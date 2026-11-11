/** Schlanke Linien-Icons (eigene SVG-Pfade, 24×24) */
const PATHS: Record<string, string> = {
  search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM21 21l-4.3-4.3',
  book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 5v16M8 7h7',
  stethoscope: 'M6 3v6a5 5 0 0 0 10 0V3M11 14v2a5 5 0 0 0 10 0v-2M21 12a2 2 0 1 0 0-.01',
  device: 'M3 5h18v11H3zM8 20h8M12 16v4M6 11h3l1.5-3 2 6 1.5-3h4',
  factory: 'M3 21V10l6 4V10l6 4V6h6v15zM7 17h2M12 17h2M17 17h2',
  cog: 'M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1',
  gauge: 'M4 18a8 8 0 1 1 16 0M12 18l4-6M7 14h.01M12 9h.01M17 14h.01',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  atom: 'M12 12h.01M12 3c4 0 7 4 7 9s-3 9-7 9-7-4-7-9 3-9 7-9zM3.5 8c2-3.5 7.5-4 12.3-1.3S22.5 13.5 20.5 17',
  heart: 'M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z',
  scale: 'M12 3v18M5 7h14M5 7l-3 7a4 4 0 0 0 6 0zM19 7l-3 7a4 4 0 0 0 6 0zM8 21h8',
  check: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',
  alert: 'M12 3 2 20h20zM12 10v4M12 17h.01',
  abc: 'M3 17l3-9 3 9M4 14h4M12 8h3a2 2 0 0 1 0 4h-3zM12 12h3.5a2.5 2.5 0 0 1 0 5H12zM22 9a3 3 0 1 0 0 7',
  ruler: 'M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
  bookmark: 'M6 3h12v18l-6-4-6 4z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  folder: 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  compare: 'M9 3v18M15 3v18M4 7h5M15 7h5M4 12h5M15 12h5M4 17h5M15 17h5',
  graph: 'M6 6h.01M18 6h.01M12 18h.01M6 6l6 12 6-12M6 6h12',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  quote: 'M5 11h4v6H3v-4c0-4 2-6 5-7M15 11h4v6h-6v-4c0-4 2-6 5-7',
  menu: 'M3 6h18M3 12h18M3 18h18',
  x: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 11v6M12 7.5h.01',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  filter: 'M3 5h18l-7 8v6l-4 2v-8z',
  download: 'M12 3v12M6 11l6 6 6-6M4 21h16',
  upload: 'M12 21V9M6 13l6-6 6 6M4 3h16',
  image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9h.01',
  layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17l10 5 10-5',
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      className={'icon ' + (className ?? '')}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name] ?? PATHS.book} />
    </svg>
  );
}
