import MarkdownIt, { type StateCore, type StateInline } from 'markdown-it';
import { entryById, sourceById } from './data';

/**
 * Markdown-Erweiterungen:
 *  [[id]] / [[id|Text]] / [[id#anker|Text]]  → Wiki-Link auf einen Datensatz
 *  [@quelle] / [@quelle, S. 12]               → nummerierte Quellenangabe
 *  > [!belegt] / [!vereinfacht] / [!beispiel] / [!hinweis] / [!warnung]
 *                                              → Callout mit Belegqualität
 *  Überschriften (##, ###) erhalten automatisch Anker-IDs für das Inhaltsverzeichnis.
 */

export interface RenderEnv {
  [key: string | symbol]: unknown;
  /** Reihenfolge der zitierten Quellen (für Nummerierung pro Seite) */
  citations: string[];
  headings: { id: string; text: string; level: number }[];
  /** Präfix für Überschriften-IDs, falls mehrere Blöcke auf einer Seite */
  prefix?: string;
}

export function newEnv(): RenderEnv {
  return { citations: [], headings: [] };
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const md = new MarkdownIt({ html: false, linkify: false, typographer: true });

/* ---- Wiki-Links ------------------------------------------------- */
md.inline.ruler.before('link', 'wikilink', (state: StateInline, silent: boolean) => {
  const src = state.src;
  const start = state.pos;
  if (src.charCodeAt(start) !== 0x5b || src.charCodeAt(start + 1) !== 0x5b) return false;
  const end = src.indexOf(']]', start + 2);
  if (end < 0) return false;
  const inner = src.slice(start + 2, end);
  const m = /^([a-z0-9-]+)(#[a-z0-9-]+)?(?:\|(.+))?$/.exec(inner);
  if (!m) return false;
  if (!silent) {
    const token = state.push('wikilink', '', 0);
    token.meta = { id: m[1], anchor: m[2], label: m[3] };
  }
  state.pos = end + 2;
  return true;
});

md.renderer.rules.wikilink = (tokens, idx) => {
  const { id, anchor, label } = tokens[idx].meta as { id: string; anchor?: string; label?: string };
  const target = entryById.get(id);
  const text = escapeHtml(label ?? target?.title ?? id);
  if (!target) return `<span class="wikilink missing" title="Artikel in Vorbereitung">${text}</span>`;
  const href = `#/e/${id}${anchor ? `?s=${anchor.slice(1)}` : ''}`;
  return `<a class="wikilink wl-${target.type}" data-id="${id}" href="${href}">${text}</a>`;
};

/* ---- Quellenangaben ---------------------------------------------- */
md.inline.ruler.before('link', 'citation', (state: StateInline, silent: boolean) => {
  const src = state.src;
  const start = state.pos;
  if (src.charCodeAt(start) !== 0x5b || src.charCodeAt(start + 1) !== 0x40) return false;
  const end = src.indexOf(']', start);
  if (end < 0) return false;
  const m = /^\[@([a-z0-9-]+)(?:,\s*([^\]]+))?\]$/.exec(src.slice(start, end + 1));
  if (!m) return false;
  if (!silent) {
    const token = state.push('citation', '', 0);
    token.meta = { id: m[1], loc: m[2] };
  }
  state.pos = end + 1;
  return true;
});

md.renderer.rules.citation = (tokens, idx, _opts, envAny) => {
  const env = envAny as unknown as RenderEnv;
  const { id, loc } = tokens[idx].meta as { id: string; loc?: string };
  const s = sourceById.get(id);
  let n = env.citations.indexOf(id);
  if (n < 0) {
    env.citations.push(id);
    n = env.citations.length - 1;
  }
  const title = s ? `${s.authors ? s.authors + ': ' : ''}${s.title}${loc ? ' – ' + loc : ''}` : id;
  return `<sup class="cite"><a href="#quelle-${id}" data-cite="${id}" title="${escapeHtml(title)}">${n + 1}</a></sup>`;
};

/* ---- Überschriften-Anker ---------------------------------------- */
md.core.ruler.push('heading_ids', (state: StateCore) => {
  const env = state.env as unknown as RenderEnv;
  const tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type !== 'heading_open') continue;
    const inline = tokens[i + 1];
    const text = inline.children
      ?.filter((c) => c.type === 'text' || c.type === 'code_inline')
      .map((c) => c.content)
      .join('') ?? inline.content;
    const id = (env.prefix ? env.prefix + '-' : '') + slugify(text);
    t.attrSet('id', id);
    env.headings?.push({ id, text, level: Number(t.tag.slice(1)) });
  }
});

/* ---- Callouts --------------------------------------------------- */
const CALLOUTS: Record<string, string> = {
  belegt: 'Belegte Aussage',
  vereinfacht: 'Vereinfachte Erklärung',
  beispiel: 'Beispielhafte Darstellung',
  hinweis: 'Hinweis',
  warnung: 'Sicherheitshinweis',
  praxis: 'Aus der Praxis',
};

md.core.ruler.push('callouts', (state: StateCore) => {
  const tokens = state.tokens;
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'blockquote_open') continue;
    const inline = tokens[i + 2];
    if (!inline || inline.type !== 'inline') continue;
    const m = /^\[!(\w+)\]\s*/.exec(inline.content);
    if (!m || !CALLOUTS[m[1]]) continue;
    const kind = m[1];
    tokens[i].attrSet('class', `callout callout-${kind}`);
    tokens[i].attrSet('data-label', CALLOUTS[kind]);
    // Marker aus dem ersten Text-Kind entfernen
    const first = inline.children?.[0];
    if (first && first.type === 'text') first.content = first.content.replace(/^\[!\w+\]\s*/, '');
    // Softbreak direkt nach dem Marker entfernen
    if (inline.children && inline.children[0]?.content === '' && inline.children[1]?.type === 'softbreak') {
      inline.children.splice(0, 2);
    }
  }
});

/* ---- Tabellen in scrollbaren Container -------------------------- */
md.renderer.rules.table_open = () => '<div class="table-wrap"><table>';
md.renderer.rules.table_close = () => '</table></div>';

export function renderMarkdown(src: string | undefined, env: RenderEnv): string {
  if (!src) return '';
  return md.render(src, env);
}

export function renderInline(src: string | undefined, env: RenderEnv): string {
  if (!src) return '';
  return md.renderInline(src, env);
}

/** entfernt Markdown-Syntax für Suchindex und Vorschauen */
export function plainText(src: string | undefined): string {
  if (!src) return '';
  return src
    .replace(/\[\[[a-z0-9-]+(?:#[^|\]]*)?\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([a-z0-9-]+)[^\]]*\]\]/g, (_, id) => entryById.get(id)?.title ?? id)
    .replace(/\[@[^\]]+\]/g, '')
    .replace(/\[!\w+\]/g, '')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
