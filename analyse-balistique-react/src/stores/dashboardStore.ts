import { create } from 'zustand';

export type WidgetId =
  | 'welcome'
  | 'quick-actions'
  | 'recent-analyses'
  | 'stats-overview'
  | 'calibre-breakdown'
  | 'top-scores'
  | 'activity';

export interface WidgetConfig {
  id: WidgetId;
  label: string;
  description: string;
  defaultSize: 'small' | 'medium' | 'large' | 'full';
}

export const WIDGET_CATALOG: WidgetConfig[] = [
  { id: 'welcome', label: 'Accueil', description: 'Message de bienvenue et statut système', defaultSize: 'full' },
  { id: 'quick-actions', label: 'Actions rapides', description: 'Accès direct aux fonctionnalités', defaultSize: 'medium' },
  { id: 'stats-overview', label: 'Statistiques globales', description: 'Vue d\'ensemble de vos données', defaultSize: 'medium' },
  { id: 'recent-analyses', label: 'Analyses récentes', description: 'Dernières analyses effectuées', defaultSize: 'large' },
  { id: 'calibre-breakdown', label: 'Répartition calibres', description: 'Distribution par calibre', defaultSize: 'medium' },
  { id: 'top-scores', label: 'Meilleurs scores', description: 'Top munitions par performance', defaultSize: 'medium' },
  { id: 'activity', label: 'Activité récente', description: 'Historique des dernières actions', defaultSize: 'large' },
];

const STORAGE_KEY = 'sag_dashboard_widgets';
const ORDER_KEY = 'sag_dashboard_order';

function loadVisibleWidgets(): WidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return WIDGET_CATALOG.map((w) => w.id);
}

function loadWidgetOrder(): WidgetId[] {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return WIDGET_CATALOG.map((w) => w.id);
}

interface DashboardState {
  visibleWidgets: WidgetId[];
  widgetOrder: WidgetId[];
  showCatalog: boolean;

  toggleWidget: (id: WidgetId) => void;
  reorderWidgets: (order: WidgetId[]) => void;
  setShowCatalog: (show: boolean) => void;
  moveWidget: (id: WidgetId, direction: 'up' | 'down') => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  visibleWidgets: loadVisibleWidgets(),
  widgetOrder: loadWidgetOrder(),
  showCatalog: false,

  toggleWidget: (id) => {
    const { visibleWidgets } = get();
    const next = visibleWidgets.includes(id)
      ? visibleWidgets.filter((w) => w !== id)
      : [...visibleWidgets, id];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    set({ visibleWidgets: next });
  },

  reorderWidgets: (order) => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
    set({ widgetOrder: order });
  },

  setShowCatalog: (show) => set({ showCatalog: show }),

  moveWidget: (id, direction) => {
    const { widgetOrder } = get();
    const idx = widgetOrder.indexOf(id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= widgetOrder.length) return;
    const next = [...widgetOrder];
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    localStorage.setItem(ORDER_KEY, JSON.stringify(next));
    set({ widgetOrder: next });
  },
}));
