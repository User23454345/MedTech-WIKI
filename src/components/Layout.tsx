import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { categories, entries, devices } from '../lib/data';
import { search, type Hit } from '../lib/search';
import { useUserState } from '../lib/storage';
import { TypeBadge } from './Badges';
import { CompareBar } from './CompareBar';
import { HoverPreview } from './HoverPreview';
import { Icon } from './Icon';

function GlobalSearch() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const hits: Hit[] = q.trim().length >= 1 ? search(q, 8) : [];

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA')) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    setQ('');
    input.current?.blur();
    nav(path);
  };

  return (
    <div className="gsearch" role="search">
      <Icon name="search" className="gs-icon" />
      <input
        ref={input}
        value={q}
        placeholder={`Suche in ${entries.length} Artikeln … (z. B. Turbine, SpO₂, MPBetreibV)`}
        aria-label="Globale Suche"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setSel(0);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSel((s) => Math.min(s + 1, hits.length));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSel((s) => Math.max(s - 1, 0));
          } else if (e.key === 'Enter') {
            if (hits[sel]) go(`/e/${hits[sel].entry.id}`);
            else if (q.trim()) go(`/suche?q=${encodeURIComponent(q.trim())}`);
          } else if (e.key === 'Escape') {
            setOpen(false);
            input.current?.blur();
          }
        }}
      />
      <kbd className="gs-kbd">Strg K</kbd>
      {open && q.trim() && (
        <div className="gs-results" role="listbox">
          {hits.length === 0 && <div className="gs-empty">Keine Treffer für „{q}“</div>}
          {hits.map((h, i) => (
            <button
              key={h.entry.id}
              role="option"
              aria-selected={i === sel}
              className={`gs-hit ${i === sel ? 'sel' : ''}`}
              onMouseEnter={() => setSel(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => go(`/e/${h.entry.id}`)}
            >
              <TypeBadge type={h.entry.type} />
              <span className="gs-title">{h.entry.title}</span>
              <span className="gs-sum">{h.entry.summary}</span>
            </button>
          ))}
          <button
            className={`gs-all ${sel === hits.length ? 'sel' : ''}`}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => go(`/suche?q=${encodeURIComponent(q.trim())}`)}
          >
            Alle Ergebnisse für „{q}“ anzeigen →
          </button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  const { bookmarks } = useUserState();

  useEffect(() => {
    setMenu(false);
    if (!loc.search.includes('s=')) window.scrollTo(0, 0);
  }, [loc.pathname, loc.search]);

  return (
    <div className="app">
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Zum Inhalt springen
      </a>
      <header className="topbar">
        <button className="icon-btn menu-btn" onClick={() => setMenu((m) => !m)} aria-label="Menü">
          <Icon name={menu ? 'x' : 'menu'} />
        </button>
        <Link to="/" className="logo" aria-label="MedTech Wiki – Startseite">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
            <rect width="32" height="32" rx="7" fill="#0b2545" />
            <path d="M5 17h5l2.5-6 4 12 3-9 1.8 3H27" fill="none" stroke="#2dd4bf" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            MedTech<b>Wiki</b>
          </span>
        </Link>
        <GlobalSearch />
        <nav className="topnav" aria-label="Hauptnavigation">
          <NavLink to="/geraete">Geräte</NavLink>
          <NavLink to="/glossar">Glossar</NavLink>
          <NavLink to="/netz">Wissensnetz</NavLink>
          <NavLink to="/sammlung" className="with-count">
            <Icon name="bookmark" size={16} /> Sammlung{bookmarks.length > 0 && <span className="count">{bookmarks.length}</span>}
          </NavLink>
        </nav>
      </header>
      <div className="shell">
        <aside className={`sidebar ${menu ? 'open' : ''}`} aria-label="Kategorien">
          <div className="side-title">Hauptkategorien</div>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <NavLink to={`/k/${c.id}`}>
                  <Icon name={c.icon} size={16} />
                  <span>{c.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="side-title">Werkzeuge</div>
          <ul>
            <li><NavLink to="/geraete"><Icon name="filter" size={16} /><span>Gerätedatenbank</span></NavLink></li>
            <li><NavLink to="/vergleich"><Icon name="compare" size={16} /><span>Gerätevergleich</span></NavLink></li>
            <li><NavLink to="/glossar"><Icon name="list" size={16} /><span>Glossar A–Z</span></NavLink></li>
            <li><NavLink to="/netz"><Icon name="graph" size={16} /><span>Wissensnetz</span></NavLink></li>
            <li><NavLink to="/quellen"><Icon name="quote" size={16} /><span>Quellenverzeichnis</span></NavLink></li>
            <li><NavLink to="/sammlung"><Icon name="folder" size={16} /><span>Meine Sammlung</span></NavLink></li>
            <li><NavLink to="/methodik"><Icon name="info" size={16} /><span>Methodik &amp; Qualität</span></NavLink></li>
          </ul>
        </aside>
        {menu && <div className="scrim" onClick={() => setMenu(false)} />}
        <main id="main" tabIndex={-1}>
          <Outlet />
          <footer className="footer">
            <div>
              <strong>MedTech Wiki</strong> · {entries.length} Datensätze · {devices.length} Gerätetypen ·{' '}
              <Link to="/methodik">Methodik &amp; Qualitätsgrundsätze</Link>
            </div>
            <div className="muted small">
              Nachschlagewerk zu Bildungszwecken. Ersetzt weder Gebrauchsanweisung, Herstellerschulung noch
              Einweisung nach MPBetreibV. Keine medizinische Beratung.
            </div>
          </footer>
        </main>
      </div>
      <CompareBar />
      <HoverPreview />
    </div>
  );
}
