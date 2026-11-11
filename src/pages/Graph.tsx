import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, type SimulationNodeDatum } from 'd3-force';
import { backlinks, entries, getEntry, outgoing, TYPE_LABEL } from '../lib/data';
import type { EntryType } from '../types';

/**
 * Wissensnetz: Kraftbasierte Darstellung der Verknüpfungen.
 * Modus „Umgebung“ zeigt die Nachbarschaft eines Artikels (1–2 Schritte),
 * Modus „Gesamtnetz“ alle Datensätze.
 */

const COLORS: Record<EntryType, string> = {
  category: '#0b2545',
  device: '#0d9488',
  term: '#2563eb',
  manufacturer: '#9333ea',
  standard: '#b45309',
  fault: '#dc2626',
  domain: '#0891b2',
};

interface N extends SimulationNodeDatum {
  id: string;
  type: EntryType;
  title: string;
  deg: number;
}
interface L {
  source: N | string;
  target: N | string;
}

function neighbourhood(center: string, depth: number): Set<string> {
  const seen = new Set([center]);
  let frontier = [center];
  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const n of [...(outgoing.get(id) ?? []), ...(backlinks.get(id) ?? [])]) {
        if (getEntry(n)?.type === 'category') continue;
        if (!seen.has(n)) {
          seen.add(n);
          next.push(n);
        }
      }
    }
    frontier = next;
  }
  return seen;
}

