import { Link } from 'react-router-dom';
import { getEntry } from '../lib/data';

/** Link auf einen Datensatz (React-Komponente; im Fließtext übernimmt der Markdown-Renderer). */
export function EntryLink({ id, children, className }: { id: string; children?: React.ReactNode; className?: string }) {
  const e = getEntry(id);
  if (!e) return <span className="wikilink missing">{children ?? id}</span>;
  return (
    <Link to={`/e/${id}`} className={`wikilink wl-${e.type} ${className ?? ''}`} data-id={id}>
      {children ?? e.title}
    </Link>
  );
}
