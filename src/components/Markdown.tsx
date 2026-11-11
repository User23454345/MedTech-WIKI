/** Fängt Klicks auf Quellenverweise ab (Hash-Router würde sonst navigieren). */
export function handleCiteClick(ev: React.MouseEvent) {
  const a = (ev.target as HTMLElement).closest('a[data-cite]') as HTMLAnchorElement | null;
  if (!a) return;
  ev.preventDefault();
  const el = document.getElementById('quelle-' + a.dataset.cite);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 1600);
  }
}

/** Gibt vorgerendertes Markdown-HTML aus (Rendern erfolgt seitenweise, damit
 *  Quellennummern und Inhaltsverzeichnis über alle Blöcke konsistent sind). */
export function Html({ html, inline, className }: { html: string; inline?: boolean; className?: string }) {
  if (!html) return null;
  return inline ? (
    <span className={className} onClick={handleCiteClick} dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <div className={'prose ' + (className ?? '')} onClick={handleCiteClick} dangerouslySetInnerHTML={{ __html: html }} />
  );
}
