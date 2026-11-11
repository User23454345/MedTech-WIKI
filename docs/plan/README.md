# Inhaltsplan

- `registry.json` – alle 363 geplanten Datensätze (100 Geräte, 143 Fachbegriffe, 41 Hersteller, 39 Normen/Gesetze, 22 Fachbereiche, 18 Fehlerbilder) mit ID, Typ, Titel, Kategorie, Gerätegruppe und Rang.
- `planned-ids.json` – ID-Liste für `node scripts/validate.mjs --planned docs/plan/planned-ids.json` (Verweise auf noch nicht geschriebene Datensätze = Warnung statt Fehler).
- `batches/` – Aufteilung der Registry in Arbeitspakete.
- `gen_registry.py` – erzeugt Registry und ID-Liste.
