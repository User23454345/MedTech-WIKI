# MedTech Wiki – Leitfaden für Inhalte

Dieser Leitfaden beschreibt das Datenformat, die Verknüpfungssyntax und die Qualitätsregeln. Er gilt für alle Autorinnen und Autoren (Menschen wie Werkzeuge).

## 1. Grundprinzip

* **Ein Datensatz = eine JSON-Datei.** Dateiname = `id` + `.json`.
* **IDs** sind global eindeutig, kleingeschrieben, nur `a-z`, `0-9` und `-`, Umlaute ausgeschrieben (`ae`, `oe`, `ue`, `ss`). Beispiel: `roentgenroehre`.
* **Ordner** nach Typ:

| Ordner | `type` | Inhalt |
|---|---|---|
| `content/categories/` | `category` | die 15 Hauptkategorien (Hub-Seiten) |
| `content/devices/` | `device` | Gerätetypen |
| `content/entries/` | `term`, `domain` | Fachbegriffe/Grundlagenartikel, medizinische Fachbereiche |
| `content/manufacturers/` | `manufacturer` | Hersteller |
| `content/standards/` | `standard` | Normen, Gesetze, Verordnungen |
| `content/faults/` | `fault` | Fehlerbilder und Alarme |

* Zusätzliche Sammeldateien: `content/sources.json` (Quellen; Ergänzungen als Array in `content/sources/<name>.json`), `content/abbreviations.json` (Abkürzungen), `content/device-groups.json` (Gerätegruppen).
* Prüfung: `npm run validate` (läuft automatisch vor `npm run build`). Einzeldateien: `node scripts/validate.mjs --files content/devices/x.json`.

## 2. Gemeinsame Felder (alle Typen)

```jsonc
{
  "id": "drucksensor",
  "type": "term",
  "title": "Piezoresistiver Drucksensor",
  "aliases": ["Drucktransducer", "Druckaufnehmer"],   // Synonyme, englische Begriffe, Abkürzungen
  "category": "sensorik",                               // eine der 15 Hauptkategorien
  "summary": "1–3 Sätze reiner Text ohne Links. Erscheint in Vorschaukarten, Suche und Glossar.",
  "body": "Markdown – siehe Abschnitt 4",
  "related": ["druckmessung", "invasive-druckmessung"], // optionale Querverweise
  "paths": [["beatmungsgeraet", "drucksensor", "piezoelektrischer-effekt"]], // optionale Wissenspfade
  "sources": ["hering-2018", "webster-2010"],            // Quellen-IDs aus content/sources.json
  "status": "basis",                                     // "ausfuehrlich" | "basis" | "stub"
  "updated": "2026-11-11"
}
```

Hub-Kategorien (`category`): `einfuehrung`, `fachbereiche`, `geraete`, `hersteller`, `komponenten`, `sensorik`, `elektrotechnik`, `physik`, `anatomie`, `recht`, `stk-mtk`, `instandhaltung`, `fehler`, `abkuerzungen`, `normen`.

## 3. Typspezifische Felder

### Gerät (`device`)

