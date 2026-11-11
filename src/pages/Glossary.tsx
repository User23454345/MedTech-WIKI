import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categories, entries, TYPE_LABEL } from '../lib/data';
import type { EntryType } from '../types';

/** Glossar A–Z über alle Fachbegriffe (ohne Hauptkategorien) */
export function Glossary() {
  const [q, setQ] = useState('');
  const [type, setType] = useState<EntryType | ''>('');
  useEffect(() => {
    document.title = 'Glossar – MedTech Wiki';
  }, []);
  const list = entries.filter(
    (e) =>
      e.type !== 'category' &&
      (!type || e.type === type) &&
      (!q || (e.title + ' ' + (e.aliases ?? []).join(' ')).toLowerCase().includes(q.toLowerCase())),
  );
  const letter = (t: string) => {
    const c = t[0].toUpperCase().replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U');
    return /[A-Z]/.test(c) ? c : '#';
  };
  const groups = new Map<string, typeof list>();
  list.forEach((e) => {
    const l = letter(e.title);
    if (!groups.has(l)) groups.set(l, []);
    groups.get(l)!.push(e);
  });
  const letters = [...groups.keys()].sort();
  const types: EntryType[] = ['device', 'term', 'domain', 'manufacturer', 'standard', 'fault'];

  return (
    <div className="page">
      <nav className="breadcrumb"><Link to="/">Start</Link></nav>
      <h1>Glossar A–Z</h1>
      <p className="lead">Alle {entries.length - categories.length} Datensätze des Wikis alphabetisch – mit Kurzdefinition.</p>
      <div className="filters sticky">
        <input className="input" placeholder="Begriff filtern …" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Glossar filtern" />
        <select value={type} onChange={(e) => setType(e.target.value as EntryType | '')} aria-label="Typ">
          <option value="">Alle Typen</option>
          {types.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
        </select>
        <nav className="az" aria-label="Buchstaben">
          {letters.map((l) => (
            <a key={l} href={'#g-' + l} onClick={(e) => { e.preventDefault(); document.getElementById('g-' + l)?.scrollIntoView({ behavior: 'smooth' }); }}>{l}</a>
          ))}
        </nav>
      </div>
      {letters.map((l) => (
        <section key={l} className="glossary-group">
          <h2 id={'g-' + l}>{l}</h2>
          <dl className="glossary">
            {groups.get(l)!.map((e) => (
              <div key={e.id}>
                <dt>
                  <Link to={`/e/${e.id}`} className={`wikilink wl-${e.type}`} data-id={e.id} data-nopreview="">{e.title}</Link>
                  <span className="muted small"> · {TYPE_LABEL[e.type]}</span>
                </dt>
                <dd>{e.summary}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
