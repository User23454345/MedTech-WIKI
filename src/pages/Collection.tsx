import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEntry, TYPE_LABEL } from '../lib/data';
import { actions, useUserState, type Collection as Coll } from '../lib/storage';
import { EntryCard } from '../components/EntryCard';
import { EntryLink } from '../components/EntryLink';
import { Icon } from '../components/Icon';

function download(name: string, data: string, mime: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([data], { type: mime }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function toMarkdown(c: Coll): string {
  const lines = [`# ${c.name}`, '', c.description ?? '', ''];
  for (const i of c.items) {
    const e = getEntry(i.id);
    if (!e) continue;
    lines.push(`## ${e.title} (${TYPE_LABEL[e.type]})`, '', e.summary, '');
    if (i.note) lines.push(`> Notiz: ${i.note}`, '');
    lines.push(`Link: ${location.origin}${location.pathname}#/e/${e.id}`, '');
  }
  return lines.join('\n');
}

function CollectionBox({ c }: { c: Coll }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(c.name);
  return (
    <section className="collection panel">
      <div className="coll-head">
        {edit ? (
          <form onSubmit={(e) => { e.preventDefault(); actions.renameCollection(c.id, name); setEdit(false); }}>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus aria-label="Name" />
          </form>
        ) : (
          <h2 onDoubleClick={() => setEdit(true)}>{c.name}</h2>
        )}
        <span className="muted small">{c.items.length} Einträge · angelegt {new Date(c.created).toLocaleDateString('de-DE')}</span>
        <div className="coll-actions">
          <button className="btn ghost small" onClick={() => setEdit((x) => !x)}>Umbenennen</button>
          <button className="btn ghost small" onClick={() => download(`${c.name}.md`, toMarkdown(c), 'text/markdown')}>
            <Icon name="download" size={14} /> Markdown
          </button>
          <button className="btn ghost small danger" onClick={() => confirm(`Sammlung „${c.name}“ löschen?`) && actions.deleteCollection(c.id)}>
            Löschen
          </button>
        </div>
      </div>
      {c.items.length === 0 && <p className="muted small">Leer – füge Artikel über die Schaltfläche „Sammlung“ auf einer Artikelseite hinzu.</p>}
      <ul className="coll-items">
        {c.items.map((i) => (
          <li key={i.id}>
            <div className="ci-main">
              <EntryLink id={i.id} />
              <span className="muted small"> · {getEntry(i.id) ? TYPE_LABEL[getEntry(i.id)!.type] : 'nicht mehr vorhanden'}</span>
              <textarea
                className="note"
                placeholder="Persönliche Notiz …"
                defaultValue={i.note}
                onBlur={(e) => actions.setNote(c.id, i.id, e.target.value)}
                aria-label="Notiz"
              />
            </div>
            <button className="icon-btn" onClick={() => actions.removeFromCollection(c.id, i.id)} aria-label="Entfernen">
              <Icon name="x" size={14} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Collection() {
  const st = useUserState();
  const [name, setName] = useState('');
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    document.title = 'Meine Sammlung – MedTech Wiki';
  }, []);
  const bm = st.bookmarks.map((id) => getEntry(id)).filter(Boolean);
  const hist = st.history.map((id) => getEntry(id)).filter(Boolean).slice(0, 12);

  return (
    <div className="page">
      <nav className="breadcrumb"><Link to="/">Start</Link></nav>
      <h1>Meine Wissenssammlung</h1>
      <p className="lead">
        Lesezeichen, thematische Sammlungen mit eigenen Notizen und Verlauf. Alle Daten bleiben lokal in deinem
        Browser und lassen sich exportieren.
      </p>
      <div className="filters">
        <button className="btn ghost small" onClick={() => download('medtech-wiki-sammlung.json', JSON.stringify(actions.exportState(), null, 2), 'application/json')}>
          <Icon name="download" size={14} /> Alles exportieren (JSON)
        </button>
        <button className="btn ghost small" onClick={() => file.current?.click()}>
          <Icon name="upload" size={14} /> Importieren
        </button>
        <input
          ref={file}
          type="file"
          accept="application/json"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try {
              const data = JSON.parse(await f.text());
              if (typeof data !== 'object' || !Array.isArray(data.bookmarks ?? []) || !Array.isArray(data.collections ?? [])) throw new Error();
              actions.importState(data);
            } catch {
              alert('Die Datei ist keine gültige Sammlungs-Exportdatei.');
            }
            e.target.value = '';
          }}
        />
      </div>

      <h2><Icon name="bookmark" /> Lesezeichen ({bm.length})</h2>
      {bm.length === 0 ? (
        <p className="muted">Noch keine Lesezeichen. Nutze „Merken“ auf einer Artikelseite.</p>
      ) : (
        <div className="card-grid small">{bm.map((e) => <EntryCard key={e!.id} entry={e!} />)}</div>
      )}

      <h2><Icon name="folder" /> Sammlungen ({st.collections.length})</h2>
      <form
        className="filters"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) {
            actions.createCollection(name.trim());
            setName('');
          }
        }}
      >
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Prüfungsvorbereitung Beatmung" aria-label="Neue Sammlung" />
        <button className="btn primary small" type="submit"><Icon name="plus" size={14} /> Sammlung anlegen</button>
      </form>
      {st.collections.map((c) => <CollectionBox key={c.id} c={c} />)}

      {hist.length > 0 && (
        <>
          <h2>Verlauf</h2>
          <div className="card-grid small">{hist.map((e) => <EntryCard key={e!.id} entry={e!} />)}</div>
        </>
      )}
    </div>
  );
}
