/**
 * Datenmodell des MedTech Wiki.
 *
 * Jeder Datensatz (Gerät, Begriff, Hersteller, Norm, Fehlerbild, Kategorie)
 * liegt als eigene JSON-Datei unter /content und besitzt eine global
 * eindeutige `id`. Verweise zwischen Datensätzen erfolgen ausschließlich über
 * diese IDs – im Fließtext über die Syntax [[id]] bzw. [[id|Anzeigetext]].
 * Ausführliche Beschreibung: docs/CONTENT_GUIDE.md
 */

export type EntryType =
  | 'category' // eine der 15 Hauptkategorien (Hub-Seite)
  | 'device' // Gerätetyp
  | 'term' // Fachbegriff / Grundlagenartikel
  | 'manufacturer'
  | 'standard' // Norm, Gesetz, Verordnung
  | 'fault' // Fehlerbild / Alarmtyp
  | 'domain'; // medizinischer Fachbereich

/** Belegqualität einer Aussage */
export type Evidence = 'belegt' | 'typisch' | 'beispiel' | 'vereinfacht';

export type EntryStatus = 'ausfuehrlich' | 'basis' | 'stub';

export interface DiagramNode {
  id: string;
  label: string;
  /** optionaler Verweis auf einen Datensatz – macht den Knoten anklickbar */
  ref?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: 'patient' | 'source' | 'process' | 'sensor' | 'actuator' | 'control' | 'output';
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  kind?: 'gas' | 'fluid' | 'signal' | 'power' | 'data' | 'energy';
}

export interface Diagram {
  title: string;
  caption?: string;
  width: number;
  height: number;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface ImageRef {
  /** Pfad relativ zu /public, z. B. "img/devices/defibrillator-aufbau.svg" */
  src: string;
  caption: string;
  /** "schema" = eigene vereinfachte Schemazeichnung, "foto" = Fotografie */
  kind: 'schema' | 'foto';
  credit?: string;
  license?: string;
  sourceUrl?: string;
}

interface BaseEntry {
  id: string;
  type: EntryType;
  title: string;
  aliases?: string[];
  /** Hub-Kategorie (eine der 15 Hauptkategorien) */
  category: string;
  /** 1–3 Sätze, reiner Text */
  summary: string;
  /** Markdown mit [[Links]], [@Quellen] und Callouts */
  body?: string;
  related?: string[];
  sources?: string[];
  /** Wissenspfade: Ketten von IDs, z. B. Gerät → Komponente → Grundlage */
  paths?: string[][];
  diagram?: Diagram;
  images?: ImageRef[];
  tags?: string[];
  status: EntryStatus;
  updated: string;
}

export interface SpecRow {
  param: string;
  value: string;
  note?: string;
  evidence: Evidence;
  sources?: string[];
}

export interface DeviceEntry extends BaseEntry {
  type: 'device';
  deviceGroup: string;
  domains?: string[];
  /** Platz in der Liste der 100 wichtigsten Geräte */
  rank?: number;
  riskClass?: { value: string; note?: string; evidence: Evidence; sources?: string[] };
  sections?: {
    purpose?: string;
    applications?: string;
    principle?: string;
    construction?: string;
    maintenance?: string;
    testing?: string;
  };
  components?: { ref: string; role: string }[];
  sensors?: { ref: string; role: string }[];
  specs?: SpecRow[];
  manufacturers?: { ref: string; models: string[]; note?: string }[];
  price?: {
    status: 'nicht-verifiziert' | 'belegt';
    range?: string;
    note: string;
    sources?: string[];
  };
  maintenance?: {
    stk: 'ja' | 'nein' | 'abhaengig';
    mtk: 'ja' | 'nein' | 'abhaengig';
    basis?: string;
    intervals?: string;
  };
  faults?: { title: string; cause: string; action: string; ref?: string }[];
  tests?: { name: string; description: string; ref?: string }[];
}

export interface ManufacturerEntry extends BaseEntry {
  type: 'manufacturer';
  headquarters?: string;
  founded?: string;
  website?: string;
  productLines?: { device: string; models: string[]; note?: string }[];
}

export interface StandardEntry extends BaseEntry {
  type: 'standard';
  code: string;
  fullTitle?: string;
  kind: 'norm' | 'gesetz' | 'verordnung' | 'richtlinie' | 'leitfaden';
  scope?: string;
}

export interface FaultEntry extends BaseEntry {
  type: 'fault';
  devices?: string[];
  causes?: string[];
  actions?: string[];
}

export interface CategoryEntry extends BaseEntry {
  type: 'category';
  order: number;
  icon: string;
}

export interface GenericEntry extends BaseEntry {
  type: 'term' | 'domain';
}

export type Entry =
  | DeviceEntry
  | ManufacturerEntry
  | StandardEntry
  | FaultEntry
  | CategoryEntry
  | GenericEntry;

export interface Source {
  id: string;
  kind: 'buch' | 'norm' | 'gesetz' | 'leitlinie' | 'hersteller' | 'artikel' | 'web' | 'behoerde';
  authors?: string;
  title: string;
  edition?: string;
  publisher?: string;
  year?: string;
  url?: string;
  note?: string;
}

export interface Abbreviation {
  abbr: string;
  full: string;
  en?: string;
  area: 'medizinisch' | 'technisch' | 'regulatorisch';
  ref?: string;
}

export interface DeviceGroup {
  id: string;
  label: string;
}