```jsonc
{
  "type": "device", "category": "geraete",
  "deviceGroup": "beatmung-anaesthesie",   // siehe content/device-groups.json
  "rank": 2,                                // Position in der Top-100-Liste
  "domains": ["intensivmedizin"],           // IDs vom Typ domain
  "riskClass": { "value": "IIb", "evidence": "belegt", "note": "Markdown: Begründung, z. B. Klassifizierungsregel der [[mdr|MDR]] Anhang VIII", "sources": ["mdr-2017"] },
  "sections": {
    "purpose": "Markdown – medizinischer Zweck",
    "applications": "Markdown – Einsatzgebiete",
    "principle": "Markdown – Funktionsprinzip (Kernstück, physikalisch-technisch tief)",
    "construction": "Markdown – technischer Aufbau, Baugruppen",
    "maintenance": "Markdown – Wartung/Instandhaltung",
    "testing": "Markdown – Prüfverfahren"
  },
  "components": [{ "ref": "turbine", "role": "Markdown-Inline: Funktion im Gerät" }],
  "sensors":    [{ "ref": "flowsensor", "role": "…" }],
  "specs": [
    { "param": "Tidalvolumen (Einstellbereich)", "value": "…", "note": "Inline-Markdown", "evidence": "typisch", "sources": ["…"] }
  ],
  "manufacturers": [{ "ref": "draeger", "models": ["Evita V800"], "note": "optional" }],
  "price": { "status": "nicht-verifiziert", "note": "Einflussfaktoren auf den Preis …" },
  "maintenance": { "stk": "ja", "mtk": "nein", "basis": "MPBetreibV Anlage 1 Nr. 1.5", "intervals": "spätestens alle 2 Jahre, früher wenn Mängel früher zu erwarten sind (§ 12 MPBetreibV 2025)" },
  "faults": [{ "title": "Leckagealarm", "ref": "leckage", "cause": "…", "action": "…" }],
  "tests":  [{ "name": "Sicherheitstechnische Kontrolle", "ref": "stk", "description": "…" }],
  "diagram": { … siehe Abschnitt 5 … },
  "images": [{ "src": "img/devices/beatmungsgeraet-aufbau.svg", "kind": "schema", "caption": "…" }]
}
```

`status: "ausfuehrlich"` verlangt alle sechs `sections`, `components`, `sensors`, `specs`, `manufacturers`, `faults`, `tests`, `diagram`, `price`, `maintenance`, `riskClass` und ca. ≥ 2 000 Wörter.
Kurzeinträge (`status: "stub"`) benötigen mindestens `summary`, `deviceGroup`, `rank`, `domains`, und sollten `sections.purpose`, `sections.principle`, `maintenance`, `related` und – wo sicher bekannt – `manufacturers` enthalten.

### Hersteller (`manufacturer`)
`headquarters` (Ort, Land), `founded` (Jahr als String), `website` (nur `https://domain.tld/`), `productLines: [{device, models[], note?}]` – `device` ist eine Geräte-ID.

### Norm/Gesetz (`standard`)
`code` (z. B. „IEC 60601-1“), `kind` (`norm|gesetz|verordnung|richtlinie|leitfaden`), `fullTitle` (deutscher Titel, sofern bekannt), `scope` (Anwendungsbereich, ein Satz). Keine Normtexte zitieren (Urheberrecht) – Inhalte mit eigenen Worten zusammenfassen. Ausgabestände nur nennen, wenn sicher; Hinweis auf „jeweils gültige Fassung“.

### Fehlerbild (`fault`)
`devices` (Geräte-IDs), `causes[]`, `actions[]` (jeweils Inline-Markdown). **Keine herstellerspezifischen Fehlercodes erfinden.**

## 4. Markdown-Syntax

* Überschriften ab `##` (H1 ist der Titel). `##`/`###` erzeugen automatisch das Inhaltsverzeichnis.
* **Wiki-Link:** `[[id]]` (Titel des Ziels als Text) oder `[[id|eigener Text]]`. Jeder wichtige Fachbegriff soll beim ersten Vorkommen verlinkt sein.
* **Quellenangabe:** `[@quellen-id]` oder `[@quellen-id, S. 123]` – erzeugt eine nummerierte Fußnote.
* **Belegqualität als Callout** (Blockquote mit Marker in der ersten Zeile):
  * `> [!belegt] …` – Aussage, die direkt aus Gesetz, Norm, Fachbuch oder Herstellerangabe folgt (mit `[@…]`).
  * `> [!vereinfacht] …` – didaktische Vereinfachung, ausdrücklich als solche markiert.
  * `> [!beispiel] …` – Rechen- oder Fallbeispiel mit beispielhaften Zahlen.
  * `> [!hinweis] …`, `> [!warnung] …` (Sicherheit), `> [!praxis] …` (Praxiswissen aus dem Klinikalltag).
* Tabellen (GitHub-Markdown) sind ausdrücklich erwünscht. Formeln als Text/Unicode, z. B. `p = F / A`, `R = U / I`, `SpO₂`.
* Keine externen Links im Fließtext – Quellen gehören in `content/sources.json`.

## 5. Interaktives Blockdiagramm (`diagram`)

