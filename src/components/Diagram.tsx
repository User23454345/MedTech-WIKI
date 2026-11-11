import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Diagram as D, DiagramEdge, DiagramNode } from '../types';
import { getEntry } from '../lib/data';

/**
 * Interaktives technisches Blockschaltbild. Knoten mit `ref` sind anklickbar
 * und führen zum verknüpften Artikel; Hover hebt Signal-/Stoffpfade hervor.
 */

const EDGE_STYLE: Record<NonNullable<DiagramEdge['kind']>, { color: string; dash?: string; label: string }> = {
  gas: { color: '#0ea5a4', label: 'Gasfluss' },
  fluid: { color: '#2563eb', label: 'Flüssigkeit / Blut' },
  signal: { color: '#64748b', dash: '5 4', label: 'Messsignal' },
  data: { color: '#7c3aed', dash: '2 4', label: 'Daten / Steuerung' },
  power: { color: '#d97706', label: 'Elektrische Energie' },
  energy: { color: '#dc2626', label: 'Therapeutische Energie / Strahlung' },
};

const NODE_KIND_LABEL: Record<NonNullable<DiagramNode['kind']>, string> = {
  patient: 'Patient',
  source: 'Versorgung / Quelle',
  process: 'Funktionsblock',
  sensor: 'Sensor',
  actuator: 'Aktor',
  control: 'Steuerung / Elektronik',
  output: 'Ausgabe / Anzeige',
};

const W = 150;
const H = 52;

function size(n: DiagramNode) {
  return { w: n.w ?? W, h: n.h ?? H };
}

/** Schnittpunkt der Linie Mittelpunkt→Ziel mit dem Rechteckrand */
function border(n: DiagramNode, tx: number, ty: number) {
  const { w, h } = size(n);
  const dx = tx - n.x;
  const dy = ty - n.y;
  if (dx === 0 && dy === 0) return { x: n.x, y: n.y };
  const sx = Math.abs(dx) / (w / 2 + 4);
  const sy = Math.abs(dy) / (h / 2 + 4);
  const s = Math.max(sx, sy);
  return { x: n.x + dx / s, y: n.y + dy / s };
}

export function Diagram({ d }: { d: D }) {
  const nav = useNavigate();
  const [hover, setHover] = useState<string | null>(null);
  const nodes = new Map(d.nodes.map((n) => [n.id, n]));
  const kinds = [...new Set(d.edges.map((e) => e.kind ?? 'signal'))];
  const nodeKinds = [...new Set(d.nodes.map((n) => n.kind ?? 'process'))];
  const connected = (e: DiagramEdge) => hover && (e.from === hover || e.to === hover);
  const active = (n: DiagramNode) =>
    !hover || n.id === hover || d.edges.some((e) => connected(e) && (e.from === n.id || e.to === n.id));

  return (
    <figure className="diagram">
      <div className="diagram-head">
        <strong>{d.title}</strong>
        <span className="muted small">Interaktiv – Blöcke anklicken, um zum Fachartikel zu gelangen</span>
      </div>
      <div className="diagram-scroll">
        <svg viewBox={`0 0 ${d.width} ${d.height}`} role="img" aria-label={d.title} style={{ minWidth: Math.min(d.width, 640) }}>
          <defs>
            {Object.entries(EDGE_STYLE).map(([k, s]) => (
              <marker key={k} id={`arr-${k}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" fill={s.color} />
              </marker>
            ))}
          </defs>
          {d.edges.map((e, i) => {
            const a = nodes.get(e.from);
            const b = nodes.get(e.to);
            if (!a || !b) return null;
            const p1 = border(a, b.x, b.y);
            const p2 = border(b, a.x, a.y);
            const st = EDGE_STYLE[e.kind ?? 'signal'];
            const on = connected(e);
            const dim = hover && !on;
            return (
              <g key={i} className="d-edge" opacity={dim ? 0.18 : 1}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={st.color}
                  strokeWidth={on ? 3 : 2}
                  strokeDasharray={st.dash}
                  markerEnd={`url(#arr-${e.kind ?? 'signal'})`}
                />
                {e.label && (
                  <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 - 6} className="d-edge-label" textAnchor="middle">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
          {d.nodes.map((n) => {
            const { w, h } = size(n);
            const target = n.ref ? getEntry(n.ref) : undefined;
            const lines = n.label.split('\n');
            return (
              <g
                key={n.id}
                className={`d-node k-${n.kind ?? 'process'} ${target ? 'clickable' : ''}`}
                transform={`translate(${n.x - w / 2},${n.y - h / 2})`}
                opacity={active(n) ? 1 : 0.3}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => target && nav(`/e/${target.id}`)}
                tabIndex={target ? 0 : -1}
                onKeyDown={(ev) => ev.key === 'Enter' && target && nav(`/e/${target.id}`)}
                role={target ? 'link' : undefined}
                aria-label={target ? `${n.label} – Artikel öffnen` : n.label}
                {...(target ? { 'data-id': target.id } : {})}
              >
                <rect width={w} height={h} rx={n.kind === 'patient' ? h / 2 : 8} />
                <text x={w / 2} y={h / 2 - (lines.length - 1) * 7} textAnchor="middle" dominantBaseline="middle">
                  {lines.map((l, i) => (
                    <tspan key={i} x={w / 2} dy={i === 0 ? 0 : 14}>
                      {l}
                    </tspan>
                  ))}
                </text>
                {target && <circle cx={w - 8} cy={8} r={3} className="d-linkdot" />}
              </g>
            );
          })}
        </svg>
      </div>
      <figcaption>
        <div className="legend">
          {nodeKinds.map((k) => (
            <span key={k} className="legend-item">
              <i className={`lg-node k-${k}`} />
              {NODE_KIND_LABEL[k]}
            </span>
          ))}
          {kinds.map((k) => (
            <span key={k} className="legend-item">
              <svg width="26" height="8">
                <line x1="0" y1="4" x2="26" y2="4" stroke={EDGE_STYLE[k].color} strokeWidth="2" strokeDasharray={EDGE_STYLE[k].dash} />
              </svg>
              {EDGE_STYLE[k].label}
            </span>
          ))}
        </div>
        {d.caption && <p className="muted small">{d.caption}</p>}
        <p className="muted small">Vereinfachtes Funktionsschema – keine Abbildung eines bestimmten Gerätemodells.</p>
      </figcaption>
    </figure>
  );
}
