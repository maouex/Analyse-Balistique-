import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { WidgetId } from '../../stores/dashboardStore';

interface WidgetShellProps {
  id: WidgetId;
  title: string;
  icon: React.ReactNode;
  accentColor?: string;
  accentGlow?: string;
  children: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function WidgetShell({
  title,
  icon,
  accentColor = 'var(--accent2)',
  accentGlow = 'var(--accent-glow)',
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
  isFirst,
  isLast,
}: WidgetShellProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }}
    >
      {/* Top glow line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        background: accentGlow,
        flexShrink: 0,
      }}>
        <div style={{ color: accentColor, display: 'flex', alignItems: 'center' }}>
          {icon}
        </div>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: accentColor,
          fontFamily: 'var(--font-mono)',
          flex: 1,
        }}>
          {title}
        </span>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onMoveUp && !isFirst && (
            <button onClick={onMoveUp} style={controlBtnStyle} title="Monter">
              <ChevronUp size={11} />
            </button>
          )}
          {onMoveDown && !isLast && (
            <button onClick={onMoveDown} style={controlBtnStyle} title="Descendre">
              <ChevronDown size={11} />
            </button>
          )}
          {onRemove && (
            <button onClick={onRemove} style={{ ...controlBtnStyle, color: 'var(--red)' }} title="Retirer">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Content - scrollable */}
      <div style={{ flex: 1, padding: 12, overflowY: 'auto', minHeight: 0 }}>
        {children}
      </div>
    </motion.div>
  );
}

const controlBtnStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted)',
  transition: 'color 0.15s',
};
