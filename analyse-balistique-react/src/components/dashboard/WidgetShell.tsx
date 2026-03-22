import { motion } from 'framer-motion';
import { GripVertical, ChevronUp, ChevronDown, X } from 'lucide-react';
import type { WidgetId } from '../../stores/dashboardStore';

interface WidgetShellProps {
  id: WidgetId;
  title: string;
  icon: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  accentColor?: string;
  accentGlow?: string;
  children: React.ReactNode;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onRemove?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const sizeMap = {
  small: '1',
  medium: '1',
  large: '1 / span 2',
  full: '1 / -1',
};

export function WidgetShell({
  title,
  icon,
  size = 'medium',
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
        gridColumn: sizeMap[size],
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
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
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        background: accentGlow,
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
          <GripVertical size={11} color="var(--muted)" style={{ opacity: 0.4, marginLeft: 2 }} />
          {onRemove && (
            <button onClick={onRemove} style={{ ...controlBtnStyle, color: 'var(--red)' }} title="Retirer">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 14 }}>
        {children}
      </div>
    </motion.div>
  );
}

const controlBtnStyle: React.CSSProperties = {
  width: 22,
  height: 22,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--muted)',
  transition: 'color 0.15s',
};
