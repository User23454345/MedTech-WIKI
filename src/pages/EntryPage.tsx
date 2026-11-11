import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import {
  categories,
  deviceGroupById,
  devices,
  devicesOfManufacturer,
  getEntry,
  manufacturersOfDevice,
} from '../lib/data';
import { newEnv, renderInline, renderMarkdown, type RenderEnv } from '../lib/markdown';
import { actions } from '../lib/storage';
import type { DeviceEntry, Entry } from '../types';
import { EvidenceBadge, StatusBadge, TypeBadge } from '../components/Badges';
import { Connections } from '../components/Connections';
import { Diagram } from '../components/Diagram';
import { EntryActions } from '../components/EntryActions';
import { EntryCard } from '../components/EntryCard';
import { EntryLink } from '../components/EntryLink';
import { Gallery } from '../components/Gallery';
import { KnowledgePath } from '../components/KnowledgePath';
import { Html } from '../components/Markdown';
import { SourceList } from '../components/SourceList';
import { Toc, type TocItem } from '../components/Toc';
import { NotFound } from './NotFound';

const md = (src: string | undefined, env: RenderEnv, prefix?: string) => {
  env.prefix = prefix;
  const html = renderMarkdown(src, env);
  env.prefix = undefined;
  return html;
};
const il = (src: string | undefined, env: RenderEnv) => renderInline(src, env);

function Breadcrumb({ entry }: { entry: Entry }) {
  const cat = categories.find((c) => c.id === entry.category);
  return (
    <nav className="breadcrumb" aria-label="Brotkrumen">
      <Link to="/">Start</Link>
      {cat && cat.id !== entry.id && (
        <>
          <span>/</span>
          <Link to={`/k/${cat.id}`}>{cat.title}</Link>
        </>
      )}
      {entry.type === 'device' && deviceGroupById.get(entry.deviceGroup) && (
        <>
          <span>/</span>
          <Link to={`/geraete?gruppe=${entry.deviceGroup}`}>{deviceGroupById.get(entry.deviceGroup)!.label}</Link>
        </>
      )}
    </nav>
  );
}

function Header({ entry }: { entry: Entry }) {
  return (
    <header className="entry-head">
      <Breadcrumb entry={entry} />
      <div className="card-meta">
        <TypeBadge type={entry.type} />
        <StatusBadge status={entry.status} />
        <span className="muted small">Stand: {new Date(entry.updated).toLocaleDateString('de-DE')}</span>
      </div>
      <h1>{entry.title}</h1>
      {entry.aliases?.length ? <div className="aliases">Auch: {entry.aliases.join(' · ')}</div> : null}
      <p className="lead">{entry.summary}</p>
      <EntryActions entry={entry} />
    </header>
  );
}

function Paths({ entry }: { entry: Entry }) {
  if (!entry.paths?.length) return null;
  return (
    <section className="paths" id="wissenspfade">
      <h2>Wissenspfade</h2>
      <p className="muted small">Vom Gerät zur Grundlage – jeder Schritt führt zu einem eigenen Fachartikel.</p>
      {entry.paths.map((p, i) => (
        <KnowledgePath key={i} path={p} current={entry.id} />
      ))}
    </section>
  );
}

