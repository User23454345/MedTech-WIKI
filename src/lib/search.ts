import MiniSearch from 'minisearch';
import { abbreviations, entries, markdownOf, TYPE_LABEL } from './data';
import { plainText } from './markdown';
import type { Entry } from '../types';

/**
 * Globale Suche (MiniSearch): Präfix- und Fehlertoleranz-Suche über Titel,
 * Synonyme, Abkürzungen, Zusammenfassung und Volltext, gewichtet.
 * Abkürzungen aus dem Abkürzungsverzeichnis werden den verknüpften
 * Datensätzen als zusätzliche Suchbegriffe zugeordnet.
 */

interface Doc {
  id: string;
  title: string;
  aliases: string;
  summary: string;
  text: string;
  type: string;
  category: string;
}

const abbrByRef = new Map<string, string[]>();
for (const a of abbreviations) {
  if (!a.ref) continue;
  if (!abbrByRef.has(a.ref)) abbrByRef.set(a.ref, []);
  abbrByRef.get(a.ref)!.push(a.abbr, a.full);
}

const normalize = (t: string) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss');

export const index = new MiniSearch<Doc>({
  fields: ['title', 'aliases', 'summary', 'text'],
  storeFields: ['id'],
  processTerm: (term) => normalize(term),
  tokenize: (s) => s.split(/[\s\-–/(),.;:„“"!?]+/).filter(Boolean),
  searchOptions: {
    boost: { title: 5, aliases: 4, summary: 2, text: 1 },
    prefix: true,
    fuzzy: (term) => (term.length > 4 ? 0.2 : false),
    combineWith: 'AND',
  },
});

index.addAll(
  entries.map<Doc>((e) => ({
    id: e.id,
    title: e.title,
    aliases: [...(e.aliases ?? []), ...(abbrByRef.get(e.id) ?? [])].join(' '),
    summary: e.summary,
    text: plainText(markdownOf(e)),
    type: e.type,
    category: e.category,
  })),
);

export interface Hit {
  entry: Entry;
  score: number;
  terms: string[];
}

import { entryById } from './data';

export function search(q: string, limit = 50): Hit[] {
  const query = q.trim();
  if (!query) return [];
  let res = index.search(query);
  if (res.length === 0) res = index.search(query, { combineWith: 'OR' });
  return res
    .slice(0, limit)
    .map((r) => ({ entry: entryById.get(r.id)!, score: r.score, terms: r.terms }))
    .filter((h) => h.entry);
}

export function suggest(q: string): string[] {
  return index.autoSuggest(q, { fuzzy: 0.2 }).slice(0, 5).map((s) => s.suggestion);
}

export { TYPE_LABEL };
