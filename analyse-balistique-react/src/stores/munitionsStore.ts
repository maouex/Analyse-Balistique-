import { create } from 'zustand';
import type { Munition } from '../types';
import { munitionsStorage } from '../lib/storage';

interface MunitionsState {
  munitions: Munition[];
  searchQuery: string;
  selectedIds: Set<string>;
  editingId: string | null;
  showForm: boolean;
  showComparison: boolean;

  // Actions
  load: () => void;
  addMunition: (data: Omit<Munition, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMunition: (id: string, updates: Partial<Munition>) => void;
  removeMunition: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  setEditingId: (id: string | null) => void;
  setShowForm: (show: boolean) => void;
  setShowComparison: (show: boolean) => void;

  // Computed
  filtered: () => Munition[];
  selectedMunitions: () => Munition[];
}

export const useMunitionsStore = create<MunitionsState>((set, get) => ({
  munitions: [],
  searchQuery: '',
  selectedIds: new Set(),
  editingId: null,
  showForm: false,
  showComparison: false,

  load: () => set({ munitions: munitionsStorage.getAll() }),

  addMunition: (data) => {
    const record = munitionsStorage.add(data);
    set((s) => ({ munitions: [...s.munitions, record] }));
  },

  updateMunition: (id, updates) => {
    munitionsStorage.update(id, updates);
    set((s) => ({
      munitions: s.munitions.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    }));
  },

  removeMunition: (id) => {
    munitionsStorage.remove(id);
    set((s) => ({
      munitions: s.munitions.filter((m) => m.id !== id),
      selectedIds: new Set([...s.selectedIds].filter((sid) => sid !== id)),
    }));
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSelect: (id) =>
    set((s) => {
      const next = new Set(s.selectedIds);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return { selectedIds: next };
    }),

  clearSelection: () => set({ selectedIds: new Set() }),
  setEditingId: (id) => set({ editingId: id }),
  setShowForm: (show) => set({ showForm: show }),
  setShowComparison: (show) => set({ showComparison: show }),

  filtered: () => {
    const { munitions, searchQuery } = get();
    if (!searchQuery.trim()) return munitions;
    const q = searchQuery.toLowerCase();
    return munitions.filter(
      (m) =>
        m.nom.toLowerCase().includes(q) ||
        m.fabricant.toLowerCase().includes(q) ||
        m.calibre.toLowerCase().includes(q)
    );
  },

  selectedMunitions: () => {
    const { munitions, selectedIds } = get();
    return munitions.filter((m) => selectedIds.has(m.id));
  },
}));
