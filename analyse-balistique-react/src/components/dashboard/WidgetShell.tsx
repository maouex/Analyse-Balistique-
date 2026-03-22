import { GripVertical, X } from 'lucide-react';
import type { WidgetId, WidgetSize } from '../../stores/dashboardStore';
import { useBentoEffects } from './useBentoEffects';
import './MagicBento.css';

interface WidgetShellProps {
  id: WidgetId;
  title: string;
  icon: React.ReactNode;
  widgetSize?: WidgetSize;
  accentColor?: string;
  accentGlow?: string;
  glowColor?: string;
  children: React.ReactNode;
  onRemove?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  onHeaderDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onHeaderDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContainerDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContainerDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onContainerDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export function WidgetShell({
  id,
  title,
  icon,
  widgetSize = 'M',
  accentColor = 'var(--accent2)',
  accentGlow = 'var(--accent-glow)',
  glowColor = '0, 255, 65',
  children,
  onRemove,
  isDragging,
  isDragOver,
  onHeaderDragStart,
  onHeaderDragEnd,
  onContainerDragOver,
  onContainerDragLeave,
  onContainerDrop,
}: WidgetShellProps) {
  const particleRef = useBentoEffects({ glowColor, particleCount: 12, clickEffect: true });

  return (
    <div
      ref={particleRef}
      data-widget-id={id}
      className={`widget-bento--border-glow widget-bento-particles widget-size-${widgetSize}`}
      onDragOver={onContainerDragOver}
      onDragLeave={onContainerDragLeave}
      onDrop={onContainerDrop}
      style={{
        '--glow-color': glowColor,
        background: 'var(--surface)',
        border: isDragOver
          ? '2px solid var(--accent2)'
          : '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        opacity: isDragging ? 0.3 : 1,
        boxShadow: isDragOver ? '0 0 24px var(--accent-glow-strong), inset 0 0 24px var(--accent-glow)' : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.2s',
      } as React.CSSProperties}
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
        zIndex: 11,
      }} />

      {/* Header - this is the draggable handle */}
      <div
        draggable
        onDragStart={(e) => {
          const widget = e.currentTarget.parentElement;
          if (widget) {
            e.dataTransfer.setDragImage(widget, 50, 20);
          }
          onHeaderDragStart?.(e);
        }}
        onDragEnd={onHeaderDragEnd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderBottom: '1px solid var(--border)',
          background: accentGlow,
          flexShrink: 0,
          cursor: 'grab',
          userSelect: 'none',
          position: 'relative',
          zIndex: 11,
        }}
      >
        <GripVertical size={14} color="var(--muted)" style={{ opacity: 0.5, flexShrink: 0 }} />
        <div style={{ color: accentColor, display: 'flex', alignItems: 'center' }}>
          {icon}
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: accentColor,
          fontFamily: 'var(--font-mono)',
          flex: 1,
        }}>
          {title}
        </span>

        {/* Remove button */}
        {onRemove && (
          <button
            draggable={false}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={removeBtnStyle}
            title="Retirer"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: 14, position: 'relative', zIndex: 1, overflow: 'hidden', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

const removeBtnStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--red)',
  transition: 'color 0.15s',
};
