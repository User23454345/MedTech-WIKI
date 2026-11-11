import { useEffect, useRef, useState } from 'react';
import { getEntry } from '../lib/data';
import { TypeBadge } from './Badges';

/**
 * Vorschaukarte für verknüpfte Fachbegriffe: Beim Überfahren eines Links
 * mit data-id erscheint Typ, Titel und Kurzbeschreibung des Zielartikels.
 */
export function HoverPreview() {
  const [state, setState] = useState<{ id: string; x: number; y: number; above: boolean } | null>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const over = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement).closest?.('[data-id]') as HTMLElement | null;
      if (!el || el.closest('.hover-card') || el.dataset.nopreview !== undefined) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        const r = el.getBoundingClientRect();
        const above = r.bottom + 200 > window.innerHeight;
        setState({
          id: el.dataset.id!,
          x: Math.min(Math.max(8, r.left), window.innerWidth - 348),
          y: above ? r.top - 8 : r.bottom + 8,
          above,
        });
      }, 280);
    };
    const out = (ev: MouseEvent) => {
      const el = (ev.target as HTMLElement).closest?.('[data-id]');
      if (!el) return;
      window.clearTimeout(timer.current);
      setState(null);
    };
    const hide = () => setState(null);
    document.addEventListener('mouseover', over);
    document.addEventListener('mouseout', out);
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('hashchange', hide);
    return () => {
      document.removeEventListener('mouseover', over);
      document.removeEventListener('mouseout', out);
      window.removeEventListener('scroll', hide);
      window.removeEventListener('hashchange', hide);
    };
  }, []);

  const e = getEntry(state?.id);
  if (!state || !e) return null;
  return (
    <div
      className="hover-card"
      style={{ left: state.x, top: state.y, transform: state.above ? 'translateY(-100%)' : undefined }}
      role="tooltip"
    >
      <TypeBadge type={e.type} />
      <div className="hover-title">{e.title}</div>
      <p>{e.summary}</p>
    </div>
  );
}
