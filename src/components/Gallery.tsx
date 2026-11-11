import { useEffect, useState } from 'react';
import type { ImageRef } from '../types';
import { Icon } from './Icon';

/** Bildergalerie mit Lightbox. Schemazeichnungen sind als solche gekennzeichnet. */
export function Gallery({ images, title }: { images: ImageRef[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((o) => (o! + 1) % images.length);
      if (e.key === 'ArrowLeft') setOpen((o) => (o! - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, images.length]);

  if (!images.length) return null;
  const cur = open !== null ? images[open] : null;
  return (
    <>
      <div className="gallery">
        {images.map((img, i) => (
          <button key={img.src} className="gallery-item" onClick={() => setOpen(i)} aria-label={`Bild vergrößern: ${img.caption}`}>
            <img src={img.src} alt={`${title}: ${img.caption}`} loading="lazy" />
            <span className="gallery-cap">
              <span className={`badge ${img.kind === 'schema' ? 'ev-vereinfacht' : 'ev-belegt'}`}>
                {img.kind === 'schema' ? 'Schemazeichnung' : 'Foto'}
              </span>
              {img.caption}
            </span>
          </button>
        ))}
      </div>
      {cur && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={cur.caption}>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={cur.src} alt={cur.caption} />
            <figcaption>
              {cur.caption}
              {cur.credit && <span className="muted"> · {cur.credit}</span>}
              {cur.license && <span className="muted"> · {cur.license}</span>}
              {cur.kind === 'schema' && <span className="muted"> · Eigene vereinfachte Darstellung, nicht maßstäblich</span>}
            </figcaption>
            <button className="icon-btn lb-close" onClick={() => setOpen(null)} aria-label="Schließen">
              <Icon name="x" />
            </button>
          </figure>
        </div>
      )}
    </>
  );
}
