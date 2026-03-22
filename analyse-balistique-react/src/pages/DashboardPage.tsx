import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Crosshair, Activity, BookOpen, Trophy, BarChart3, Zap, Clock } from 'lucide-react';
import { useDashboardStore, WIDGET_CATALOG } from '../stores/dashboardStore';
import type { WidgetId } from '../stores/dashboardStore';
import { WidgetShell } from '../components/dashboard/WidgetShell';
import { WidgetCatalog } from '../components/dashboard/WidgetCatalog';
import { WelcomeWidget } from '../components/dashboard/WelcomeWidget';
import { QuickActionsWidget } from '../components/dashboard/QuickActionsWidget';
import { RecentAnalysesWidget } from '../components/dashboard/RecentAnalysesWidget';
import { StatsOverviewWidget } from '../components/dashboard/StatsOverviewWidget';
import { CalibreBreakdownWidget } from '../components/dashboard/CalibreBreakdownWidget';
import { TopScoresWidget } from '../components/dashboard/TopScoresWidget';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';

const widgetIcons: Record<WidgetId, React.ReactNode> = {
  'welcome': <Crosshair size={13} />,
  'quick-actions': <Zap size={13} />,
  'recent-analyses': <BookOpen size={13} />,
  'stats-overview': <BarChart3 size={13} />,
  'calibre-breakdown': <Activity size={13} />,
  'top-scores': <Trophy size={13} />,
  'activity': <Clock size={13} />,
};

const widgetColors: Record<WidgetId, { color: string; glow: string }> = {
  'welcome': { color: 'var(--accent2)', glow: 'var(--accent-glow)' },
  'quick-actions': { color: 'var(--amber)', glow: 'var(--amber-glow)' },
  'recent-analyses': { color: 'var(--blue)', glow: 'var(--blue-glow)' },
  'stats-overview': { color: 'var(--accent2)', glow: 'var(--accent-glow)' },
  'calibre-breakdown': { color: 'var(--purple)', glow: 'var(--purple-glow)' },
  'top-scores': { color: 'var(--amber)', glow: 'var(--amber-glow)' },
  'activity': { color: 'var(--blue)', glow: 'var(--blue-glow)' },
};

const widgetComponents: Record<WidgetId, React.ComponentType> = {
  'welcome': WelcomeWidget,
  'quick-actions': QuickActionsWidget,
  'recent-analyses': RecentAnalysesWidget,
  'stats-overview': StatsOverviewWidget,
  'calibre-breakdown': CalibreBreakdownWidget,
  'top-scores': TopScoresWidget,
  'activity': ActivityWidget,
};

export function DashboardPage() {
  const { visibleWidgets, widgetOrder, showCatalog, setShowCatalog, toggleWidget, reorderWidgets } = useDashboardStore();

  const [draggedId, setDraggedId] = useState<WidgetId | null>(null);
  const [dragOverId, setDragOverId] = useState<WidgetId | null>(null);

  // Determine display order
  const orderedVisible = widgetOrder.filter((id) => visibleWidgets.includes(id));
  const allVisible = [
    ...orderedVisible,
    ...visibleWidgets.filter((id) => !orderedVisible.includes(id)),
  ];

  const hasAvailableWidgets = WIDGET_CATALOG.some((w) => !visibleWidgets.includes(w.id));

  // --- Drag handlers ---

  const handleDragStart = useCallback((widgetId: WidgetId, e: React.DragEvent) => {
    setDraggedId(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((widgetId: WidgetId, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (widgetId !== draggedId) {
      setDragOverId(widgetId);
    }
  }, [draggedId]);

  const handleDragLeave = useCallback((widgetId: WidgetId, e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX <= rect.left || e.clientX >= rect.right ||
      e.clientY <= rect.top || e.clientY >= rect.bottom
    ) {
      if (dragOverId === widgetId) {
        setDragOverId(null);
      }
    }
  }, [dragOverId]);

  const handleDrop = useCallback((targetId: WidgetId, e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') as WidgetId;
    if (!sourceId || sourceId === targetId) {
      setDragOverId(null);
      setDraggedId(null);
      return;
    }

    const newOrder = [...allVisible];
    const sourceIdx = newOrder.indexOf(sourceId);
    const targetIdx = newOrder.indexOf(targetId);
    if (sourceIdx !== -1 && targetIdx !== -1) {
      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceId);
      reorderWidgets(newOrder);
    }

    setDragOverId(null);
    setDraggedId(null);
  }, [allVisible, reorderWidgets]);

  return (
    <div style={{
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: 12,
      gap: 12,
    }}>
      {/* Widget Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridAutoRows: '1fr',
        gap: 10,
        minHeight: 0,
      }}>
        {allVisible.map((widgetId) => {
          const config = WIDGET_CATALOG.find((w) => w.id === widgetId);
          if (!config) return null;
          const Component = widgetComponents[widgetId];
          const colors = widgetColors[widgetId];

          return (
            <WidgetShell
              key={widgetId}
              id={widgetId}
              title={config.label}
              icon={widgetIcons[widgetId]}
              accentColor={colors.color}
              accentGlow={colors.glow}
              onRemove={() => toggleWidget(widgetId)}
              isDragging={draggedId === widgetId}
              isDragOver={dragOverId === widgetId && draggedId !== widgetId}
              onHeaderDragStart={(e) => handleDragStart(widgetId, e)}
              onHeaderDragEnd={handleDragEnd}
              onContainerDragOver={(e) => handleDragOver(widgetId, e)}
              onContainerDragLeave={(e) => handleDragLeave(widgetId, e)}
              onContainerDrop={(e) => handleDrop(widgetId, e)}
            >
              <Component />
            </WidgetShell>
          );
        })}

        {/* Add Widget slot */}
        {hasAvailableWidgets && (
          <button
            onClick={() => setShowCatalog(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              background: 'transparent',
              border: '1px dashed var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)';
              e.currentTarget.style.background = 'var(--accent-glow)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <div style={{
              width: 36,
              height: 36,
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <Plus size={18} color="var(--muted)" />
            </div>
            <span style={{
              fontSize: 9,
              fontWeight: 700,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}>
              Ajouter un widget
            </span>
          </button>
        )}
      </div>

      {/* Widget Catalog Modal */}
      <AnimatePresence>
        {showCatalog && <WidgetCatalog />}
      </AnimatePresence>
    </div>
  );
}
