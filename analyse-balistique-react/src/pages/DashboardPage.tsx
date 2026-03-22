import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Crosshair, Activity, BookOpen, Trophy, BarChart3, Zap, Clock, Radar, TrendingUp, Gauge, Target } from 'lucide-react';
import { useDashboardStore, WIDGET_CATALOG, GRID_COLS } from '../stores/dashboardStore';
import type { WidgetId, WidgetSize } from '../stores/dashboardStore';
import { WidgetShell } from '../components/dashboard/WidgetShell';
import { WidgetCatalog } from '../components/dashboard/WidgetCatalog';
import { BentoSpotlight } from '../components/dashboard/BentoSpotlight';
import { WelcomeWidget } from '../components/dashboard/WelcomeWidget';
import { QuickActionsWidget } from '../components/dashboard/QuickActionsWidget';
import { RecentAnalysesWidget } from '../components/dashboard/RecentAnalysesWidget';
import { StatsOverviewWidget } from '../components/dashboard/StatsOverviewWidget';
import { CalibreBreakdownWidget } from '../components/dashboard/CalibreBreakdownWidget';
import { TopScoresWidget } from '../components/dashboard/TopScoresWidget';
import { ActivityWidget } from '../components/dashboard/ActivityWidget';
import { PerformanceRadarWidget } from '../components/dashboard/PerformanceRadarWidget';
import { ScoreEvolutionWidget } from '../components/dashboard/ScoreEvolutionWidget';
import { VelocityCompareWidget } from '../components/dashboard/VelocityCompareWidget';
import { DensityWidget } from '../components/dashboard/DensityWidget';

const widgetIcons: Record<WidgetId, React.ReactNode> = {
  'welcome': <Crosshair size={13} />,
  'quick-actions': <Zap size={13} />,
  'recent-analyses': <BookOpen size={13} />,
  'stats-overview': <BarChart3 size={13} />,
  'calibre-breakdown': <Activity size={13} />,
  'top-scores': <Trophy size={13} />,
  'activity': <Clock size={13} />,
  'performance-radar': <Radar size={13} />,
  'score-evolution': <TrendingUp size={13} />,
  'velocity-compare': <Gauge size={13} />,
  'density': <Target size={13} />,
};

const widgetColors: Record<WidgetId, { color: string; glow: string; glowRgb: string }> = {
  'welcome': { color: 'var(--accent2)', glow: 'var(--accent-glow)', glowRgb: '0, 255, 65' },
  'quick-actions': { color: 'var(--amber)', glow: 'var(--amber-glow)', glowRgb: '255, 170, 0' },
  'recent-analyses': { color: 'var(--blue)', glow: 'var(--blue-glow)', glowRgb: '68, 170, 255' },
  'stats-overview': { color: 'var(--accent2)', glow: 'var(--accent-glow)', glowRgb: '0, 255, 65' },
  'calibre-breakdown': { color: 'var(--purple)', glow: 'var(--purple-glow)', glowRgb: '170, 102, 255' },
  'top-scores': { color: 'var(--amber)', glow: 'var(--amber-glow)', glowRgb: '255, 170, 0' },
  'activity': { color: 'var(--blue)', glow: 'var(--blue-glow)', glowRgb: '68, 170, 255' },
  'performance-radar': { color: 'var(--accent2)', glow: 'var(--accent-glow)', glowRgb: '0, 255, 65' },
  'score-evolution': { color: 'var(--green)', glow: 'var(--green-glow)', glowRgb: '0, 255, 65' },
  'velocity-compare': { color: 'var(--amber)', glow: 'var(--amber-glow)', glowRgb: '255, 170, 0' },
  'density': { color: 'var(--blue)', glow: 'var(--blue-glow)', glowRgb: '68, 170, 255' },
};

const widgetComponents: Record<WidgetId, React.ComponentType<{ size?: WidgetSize }>> = {
  'welcome': WelcomeWidget,
  'quick-actions': QuickActionsWidget,
  'recent-analyses': RecentAnalysesWidget,
  'stats-overview': StatsOverviewWidget,
  'calibre-breakdown': CalibreBreakdownWidget,
  'top-scores': TopScoresWidget,
  'activity': ActivityWidget,
  'performance-radar': PerformanceRadarWidget,
  'score-evolution': ScoreEvolutionWidget,
  'velocity-compare': VelocityCompareWidget,
  'density': DensityWidget,
};

