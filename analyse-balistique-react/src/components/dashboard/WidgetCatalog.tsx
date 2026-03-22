import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, LayoutGrid, Plus, AlertTriangle } from 'lucide-react';
import { useDashboardStore, WIDGET_CATALOG, SIZE_CELLS, MAX_CELLS } from '../../stores/dashboardStore';
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
const PREVIEW_WIDTHS: Record<WidgetSize, number> = { S: 80, M: 180, L: 300 };

export function WidgetCatalog() {
  const { visibleWidgets, addWidget, setShowCatalog, usedCells, canAddSize } = useDashboardStore();
  const [selectedWidget, setSelectedWidget] = useState<WidgetId | null>(null);
  const [previewSize, setPreviewSize] = useState<WidgetSize>('M');
  const used = usedCells();
  const remaining = MAX_CELLS - used;
  const isFull = remaining <= 0;

  const availableWidgets = WIDGET_CATALOG.filter((w) => !visibleWidgets.includes(w.id));

  const handleAdd = () => {
    if (!selectedWidget) return;
    addWidget(selectedWidget, previewSize);
    setSelectedWidget(null);
    if (remaining - SIZE_CELLS[previewSize] <= 0) {
      setShowCatalog(false);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Cell usage indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: MAX_CELLS }).map((_, i) => (
                  <div key={i} style={{
                    width: 6, height: 6,
                    background: i < used ? 'var(--accent2)' : 'var(--surface2)',
                    border: `1px solid ${i < used ? 'var(--accent2)' : 'var(--border)'}`,
                    opacity: i < used ? 0.8 : 0.4,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 9, color: remaining > 0 ? 'var(--text-secondary)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {remaining}/{MAX_CELLS}
              </span>
            </div>
            <button onClick={() => setShowCatalog(false)} style={{ width: 28, height: 28, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: Widget list */}
          <div style={{ width: 220, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '8px' }}>
            {isFull && availableWidgets.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--red-glow)', border: '1px solid rgba(255,68,68,0.2)', marginBottom: 8, fontSize: 9, color: 'var(--red)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                <AlertTriangle size={11} /> Grille pleine
              </div>
            )}

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
                      const canFit = canAddSize(s);
                      return (
                        <button
                          key={s}
                          onClick={() => canFit && setPreviewSize(s)}
                          disabled={!canFit}
                          style={{
                            flex: 1, padding: '6px 8px', cursor: canFit ? 'pointer' : 'not-allowed',
                            background: isActive ? 'var(--accent-glow-strong)' : 'var(--surface2)',
                            border: `1px solid ${isActive ? 'var(--accent2)' : 'var(--border)'}`,
                            opacity: canFit ? 1 : 0.3, transition: 'all 0.15s',
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
                  <div style={{
                    width: PREVIEW_WIDTHS[previewSize], height: 120,
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    padding: '6px 8px', overflow: 'hidden', transition: 'width 0.3s ease',
                  }}>
                    <PreviewComponent size={previewSize} />
                  </div>
                </div>

                {/* Add button */}
                <button
                  className="btn btn-primary"
                  onClick={handleAdd}
                  disabled={!canAddSize(previewSize)}
                  style={{ alignSelf: 'flex-end', gap: 6, opacity: canAddSize(previewSize) ? 1 : 0.4 }}
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