function StubNotice({ entry }: { entry: Entry }) {
  if (entry.status !== 'stub') return null;
  return (
    <div className="callout callout-hinweis" data-label="Kurzeintrag">
      <p>
        Dieser Eintrag ist ein Kurzeintrag der Gerätedatenbank. Ausführliche Inhalte (Funktionsprinzip, Aufbau,
        Prüfverfahren) werden ergänzt. Die bereits ausgearbeiteten Artikel findest du in der{' '}
        <Link to="/geraete?status=ausfuehrlich">Gerätedatenbank</Link>.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Geräteseite                                                         */
/* ------------------------------------------------------------------ */

const STK_LABEL = { ja: 'erforderlich', nein: 'nicht vorgeschrieben', abhaengig: 'abhängig von Ausführung' } as const;

function DevicePage({ d }: { d: DeviceEntry }) {
  const r = useMemo(() => {
    const env = newEnv();
    const s = d.sections ?? {};
    const out = {
      env,
      purpose: md(s.purpose, env, 'zweck'),
      applications: md(s.applications, env, 'einsatz'),
      principle: md(s.principle, env, 'prinzip'),
      construction: md(s.construction, env, 'aufbau'),
      components: (d.components ?? []).map((c) => il(c.role, env)),
      sensors: (d.sensors ?? []).map((c) => il(c.role, env)),
      specs: (d.specs ?? []).map((x) => ({
        note: il(x.note, env),
        cites: (x.sources ?? []).map((id) => il(`[@${id}]`, env)).join(''),
      })),
      risk: il(d.riskClass?.note, env) + (d.riskClass?.sources ?? []).map((id) => il(`[@${id}]`, env)).join(''),
      price: il(d.price?.note, env) + (d.price?.sources ?? []).map((id) => il(`[@${id}]`, env)).join(''),
      maintenance: md(s.maintenance, env, 'wartung'),
      faults: (d.faults ?? []).map((f) => ({ cause: il(f.cause, env), action: il(f.action, env) })),
      tests: (d.tests ?? []).map((t) => il(t.description, env)),
      testing: md(s.testing, env, 'pruefung'),
      body: md(d.body, env, 'mehr'),
    };
    return out;
  }, [d]);

  const mfrs = manufacturersOfDevice(d);
  const sameGroup = devices.filter((x) => x.deviceGroup === d.deviceGroup && x.id !== d.id);

  const toc: TocItem[] = [
    { id: 'steckbrief', text: 'Steckbrief', level: 2 },
    r.purpose && { id: 'zweck', text: 'Medizinischer Zweck', level: 2 },
    r.applications && { id: 'einsatz', text: 'Einsatzgebiete', level: 2 },
    r.principle && { id: 'prinzip', text: 'Funktionsprinzip', level: 2 },
    (r.construction || d.diagram) && { id: 'aufbau', text: 'Technischer Aufbau', level: 2 },
    (d.components?.length || d.sensors?.length) && { id: 'komponenten', text: 'Komponenten & Sensoren', level: 2 },
    d.specs?.length && { id: 'daten', text: 'Technische Daten', level: 2 },
    mfrs.length && { id: 'hersteller', text: 'Hersteller & Modelle', level: 2 },
    d.price && { id: 'preise', text: 'Anschaffungskosten', level: 2 },
    (d.maintenance || r.maintenance) && { id: 'wartung', text: 'Wartung & Instandhaltung', level: 2 },
    d.faults?.length && { id: 'fehler', text: 'Typische Fehler', level: 2 },
    (d.tests?.length || r.testing) && { id: 'pruefung', text: 'Prüfverfahren', level: 2 },
    r.body && { id: 'mehr', text: 'Vertiefung', level: 2 },
    d.paths?.length && { id: 'wissenspfade', text: 'Wissenspfade', level: 2 },
    { id: 'quellen', text: 'Quellen', level: 2 },
  ].filter(Boolean) as TocItem[];

  return (
    <div className="entry-layout">
      <article className="entry">
        <Header entry={d} />
        <StubNotice entry={d} />

        <section id="steckbrief" className="factbox">
          <h2 className="sr-only">Steckbrief</h2>
          <dl>
            <div>
              <dt>Gerätegruppe</dt>
              <dd>
                <Link to={`/geraete?gruppe=${d.deviceGroup}`}>{deviceGroupById.get(d.deviceGroup)?.label ?? d.deviceGroup}</Link>
              </dd>
            </div>
            {d.domains?.length ? (
              <div>
                <dt>Fachbereiche</dt>
                <dd>
                  {d.domains.map((x, i) => (
                    <span key={x}>
                      {i > 0 && ', '}
                      <EntryLink id={x} />
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            {d.riskClass && (
              <div>
                <dt>
                  Risikoklasse (<EntryLink id="mdr">MDR</EntryLink>)
                </dt>
                <dd>
                  <strong>{d.riskClass.value}</strong> <EvidenceBadge e={d.riskClass.evidence} />
                  {r.risk && <Html inline html={r.risk} className="small muted block" />}
                </dd>
              </div>
            )}
            {d.maintenance && (
              <>
                <div>
                  <dt>
                    <EntryLink id="stk">STK</EntryLink>
                  </dt>
                  <dd>{STK_LABEL[d.maintenance.stk]}</dd>
                </div>
                <div>
                  <dt>
                    <EntryLink id="mtk">MTK</EntryLink>
                  </dt>
                  <dd>{STK_LABEL[d.maintenance.mtk]}</dd>
                </div>
              </>
            )}
            {mfrs.length > 0 && (
              <div>
                <dt>Hersteller (Auswahl)</dt>
                <dd>
                  {mfrs.slice(0, 6).map((m, i) => (
                    <span key={m.id}>
                      {i > 0 && ', '}
                      <EntryLink id={m.id} />
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {r.purpose && (
          <section>
            <h2 id="zweck">Medizinischer Zweck</h2>
            <Html html={r.purpose} />
          </section>
        )}
        {r.applications && (
          <section>
            <h2 id="einsatz">Einsatzgebiete</h2>
            <Html html={r.applications} />
          </section>
        )}
        {r.principle && (
          <section>
            <h2 id="prinzip">Funktionsprinzip</h2>
            <Html html={r.principle} />
          </section>
        )}
        {(r.construction || d.diagram || d.images?.length) && (
          <section>
            <h2 id="aufbau">Technischer Aufbau</h2>
            {d.diagram && <Diagram d={d.diagram} />}
            <Html html={r.construction} />
            {d.images?.length ? <Gallery images={d.images} title={d.title} /> : null}
          </section>
        )}
        {(d.components?.length || d.sensors?.length) ? (
          <section>
            <h2 id="komponenten">Komponenten &amp; Sensoren</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Baugruppe</th>
                    <th>Art</th>
                    <th>Funktion im Gerät</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.components ?? []).map((c, i) => (
                    <tr key={'c' + i}>
                      <td><EntryLink id={c.ref} /></td>
                      <td><span className="badge neutral">Komponente</span></td>
                      <td><Html inline html={r.components[i]} /></td>
                    </tr>
                  ))}
                  {(d.sensors ?? []).map((c, i) => (
                    <tr key={'s' + i}>
                      <td><EntryLink id={c.ref} /></td>
                      <td><span className="badge sensor">Sensor</span></td>
                      <td><Html inline html={r.sensors[i]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {d.specs?.length ? (
          <section>
            <h2 id="daten">Technische Daten</h2>
            <p className="muted small">
              Gerätetyp-übergreifende Kennwerte. Maßgeblich sind stets die Angaben in der Gebrauchsanweisung des
              konkreten Modells. Belegqualität: <EvidenceBadge e="belegt" /> <EvidenceBadge e="typisch" />{' '}
              <EvidenceBadge e="beispiel" />
            </p>
            <div className="table-wrap">
              <table className="data specs">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Wert / Bereich</th>
                    <th>Erläuterung</th>
                    <th>Beleg</th>
                  </tr>
                </thead>
                <tbody>
                  {d.specs.map((x, i) => (
                    <tr key={i}>
                      <th scope="row">{x.param}</th>
                      <td className="val">{x.value}</td>
                      <td>
                        <Html inline html={r.specs[i].note} />
                      </td>
                      <td className="nowrap">
                        <EvidenceBadge e={x.evidence} />
                        <Html inline html={r.specs[i].cites} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
        {mfrs.length > 0 && (
          <section>
            <h2 id="hersteller">Hersteller &amp; bekannte Modelle</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Hersteller</th>
                    <th>Modelle / Produktlinien (Auswahl)</th>
                  </tr>
                </thead>
                <tbody>
                  {mfrs.map((m) => (
                    <tr key={m.id}>
                      <td><EntryLink id={m.id} /></td>
                      <td>
                        {m.models.join(', ') || <span className="muted">–</span>}
                        {m.note && <div className="muted small">{m.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">
              Modellnamen dienen der Orientierung; Verfügbarkeit, Varianten und Zulassungsstatus ändern sich. Keine
              Wertung oder Empfehlung.
            </p>
          </section>
        )}
        {d.price && (
          <section>
            <h2 id="preise">Anschaffungskosten</h2>
            <div className={`price-box ${d.price.status}`}>
              {d.price.status === 'belegt' && d.price.range ? (
                <div className="price-range">{d.price.range}</div>
              ) : (
                <div className="price-range muted">Keine verifizierte Preisangabe</div>
              )}
              <Html inline html={r.price} />
            </div>
          </section>
        )}
        {(d.maintenance || r.maintenance) && (
          <section>
            <h2 id="wartung">Wartung &amp; Instandhaltung</h2>
            {d.maintenance && (
              <div className="maint-grid">
                <div className={`maint-cell ${d.maintenance.stk}`}>
                  <span>Sicherheitstechnische Kontrolle</span>
                  <strong>{STK_LABEL[d.maintenance.stk]}</strong>
                </div>
                <div className={`maint-cell ${d.maintenance.mtk}`}>
                  <span>Messtechnische Kontrolle</span>
                  <strong>{STK_LABEL[d.maintenance.mtk]}</strong>
                </div>
                {d.maintenance.intervals && (
                  <div className="maint-cell wide">
                    <span>Fristen</span>
                    <strong>{d.maintenance.intervals}</strong>
                  </div>
                )}
                {d.maintenance.basis && <p className="muted small wide">{d.maintenance.basis}</p>}
              </div>
            )}
            <Html html={r.maintenance} />
          </section>
        )}
        {d.faults?.length ? (
          <section>
            <h2 id="fehler">Typische Fehler und Alarme</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Fehlerbild</th>
                    <th>Mögliche Ursachen</th>
                    <th>Vorgehen</th>
                  </tr>
                </thead>
                <tbody>
                  {d.faults.map((f, i) => (
                    <tr key={i}>
                      <th scope="row">{f.ref ? <EntryLink id={f.ref}>{f.title}</EntryLink> : f.title}</th>
                      <td><Html inline html={r.faults[i].cause} /></td>
                      <td><Html inline html={r.faults[i].action} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="muted small">
              Herstellerspezifische Fehlercodes sind den jeweiligen Service-Unterlagen zu entnehmen und werden hier
              bewusst nicht wiedergegeben. Instandsetzung nur durch befugtes Fachpersonal.
            </p>
          </section>
        ) : null}
        {(d.tests?.length || r.testing) && (
          <section>
            <h2 id="pruefung">Relevante Prüfverfahren</h2>
            {d.tests?.length ? (
              <ul className="test-list">
                {d.tests.map((t, i) => (
                  <li key={i}>
                    <strong>{t.ref ? <EntryLink id={t.ref}>{t.name}</EntryLink> : t.name}</strong>
                    <Html inline html={r.tests[i]} className="block" />
                  </li>
                ))}
              </ul>
            ) : null}
            <Html html={r.testing} />
          </section>
        )}
        {r.body && (
          <section>
            <h2 id="mehr">Vertiefung</h2>
            <Html html={r.body} />
          </section>
        )}
        <Paths entry={d} />
        {sameGroup.length > 0 && (
          <section>
            <h2 className="h-small">Weitere Geräte der Gruppe {deviceGroupById.get(d.deviceGroup)?.label}</h2>
            <div className="card-grid small">
              {sameGroup.slice(0, 6).map((x) => (
                <EntryCard key={x.id} entry={x} showType={false} />
              ))}
            </div>
          </section>
        )}
        <SourceList cited={r.env.citations} extra={d.sources} />
      </article>
      <aside className="entry-aside">
        <Toc items={toc} />
        <Connections id={d.id} />
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Generische Seite (Begriff, Hersteller, Norm, Fehlerbild, Fachbereich) */
/* ------------------------------------------------------------------ */

function GenericPage({ e }: { e: Entry }) {
  const r = useMemo(() => {
    const env = newEnv();
    const body = md(e.body, env);
    const causes = e.type === 'fault' ? (e.causes ?? []).map((c) => il(c, env)) : [];
    const acts = e.type === 'fault' ? (e.actions ?? []).map((c) => il(c, env)) : [];
    return { env, body, causes, acts };
  }, [e]);

  const mfrDevices = e.type === 'manufacturer' ? devicesOfManufacturer(e.id) : [];
  const domainDevices = e.type === 'domain' ? devices.filter((d) => d.domains?.includes(e.id)) : [];

  const toc: TocItem[] = [
    ...r.env.headings.filter((h) => h.level <= 3),
    ...(e.type === 'fault' && r.causes.length ? [{ id: 'ursachen', text: 'Ursachen & Maßnahmen', level: 2 }] : []),
    ...(mfrDevices.length ? [{ id: 'produkte', text: 'Geräte & Modelle', level: 2 }] : []),
    ...(domainDevices.length ? [{ id: 'geraete', text: 'Geräte im Fachbereich', level: 2 }] : []),
    ...(e.paths?.length ? [{ id: 'wissenspfade', text: 'Wissenspfade', level: 2 }] : []),
    { id: 'quellen', text: 'Quellen', level: 2 },
  ];

  return (
    <div className="entry-layout">
      <article className="entry">
        <Header entry={e} />
        {e.type === 'standard' && (
          <section className="factbox">
            <dl>
              <div>
                <dt>Kennung</dt>
                <dd><strong>{e.code}</strong></dd>
              </div>
              <div>
                <dt>Art</dt>
                <dd>{{ norm: 'Norm', gesetz: 'Gesetz', verordnung: 'Verordnung', richtlinie: 'Richtlinie', leitfaden: 'Leitfaden' }[e.kind]}</dd>
              </div>
              {e.fullTitle && (
                <div className="wide">
                  <dt>Titel</dt>
                  <dd>{e.fullTitle}</dd>
                </div>
              )}
              {e.scope && (
                <div className="wide">
                  <dt>Anwendungsbereich</dt>
                  <dd>{e.scope}</dd>
                </div>
              )}
            </dl>
          </section>
        )}
        {e.type === 'manufacturer' && (e.headquarters || e.founded || e.website) && (
          <section className="factbox">
            <dl>
              {e.headquarters && (
                <div>
                  <dt>Hauptsitz</dt>
                  <dd>{e.headquarters}</dd>
                </div>
              )}
              {e.founded && (
                <div>
                  <dt>Gegründet</dt>
                  <dd>{e.founded}</dd>
                </div>
              )}
              {e.website && (
                <div>
                  <dt>Website</dt>
                  <dd>
                    <a href={e.website} target="_blank" rel="noreferrer noopener">
                      {e.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}
        {e.diagram && <Diagram d={e.diagram} />}
        {e.images?.length ? <Gallery images={e.images} title={e.title} /> : null}
        <Html html={r.body} />
        {e.type === 'fault' && (r.causes.length > 0 || r.acts.length > 0) && (
          <section>
            <h2 id="ursachen">Ursachen &amp; Maßnahmen</h2>
            <div className="two-col">
              <div className="panel">
                <h3>Mögliche Ursachen</h3>
                <ul>{r.causes.map((c, i) => <li key={i}><Html inline html={c} /></li>)}</ul>
              </div>
              <div className="panel">
                <h3>Maßnahmen</h3>
                <ul>{r.acts.map((c, i) => <li key={i}><Html inline html={c} /></li>)}</ul>
              </div>
            </div>
            {e.devices?.length ? (
              <p>
                Betrifft u. a.:{' '}
                {e.devices.map((x, i) => (
                  <span key={x}>
                    {i > 0 && ', '}
                    <EntryLink id={x} />
                  </span>
                ))}
              </p>
            ) : null}
          </section>
        )}
        {mfrDevices.length > 0 && (
          <section>
            <h2 id="produkte">Geräte &amp; Modelle im Wiki</h2>
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Gerätetyp</th>
                    <th>Modelle / Produktlinien (Auswahl)</th>
                  </tr>
                </thead>
                <tbody>
                  {mfrDevices.map((m) => (
                    <tr key={m.device.id}>
                      <td><EntryLink id={m.device.id} /></td>
                      <td>{m.models.join(', ') || <span className="muted">–</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {domainDevices.length > 0 && (
          <section>
            <h2 id="geraete">Geräte im Fachbereich {e.title}</h2>
            <div className="card-grid small">
              {domainDevices.map((x) => (
                <EntryCard key={x.id} entry={x} showType={false} />
              ))}
            </div>
          </section>
        )}
        <Paths entry={e} />
        <SourceList cited={r.env.citations} extra={e.sources} />
      </article>
      <aside className="entry-aside">
        <Toc items={toc} />
        <Connections id={e.id} />
      </aside>
    </div>
  );
}

export function EntryPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const e = getEntry(id);

  useEffect(() => {
    if (e) actions.visit(e.id);
    document.title = e ? `${e.title} – MedTech Wiki` : 'MedTech Wiki';
  }, [e]);

  useEffect(() => {
    const s = sp.get('s');
    if (s) setTimeout(() => document.getElementById(s)?.scrollIntoView({ block: 'start' }), 50);
  }, [sp, id]);

  if (!e) return <NotFound what={id} />;
  if (e.type === 'category') return <Navigate to={`/k/${e.id}`} replace />;
  return e.type === 'device' ? <DevicePage key={e.id} d={e} /> : <GenericPage key={e.id} e={e} />;
}

