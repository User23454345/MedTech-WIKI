import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { abbreviations, categories, TYPE_LABEL } from '../lib/data';
import { search, suggest } from '../lib/search';
import type { EntryType } from '../types';
import { TypeBadge } from '../components/Badges';
import { EntryLink } from '../components/EntryLink';
import { Icon } from '../components/Icon';

export function SearchPage() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') ?? '';
  const [input, setInput] = useState(q);
  const [type, setType] = useState<EntryType | ''>('');
  useEffect(() => setInput(q), [q]);
  useEffect(() => {
    document.title = `Suche: ${q} – MedTech Wiki`;
  }, [q]);

  const hits = search(q, 200);
  const counts = new Map<EntryType, number>();
  hits.forEach((h) => counts.set(h.entry.type, (counts.get(h.entry.type) ?? 0) + 1));
  const shown = type ? hits.filter((h) => h.entry.type === type) : hits;
  const qa = q.trim().toLowerCase();
  const abbr = qa ? abbreviations.filter((a) => a.abbr.toLowerCase() === qa || a.abbr.toLowerCase().startsWith(qa)).slice(0, 6) : [];
  const alt = hits.length === 0 && q ? suggest(q) : [];

  return (
    <div className="page narrow">
      <h1>Suche</h1>
      <form
        className="hero-search compact"
        onSubmit={(e) => {
          e.preventDefault();
          setSp({ q: input.trim() });
        }}
      >
        <Icon name="search" />
        <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Suchbegriff" autoFocus />
        <button className="btn primary">Suchen</button>
      </form>
      {abbr.length > 0 && (
        <div className="abbr-hits">
          {abbr.map((a) => (
            <div key={a.abbr + a.full} className="abbr-hit">
              <strong>{a.abbr}</strong> = {a.ref ? <EntryLink id={a.ref}>{a.full}</EntryLink> : a.full}
              <span className="badge neutral">{a.area}</span>
            </div>
          ))}
        </div>
      )}
      {q && (
        <div className="seg facet">
          <button className={!type ? 'active' : ''} onClick={() => setType('')}>Alle ({hits.length})</button>
          {[...counts.entries()].map(([t, n]) => (
            <button key={t} className={type === t ? 'active' : ''} onClick={() => setType(t)}>
              {TYPE_LABEL[t]} ({n})
            </button>
          ))}
        </div>
      )}
      {q && hits.length === 0 && (
        <p>
          Keine Treffer für „{q}“.
          {alt.length > 0 && (
            <> Meintest du: {alt.map((s, i) => (<span key={s}>{i > 0 && ', '}<Link to={`/suche?q=${encodeURIComponent(s)}`}>{s}</Link></span>))}?</>
          )}
        </p>
      )}
      <ol className="results">
        {shown.map((h) => {
          const cat = categories.find((c) => c.id === h.entry.category);
          return (
            <li key={h.entry.id}>
              <div className="card-meta">
                <TypeBadge type={h.entry.type} />
                {cat && <span className="muted small">{cat.title}</span>}
              </div>
              <Link to={`/e/${h.entry.id}`} className="res-title" data-id={h.entry.id} data-nopreview="">{h.entry.title}</Link>
              <p>{h.entry.summary}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
