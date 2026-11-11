import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { devices, entries, sources } from '../lib/data';
import { EVIDENCE_INFO, EvidenceBadge } from '../components/Badges';
import type { Evidence } from '../types';

export function Methodik() {
  useEffect(() => {
    document.title = 'Methodik & Qualität – MedTech Wiki';
  }, []);
  return (
    <div className="page narrow prose-page">
      <nav className="breadcrumb"><Link to="/">Start</Link></nav>
      <h1>Methodik &amp; Qualitätsgrundsätze</h1>
      <p className="lead">
        Das MedTech Wiki verbindet technische, medizinische und naturwissenschaftliche Inhalte. Damit es als
        Nachschlagewerk taugt, gelten feste Regeln für Belege, Kennzeichnung und Verknüpfung.
      </p>

      <h2>1. Kennzeichnung der Belegqualität</h2>
      <p>Aussagen, Kennwerte und Darstellungen werden nach ihrer Herkunft gekennzeichnet:</p>
      <table className="data">
        <tbody>
          {(Object.keys(EVIDENCE_INFO) as Evidence[]).map((k) => (
            <tr key={k}>
              <th scope="row"><EvidenceBadge e={k} /></th>
              <td>{EVIDENCE_INFO[k].text}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Im Fließtext erscheinen dieselben Kategorien als farbige Kästen („Belegte Aussage“, „Vereinfachte Erklärung“,
        „Beispielhafte Darstellung“). Hochgestellte Ziffern verweisen auf das Quellenverzeichnis am Artikelende.
      </p>

      <h2>2. Was bewusst nicht erfunden wird</h2>
      <ul>
        <li><strong>Technische Daten:</strong> Es werden nur gerätetyp-übergreifende Kennwerte aus Normen und Fachliteratur genannt, als Bereich und mit Belegkennzeichnung. Modellspezifische Daten stehen in der jeweiligen Gebrauchsanweisung.</li>
        <li><strong>Preise:</strong> Anschaffungspreise hängen von Ausstattung, Rahmenverträgen, Ausschreibungen und Servicepaketen ab und werden selten öffentlich belegt. Ohne verifizierte Quelle wird keine Zahl genannt, sondern die Einflussfaktoren erläutert.</li>
        <li><strong>Fehlercodes:</strong> Herstellerspezifische Fehlercodes stammen aus Service-Unterlagen und werden nicht wiedergegeben. Beschrieben werden herstellerübergreifende Fehlerbilder, Alarme und ihre physikalisch-technischen Ursachen.</li>
        <li><strong>Normen:</strong> Normen werden mit Nummer, Titel und Gegenstand genannt; Normtexte sind urheberrechtlich geschützt und werden nicht zitiert. Ausgabestände ändern sich – maßgeblich ist die jeweils gültige, harmonisierte Fassung.</li>
        <li><strong>Bilder:</strong> Abbildungen sind eigene, vereinfachte Schemazeichnungen und als solche gekennzeichnet. Fotografien werden nur mit geklärter Lizenz aufgenommen.</li>
      </ul>

      <h2>3. Wissensverknüpfung</h2>
      <p>
        Jeder Datensatz – {devices.length} Gerätetypen und {entries.length - devices.length} weitere Artikel – ist eine
        eigene Einheit mit eindeutiger Kennung. Verweise im Text, Komponenten- und Sensortabellen, Diagrammblöcke und
        Wissenspfade erzeugen ein Netz, das in beide Richtungen navigierbar ist („Verweist auf“ / „Wird verwendet in“).
        Das <Link to="/netz">Wissensnetz</Link> visualisiert diese Struktur.
      </p>

      <h2>4. Quellen</h2>
      <p>
        Grundlage sind {sources.length} Quellen: Standardwerke der Medizintechnik und Physiologie, EU-Verordnungen und
        deutsche Gesetze im amtlichen Wortlaut, Normen (zitiert nach Nummer und Titel), Leitlinien sowie öffentliche
        Herstellerinformationen. Siehe <Link to="/quellen">Quellenverzeichnis</Link>.
      </p>

      <h2>5. Grenzen</h2>
      <div className="callout callout-warnung" data-label="Sicherheitshinweis">
        <p>
          Das Wiki dient der Aus- und Weiterbildung. Es ersetzt weder die Gebrauchsanweisung, die Einweisung nach
          § 4 MPBetreibV, Herstellerschulungen noch die Beurteilung durch qualifiziertes Fachpersonal. Prüfungen und
          Instandsetzungen dürfen nur Personen durchführen, die die Anforderungen der MPBetreibV erfüllen.
        </p>
      </div>

      <h2>6. Erweiterbarkeit</h2>
      <p>
        Inhalte liegen als einzelne JSON-Dateien im Verzeichnis <code>content/</code> vor; ein Prüfskript
        validiert vor jedem Build Pflichtfelder, Verweise und Quellenangaben. Die Struktur ist für mehrere hundert
        Geräte ausgelegt. Das Format ist in <code>docs/CONTENT_GUIDE.md</code> beschrieben.
      </p>
    </div>
  );
}
