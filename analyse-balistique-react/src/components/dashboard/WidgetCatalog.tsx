import { motion } from 'framer-motion';
import { X, Check, Plus, LayoutGrid } from 'lucide-react';
import { useDashboardStore, WIDGET_CATALOG } from '../../stores/dashboardStore';
import type { WidgetId } from '../../stores/dashboardStore';

export function WidgetCatalog() {
  const { visibleWidgets, toggleWidget, setShowCatalog } = useDashboardStore();

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) setShowCatalog(false); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        className="modal"
        style={{ maxWidth: 560 }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <LayoutGrid size={14} color="var(--accent2)" />
            <h2>Catalogue de widgets</h2>
          </div>
          <button
            onClick={() => setShowCatalog(false)}
            style={{
              width: 28,
              height: 28,
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted)',
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            fontSize: 10,
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.5px',
            marginBottom: 8,
          }}>
            Sélectionnez les widgets à afficher sur votre tableau de bord
          </div>

          {WIDGET_CATALOG.map((widget) => {
            const isActive = visibleWidgets.includes(widget.id);
            return (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id as WidgetId)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: isActive ? 'var(--accent-glow)' : 'var(--surface2)',
                  border: `1px solid ${isActive ? 'var(--border-light)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                {/* Toggle indicator */}
                <div style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  border: `1px solid ${isActive ? 'var(--accent2)' : 'var(--border)'}`,
                  background: isActive ? 'var(--accent-glow-strong)' : 'transparent',
                }}>
                  {isActive ? (
                    <Check size={12} color="var(--accent2)" strokeWidth={3} />
                  ) : (
                    <Plus size={12} color="var(--muted)" />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    color: isActive ? 'var(--accent2)' : 'var(--text)',
                  }}>
                    {widget.label}
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: 'var(--muted)',
                    marginTop: 2,
                  }}>
                    {widget.description}
                  </div>
                </div>

                {/* Size badge */}
                <span style={{
                  fontSize: 8,
                  fontWeight: 600,
                  color: 'var(--muted)',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  border: '1px solid var(--border)',
                }}>
                  {widget.defaultSize}
                </span>
              </button>
            );
          })}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => setShowCatalog(false)}>
            Fermer
          </button>
        </div>
      </motion.div>
    </div>
  );
}
