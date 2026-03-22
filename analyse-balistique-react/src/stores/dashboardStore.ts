import { create } from 'zustand';

export type WidgetId =
  | 'welcome'
  | 'quick-actions'
  | 'recent-analyses'
  | 'stats-overview'
  | 'calibre-breakdown'
  | 'top-scores'
  | 'activity'
  | 'performance-radar'
  | 'score-evolution'
  | 'velocity-compare'
  | 'density';

export type WidgetSize = 'S' | 'M' | 'L';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  description: string;
  availableSizes: WidgetSize[];
  defaultSize: WidgetSize;
}

// Cells per size in a 6-column grid
export const SIZE_CELLS: Record<WidgetSize, number> = { S: 1, M: 2, L: 3 };
export const GRID_COLS = 6;

export const WIDGET_CATALOG: WidgetConfig[] = [
  { id: 'welcome', label: 'Accueil', description: 'Message de bienvenue et statut système', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'quick-actions', label: 'Actions rapides', description: 'Accès direct aux fonctionnalités', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'stats-overview', label: 'Statistiques globales', description: 'Scores, impacts et graphiques donut', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'recent-analyses', label: 'Analyses récentes', description: 'Dernières analyses effectuées', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'calibre-breakdown', label: 'Répartition calibres', description: 'Camembert et barres par calibre', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'top-scores', label: 'Meilleurs scores', description: 'Top munitions par performance', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'performance-radar', label: 'Radar performance', description: 'Graphique radar multi-critères', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'score-evolution', label: 'Évolution scores', description: 'Courbe de progression et tendance', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'density', label: 'Densité impacts', description: 'Répartition zones et jauges de densité', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'velocity-compare', label: 'Vitesse & pénétration', description: 'Comparaison vitesses et pénétrations', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
  { id: 'activity', label: 'Activité récente', description: 'Historique des dernières actions', availableSizes: ['S', 'M', 'L'], defaultSize: 'M' },
];

const STORAGE_KEY = 'sag_dashboard_widgets';
const ORDER_KEY = 'sag_dashboard_order';
const SIZES_KEY = 'sag_dashboard_sizes';

function loadVisibleWidgets(): WidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // Default: 4 widgets (8 cells) leaving room for user to add more
  return ['welcome', 'quick-actions', 'stats-overview', 'recent-analyses'];
}

function loadWidgetOrder(): WidgetId[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return WIDGET_CATALOG.map((w) => w.id);
}

function loadWidgetSizes(): Record<string, WidgetSize> {
  try {
    const raw = localStorage.getItem(SIZES_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}


interface DashboardState {
  visibleWidgets: WidgetId[];
  widgetOrder: WidgetId[];
  widgetSizes: Record<string, WidgetSize>;
  showCatalog: boolean;

  getWidgetSize: (id: WidgetId) => WidgetSize;

  addWidget: (id: WidgetId, size: WidgetSize) => void;
  removeWidget: (id: WidgetId) => void;
  setWidgetSize: (id: WidgetId, size: WidgetSize) => void;
  reorderWidgets: (order: WidgetId[]) => void;
  setShowCatalog: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  visibleWidgets: loadVisibleWidgets(),
  widgetOrder: loadWidgetOrder(),
  widgetSizes: loadWidgetSizes(),
  showCatalog: false,

  getWidgetSize: (id) => {
    const { widgetSizes } = get();
    const config = WIDGET_CATALOG.find((w) => w.id === id);
    return widgetSizes[id] ?? config?.defaultSize ?? 'M';
  },

  addWidget: (id, size) => {
    const { visibleWidgets, widgetSizes } = get();
    if (visibleWidgets.includes(id)) return;
    const nextVisible = [...visibleWidgets, id];
    const nextSizes = { ...widgetSizes, [id]: size };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextVisible));
    localStorage.setItem(SIZES_KEY, JSON.stringify(nextSizes));
    set({ visibleWidgets: nextVisible, widgetSizes: nextSizes });
  },

  removeWidget: (id) => {
    const { visibleWidgets } = get();
    const next = visibleWidgets.filter((w) => w !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ visibleWidgets: next });
  },

  setWidgetSize: (id, size) => {
    const { widgetSizes, visibleWidgets } = get();
    const next = { ...widgetSizes, [id]: size };
    localStorage.setItem(SIZES_KEY, JSON.stringify(next));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibleWidgets));
    set({ widgetSizes: next });
  },

  reorderWidgets: (order) => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    set({ widgetOrder: order });
  },

  setShowCatalog: (show) => set({ showCatalog: show }),
}));
