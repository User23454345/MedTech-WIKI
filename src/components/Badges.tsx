import type { EntryStatus, EntryType, Evidence } from '../types';
import { STATUS_LABEL, TYPE_LABEL } from '../lib/data';

export const EVIDENCE_INFO: Record<Evidence, { label: string; text: string }> = {
  belegt: { label: 'belegt', text: 'Durch die angegebene Quelle (Norm, Gesetz, Fachbuch, Herstellerangabe) belegt.' },
  typisch: { label: 'typisch', text: 'Typischer Wertebereich aus der Fachliteratur; konkrete Geräte können abweichen.' },
  vereinfacht: { label: 'vereinfacht', text: 'Didaktisch vereinfachte Darstellung.' },
  beispiel: { label: 'Beispiel', text: 'Beispielhafte Darstellung – kein konkreter Gerätewert.' },
};

export function EvidenceBadge({ e }: { e: Evidence }) {
  const info = EVIDENCE_INFO[e];
  return (
    <span className={`badge ev-${e}`} title={info.text}>
      {info.label}
    </span>
  );
}

export function TypeBadge({ type }: { type: EntryType }) {
  return <span className={`badge type-${type}`}>{TYPE_LABEL[type]}</span>;
}

export function StatusBadge({ status }: { status: EntryStatus }) {
  return <span className={`badge st-${status}`}>{STATUS_LABEL[status]}</span>;
}
