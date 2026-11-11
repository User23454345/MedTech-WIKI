import { Link } from 'react-router-dom';
import { search } from '../lib/search';
import { EntryCard } from '../components/EntryCard';

export function NotFound({ what }: { what?: string }) {
  const sugg = what ? search(what.replace(/-/g, ' '), 6) : [];
  return (
    <div className="page narrow">
      <h1>Seite nicht gefunden</h1>
      <p>
        {what ? <>Zu „{what}“ gibt es (noch) keinen Artikel. </> : null}
        Zurück zur <Link to="/">Startseite</Link> oder nutze die Suche.
      </p>
      {sugg.length > 0 && (
        <>
          <h2 className="h-small">Ähnliche Artikel</h2>
          <div className="card-grid small">
            {sugg.map((h) => <EntryCard key={h.entry.id} entry={h.entry} />)}
          </div>
        </>
      )}
    </div>
  );
}
