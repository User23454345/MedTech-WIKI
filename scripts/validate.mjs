#!/usr/bin/env node
/**
 * Inhaltsvalidierung für das MedTech Wiki.
 *
 * Prüft alle Datensätze unter content/ auf Pflichtfelder, gültige Werte,
 * auflösbare Verweise ([[id]], Strukturverweise), existierende Quellen ([@id])
 * und vorhandene Bilddateien. Läuft vor jedem Build (npm run build).
 *
 * Optionen:
 *   --files <pfad...>   nur diese Dateien prüfen (Verweise gegen Gesamtbestand)
 *   --planned <datei>   JSON-Array geplanter IDs: Verweise darauf gelten als Warnung statt Fehler
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const C = (...p) => path.join(root, 'content', ...p);
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return null;
  const out = [];
  for (let j = i + 1; j < args.length && !args[j].startsWith('--'); j++) out.push(args[j]);
  return out;
};
const onlyFiles = opt('--files')?.map((f) => path.resolve(f));
const plannedFile = opt('--planned')?.[0];
const planned = new Set(plannedFile ? JSON.parse(fs.readFileSync(plannedFile, 'utf8')) : []);

const DIRS = {
  categories: ['category'],
  devices: ['device'],
  entries: ['term', 'domain'],
  manufacturers: ['manufacturer'],
  standards: ['standard'],
  faults: ['fault'],
};
const HUBS = new Set();
const errors = [];
const warnings = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warnings.push(`${f}: ${m}`);

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    err(path.relative(root, file), 'ungültiges JSON – ' + e.message);
    return null;
  }
};

const sources = [];
const sourceFiles = [C('sources.json'), ...(fs.existsSync(C('sources')) ? fs.readdirSync(C('sources')).filter((f) => f.endsWith('.json')).sort().map((f) => C('sources', f)) : [])];
const sourceIds = new Set();
const sourceTitle = new Map();
const SOURCE_KINDS = ['buch', 'norm', 'gesetz', 'leitlinie', 'hersteller', 'artikel', 'web', 'behoerde'];
for (const sf of sourceFiles) {
  const list = readJson(sf) ?? [];
  const rel = path.relative(root, sf);
  if (!Array.isArray(list)) { err(rel, 'muss ein Array von Quellen sein'); continue; }
  for (const s of list) {
    if (!s.id || !s.title || !SOURCE_KINDS.includes(s.kind)) err(rel, `Quelle unvollständig/ungültig: ${JSON.stringify(s).slice(0, 80)}`);
    if (sourceIds.has(s.id)) {
      if (sourceTitle.get(s.id) === s.title) warn(rel, `Quelle ${s.id} mehrfach definiert (identisch)`);
      else err(rel, `Quellen-ID ${s.id} mehrfach mit unterschiedlichem Titel`);
      continue;
    }
    sourceIds.add(s.id);
    sourceTitle.set(s.id, s.title);
    sources.push(s);
  }
}
const groups = new Set((readJson(C('device-groups.json')) ?? []).map((g) => g.id));
const abbreviations = readJson(C('abbreviations.json')) ?? [];

/** Alle Datensätze laden */
const all = [];
for (const [dir, types] of Object.entries(DIRS)) {
  const d = C(dir);
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.json')).sort()) {
    const file = path.join(d, f);
    const e = readJson(file);
    if (!e) continue;
    all.push({ e, file, rel: path.relative(root, file), types });
    if (e.type === 'category') HUBS.add(e.id);
  }
}
const byId = new Map();
for (const x of all) {
  if (byId.has(x.e.id)) err(x.rel, `doppelte ID „${x.e.id}“ (auch in ${byId.get(x.e.id).rel})`);
  byId.set(x.e.id, x);
}

const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const LINK_RE = /\[\[([^\]|#]+)(#[^|\]]*)?(?:\|([^\]]*))?\]\]/g;
const CITE_RE = /\[@([^\],\]]+)(?:,[^\]]*)?\]/g;
const EVIDENCE = new Set(['belegt', 'typisch', 'beispiel', 'vereinfacht']);

