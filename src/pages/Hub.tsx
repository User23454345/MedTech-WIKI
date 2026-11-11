import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  abbreviations,
  categories,
  deviceGroups,
  devices,
  entriesInCategory,
  getEntry,
} from '../lib/data';
import { newEnv, renderMarkdown } from '../lib/markdown';
import type { Abbreviation, Entry, StandardEntry } from '../types';
import { EntryCard } from '../components/EntryCard';
import { EntryLink } from '../components/EntryLink';
import { Html } from '../components/Markdown';
import { Icon } from '../components/Icon';
import { SourceList } from '../components/SourceList';
import { KnowledgePath } from '../components/KnowledgePath';
import { NotFound } from './NotFound';

function AbbrTable() {
  const [q, setQ] = useState('');
  const [area, setArea] = useState<'' | Abbreviation['area']>('');
  const list = abbreviations.filter(
    (a) =>
      (!area || a.area === area) &&
      (!q || (a.abbr + ' ' + a.full + ' ' + (a.en ?? '')).toLowerCase().includes(q.toLowerCase())),
  );
  return (
    <section>
      <div className="filters">
        <input className="input" placeholder="Abkürzung filtern …" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Abkürzungen filtern" />
        <div className="seg">
          {(['', 'medizinisch', 'technisch', 'regulatorisch'] as const).map((a) => (
            <button key={a} className={area === a ? 'active' : ''} onClick={() => setArea(a)}>
              {a || 'Alle'}
            </button>
          ))}
        </div>
        <span className="muted small">{list.length} Einträge</span>
      </div>
      <div className="table-wrap">
        <table className="data abbr">
          <thead>
            <tr><th>Abkürzung</th><th>Bedeutung</th><th>Englisch</th><th>Bereich</th></tr>
          </thead>
          <tbody>
            {list.map((a) => (
              <tr key={a.abbr + a.full}>
                <th scope="row">{a.abbr}</th>
                <td>{a.ref && getEntry(a.ref) ? <EntryLink id={a.ref}>{a.full}</EntryLink> : a.full}</td>
                <td className="muted">{a.en}</td>
                <td><span className="badge neutral">{a.area}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StandardsTable({ list }: { list: Entry[] }) {
  const std = (list.filter((e) => e.type === 'standard') as StandardEntry[]).sort((a, b) =>
    a.code.localeCompare(b.code, 'de', { numeric: true }),
  );
  const rest = list.filter((e) => e.type !== 'standard');
  const kinds = ['gesetz', 'verordnung', 'richtlinie', 'norm', 'leitfaden'] as const;
  const label = { gesetz: 'Gesetze', verordnung: 'Verordnungen', richtlinie: 'Richtlinien', norm: 'Normen', leitfaden: 'Leitfäden' };
  return (
    <>
      {kinds.map((k) => {
        const l = std.filter((s) => s.kind === k);
        if (!l.length) return null;
        return (
          <section key={k}>
            <h2>{label[k]}</h2>
            <div className="table-wrap">
              <table className="data">
                <thead><tr><th>Kennung</th><th>Titel / Gegenstand</th></tr></thead>
                <tbody>
                  {l.map((s) => (
                    <tr key={s.id}>
                      <th scope="row" className="nowrap"><EntryLink id={s.id}>{s.code}</EntryLink></th>
                      <td>{s.fullTitle ?? s.title}<div className="muted small">{s.summary}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
      {rest.length > 0 && <CardList list={rest} />}
    </>
  );
}

function DevicesOverview() {
  const sorted = [...devices].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  return (
    <>
      <div className="filters">
        <Link className="btn primary" to="/geraete"><Icon name="filter" /> Zur filterbaren Gerätedatenbank</Link>
        <Link className="btn ghost" to="/vergleich"><Icon name="compare" /> Geräte vergleichen</Link>
      </div>
      {deviceGroups.map((g) => {
        const l = sorted.filter((d) => d.deviceGroup === g.id);
        if (!l.length) return null;
        return (
          <section key={g.id}>
            <h2 className="h-group">{g.label} <span className="muted small">({l.length})</span></h2>
            <ul className="device-list">
              {l.map((d) => (
                <li key={d.id}>
                  {d.rank && <span className="rank">{d.rank}</span>}
                  <EntryLink id={d.id} />
                  {d.status === 'ausfuehrlich' && <span className="badge st-ausfuehrlich">ausführlich</span>}
                  <span className="muted small dl-sum">{d.summary}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function CardList({ list }: { list: Entry[] }) {
  const [q, setQ] = useState('');
  const shown = list.filter((e) => !q || (e.title + ' ' + (e.aliases ?? []).join(' ') + ' ' + e.summary).toLowerCase().includes(q.toLowerCase()));
  const deep = shown.filter((e) => e.status === 'ausfuehrlich');
  const other = shown.filter((e) => e.status !== 'ausfuehrlich');
  return (
    <section>
      {list.length > 8 && (
        <div className="filters">
          <input className="input" placeholder="In dieser Kategorie filtern …" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Kategorie filtern" />
          <span className="muted small">{shown.length} von {list.length}</span>
        </div>
      )}
      {deep.length > 0 && other.length > 0 && <h2 className="h-small">Ausführliche Artikel</h2>}
      {deep.length > 0 && <div className="card-grid">{deep.map((e) => <EntryCard key={e.id} entry={e} />)}</div>}
      {deep.length > 0 && other.length > 0 && <h2 className="h-small">Weitere Einträge</h2>}
      <div className="card-grid small">{other.map((e) => <EntryCard key={e.id} entry={e} />)}</div>
    </section>
  );
}

export function Hub() {
  const { id } = useParams();
  const cat = categories.find((c) => c.id === id);
  const r = useMemo(() => {
    const env = newEnv();
    return { env, html: renderMarkdown(cat?.body, env) };
  }, [cat]);
  useEffect(() => {
    document.title = cat ? `${cat.title} – MedTech Wiki` : 'MedTech Wiki';
  }, [cat]);
  if (!cat) return <NotFound what={id} />;
  const list = entriesInCategory(cat.id).filter((e) => e.type !== 'device' || cat.id !== 'geraete');

  return (
    <div className="page">
      <header className="hub-head">
        <nav className="breadcrumb"><Link to="/">Start</Link><span>/</span><span>Hauptkategorie</span></nav>
        <div className="hub-title">
          <span className="cat-icon big"><Icon name={cat.icon} size={28} /></span>
          <div>
            <h1>{cat.title}</h1>
            <p className="lead">{cat.summary}</p>
          </div>
        </div>
      </header>
      {r.html && (
        <details className="hub-intro" open={cat.id === 'einfuehrung' || list.length < 4}>
          <summary>Einführung in den Bereich</summary>
          <Html html={r.html} />
          {cat.paths?.map((p, i) => <KnowledgePath key={i} path={p} />)}
        </details>
      )}
      {cat.id === 'geraete' && <DevicesOverview />}
      {cat.id === 'abkuerzungen' && <AbbrTable />}
      {cat.id === 'normen' ? <StandardsTable list={list} /> : cat.id !== 'geraete' && list.length > 0 && <CardList list={list} />}
      <SourceList cited={r.env.citations} extra={cat.sources} />
    </div>
  );
}
