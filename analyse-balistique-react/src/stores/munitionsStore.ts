import { create } from 'zustand';
import type { Munition } from '../types';
import { munitionsStorage } from '../lib/storage';

// ─── Sort / Group / Filter types ────────────────────────────

export type SortField =
  | 'nom' | 'fabricant' | 'calibre' | 'prix' | 'createdAt'
  | 'score' | 'nbImpacts' | 'r90' | 'dispMoy';

export type SortDir = 'asc' | 'desc';

export type GroupField = 'none' | 'fabricant' | 'calibre' | 'distance' | 'choke' | 'fusil';

export type ViewMode = 'grid' | 'table';

export interface Filters {
  fabricant: string[];
  calibre: string[];
  distance: string[];
  choke: string[];
  hasAnalysis: 'all' | 'yes' | 'no';
  scoreMin: number | null;
  scoreMax: number | null;
}

const EMPTY_FILTERS: Filters = {
  fabricant: [],
  calibre: [],
  distance: [],
  choke: [],
  hasAnalysis: 'all',
  scoreMin: null,
  scoreMax: null,
};

export const SORT_OPTIONS: { field: SortField; label: string; defaultDir: SortDir }[] = [
  { field: 'nom', label: 'Nom', defaultDir: 'asc' },
  { field: 'fabricant', label: 'Fabricant', defaultDir: 'asc' },
  { field: 'calibre', label: 'Calibre', defaultDir: 'asc' },
  { field: 'prix', label: 'Prix', defaultDir: 'asc' },
  { field: 'score', label: 'Score', defaultDir: 'desc' },
  { field: 'nbImpacts', label: 'Impacts', defaultDir: 'desc' },
  { field: 'r90', label: 'R90', defaultDir: 'asc' },
  { field: 'dispMoy', label: 'Dispersion', defaultDir: 'asc' },
  { field: 'createdAt', label: 'Date', defaultDir: 'desc' },
];

export const GROUP_OPTIONS: { field: GroupField; label: string }[] = [
  { field: 'none', label: 'Aucun' },
  { field: 'fabricant', label: 'Fabricant' },
  { field: 'calibre', label: 'Calibre' },
  { field: 'distance', label: 'Distance' },
  { field: 'choke', label: 'Choke' },
  { field: 'fusil', label: 'Fusil' },
];

// ─── Helpers ────────────────────────────────────────────────

function getSortValue(m: Munition, field: SortField): number | string {
  switch (field) {
    case 'nom': return m.nom.toLowerCase();
    case 'fabricant': return m.fabricant.toLowerCase();
    case 'calibre': return m.calibre.toLowerCase();
    case 'prix': return m.prix || 0;
    case 'createdAt': return m.createdAt || '';
    case 'score': return m.snap?.score ?? -1;
    case 'nbImpacts': return m.snap?.nbImpacts ?? -1;
    case 'r90': return m.snap?.r90 ?? 9999;
    case 'dispMoy': return m.snap?.dispMoy ?? 9999;
  }
}

function compareMunitions(a: Munition, b: Munition, field: SortField, dir: SortDir): number {
  const va = getSortValue(a, field);
  const vb = getSortValue(b, field);
  let cmp = 0;
  if (typeof va === 'string' && typeof vb === 'string') {
    cmp = va.localeCompare(vb, 'fr');
  } else {
    cmp = (va as number) - (vb as number);
  }
  return dir === 'asc' ? cmp : -cmp;
}

function getGroupKey(m: Munition, field: GroupField): string {
  switch (field) {
    case 'none': return '';
    case 'fabricant': return m.fabricant || 'Non renseigné';
    case 'calibre': return m.calibre || 'Non renseigné';
    case 'distance': return m.distance || 'Non renseigné';
    case 'choke': return m.choke || 'Non renseigné';
    case 'fusil': return m.fusil || 'Non renseigné';
  }
}

function applyFilters(munitions: Munition[], searchQuery: string, filters: Filters): Munition[] {
  let result = munitions;

  // Text search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (m) =>
        m.nom.toLowerCase().includes(q) ||
        m.fabricant.toLowerCase().includes(q) ||
        m.calibre.toLowerCase().includes(q) ||
        m.fusil?.toLowerCase().includes(q) ||
        m.notes?.toLowerCase().includes(q)
    );
  }

  // Discrete filters
  if (filters.fabricant.length > 0) {
    result = result.filter((m) => filters.fabricant.includes(m.fabricant));
  }
  if (filters.calibre.length > 0) {
    result = result.filter((m) => filters.calibre.includes(m.calibre));
  }
  if (filters.distance.length > 0) {
    result = result.filter((m) => filters.distance.includes(m.distance));
  }
  if (filters.choke.length > 0) {
    result = result.filter((m) => filters.choke.includes(m.choke));
  }

  // Analysis presence
  if (filters.hasAnalysis === 'yes') {
    result = result.filter((m) => m.snap !== null);
  } else if (filters.hasAnalysis === 'no') {
    result = result.filter((m) => m.snap === null);
  }

  // Score range
  if (filters.scoreMin !== null) {
    result = result.filter((m) => (m.snap?.score ?? 0) >= filters.scoreMin!);
  }
  if (filters.scoreMax !== null) {
    result = result.filter((m) => (m.snap?.score ?? 100) <= filters.scoreMax!);
  }

  return result;
}

