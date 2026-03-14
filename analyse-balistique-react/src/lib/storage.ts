import type { Munition } from '../types';

const STORAGE_KEY = 'balistique_munitions_v2';
const TUTORIAL_KEY = 'balistique_tut_seen_v2';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(16).slice(2, 8);
}

export const munitionsStorage = {
  getAll(): Munition[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  save(munitions: Munition[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(munitions));
    } catch (e) {
      console.error('Failed to save munitions to localStorage:', e);
    }
  },

  add(munition: Omit<Munition, 'id' | 'createdAt' | 'updatedAt'>): Munition {
    const now = new Date().toISOString();
    const record: Munition = {
      ...munition,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = this.getAll();
    all.push(record);
    this.save(all);
    return record;
  },

  update(id: string, updates: Partial<Munition>): Munition | null {
    const all = this.getAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save(all);
    return all[idx];
  },

  remove(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((m) => m.id !== id);
    if (filtered.length === all.length) return false;
    this.save(filtered);
    return true;
  },

  get(id: string): Munition | null {
    return this.getAll().find((m) => m.id === id) ?? null;
  },
};

export const tutorialStorage = {
  hasSeen(): boolean {
    return localStorage.getItem(TUTORIAL_KEY) === '1';
  },

  markSeen(): void {
    localStorage.setItem(TUTORIAL_KEY, '1');
  },

  reset(): void {
    localStorage.removeItem(TUTORIAL_KEY);
  },
};
