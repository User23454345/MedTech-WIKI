import { Link } from 'react-router-dom';
import { actions, useUserState } from '../lib/storage';
import { getEntry } from '../lib/data';
import { Icon } from './Icon';

/** Schwebende Leiste mit den zum Vergleich vorgemerkten Geräten */
export function CompareBar() {
  const { compare } = useUserState();
  if (!compare.length) return null;
  return (
    <div className="compare-bar" role="region" aria-label="Gerätevergleich">
      <Icon name="compare" />
      <span className="cb-label">Vergleich:</span>
      {compare.map((id) => (
        <span key={id} className="chip">
          {getEntry(id)?.title ?? id}
          <button onClick={() => actions.toggleCompare(id)} aria-label="Entfernen">
            <Icon name="x" size={12} />
          </button>
        </span>
      ))}
      <Link className="btn small primary" to={`/vergleich?ids=${compare.join(',')}`}>
        Vergleichen
      </Link>
      <button className="btn small ghost" onClick={actions.clearCompare}>
        Leeren
      </button>
    </div>
  );
}