function checkRef(rel, id, ctx, allowedTypes) {
  if (typeof id !== 'string' || !id) return err(rel, `${ctx}: leerer Verweis`);
  const t = byId.get(id);
  if (!t) {
    if (planned.has(id)) warn(rel, `${ctx}: „${id}“ geplant, noch nicht vorhanden`);
    else err(rel, `${ctx}: Verweis auf unbekannte ID „${id}“`);
    return;
  }
  if (allowedTypes && !allowedTypes.includes(t.e.type)) err(rel, `${ctx}: „${id}“ hat Typ ${t.e.type}, erwartet ${allowedTypes.join('/')}`);
}

function checkMarkdown(rel, md, ctx) {
  if (md == null) return;
  if (typeof md !== 'string') return err(rel, `${ctx}: muss ein String sein`);
  for (const m of md.matchAll(LINK_RE)) {
    if (!ID_RE.test(m[1])) err(rel, `${ctx}: ungültige Link-Syntax [[${m[1]}]]`);
    else checkRef(rel, m[1], `${ctx} [[${m[1]}]]`);
  }
  for (const m of md.matchAll(CITE_RE)) if (!sourceIds.has(m[1])) err(rel, `${ctx}: unbekannte Quelle [@${m[1]}]`);
  if (/\]\(http/.test(md)) warn(rel, `${ctx}: externer Markdown-Link – bitte Quelle in sources.json verwenden`);
  if (/\b(TODO|TBD|lorem ipsum)\b/i.test(md)) err(rel, `${ctx}: Platzhaltertext gefunden`);
  const unbalanced = (md.match(/\[\[/g) ?? []).length !== (md.match(/\]\]/g) ?? []).length;
  if (unbalanced) err(rel, `${ctx}: unausgeglichene [[ ]]`);
}

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;

