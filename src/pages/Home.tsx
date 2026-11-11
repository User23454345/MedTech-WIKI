import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { categories, devices, entries, entriesInCategory, getEntry, sources } from '../lib/data';
import { useUserState } from '../lib/storage';
import { Icon } from '../components/Icon';
import { EntryCard } from '../components/EntryCard';
import { KnowledgePath } from '../components/KnowledgePath';

const FEATURED_PATH = ['beatmungsgeraet', 'turbine', 'elektromotor', 'elektrotechnik', 'drehzahlregelung', 'sensorik', 'druckmessung'];

export function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const { history } = useUserState();
  const detailed = devices.filter((d) => d.status === 'ausfuehrlich').sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  const recent = history.map((id) => getEntry(id)).filter(Boolean).slice(0, 6);
  const nTerms = entries.filter((e) => e.type !== 'device' && e.type !== 'category').length;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Das verknüpfte Nachschlagewerk der Medizintechnik</p>
          <h1>
            Medizintechnik verstehen –<br />
            vom Gerät bis zur physikalischen Grundlage.
          </h1>
          <p className="hero-sub">
            Geräte, Komponenten, Sensorik, Elektronik, Physik, Anatomie, Recht und Normen in einem Wissensnetz.
            Jeder Fachbegriff führt zu seiner eigenen Erklärung.
          </p>
          <form
            className="hero-search"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) nav(`/suche?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <Icon name="search" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gerät, Bauteil, Norm oder Abkürzung suchen …" aria-label="Suche" />
            <button className="btn primary" type="submit">Suchen</button>
          </form>
          <div className="hero-stats">
            <div><strong>{devices.length}</strong><span>Gerätetypen</span></div>
            <div><strong>{detailed.length}</strong><span>ausführliche Geräteartikel</span></div>
            <div><strong>{nTerms}</strong><span>Fachartikel &amp; Begriffe</span></div>
            <div><strong>{sources.length}</strong><span>Quellen</span></div>
          </div>
        </div>
        <svg className="hero-art" viewBox="0 0 400 260" aria-hidden="true">
          <defs>
            <linearGradient id="hg" x1="0" x2="1">
              <stop offset="0" stopColor="#2dd4bf" stopOpacity=".9" />
              <stop offset="1" stopColor="#38bdf8" stopOpacity=".6" />
            </linearGradient>
          </defs>
          {[[60, 60], [200, 40], [330, 80], [110, 170], [260, 160], [350, 210], [40, 220], [190, 230]].map(([x, y], i, a) =>
            a.slice(i + 1).filter((_, j) => (i + j) % 3 !== 2).map(([x2, y2], j) => (
              <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#5eead4" strokeOpacity=".18" />
            )),
          )}
          {[[60, 60], [200, 40], [330, 80], [110, 170], [260, 160], [350, 210], [40, 220], [190, 230]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 7 : 4.5} fill="url(#hg)" />
          ))}
          <path d="M0 130h90l14-34 22 70 18-52 10 16h246" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Wissensverknüpfung an einem Beispiel</h2>
          <Link to="/netz">Zum Wissensnetz →</Link>
        </div>
        <p className="muted">
          Vom Intensivbeatmungsgerät über die Turbine und ihren Antrieb bis zur Druckmessung – jeder Schritt ist ein
          eigener Fachartikel:
        </p>
        <KnowledgePath path={FEATURED_PATH} />
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Hauptkategorien</h2>
        </div>
        <div className="cat-grid">
          {categories.map((c) => {
            const n = c.id === 'geraete' ? devices.length : entriesInCategory(c.id).length;
            return (
              <Link key={c.id} to={`/k/${c.id}`} className="cat-card">
                <span className="cat-icon"><Icon name={c.icon} size={22} /></span>
                <span className="cat-text">
                  <strong>{c.title}</strong>
                  <small>{c.summary}</small>
                </span>
                <span className="cat-count">{n}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-section">
        <div className="section-head">
          <h2>Ausführliche Geräteartikel</h2>
          <Link to="/geraete">Alle {devices.length} Geräte →</Link>
        </div>
        <div className="card-grid">
          {detailed.map((d) => <EntryCard key={d.id} entry={d} showType={false} />)}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="home-section">
          <div className="section-head">
            <h2>Zuletzt angesehen</h2>
            <Link to="/sammlung">Meine Sammlung →</Link>
          </div>
          <div className="card-grid small">
            {recent.map((e) => <EntryCard key={e!.id} entry={e!} />)}
          </div>
        </section>
      )}

      <section className="home-section quality">
        <div>
          <h2>Wissenschaftliche Qualität</h2>
          <p>
            Jede Aussage ist nach ihrer Belegqualität gekennzeichnet: <span className="badge ev-belegt">belegt</span>{' '}
            durch Gesetz, Norm, Fachbuch oder Herstellerangabe, <span className="badge ev-typisch">typisch</span> als
            Wertebereich aus der Literatur, <span className="badge ev-vereinfacht">vereinfacht</span> als didaktische
            Erklärung und <span className="badge ev-beispiel">Beispiel</span> für illustrative Darstellungen. Technische
            Daten, Preise oder Fehlercodes werden nicht erfunden – fehlt ein Beleg, wird das ausgewiesen.
          </p>
          <Link className="btn" to="/methodik">Methodik &amp; Qualitätsgrundsätze</Link>
        </div>
      </section>
    </div>
  );
}
