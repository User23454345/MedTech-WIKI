# MedTech Wiki

Das verknüpfte Nachschlagewerk der Medizintechnik: Geräte, Komponenten, Sensorik, Elektrotechnik, Physik, Anatomie, Medizinprodukterecht, STK/MTK, Instandhaltung, Fehlerbilder, Abkürzungen und Normen – als Wissensnetz, in dem jeder Fachbegriff zu seiner eigenen Erklärung führt.

## Funktionen

- **15 Hauptkategorien** als Einstiegsseiten mit Einführung und Lernpfad
- **Gerätedatenbank** (100 Gerätetypen) mit Filtern nach Gerätegruppe, Hersteller, Fachbereich, Prüfpflicht und Artikelumfang; ausführliche Geräteartikel mit Steckbrief, Funktionsprinzip, Aufbau, Komponenten- und Sensortabellen, Kennwerten mit Belegkennzeichnung, Herstellern/Modellen, Kosteneinflussfaktoren, Wartung, typischen Fehlern und Prüfverfahren
- **Interaktive Blockschaltbilder** – Blöcke sind anklickbar und führen zum Fachartikel; Hover hebt Signal-/Stoffpfade hervor
- **Wissenspfade** (z. B. Beatmungsgerät → Turbine → Elektromotor → Elektrotechnik → Drehzahlregelung → Sensorik → Druckmessung)
- **Wiki-Links mit Vorschaukarten**, Rückverweise („Wird verwendet in“) und ein **Wissensnetz** (Kraftlayout)
- **Globale Suche** (Strg + K) mit Präfix- und Fehlertoleranz, Synonymen und Abkürzungsauflösung
- **Gerätevergleich** (bis zu 4 Geräte), **Glossar A–Z**, **Abkürzungsverzeichnis**, **Quellenverzeichnis** mit Rückverweisen
- **Lesezeichen und persönliche Wissenssammlungen** mit Notizen, Export (JSON/Markdown) und Import – lokal im Browser
- **Belegqualität** sichtbar: belegt · typisch · vereinfacht · Beispiel

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm run validate   # Inhalte prüfen (Pflichtfelder, Verweise, Quellen, Bilder)
npm run build      # Validierung + Typprüfung + Produktionsbuild nach dist/
```

Die App ist eine statische Single-Page-Anwendung (Vite, React, TypeScript, Hash-Routing) und lässt sich auf jedem statischen Webserver bzw. GitHub Pages betreiben.

## Architektur

```
content/
  categories/     15 Hauptkategorien (Hub-Seiten)
  devices/        Gerätetypen – je Datei ein Datensatz
  entries/        Fachbegriffe und medizinische Fachbereiche
  manufacturers/  Hersteller
  standards/      Normen, Gesetze, Verordnungen
  faults/         Fehlerbilder und Alarme
  sources.json    Quellenverzeichnis (+ Ergänzungen in sources/*.json)
  abbreviations.json, device-groups.json
public/img/devices/  eigene SVG-Schemazeichnungen
scripts/validate.mjs Inhaltsvalidierung (läuft vor jedem Build)
src/              React-Anwendung (lib/: Daten, Markdown, Suche, Speicher)
docs/CONTENT_GUIDE.md  Datenformat und Qualitätsregeln für Autor:innen
```

Jeder Datensatz besitzt eine global eindeutige ID; Verknüpfungen entstehen über `[[id]]` im Text sowie über strukturierte Felder (Komponenten, Sensoren, Hersteller, Diagrammknoten, Wissenspfade). Neue Inhalte = neue JSON-Datei – die Struktur ist für mehrere hundert Geräte ausgelegt.

## Qualitätsgrundsätze

Technische Daten, Preise, Normen und Herstellerangaben werden nicht erfunden. Kennwerte sind als *belegt* oder *typisch* gekennzeichnet, Preise ohne überprüfbare Quelle werden nicht beziffert, herstellerspezifische Fehlercodes nicht wiedergegeben. Details: `docs/CONTENT_GUIDE.md` und die Seite „Methodik & Qualität“ in der App.

> Das Wiki dient der Aus- und Weiterbildung. Es ersetzt weder Gebrauchsanweisungen, Herstellerschulungen noch die Einweisung nach MPBetreibV.