export function DashboardPage() {
  const { visibleWidgets, widgetOrder, showCatalog, setShowCatalog, removeWidget, reorderWidgets, getWidgetSize, isGridFull } = useDashboardStore();
  const gridRef = useRef<HTMLDivElement>(null);

  const [draggedId, setDraggedId] = useState<WidgetId | null>(null);
  const [dragOverId, setDragOverId] = useState<WidgetId | null>(null);

  const orderedVisible = widgetOrder.filter((id) => visibleWidgets.includes(id));
  const allVisible = [
    ...orderedVisible,
    ...visibleWidgets.filter((id) => !orderedVisible.includes(id)),
  ];

  const gridFull = isGridFull();
  const hasAvailable = WIDGET_CATALOG.some((w) => !visibleWidgets.includes(w.id));
  const showAddSlot = hasAvailable && !gridFull;

  const handleDragStart = useCallback((widgetId: WidgetId, e: React.DragEvent) => {
    setDraggedId(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', widgetId);
  }, []);

  const handleDragEnd = useCallback(() => { setDraggedId(null); setDragOverId(null); }, []);

  const handleDragOver = useCallback((widgetId: WidgetId, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (widgetId !== draggedId) setDragOverId(widgetId);
  }, [draggedId]);

  const handleDragLeave = useCallback((widgetId: WidgetId, e: React.DragEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
      if (dragOverId === widgetId) setDragOverId(null);
    }
  }, [dragOverId]);

  const handleDrop = useCallback((targetId: WidgetId, e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') as WidgetId;
    if (!sourceId || sourceId === targetId) { setDragOverId(null); setDraggedId(null); return; }
    const newOrder = [...allVisible];
    const si = newOrder.indexOf(sourceId);
    const ti = newOrder.indexOf(targetId);
    if (si !== -1 && ti !== -1) { newOrder.splice(si, 1); newOrder.splice(ti, 0, sourceId); reorderWidgets(newOrder); }
    setDragOverId(null);
    setDraggedId(null);
  }, [allVisible, reorderWidgets]);

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 10, gap: 10 }}>
      <BentoSpotlight gridRef={gridRef} spotlightRadius={400} glowColor="0, 255, 65" />

      <div
        ref={gridRef}
        className="bento-grid-section"
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridAutoRows: '1fr',
          gap: 8,
          minHeight: 0,
        }}
      >
        {allVisible.map((widgetId) => {
          const config = WIDGET_CATALOG.find((w) => w.id === widgetId);
          if (!config) return null;
          const Component = widgetComponents[widgetId];
          const colors = widgetColors[widgetId];
          const wSize = getWidgetSize(widgetId);

          return (
            <WidgetShell
              key={widgetId}
              id={widgetId}
              title={config.label}
              icon={widgetIcons[widgetId]}
              widgetSize={wSize}
              accentColor={colors.color}
              accentGlow={colors.glow}
              glowColor={colors.glowRgb}
              onRemove={() => removeWidget(widgetId)}
              isDragging={draggedId === widgetId}
              isDragOver={dragOverId === widgetId && draggedId !== widgetId}
              onHeaderDragStart={(e) => handleDragStart(widgetId, e)}
              onHeaderDragEnd={handleDragEnd}
              onContainerDragOver={(e) => handleDragOver(widgetId, e)}
              onContainerDragLeave={(e) => handleDragLeave(widgetId, e)}
              onContainerDrop={(e) => handleDrop(widgetId, e)}
            >
              <Component size={wSize} />
            </WidgetShell>
          );
        })}

        {/* Add slot */}
        {showAddSlot && (
          <button
            onClick={() => setShowCatalog(true)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: 'transparent', border: '1px dashed var(--border)', cursor: 'pointer', transition: 'all 0.2s',
              minHeight: 0, overflow: 'hidden',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--accent-glow)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <Plus size={16} color="var(--muted)" />
            <span style={{ fontSize: 8, fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>Ajouter</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showCatalog && <WidgetCatalog />}
      </AnimatePresence>
    </div>
  );
}