for (const x of all) {
  if (onlyFiles && !onlyFiles.includes(path.resolve(x.file))) continue;
  const { e, rel } = x;
  const base = path.basename(x.file, '.json');
  if (!ID_RE.test(e.id ?? '')) err(rel, `ungültige ID „${e.id}“ (nur a-z, 0-9, Bindestrich)`);
  if (e.id !== base) err(rel, `ID „${e.id}“ ≠ Dateiname „${base}“`);
  if (!x.types.includes(e.type)) err(rel, `Typ „${e.type}“ gehört nicht in diesen Ordner (${x.types.join('/')})`);
  if (!isStr(e.title)) err(rel, 'title fehlt');
  if (!isStr(e.summary)) err(rel, 'summary fehlt');
  else {
    if (e.summary.length > 400) warn(rel, `summary sehr lang (${e.summary.length} Zeichen)`);
    if (/\[\[|\[@/.test(e.summary)) err(rel, 'summary darf keine Links/Zitate enthalten (reiner Text)');
  }
  if (!HUBS.has(e.category)) err(rel, `category „${e.category}“ ist keine Hauptkategorie`);
  if (!['ausfuehrlich', 'basis', 'stub'].includes(e.status)) err(rel, `status „${e.status}“ ungültig`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(e.updated ?? '')) err(rel, 'updated (JJJJ-MM-TT) fehlt');
  if (e.aliases && !Array.isArray(e.aliases)) err(rel, 'aliases muss Array sein');
  checkMarkdown(rel, e.body, 'body');
  (e.related ?? []).forEach((r) => checkRef(rel, r, 'related'));
  (e.sources ?? []).forEach((s) => sourceIds.has(s) || err(rel, `sources: unbekannte Quelle „${s}“`));
  (e.paths ?? []).forEach((p, i) => {
    if (!Array.isArray(p) || p.length < 2) err(rel, `paths[${i}] braucht mind. 2 IDs`);
    else p.forEach((id) => checkRef(rel, id, `paths[${i}]`));
  });
  if (e.diagram) {
    const d = e.diagram;
    if (!isStr(d.title) || !(d.width > 0) || !(d.height > 0)) err(rel, 'diagram: title/width/height fehlen');
    const nodes = new Set();
    for (const n of d.nodes ?? []) {
      if (nodes.has(n.id)) err(rel, `diagram: doppelter Knoten ${n.id}`);
      nodes.add(n.id);
      if (!isStr(n.label)) err(rel, `diagram: Knoten ${n.id} ohne label`);
      if (typeof n.x !== 'number' || typeof n.y !== 'number') err(rel, `diagram: Knoten ${n.id} ohne x/y`);
      else if (n.x < 0 || n.y < 0 || n.x > d.width || n.y > d.height) err(rel, `diagram: Knoten ${n.id} außerhalb der Zeichenfläche`);
      if (n.ref) checkRef(rel, n.ref, `diagram-Knoten ${n.id}`);
    }
    for (const ed of d.edges ?? []) {
      if (!nodes.has(ed.from) || !nodes.has(ed.to)) err(rel, `diagram: Kante ${ed.from}→${ed.to} verweist auf unbekannten Knoten`);
      if (ed.kind && !['gas', 'fluid', 'signal', 'power', 'data', 'energy'].includes(ed.kind)) err(rel, `diagram: Kantentyp ${ed.kind} ungültig`);
    }
  }
  for (const img of e.images ?? []) {
    if (!isStr(img.src) || !isStr(img.caption) || !['schema', 'foto'].includes(img.kind)) err(rel, `images: src/caption/kind fehlt`);
    else if (!/^https?:/.test(img.src) && !fs.existsSync(path.join(root, 'public', img.src))) err(rel, `images: Datei public/${img.src} fehlt`);
    if (img.kind === 'foto' && !(img.license && img.credit)) err(rel, `images: Foto ${img.src} ohne Lizenz/Urheber`);
  }

  if (e.type === 'device') {
    if (!groups.has(e.deviceGroup)) err(rel, `deviceGroup „${e.deviceGroup}“ unbekannt`);
    if (e.category !== 'geraete') err(rel, 'Geräte gehören in category „geraete“');
    (e.domains ?? []).forEach((d) => checkRef(rel, d, 'domains', ['domain']));
    const s = e.sections ?? {};
    for (const [k, v] of Object.entries(s)) {
      if (!['purpose', 'applications', 'principle', 'construction', 'maintenance', 'testing'].includes(k)) err(rel, `sections.${k} unbekannt`);
      checkMarkdown(rel, v, `sections.${k}`);
    }
    if (e.status === 'ausfuehrlich') {
      for (const k of ['purpose', 'applications', 'principle', 'construction', 'maintenance', 'testing'])
        if (!isStr(s[k])) err(rel, `ausführlicher Artikel: sections.${k} fehlt`);
      for (const k of ['components', 'sensors', 'specs', 'faults', 'tests', 'manufacturers'])
        if (!Array.isArray(e[k]) || e[k].length === 0) err(rel, `ausführlicher Artikel: ${k} fehlt`);
      if (!e.diagram) err(rel, 'ausführlicher Artikel: diagram fehlt');
      if (!e.price) err(rel, 'ausführlicher Artikel: price fehlt');
      if (!e.maintenance) err(rel, 'ausführlicher Artikel: maintenance fehlt');
      if (!e.riskClass) err(rel, 'ausführlicher Artikel: riskClass fehlt');
      const words = [e.body, ...Object.values(s)].join(' ').split(/\s+/).length;
      if (words < 1500) warn(rel, `ausführlicher Artikel recht kurz (${words} Wörter)`);
    }
    (e.components ?? []).forEach((c, i) => { checkRef(rel, c.ref, `components[${i}]`); checkMarkdown(rel, c.role, `components[${i}].role`); });
    (e.sensors ?? []).forEach((c, i) => { checkRef(rel, c.ref, `sensors[${i}]`); checkMarkdown(rel, c.role, `sensors[${i}].role`); });
    (e.specs ?? []).forEach((sp, i) => {
      if (!isStr(sp.param) || !isStr(sp.value)) err(rel, `specs[${i}]: param/value fehlt`);
      if (!EVIDENCE.has(sp.evidence)) err(rel, `specs[${i}]: evidence „${sp.evidence}“ ungültig`);
      if (sp.evidence === 'belegt' && !(sp.sources?.length)) err(rel, `specs[${i}] „${sp.param}“: belegt ohne sources`);
      (sp.sources ?? []).forEach((s) => sourceIds.has(s) || err(rel, `specs[${i}]: unbekannte Quelle ${s}`));
      checkMarkdown(rel, sp.note, `specs[${i}].note`);
    });
    (e.manufacturers ?? []).forEach((m, i) => {
      checkRef(rel, m.ref, `manufacturers[${i}]`, ['manufacturer']);
      if (!Array.isArray(m.models)) err(rel, `manufacturers[${i}].models muss Array sein`);
    });
    if (e.price) {
      if (!['nicht-verifiziert', 'belegt'].includes(e.price.status)) err(rel, 'price.status ungültig');
      if (e.price.status === 'belegt' && !(e.price.sources?.length)) err(rel, 'price: belegt ohne sources');
      if (e.price.status !== 'belegt' && e.price.range) err(rel, 'price.range nur bei status „belegt“ erlaubt');
      checkMarkdown(rel, e.price.note, 'price.note');
    }
    if (e.maintenance) for (const k of ['stk', 'mtk']) if (!['ja', 'nein', 'abhaengig'].includes(e.maintenance[k])) err(rel, `maintenance.${k} ungültig`);
    if (e.riskClass) {
      if (!EVIDENCE.has(e.riskClass.evidence)) err(rel, 'riskClass.evidence ungültig');
      checkMarkdown(rel, e.riskClass.note, 'riskClass.note');
      (e.riskClass.sources ?? []).forEach((s) => sourceIds.has(s) || err(rel, `riskClass: unbekannte Quelle ${s}`));
    }
    (e.faults ?? []).forEach((f, i) => {
      if (!isStr(f.title) || !isStr(f.cause) || !isStr(f.action)) err(rel, `faults[${i}] unvollständig`);
      if (f.ref) checkRef(rel, f.ref, `faults[${i}]`);
      checkMarkdown(rel, f.cause, `faults[${i}].cause`);
      checkMarkdown(rel, f.action, `faults[${i}].action`);
    });
    (e.tests ?? []).forEach((t, i) => {
      if (!isStr(t.name) || !isStr(t.description)) err(rel, `tests[${i}] unvollständig`);
      if (t.ref) checkRef(rel, t.ref, `tests[${i}]`);
      checkMarkdown(rel, t.description, `tests[${i}].description`);
    });
  }
  if (e.type === 'manufacturer') {
    (e.productLines ?? []).forEach((p, i) => checkRef(rel, p.device, `productLines[${i}]`, ['device']));
    if (e.website && !/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/.test(e.website)) warn(rel, `website „${e.website}“: nur Startseite der Domain verwenden`);
  }
  if (e.type === 'standard') {
    if (!isStr(e.code)) err(rel, 'code fehlt');
    if (!['norm', 'gesetz', 'verordnung', 'richtlinie', 'leitfaden'].includes(e.kind)) err(rel, `kind „${e.kind}“ ungültig`);
  }
  if (e.type === 'fault') {
    (e.devices ?? []).forEach((d) => checkRef(rel, d, 'devices', ['device']));
    (e.causes ?? []).forEach((c, i) => checkMarkdown(rel, c, `causes[${i}]`));
    (e.actions ?? []).forEach((c, i) => checkMarkdown(rel, c, `actions[${i}]`));
  }
  if (e.type === 'category') {
    if (typeof e.order !== 'number' || !isStr(e.icon)) err(rel, 'order/icon fehlt');
  }
}

if (!onlyFiles) {
  const seen = new Set();
  abbreviations.forEach((a, i) => {
    if (!isStr(a.abbr) || !isStr(a.full) || !['medizinisch', 'technisch', 'regulatorisch'].includes(a.area)) err('abbreviations.json', `Eintrag ${i} unvollständig`);
    const k = a.abbr + '|' + a.full;
    if (seen.has(k)) err('abbreviations.json', `doppelt: ${a.abbr}`);
    seen.add(k);
    if (a.ref) checkRef('abbreviations.json', a.ref, `Abkürzung ${a.abbr}`);
  });
}

const n = onlyFiles ? onlyFiles.length : all.length;
if (warnings.length) console.log(`⚠ ${warnings.length} Warnung(en):\n  ` + warnings.slice(0, 400).join('\n  '));
if (errors.length) {
  console.error(`✖ ${errors.length} Fehler in ${n} geprüften Datensätzen:\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`✔ ${n} Datensätze geprüft, ${sources.length} Quellen, ${abbreviations.length} Abkürzungen – keine Fehler.`);
