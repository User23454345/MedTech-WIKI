import { Fragment } from 'react';
import { getEntry, TYPE_LABEL } from '../lib/data';
import { EntryLink } from './EntryLink';
import { Icon } from './Icon';

/** Wissenspfad: Kette verknüpfter Begriffe, jeder Schritt anklickbar. */
export function KnowledgePath({ path, current }: { path: string[]; current?: string }) {
  const items = path.filter((id) => getEntry(id));
  if (items.length < 2) return null;
  return (
    <ol className="kpath">
      {items.map((id, i) => {
        const e = getEntry(id)!;
        return (
          <Fragment key={id + i}>
            {i > 0 && (
              <li className="kpath-arrow" aria-hidden="true">
                <Icon name="arrow" size={14} />
              </li>
            )}
            <li className={`kpath-step t-${e.type} ${id === current ? 'current' : ''}`}>
              <EntryLink id={id}>
                <small>{TYPE_LABEL[e.type]}</small>
                {e.title}
              </EntryLink>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
