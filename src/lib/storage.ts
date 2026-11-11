import { useSyncExternalStore } from 'react';

/**
 * Persönliche Daten (Lesezeichen, Wissenssammlungen, Notizen, Vergleichsliste)
 * werden ausschließlich lokal im Browser (localStorage) gespeichert.
 */

export interface CollectionItem {
  id: string;
  note?: string;
  added: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  items: CollectionItem[];
  created: string;
}

export interface UserState {
  bookmarks: string[];
  collections: Collection[];
  compare: string[];
  history: string[];
}

const KEY = 'medtech-wiki:v1';
const empty: UserState = { bookmarks: [], collections: [], compare: [], history: [] };

function load(): UserState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    return empty;
  }
}

let state: UserState = load();
const listeners = new Set<() => void>();

function set(next: UserState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Speicher voll oder deaktiviert – Zustand bleibt für diese Sitzung erhalten */
  }
  listeners.forEach((l) => l());
}

window.addEventListener('storage', (e) => {
  if (e.key === KEY) {
    state = load();
    listeners.forEach((l) => l());
  }
});

export function useUserState(): UserState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

const today = () => new Date().toISOString().slice(0, 10);

export const actions = {
  toggleBookmark(id: string) {
    const has = state.bookmarks.includes(id);
    set({ ...state, bookmarks: has ? state.bookmarks.filter((b) => b !== id) : [id, ...state.bookmarks] });
  },
  toggleCompare(id: string) {
    const has = state.compare.includes(id);
    const compare = has ? state.compare.filter((c) => c !== id) : [...state.compare, id].slice(-4);
    set({ ...state, compare });
  },
  clearCompare() {
    set({ ...state, compare: [] });
  },
  visit(id: string) {
    set({ ...state, history: [id, ...state.history.filter((h) => h !== id)].slice(0, 30) });
  },
  createCollection(name: string, description?: string): string {
    const id = 'c' + Date.now().toString(36);
    set({ ...state, collections: [...state.collections, { id, name, description, items: [], created: today() }] });
    return id;
  },
  deleteCollection(cid: string) {
    set({ ...state, collections: state.collections.filter((c) => c.id !== cid) });
  },
  renameCollection(cid: string, name: string) {
    set({ ...state, collections: state.collections.map((c) => (c.id === cid ? { ...c, name } : c)) });
  },
  addToCollection(cid: string, id: string) {
    set({
      ...state,
      collections: state.collections.map((c) =>
        c.id === cid && !c.items.some((i) => i.id === id)
          ? { ...c, items: [...c.items, { id, added: today() }] }
          : c,
      ),
    });
  },
  removeFromCollection(cid: string, id: string) {
    set({
      ...state,
      collections: state.collections.map((c) =>
        c.id === cid ? { ...c, items: c.items.filter((i) => i.id !== id) } : c,
      ),
    });
  },
  setNote(cid: string, id: string, note: string) {
    set({
      ...state,
      collections: state.collections.map((c) =>
        c.id === cid ? { ...c, items: c.items.map((i) => (i.id === id ? { ...i, note } : i)) } : c,
      ),
    });
  },
  importState(data: Partial<UserState>) {
    set({ ...empty, ...state, ...data });
  },
  exportState(): UserState {
    return state;
  },
};
