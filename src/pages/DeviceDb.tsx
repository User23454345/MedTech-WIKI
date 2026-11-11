import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deviceGroupById, deviceGroups, devices, entries, getEntry, manufacturersOfDevice } from '../lib/data';
import { search } from '../lib/search';
import { actions, useUserState } from '../lib/storage';
import { Icon } from '../components/Icon';

/** Filterbare Gerätedatenbank (Filterzustand in der URL → teilbar) */
export function DeviceDb() {
  const [sp, setSp] = useSearchParams();
  const { compare } = useUserState();
  const q = sp.get('q') ?? '';
  const gruppe = sp.get('gruppe') ?? '';
  const hersteller = sp.get('hersteller') ?? '';
  const bereich = sp.get('bereich') ?? '';
  const stk = sp.get('stk') ?? '';
  const status = sp.get('status') ?? '';
  const sort = sp.get('sort') ?? 'rank';

  useEffect(() => {
    document.title = 'Gerätedatenbank – MedTech Wiki';
  }, []);

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v) n.set(k, v);
    else n.delete(k);
    setSp(n, { replace: true });
  };

  const mfrOf = useMemo(() => new Map(devices.map((d) => [d.id, manufacturersOfDevice(d).map((m) => m.id)])), []);
  const allMfr = useMemo(
    () => entries.filter((e) => e.type === 'manufacturer').sort((a, b) => a.title.localeCompare(b.title, 'de')),
    [],
  );
  const allDomains = useMemo(
    () => entries.filter((e) => e.type === 'domain').sort((a, b) => a.title.localeCompare(b.title, 'de')),
    [],
  );

  let list = devices;
  if (q.trim()) {
    const ids = new Set(search(q, 500).map((h) => h.entry.id));
    list = list.filter((d) => ids.has(d.id));
  }
  if (gruppe) list = list.filter((d) => d.deviceGroup === gruppe);
  if (hersteller) list = list.filter((d) => mfrOf.get(d.id)?.includes(hersteller));
  if (bereich) list = list.filter((d) => d.domains?.includes(bereich));
  if (stk) list = list.filter((d) => d.maintenance?.stk === stk || (stk === 'mtk' && d.maintenance?.mtk === 'ja'));
  if (status) list = list.filter((d) => d.status === status);
  list = [...list].sort((a, b) =>
    sort === 'name' ? a.title.localeCompare(b.title, 'de') : sort === 'gruppe'
      ? (deviceGroupById.get(a.deviceGroup)?.label ?? '').localeCompare(deviceGroupById.get(b.deviceGroup)?.label ?? '', 'de') || a.title.localeCompare(b.title, 'de')
      : (a.rank ?? 999) - (b.rank ?? 999),
  );
  const active = [q, gruppe, hersteller, bereich, stk, status].filter(Boolean).length;

  return (
    <div className="page">
      <nav className="breadcrumb"><Link to="/">Start</Link><span>/</span><Link to="/k/geraete">Geräte</Link></nav>
      <h1>Gerätedatenbank</h1>
      <p className="lead">
        {devices.length} Gerätetypen der Medizintechnik – filterbar nach Gerätegruppe, Hersteller, Fachbereich und
        Prüfpflichten. Bis zu vier Geräte lassen sich direkt vergleichen.
      </p>
      <div className="db-layout">
        <aside className="db-filters" aria-label="Filter">
          <label>
            <span>Freitext</span>
            <input className="input" value={q} onChange={(e) => set('q', e.target.value)} placeholder="z. B. Druck, Ultraschall …" />
          </label>
          <label>
            <span>Gerätegruppe</span>
            <select value={gruppe} onChange={(e) => set('gruppe', e.target.value)}>
              <option value="">Alle Gruppen</option>
              {deviceGroups.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </label>
          <label>
            <span>Hersteller</span>
            <select value={hersteller} onChange={(e) => set('hersteller', e.target.value)}>
              <option value="">Alle Hersteller</option>
              {allMfr.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </label>
          <label>
            <span>Fachbereich</span>
            <select value={bereich} onChange={(e) => set('bereich', e.target.value)}>
              <option value="">Alle Fachbereiche</option>
              {allDomains.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </label>
          <label>
            <span>Prüfpflicht (MPBetreibV)</span>
            <select value={stk} onChange={(e) => set('stk', e.target.value)}>
              <option value="">Keine Einschränkung</option>
              <option value="ja">STK erforderlich</option>
              <option value="mtk">MTK erforderlich</option>
              <option value="abhaengig">STK abhängig von Ausführung</option>
              <option value="nein">keine STK vorgeschrieben</option>
            </select>
          </label>
          <label>
            <span>Artikelumfang</span>
            <select value={status} onChange={(e) => set('status', e.target.value)}>
              <option value="">Alle</option>
              <option value="ausfuehrlich">Nur ausführliche Artikel</option>
              <option value="stub">Kurzeinträge</option>
            </select>
          </label>
          {active > 0 && (
            <button className="btn ghost small" onClick={() => setSp({}, { replace: true })}>
              <Icon name="x" size={14} /> Filter zurücksetzen
            </button>
          )}
        </aside>
        <section className="db-results">
          <div className="db-toolbar">
            <span><strong>{list.length}</strong> Geräte</span>
            <label className="small">
              Sortierung{' '}
              <select value={sort} onChange={(e) => set('sort', e.target.value === 'rank' ? '' : e.target.value)}>
                <option value="rank">Rangliste (Top 100)</option>
                <option value="name">Name A–Z</option>
                <option value="gruppe">Gerätegruppe</option>
              </select>
            </label>
          </div>
          <div className="table-wrap">
            <table className="data db-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Gerät</th>
                  <th>Gruppe</th>
                  <th>Hersteller (Auswahl)</th>
                  <th>STK / MTK</th>
                  <th aria-label="Vergleich" />
                </tr>
              </thead>
              <tbody>
                {list.map((d) => {
                  const inCmp = compare.includes(d.id);
                  const m = mfrOf.get(d.id) ?? [];
                  return (
                    <tr key={d.id}>
                      <td className="muted">{d.rank ?? ''}</td>
                      <td>
                        <Link to={`/e/${d.id}`} className="wikilink" data-id={d.id}>{d.title}</Link>
                        {d.status === 'ausfuehrlich' && <span className="badge st-ausfuehrlich">ausführlich</span>}
                        <div className="muted small">{d.summary}</div>
                      </td>
                      <td className="small">{deviceGroupById.get(d.deviceGroup)?.label}</td>
                      <td className="small">{m.slice(0, 3).map((x) => getEntry(x)?.title).join(', ') || <span className="muted">–</span>}{m.length > 3 && ` +${m.length - 3}`}</td>
                      <td className="small nowrap">
                        {d.maintenance ? (
                          <>
                            <span className={`dot ${d.maintenance.stk}`} title="STK" /> STK{' '}
                            <span className={`dot ${d.maintenance.mtk}`} title="MTK" /> MTK
                          </>
                        ) : <span className="muted">–</span>}
                      </td>
                      <td>
                        <button
                          className={`icon-btn ${inCmp ? 'on' : ''}`}
                          onClick={() => actions.toggleCompare(d.id)}
                          aria-pressed={inCmp}
                          title={inCmp ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen'}
                        >
                          <Icon name={inCmp ? 'check' : 'compare'} size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {list.length === 0 && <p className="muted">Keine Geräte entsprechen den Filtern.</p>}
          <p className="muted small legend-dots">
            <span className="dot ja" /> erforderlich <span className="dot abhaengig" /> abhängig von Ausführung{' '}
            <span className="dot nein" /> nicht vorgeschrieben (nach MPBetreibV Anlage 1/2)
          </p>
        </section>
      </div>
    </div>
  );
}
