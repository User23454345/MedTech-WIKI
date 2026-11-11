import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { citedBy, sources } from '../lib/data';
import type { Source } from '../types';
import { EntryLink } from '../components/EntryLink';
import { SOURCE_KIND, SourceCitation } from '../components/SourceList';

export function Sources() {
  const [kind, setKind] = useState<Source['kind'] | ''>('');
  useEffect(() => {
    document.title = 'Quellenverzeichnis – MedTech Wiki';
  }, []);
  const kinds = [...new Set(sources.map((s) => s.kind))];
  const list = [...sources]
    .filter((s) => !kind || s.kind === kind)
    .sort((a, b) => (a.authors ?? a.title).localeCompare(b.authors ?? b.title, 'de'));
  return (
    <div className="page narrow">
      <nav className="breadcrumb"><Link to="/">Start</Link></nav>
      <h1>Quellenverzeichnis</h1>
      <p className="lead">
        Fachbücher, Gesetze, Normen, Leitlinien und Herstellerinformationen, auf die sich die Artikel stützen – mit
        Rückverweis auf die zitierenden Artikel.
      </p>
      <div className="seg facet">
        <button className={!kind ? 'active' : ''} onClick={() => setKind('')}>Alle ({sources.length})</button>
        {kinds.map((k) => (
          <button key={k} className={kind === k ? 'active' : ''} onClick={() => setKind(k)}>
            {SOURCE_KIND[k]} ({sources.filter((s) => s.kind === k).length})
          </button>
        ))}
      </div>
      <ul className="source-index">
        {list.map((s) => {
          const by = [...(citedBy.get(s.id) ?? [])];
          return (
            <li key={s.id} id={'quelle-' + s.id}>
              <SourceCitation s={s} />
              {s.note && <div className="muted small">{s.note}</div>}
              {by.length > 0 && (
                <details>
                  <summary className="small">Zitiert in {by.length} Artikel{by.length === 1 ? '' : 'n'}</summary>
                  <div className="small cited-by">
                    {by.map((id, i) => (<span key={id}>{i > 0 && ' · '}<EntryLink id={id} /></span>))}
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
