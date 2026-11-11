import type {
  Abbreviation,
  CategoryEntry,
  DeviceEntry,
  DeviceGroup,
  Entry,
  EntryType,
  Source,
} from '../types';

/* ------------------------------------------------------------------ *
 * Laden aller Datensätze. Jede JSON-Datei in /content/<typ>/ ist ein
 * Datensatz; Vite bündelt sie zur Build-Zeit (import.meta.glob).
 * ------------------------------------------------------------------ */

const files = import.meta.glob<Entry>(
  [
    '/content/categories/*.json',
    '/content/devices/*.json',
    '/content/entries/*.json',
    '/content/manufacturers/*.json',
    '/content/standards/*.json',
    '/content/faults/*.json',
  ],
  { eager: true, import: 'default' },
);

import sourcesJson from '../../content/sources.json';
import abbreviationsJson from '../../content/abbreviations.json';
import deviceGroupsJson from '../../content/device-groups.json';

export const entries: Entry[] = Object.values(files).sort((a, b) =>
  a.title.localeCompare(b.title, 'de'),
);

export const entryById = new Map<string, Entry>(entries.map((e) => [e.id, e]));

const extraSources = import.meta.glob<Source[]>('/content/sources/*.json', { eager: true, import: 'default' });
export const sources: Source[] = [];
{
  const seen = new Set<string>();
  for (const s of [...(sourcesJson as Source[]), ...Object.values(extraSources).flat()]) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    sources.push(s);
  }
}
export const sourceById = new Map(sources.map((s) => [s.id, s]));
export const abbreviations = (abbreviationsJson as Abbreviation[]).sort((a, b) =>
  a.abbr.localeCompare(b.abbr, 'de'),
);
export const deviceGroups = deviceGroupsJson as DeviceGroup[];
export const deviceGroupById = new Map(deviceGroups.map((g) => [g.id, g]));

export const categories = entries
  .filter((e): e is CategoryEntry => e.type === 'category')
  .sort((a, b) => a.order - b.order);

export const devices = entries.filter((e): e is DeviceEntry => e.type === 'device');

export const TYPE_LABEL: Record<EntryType, string> = {
  category: 'Hauptkategorie',
  device: 'Gerät',
  term: 'Fachbegriff',
  manufacturer: 'Hersteller',
  standard: 'Norm / Vorschrift',
  fault: 'Fehlerbild',
  domain: 'Fachbereich',
};

export const STATUS_LABEL = {
  ausfuehrlich: 'Ausführlicher Artikel',
  basis: 'Basisartikel',
  stub: 'Kurzeintrag',
} as const;

export function getEntry(id: string | undefined): Entry | undefined {
  return id ? entryById.get(id) : undefined;
}

/* ------------------------------------------------------------------ *
 * Verknüpfungsgraph: ausgehende Links und Rückverweise
 * ------------------------------------------------------------------ */