export interface GroupedMunitions {
  key: string;
  munitions: Munition[];
}

// ─── Store ──────────────────────────────────────────────────

export interface MunitionsState {
  munitions: Munition[];
  searchQuery: string;
  selectedIds: Set<string>;
  editingId: string | null;
  showForm: boolean;
  showComparison: boolean;

  // Sort / Group / Filter / View
  sortField: SortField;
  sortDir: SortDir;
  groupField: GroupField;
  filters: Filters;
  viewMode: ViewMode;
  showFilters: boolean;

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

  // Sort / Group / Filter actions
  setSort: (field: SortField) => void;
  setGroupField: (field: GroupField) => void;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;
  toggleFilterValue: (key: 'fabricant' | 'calibre' | 'distance' | 'choke', value: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setShowFilters: (show: boolean) => void;

  // Computed
  filtered: () => Munition[];
  grouped: () => GroupedMunitions[];
  selectedMunitions: () => Munition[];
  activeFilterCount: () => number;
  uniqueValues: (key: 'fabricant' | 'calibre' | 'distance' | 'choke' | 'fusil') => string[];
}

export const useMunitionsStore = create<MunitionsState>((set, get) => ({
  munitions: [],
  searchQuery: '',
  selectedIds: new Set(),
  editingId: null,
  showForm: false,
  showComparison: false,

  sortField: 'createdAt',
  sortDir: 'desc',
  groupField: 'none',
  filters: { ...EMPTY_FILTERS },
  viewMode: 'grid',
  showFilters: false,

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

  // ── Sort / Group / Filter ────────────────────────────────
  setSort: (field) =>
    set((s) => {
      if (s.sortField === field) {
        return { sortDir: s.sortDir === 'asc' ? 'desc' : 'asc' };
      }
      const opt = SORT_OPTIONS.find((o) => o.field === field);
      return { sortField: field, sortDir: opt?.defaultDir ?? 'asc' };
    }),

  setGroupField: (field) => set({ groupField: field }),

  setFilters: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),

  resetFilters: () => set({ filters: { ...EMPTY_FILTERS }, searchQuery: '' }),

  toggleFilterValue: (key, value) =>
    set((s) => {
      const arr = s.filters[key];
      const next = arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value];
      return { filters: { ...s.filters, [key]: next } };
    }),

  setViewMode: (mode) => set({ viewMode: mode }),
  setShowFilters: (show) => set({ showFilters: show }),

  // ── Computed ─────────────────────────────────────────────
  filtered: () => {
    const { munitions, searchQuery, filters, sortField, sortDir } = get();
    const result = applyFilters(munitions, searchQuery, filters);
    return result.sort((a, b) => compareMunitions(a, b, sortField, sortDir));
  },

  grouped: () => {
    const { groupField } = get();
    const items = get().filtered();

    if (groupField === 'none') {
      return [{ key: '', munitions: items }];
    }

    const map = new Map<string, Munition[]>();
    for (const m of items) {
      const key = getGroupKey(m, groupField);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([key, munitions]) => ({ key, munitions }));
  },

  selectedMunitions: () => {
    const { munitions, selectedIds } = get();
    return munitions.filter((m) => selectedIds.has(m.id));
  },

  activeFilterCount: () => {
    const { filters } = get();
    let count = 0;
    if (filters.fabricant.length > 0) count++;
    if (filters.calibre.length > 0) count++;
    if (filters.distance.length > 0) count++;
    if (filters.choke.length > 0) count++;
    if (filters.hasAnalysis !== 'all') count++;
    if (filters.scoreMin !== null || filters.scoreMax !== null) count++;
    return count;
  },

  uniqueValues: (key) => {
    const { munitions } = get();
    const vals = new Set<string>();
    for (const m of munitions) {
      const v = m[key];
      if (typeof v === 'string' && v.trim()) vals.add(v);
    }
    return Array.from(vals).sort((a, b) => a.localeCompare(b, 'fr'));
  },
}));
