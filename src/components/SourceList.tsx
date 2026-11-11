import { Link } from 'react-router-dom';
import { sourceById } from '../lib/data';
import type { Source } from '../types';

export const SOURCE_KIND: Record<Source['kind'], string> = {
  buch: 'Fachbuch',
  norm: 'Norm',
  gesetz: 'Gesetz / Verordnung',
  leitlinie: 'Leitlinie',
  hersteller: 'Herstellerinformation',
  artikel: 'Fachartikel',
  web: 'Webseite',
  behoerde: 'Behörde',
};

export function SourceCitation({ s }: { s: Source }) {
  return (
    <>
      {s.authors && <span>{s.authors}: </span>}
      <cite>{s.title}</cite>
      {s.edition && <span>, {s.edition}</span>}
      {s.publisher && <span>, {s.publisher}</span>}
      {s.year && <span> ({s.year})</span>}
      {s.url && (
        <>
          {' · '}
          <a href={s.url} target="_blank" rel="noreferrer noopener">
            Online
          </a>
        </>
      )}
      <span className="badge src-kind">{SOURCE_KIND[s.kind]}</span>
    </>
  );
}

/** Quellenverzeichnis eines Artikels: zuerst zitierte (nummeriert), dann weitere */
export function SourceList({ cited, extra }: { cited: string[]; extra?: string[] }) {
  const rest = (extra ?? []).filter((x) => !cited.includes(x));
  if (!cited.length && !rest.length) return null;
  return (
    <section className="sources" id="quellen">
      <h2>Quellen</h2>
      <ol>
        {cited.map((id) => {
          const s = sourceById.get(id);
          return (
            <li key={id} id={'quelle-' + id}>
              {s ? <SourceCitation s={s} /> : <span className="muted">Unbekannte Quelle „{id}“</span>}
            </li>
          );
        })}
      </ol>
      {rest.length > 0 && (
        <>
          <h3 className="small-h">Weiterführende Literatur</h3>
          <ul>
            {rest.map((id) => {
              const s = sourceById.get(id);
              return (
                <li key={id} id={'quelle-' + id}>
                  {s ? <SourceCitation s={s} /> : id}
                </li>
              );
            })}
          </ul>
        </>
      )}
      <p className="muted small">
        Alle Quellen im <Link to="/quellen">Quellenverzeichnis</Link>. Inhalte ersetzen keine Gebrauchsanweisung des
        Herstellers und keine Einweisung nach MPBetreibV.
      </p>
    </section>
  );
}
