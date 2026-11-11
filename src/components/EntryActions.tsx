import { useState } from 'react';
import { Link } from 'react-router-dom';
import { actions, useUserState } from '../lib/storage';
import type { Entry } from '../types';
import { Icon } from './Icon';

/** Lesezeichen, „Zur Sammlung hinzufügen“ und (bei Geräten) Vergleich */
export function EntryActions({ entry }: { entry: Entry }) {
  const st = useUserState();
  const [menu, setMenu] = useState(false);
  const [name, setName] = useState('');
  const marked = st.bookmarks.includes(entry.id);
  const comparing = st.compare.includes(entry.id);
  return (
    <div className="entry-actions">
      <button className={`btn ghost ${marked ? 'on' : ''}`} onClick={() => actions.toggleBookmark(entry.id)} aria-pressed={marked}>
        <Icon name="bookmark" /> {marked ? 'Gemerkt' : 'Merken'}
      </button>
      <div className="dropdown">
        <button className="btn ghost" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
          <Icon name="folder" /> Sammlung
        </button>
        {menu && (
          <div className="dropdown-menu" onMouseLeave={() => setMenu(false)}>
            <div className="dd-title">Zur Wissenssammlung hinzufügen</div>
            {st.collections.length === 0 && <p className="muted small">Noch keine Sammlung angelegt.</p>}
            {st.collections.map((c) => {
              const inside = c.items.some((i) => i.id === entry.id);
              return (
                <button
                  key={c.id}
                  className={`dd-item ${inside ? 'on' : ''}`}
                  onClick={() => (inside ? actions.removeFromCollection(c.id, entry.id) : actions.addToCollection(c.id, entry.id))}
                >
                  {inside ? '✓ ' : '+ '}
                  {c.name}
                </button>
              );
            })}
            <form
              className="dd-new"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                const cid = actions.createCollection(name.trim());
                actions.addToCollection(cid, entry.id);
                setName('');
              }}
            >
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Neue Sammlung …" aria-label="Name der neuen Sammlung" />
              <button className="btn small" type="submit">
                Anlegen
              </button>
            </form>
            <Link className="dd-link small" to="/sammlung">
              Alle Sammlungen verwalten →
            </Link>
          </div>
        )}
      </div>
      {entry.type === 'device' && (
        <button className={`btn ghost ${comparing ? 'on' : ''}`} onClick={() => actions.toggleCompare(entry.id)} aria-pressed={comparing}>
          <Icon name="compare" /> {comparing ? 'Im Vergleich' : 'Vergleichen'}
        </button>
      )}
    </div>
  );
}