const LINK_RE = /\[\[([a-z0-9-]+)(?:#[^|\]]*)?(?:\|[^\]]*)?\]\]/g;
const CITE_RE = /\[@([a-z0-9-]+)(?:,[^\]]*)?\]/g;

/** sammelt alle Markdown-Felder eines Eintrags */
export function markdownOf(e: Entry): string {
  const parts: string[] = [e.body ?? ''];
  if (e.type === 'device') {
    const s = e.sections ?? {};
    parts.push(...Object.values(s).filter(Boolean) as string[]);
    e.faults?.forEach((f) => parts.push(f.cause, f.action));
    e.tests?.forEach((t) => parts.push(t.description));
    e.specs?.forEach((s) => parts.push(s.note ?? ''));
    e.components?.forEach((c) => parts.push(c.role));
    e.sensors?.forEach((c) => parts.push(c.role));
    if (e.price) parts.push(e.price.note);
    if (e.riskClass?.note) parts.push(e.riskClass.note);
  }
  if (e.type === 'fault') parts.push(...(e.causes ?? []), ...(e.actions ?? []));
  return parts.join('\n');
}

function structuredRefs(e: Entry): string[] {
  const refs: string[] = [...(e.related ?? [])];
  e.paths?.forEach((p) => refs.push(...p));
  e.diagram?.nodes.forEach((n) => n.ref && refs.push(n.ref));
  switch (e.type) {
    case 'device':
      e.domains?.forEach((d) => refs.push(d));
      e.components?.forEach((c) => refs.push(c.ref));
      e.sensors?.forEach((c) => refs.push(c.ref));
      e.manufacturers?.forEach((m) => refs.push(m.ref));
      e.faults?.forEach((f) => f.ref && refs.push(f.ref));
      e.tests?.forEach((t) => t.ref && refs.push(t.ref));
      break;
    case 'manufacturer':
      e.productLines?.forEach((p) => refs.push(p.device));
      break;
    case 'fault':
      e.devices?.forEach((d) => refs.push(d));
      break;
  }
  return refs.filter(Boolean);
}

export function extractLinks(md: string): string[] {
  return [...md.matchAll(LINK_RE)].map((m) => m[1]);
}

export function extractCitations(md: string): string[] {
  return [...md.matchAll(CITE_RE)].map((m) => m[1]);
}

export const outgoing = new Map<string, Set<string>>();
export const backlinks = new Map<string, Set<string>>();
export const citedBy = new Map<string, Set<string>>();

for (const e of entries) {
  const out = new Set<string>();
  for (const id of [...extractLinks(markdownOf(e)), ...structuredRefs(e)]) {
    if (id !== e.id && entryById.has(id)) out.add(id);
  }
  outgoing.set(e.id, out);
  for (const t of out) {
    if (!backlinks.has(t)) backlinks.set(t, new Set());
    backlinks.get(t)!.add(e.id);
  }
  const cites = new Set([...(e.sources ?? []), ...extractCitations(markdownOf(e))]);
  if (e.type === 'device') e.specs?.forEach((s) => s.sources?.forEach((x) => cites.add(x)));
  for (const c of cites) {
    if (!citedBy.has(c)) citedBy.set(c, new Set());
    citedBy.get(c)!.add(e.id);
  }
}

export function entriesInCategory(catId: string): Entry[] {
  return entries.filter((e) => e.category === catId && e.type !== 'category');
}

/** Hersteller → Geräte, abgeleitet aus Geräten UND Herstellerdatensätzen */
export function devicesOfManufacturer(mId: string): { device: DeviceEntry; models: string[] }[] {
  const map = new Map<string, Set<string>>();
  for (const d of devices) {
    for (const m of d.manufacturers ?? []) {
      if (m.ref !== mId) continue;
      if (!map.has(d.id)) map.set(d.id, new Set());
      m.models.forEach((x) => map.get(d.id)!.add(x));
    }
  }
  const me = entryById.get(mId);
  if (me?.type === 'manufacturer') {
    for (const p of me.productLines ?? []) {
      if (!entryById.has(p.device)) continue;
      if (!map.has(p.device)) map.set(p.device, new Set());
      p.models.forEach((x) => map.get(p.device)!.add(x));
    }
  }
  return [...map.entries()]
    .map(([id, models]) => ({ device: entryById.get(id) as DeviceEntry, models: [...models] }))
    .filter((x) => x.device)
    .sort((a, b) => a.device.title.localeCompare(b.device.title, 'de'));
}

export function manufacturersOfDevice(d: DeviceEntry): { id: string; models: string[]; note?: string }[] {
  const map = new Map<string, { models: Set<string>; note?: string }>();
  for (const m of d.manufacturers ?? []) {
    map.set(m.ref, { models: new Set(m.models), note: m.note });
  }
  for (const e of entries) {
    if (e.type !== 'manufacturer') continue;
    for (const p of e.productLines ?? []) {
      if (p.device !== d.id) continue;
      if (!map.has(e.id)) map.set(e.id, { models: new Set() });
      p.models.forEach((x) => map.get(e.id)!.models.add(x));
    }
  }
  return [...map.entries()].map(([id, v]) => ({ id, models: [...v.models], note: v.note }));
}
