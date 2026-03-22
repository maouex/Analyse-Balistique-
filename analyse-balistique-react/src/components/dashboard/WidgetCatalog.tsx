import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, LayoutGrid, Plus } from 'lucide-react';
import { useDashboardStore, WIDGET_CATALOG, SIZE_CELLS } from '../../stores/dashboardStore';
import type { WidgetId, WidgetSize } from '../../stores/dashboardStore';

// Import all widget components for preview
import { WelcomeWidget } from './WelcomeWidget';
import { QuickActionsWidget } from './QuickActionsWidget';
import { RecentAnalysesWidget } from './RecentAnalysesWidget';
import { StatsOverviewWidget } from './StatsOverviewWidget';
import { CalibreBreakdownWidget } from './CalibreBreakdownWidget';
import { TopScoresWidget } from './TopScoresWidget';
import { ActivityWidget } from './ActivityWidget';
import { PerformanceRadarWidget } from './PerformanceRadarWidget';
import { ScoreEvolutionWidget } from './ScoreEvolutionWidget';
import { VelocityCompareWidget } from './VelocityCompareWidget';
import { DensityWidget } from './DensityWidget';

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

const SIZE_LABELS: Record<WidgetSize, string> = { S: 'Petit', M: 'Moyen', L: 'Grand' };
// Real rendered width for each size, then scaled down to fit the preview area
const RENDER_WIDTHS: Record<WidgetSize, number> = { S: 140, M: 340, L: 500 };
const PREVIEW_SCALE: Record<WidgetSize, number> = { S: 0.85, M: 0.65, L: 0.52 };

export function WidgetCatalog() {
  const { visibleWidgets, addWidget, setShowCatalog } = useDashboardStore();
  const [selectedWidget, setSelectedWidget] = useState<WidgetId | null>(null);
  const [previewSize, setPreviewSize] = useState<WidgetSize>('M');

  const availableWidgets = WIDGET_CATALOG.filter((w) => !visibleWidgets.includes(w.id));

  const handleAdd = () => {
    if (!selectedWidget) return;
    addWidget(selectedWidget, previewSize);
    setSelectedWidget(null);
  };

  const selectedConfig = selectedWidget ? WIDGET_CATALOG.find((w) => w.id === selectedWidget) : null;
  const PreviewComponent = selectedWidget ? widgetComponents[selectedWidget] : null;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCatalog(false); }}>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="modal"
        style={{ maxWidth: 700, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutGrid size={14} color="var(--accent2)" />
            <h2>Ajouter un widget</h2>
          </div>
          <button onClick={() => setShowCatalog(false)} style={{ width: 28, height: 28, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: Widget list */}
          <div style={{ width: 220, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '8px' }}>
            {availableWidgets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                Tous les widgets sont déjà affichés
              </div>
            ) : (
              availableWidgets.map((widget) => {
                const isSelected = selectedWidget === widget.id;
                return (
                  <button
                    key={widget.id}
                    onClick={() => { setSelectedWidget(widget.id); setPreviewSize(widget.defaultSize); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', width: '100%',
                      background: isSelected ? 'var(--accent-glow)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--border-light)' : 'transparent'}`,
                      cursor: 'pointer', textAlign: 'left', marginBottom: 2, transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? 'var(--accent2)' : 'var(--text)', letterSpacing: '0.3px' }}>{widget.label}</div>
                      <div style={{ fontSize: 8, color: 'var(--muted)', marginTop: 1 }}>{widget.description}</div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: 12 }}>
            {selectedConfig && PreviewComponent ? (
              <>
                {/* Size selector */}
                <div>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
                    Choisir la taille — {SIZE_CELLS[previewSize]} cellule{SIZE_CELLS[previewSize] > 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['S', 'M', 'L'] as WidgetSize[]).map((s) => {
                      const isActive = previewSize === s;
                      return (
                        <button
                          key={s}
                          onClick={() => setPreviewSize(s)}
                          style={{
                            flex: 1, padding: '6px 8px', cursor: 'pointer',
                            background: isActive ? 'var(--accent-glow-strong)' : 'var(--surface2)',
                            border: `1px solid ${isActive ? 'var(--accent2)' : 'var(--border)'}`,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontSize: 12, fontWeight: 800, color: isActive ? 'var(--accent2)' : 'var(--text)', fontFamily: 'var(--font-mono)' }}>{s}</div>
                          <div style={{ fontSize: 7, color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{SIZE_LABELS[s]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6, alignSelf: 'flex-start' }}>
                    Prévisualisation
                  </div>
                  {/* Scale-down container: render at real size, then scale to fit */}
                  <div style={{
                    width: RENDER_WIDTHS[previewSize] * PREVIEW_SCALE[previewSize],
                    height: 'auto',
                    overflow: 'hidden',
                    transition: 'width 0.3s ease',
                  }}>
                    <div style={{
                      width: RENDER_WIDTHS[previewSize],
                      transform: `scale(${PREVIEW_SCALE[previewSize]})`,
                      transformOrigin: 'top left',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      padding: '12px 14px',
                    }}>
                      <PreviewComponent size={previewSize} />
                    </div>
                  </div>
                </div>

                {/* Add button */}
                <button
                  className="btn btn-primary"
                  onClick={handleAdd}
                  style={{ alignSelf: 'flex-end', gap: 6 }}
                >
                  <Plus size={13} />
                  Ajouter en {SIZE_LABELS[previewSize].toLowerCase()}
                </button>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
                Sélectionnez un widget pour prévisualiser
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
