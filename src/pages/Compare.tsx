import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deviceGroupById, devices, getEntry, manufacturersOfDevice } from '../lib/data';
import { plainText } from '../lib/markdown';
import { actions, useUserState } from '../lib/storage';
import type { DeviceEntry } from '../types';
import { EntryLink } from '../components/EntryLink';
import { EvidenceBadge } from '../components/Badges';

const STK = { ja: 'erforderlich', nein: 'nicht vorgeschrieben', abhaengig: 'abhängig' } as const;

export function Compare() {
  const [sp, setSp] = useSearchParams();
  const st = useUserState();
  const fromUrl = (sp.get('ids') ?? '').split(',').filter(Boolean);
  const ids = (fromUrl.length ? fromUrl : st.compare).filter((id) => getEntry(id)?.type === 'device').slice(0, 4);
  const list = ids.map((id) => getEntry(id) as DeviceEntry);

  useEffect(() => {
    document.title = 'Gerätevergleich – MedTech Wiki';
  }, []);

  const setIds = (n: string[]) => setSp(n.length ? { ids: n.join(',') } : {}, { replace: true });
  const params = [...new Set(list.flatMap((d) => (d.specs ?? []).map((s) => s.param)))];

  return (
    <div className="page">
      <nav className="breadcrumb"><Link to="/">Start</Link><span>/</span><Link to="/geraete">Geräte</Link></nav>
      <h1>Gerätevergleich</h1>
      <p className="lead">Bis zu vier Gerätetypen nebeneinander: Zweck, Prinzip, Sensorik, Prüfpflichten und Kennwerte.</p>
      <div className="filters">
        <select
          value=""
          onChange={(e) => e.target.value && setIds([...ids, e.target.value].slice(-4))}
          aria-label="Gerät hinzufügen"
          disabled={ids.length >= 4}
        >
          <option value="">+ Gerät hinzufügen …</option>
          {[...devices].sort((a, b) => a.title.localeCompare(b.title, 'de')).filter((d) => !ids.includes(d.id)).map((d) => (
            <option key={d.id} value={d.id}>{d.title}{d.status === 'ausfuehrlich' ? ' ★' : ''}</option>
          ))}
        </select>
        {list.length > 0 && (
          <button className="btn ghost small" onClick={() => { setIds([]); actions.clearCompare(); }}>Alle entfernen</button>
        )}
        <span className="muted small">★ = ausführlicher Artikel mit technischen Daten</span>
      </div>
      {list.length === 0 ? (
        <div className="empty">
          <p>Noch keine Geräte ausgewählt. Wähle oben Geräte aus oder nutze „Vergleichen“ auf einer Geräteseite.</p>
          <p>
            Vorschlag:{' '}
            <Link to="/vergleich?ids=infusionspumpe,spritzenpumpe">Infusionspumpe vs. Spritzenpumpe</Link> ·{' '}
            <Link to="/vergleich?ids=computertomograph,mrt">CT vs. MRT</Link> ·{' '}
            <Link to="/vergleich?ids=beatmungsgeraet,anaesthesiegeraet">Beatmungs- vs. Anästhesiegerät</Link>
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data compare">
            <thead>
              <tr>
                <th />
                {list.map((d) => (
                  <th key={d.id}>
                    <EntryLink id={d.id} />
                    <button className="link-btn small" onClick={() => setIds(ids.filter((x) => x !== d.id))}>entfernen</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr><th scope="row">Gerätegruppe</th>{list.map((d) => <td key={d.id}>{deviceGroupById.get(d.deviceGroup)?.label}</td>)}</tr>
              <tr><th scope="row">Kurzbeschreibung</th>{list.map((d) => <td key={d.id}>{d.summary}</td>)}</tr>
              <tr><th scope="row">Risikoklasse</th>{list.map((d) => <td key={d.id}>{d.riskClass ? <>{d.riskClass.value} <EvidenceBadge e={d.riskClass.evidence} /></> : '–'}</td>)}</tr>
              <tr><th scope="row">STK</th>{list.map((d) => <td key={d.id}>{d.maintenance ? STK[d.maintenance.stk] : '–'}</td>)}</tr>
              <tr><th scope="row">MTK</th>{list.map((d) => <td key={d.id}>{d.maintenance ? STK[d.maintenance.mtk] : '–'}</td>)}</tr>
              <tr><th scope="row">Funktionsprinzip</th>{list.map((d) => <td key={d.id} className="clamp">{plainText(d.sections?.principle).slice(0, 420) || '–'}{(d.sections?.principle?.length ?? 0) > 420 && ' …'}</td>)}</tr>
              <tr><th scope="row">Sensoren</th>{list.map((d) => <td key={d.id}>{d.sensors?.length ? d.sensors.map((s) => <div key={s.ref}><EntryLink id={s.ref} /></div>) : '–'}</td>)}</tr>
              <tr><th scope="row">Komponenten</th>{list.map((d) => <td key={d.id}>{d.components?.length ? d.components.map((s) => <div key={s.ref}><EntryLink id={s.ref} /></div>) : '–'}</td>)}</tr>
              <tr><th scope="row">Hersteller</th>{list.map((d) => <td key={d.id}>{manufacturersOfDevice(d).map((m) => <div key={m.id}><EntryLink id={m.id} /></div>)}</td>)}</tr>
              {params.length > 0 && (
                <tr className="sub"><th colSpan={list.length + 1}>Technische Kennwerte</th></tr>
              )}
              {params.map((p) => (
                <tr key={p}>
                  <th scope="row">{p}</th>
                  {list.map((d) => {
                    const s = d.specs?.find((x) => x.param === p);
                    return <td key={d.id}>{s ? <>{s.value} <EvidenceBadge e={s.evidence} /></> : <span className="muted">–</span>}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
