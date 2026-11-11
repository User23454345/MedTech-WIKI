import { useEffect, useState } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** Inhaltsverzeichnis mit Scroll-Spy */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>();
  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (list) => {
        const vis = list.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [items]);
  if (items.length < 2) return null;
  return (
    <nav className="toc" aria-label="Inhaltsverzeichnis">
      <div className="toc-title">Inhalt</div>
      <ol>
        {items.map((i) => (
          <li key={i.id} className={`lvl-${i.level} ${active === i.id ? 'active' : ''}`}>
            <a
              href={'#' + i.id}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(i.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