export function Graph() {
  const nav = useNavigate();
  const [sp, setSp] = useSearchParams();
  const center = sp.get('id') ?? 'beatmungsgeraet';
  const depth = Number(sp.get('tiefe') ?? 1);
  const all = sp.get('modus') === 'alle';
  const [hidden, setHidden] = useState<Set<EntryType>>(new Set(['category']));
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const W = 1000;
  const H = 680;

  useEffect(() => {
    document.title = 'Wissensnetz – MedTech Wiki';
  }, []);

  const { nodes, links } = useMemo(() => {
    const ids = all ? new Set(entries.map((e) => e.id)) : neighbourhood(center, depth);
    const keep = [...ids].filter((id) => {
      const e = getEntry(id);
      return e && !hidden.has(e.type);
    });
    const set = new Set(keep);
    const links: L[] = [];
    for (const id of keep) for (const t of outgoing.get(id) ?? []) if (set.has(t)) links.push({ source: id, target: t });
    const deg = new Map<string, number>();
    links.forEach((l) => {
      deg.set(l.source as string, (deg.get(l.source as string) ?? 0) + 1);
      deg.set(l.target as string, (deg.get(l.target as string) ?? 0) + 1);
    });
    const nodes: N[] = keep.map((id, i) => {
      const e = getEntry(id)!;
      const a = (i / keep.length) * Math.PI * 2;
      return {
        id,
        type: e.type,
        title: e.title,
        deg: deg.get(id) ?? 0,
        x: id === center ? W / 2 : W / 2 + Math.cos(a) * 250,
        y: id === center ? H / 2 : H / 2 + Math.sin(a) * 200,
        fx: !all && id === center ? W / 2 : undefined,
        fy: !all && id === center ? H / 2 : undefined,
      };
    });
    const sim = forceSimulation(nodes)
      .force('link', forceLink<N, L>(links).id((d) => d.id).distance(all ? 40 : 90).strength(0.4))
      .force('charge', forceManyBody().strength(all ? -40 : -260))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide<N>().radius((d) => 6 + Math.sqrt(d.deg) * 2))
      .stop();
    for (let i = 0; i < 320; i++) sim.tick();
    return { nodes, links };
  }, [center, depth, all, hidden]);

  useEffect(() => setView({ x: 0, y: 0, k: 1 }), [center, depth, all]);

  const nb = useMemo(() => {
    if (!hover) return null;
    const s = new Set([hover]);
    links.forEach((l) => {
      const a = (l.source as N).id;
      const b = (l.target as N).id;
      if (a === hover) s.add(b);
      if (b === hover) s.add(a);
    });
    return s;
  }, [hover, links]);

  const r = (n: N) => (n.id === center && !all ? 14 : 4 + Math.min(10, Math.sqrt(n.deg) * 1.6));
  const showLabel = (n: N) => !all || n.deg > 12 || nb?.has(n.id);
  const ce = getEntry(center);
  const types: EntryType[] = ['device', 'term', 'domain', 'manufacturer', 'standard', 'fault', 'category'];

  return (
    <div className="page">
      <nav className="breadcrumb"><Link to="/">Start</Link></nav>
      <h1>Wissensnetz</h1>
      <p className="lead">
        Alle Artikel sind über Verweise miteinander verknüpft. Klicke einen Knoten, um ihn ins Zentrum zu setzen;
        Doppelklick öffnet den Artikel. Mausrad zoomt, Ziehen verschiebt.
      </p>
      <div className="filters">
        <div className="seg">
          <button className={!all ? 'active' : ''} onClick={() => setSp({ id: center, tiefe: String(depth) })}>Umgebung</button>
          <button className={all ? 'active' : ''} onClick={() => setSp({ id: center, modus: 'alle' })}>Gesamtnetz</button>
        </div>
        {!all && (
          <div className="seg">
            {[1, 2].map((d) => (
              <button key={d} className={depth === d ? 'active' : ''} onClick={() => setSp({ id: center, tiefe: String(d) })}>
                {d} {d === 1 ? 'Schritt' : 'Schritte'}
              </button>
            ))}
          </div>
        )}
        <div className="legend">
          {types.map((t) => (
            <label key={t} className="legend-item clickable">
              <input
                type="checkbox"
                checked={!hidden.has(t)}
                onChange={() => {
                  const n = new Set(hidden);
                  if (n.has(t)) n.delete(t);
                  else n.add(t);
                  setHidden(n);
                }}
              />
              <i className="lg-dot" style={{ background: COLORS[t] }} />
              {TYPE_LABEL[t]}
            </label>
          ))}
        </div>
      </div>
      {!all && ce && (
        <p className="small">
          Zentrum: <Link to={`/e/${ce.id}`}><strong>{ce.title}</strong></Link> · {nodes.length} Knoten · {links.length} Verknüpfungen
        </p>
      )}
      <div className="graph-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="graph"
          onWheel={(e) => {
            const k = Math.min(6, Math.max(0.4, view.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
            setView((v) => ({ ...v, k }));
          }}
          onMouseDown={(e) => (drag.current = { x: e.clientX - view.x, y: e.clientY - view.y })}
          onMouseMove={(e) => drag.current && setView((v) => ({ ...v, x: e.clientX - drag.current!.x, y: e.clientY - drag.current!.y }))}
          onMouseUp={() => (drag.current = null)}
          onMouseLeave={() => (drag.current = null)}
          role="img"
          aria-label="Wissensnetz"
        >
          <g transform={`translate(${view.x},${view.y}) translate(${W / 2},${H / 2}) scale(${view.k}) translate(${-W / 2},${-H / 2})`}>
            {links.map((l, i) => {
              const a = l.source as N;
              const b = l.target as N;
              const on = nb && nb.has(a.id) && nb.has(b.id) && (a.id === hover || b.id === hover);
              return (
                <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? '#0d9488' : '#94a3b8'} strokeOpacity={nb ? (on ? 0.9 : 0.06) : all ? 0.12 : 0.35} strokeWidth={on ? 1.6 : 0.8} />
              );
            })}
            {nodes.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className="g-node"
                opacity={nb && !nb.has(n.id) ? 0.15 : 1}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSp(all ? { id: n.id, modus: 'alle' } : { id: n.id, tiefe: String(depth) })}
                onDoubleClick={() => nav(`/e/${n.id}`)}
              >
                <circle r={r(n)} fill={COLORS[n.type]} stroke="#fff" strokeWidth={1.5} />
                {showLabel(n) && (
                  <text y={-r(n) - 4} textAnchor="middle" className={n.id === center ? 'center' : ''}>
                    {n.title.length > 28 ? n.title.slice(0, 26) + '…' : n.title}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