```jsonc
"diagram": {
  "title": "Pneumatisches Funktionsschema",
  "caption": "optionale Erläuterung",
  "width": 900, "height": 420,                     // Zeichenfläche (Koordinaten in px)
  "nodes": [
    { "id": "luft", "label": "Raumluft /\nO₂-Zufuhr", "kind": "source", "x": 90, "y": 120 },
    { "id": "turb", "label": "Turbine", "ref": "turbine", "kind": "actuator", "x": 290, "y": 120 },
    { "id": "pat",  "label": "Patient", "kind": "patient", "x": 800, "y": 210 }
  ],
  "edges": [
    { "from": "luft", "to": "turb", "kind": "gas", "label": "Ansaugung" }
  ]
}
```

* `x`/`y` = **Mittelpunkt** des Blocks; Standardgröße 150 × 52 px (änderbar über `w`/`h`). Mindestens 30 px Abstand zwischen Blöcken, alles innerhalb von `width`/`height`.
* `kind` der Knoten: `patient`, `source`, `process`, `sensor`, `actuator`, `control`, `output`.
* `kind` der Kanten: `gas`, `fluid`, `signal`, `power`, `data`, `energy`.
* Mehrzeilige Labels mit `\n`. Knoten mit `ref` werden anklickbar – möglichst viele Knoten verlinken.
* Diagramme sind **Funktionsschemata**, keine Abbildung eines konkreten Modells.

## 6. Schemazeichnungen (SVG)

Ablage unter `public/img/devices/<geraete-id>-<motiv>.svg`. Stilvorgaben: `viewBox="0 0 600 400"`, weißer Hintergrund, Linien `#0b2545` (1,5–2 px), Akzent `#0d9488`/`#14b8a6`, Flächen `#f1f5f9`/`#e6f7f5`, Schrift `font-family="Inter, Arial, sans-serif"` 13–15 px in `#0b2545`, Beschriftungen mit Führungslinien. Kein Text als Pfad, keine Rasterbilder, keine Herstellerlogos, keine Nachbildung eines konkreten Modells. Im Datensatz: `"kind": "schema"`.

## 7. Wissenschaftliche Qualitätsregeln (verbindlich)

1. **Nichts erfinden.** Keine technischen Daten, Preise, Normnummern, Paragraphen, Modellnamen, Gründungsjahre, Fehlercodes oder Studienergebnisse, die nicht sicher belegt sind.
2. **Kennwerte** (`specs`) nur als gerätetyp-übergreifende Bereiche aus Normen/Fachliteratur (`typisch`) oder wörtlich belegte Werte (`belegt` + `sources`). Unsicheres weglassen.
3. **Preise:** Ohne überprüfbare Quelle `status: "nicht-verifiziert"`, keine Zahl, stattdessen Einflussfaktoren (Ausstattung, Software-Optionen, Servicevertrag, Verbrauchsmaterial, Ausschreibung, Gesamtbetriebskosten).
4. **Modelle:** nur real existierende, öffentlich bekannte Produktlinien. Im Zweifel weglassen.
5. **Recht:** Die MPBetreibV wurde **2025 neu gefasst** (vom 14.02.2025, BGBl. 2025 I Nr. 38): STK § 12 + Anlage 1 (Pflicht knüpft an Anlage 1 an; Höchstfrist 2 Jahre, früher wenn Mängel zu erwarten), MTK § 15 + Anlage 2 – ältere Paragraphenangaben (§ 11/§ 14 der Fassung 2002/2017) nicht mehr verwenden. Paragraphen/Anlagen der MPBetreibV, MDR-Regeln usw. nur zitieren, wenn sicher. Hinweis auf die jeweils geltende Fassung.
6. **Kennzeichnung:** Vereinfachungen und Beispiele als Callout markieren. Jede belegbare Kernaussage mit `[@…]`.
7. **Sicherheit:** Keine Anleitungen zur Umgehung von Schutzfunktionen; Instandsetzung nur durch befugtes Fachpersonal.
8. **Sprache:** Deutsch, sachlich, präzise, verständlich für Medizintechniker in Ausbildung und Studium; Fachbegriffe beim ersten Auftreten erklären oder verlinken.
