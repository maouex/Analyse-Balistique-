import { AnimatePresence } from 'framer-motion';
import { LayoutGrid, Plus, Crosshair, Activity, BookOpen, Trophy, BarChart3, Zap, Clock } from 'lucide-react';
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
  const { visibleWidgets, widgetOrder, showCatalog, setShowCatalog, toggleWidget, moveWidget } = useDashboardStore();

  // Determine display order: ordered widgets that are visible
  const orderedVisible = widgetOrder.filter((id) => visibleWidgets.includes(id));
  // Add any visible widgets not in the order array
  const allVisible = [
    ...orderedVisible,
    ...visibleWidgets.filter((id) => !orderedVisible.includes(id)),
  ];

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '20px 24px',
    }}>
      {/* Dashboard Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'var(--accent-glow)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LayoutGrid size={16} color="var(--accent2)" />
          </div>
          <div>
            <h1 style={{
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'var(--accent2)',
              fontFamily: 'var(--font-mono)',
              textShadow: '0 0 10px var(--accent-glow)',
              margin: 0,
            }}>
              Tableau de bord
            </h1>
            <span style={{
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '1px',
            }}>
              Centre de commande S.A.G.
            </span>
          </div>
        </div>

        <button
          className="btn btn-sm"
          onClick={() => setShowCatalog(true)}
          style={{ gap: 5 }}
        >
          <Plus size={13} /> Ajouter un widget
        </button>
      </div>

      {/* Widget Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 14,
        paddingBottom: 40,
      }}>
        <AnimatePresence mode="popLayout">
          {allVisible.map((widgetId, idx) => {
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
                size={config.defaultSize}
                accentColor={colors.color}
                accentGlow={colors.glow}
                onMoveUp={() => moveWidget(widgetId, 'up')}
                onMoveDown={() => moveWidget(widgetId, 'down')}
                onRemove={() => toggleWidget(widgetId)}
                isFirst={idx === 0}
                isLast={idx === allVisible.length - 1}
              >
                <Component />
              </WidgetShell>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {allVisible.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: '60px 20px',
          color: 'var(--muted)',
        }}>
          <LayoutGrid size={40} color="var(--border-light)" />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 4,
              fontFamily: 'var(--font-mono)',
            }}>
              Tableau de bord vide
            </div>
            <div style={{ fontSize: 11 }}>
              Ajoutez des widgets pour personnaliser votre espace de travail
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCatalog(true)}
            style={{ gap: 6 }}
          >
            <Plus size={14} /> Ajouter des widgets
          </button>
        </div>
      )}

      {/* Widget Catalog Modal */}
      <AnimatePresence>
        {showCatalog && <WidgetCatalog />}
      </AnimatePresence>
    </div>
  );
}
