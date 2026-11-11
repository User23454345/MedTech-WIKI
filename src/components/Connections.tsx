import { useState } from 'react';
import { backlinks, getEntry, outgoing, TYPE_LABEL } from '../lib/data';
import type { Entry, EntryType } from '../types';
import { EntryLink } from './EntryLink';

/** Verknüpfungs-Panel: ausgehende Verweise und Rückverweise, nach Typ gruppiert. */
function group(ids: Set<string> | undefined) {
  const out = new Map<EntryType, Entry[]>();
  for (const id of ids ?? []) {
    const e = getEntry(id);
    if (!e) continue;
    if (!out.has(e.type)) out.set(e.type, []);
    out.get(e.type)!.push(e);
  }
  for (const list of out.values()) list.sort((a, b) => a.title.localeCompare(b.title, 'de'));
  return [...out.entries()];
}

export function Connections({ id }: { id: string }) {
  const [tab, setTab] = useState<'out' | 'in'>('out');
  const groups = group(tab === 'out' ? outgoing.get(id) : backlinks.get(id));
  const nOut = outgoing.get(id)?.size ?? 0;
  const nIn = backlinks.get(id)?.size ?? 0;
  return (
    <section className="connections" aria-label="Verknüpfungen">
      <div className="tabs small">
        <button className={tab === 'out' ? 'active' : ''} onClick={() => setTab('out')}>
          Verweist auf ({nOut})
        </button>
        <button className={tab === 'in' ? 'active' : ''} onClick={() => setTab('in')}>
          Wird verwendet in ({nIn})
        </button>
      </div>
      {groups.length === 0 && <p className="muted small">Keine Verknüpfungen.</p>}
      {groups.map(([type, list]) => (
        <div key={type} className="conn-group">
          <div className="conn-type">{TYPE_LABEL[type]}</div>
          <ul>
            {list.map((e) => (
              <li key={e.id}>
                <EntryLink id={e.id} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
