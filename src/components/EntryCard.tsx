import { Link } from 'react-router-dom';
import type { Entry } from '../types';
import { deviceGroupById } from '../lib/data';
import { StatusBadge, TypeBadge } from './Badges';

export function EntryCard({ entry, showType = true }: { entry: Entry; showType?: boolean }) {
  const group = entry.type === 'device' ? deviceGroupById.get(entry.deviceGroup)?.label : undefined;
  return (
    <Link to={`/e/${entry.id}`} className={`card entry-card t-${entry.type}`} data-id={entry.id} data-nopreview="">
      <div className="card-meta">
        {showType && <TypeBadge type={entry.type} />}
        {group && <span className="badge neutral">{group}</span>}
        {entry.status === 'ausfuehrlich' && <StatusBadge status={entry.status} />}
      </div>
      <h3>{entry.title}</h3>
      <p>{entry.summary}</p>
    </Link>
  );
}
