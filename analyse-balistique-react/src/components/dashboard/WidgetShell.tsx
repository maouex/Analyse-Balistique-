import { useRef } from 'react';
import { GripVertical, X } from 'lucide-react';
import type { WidgetId } from '../../stores/dashboardStore';

interface WidgetShellProps {
  id: WidgetId;
  title: string;
  icon: React.ReactNode;
  accentColor?: string;
  accentGlow?: string;
  children: React.ReactNode;
  onRemove?: () => void;
  isDragging?: boolean;
  isDragOver?: boolean;
  dragHandlers?: {
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  };
}

export function WidgetShell({
  id,
  title,
  icon,
  accentColor = 'var(--accent2)',
  accentGlow = 'var(--accent-glow)',
  children,
  onRemove,
  isDragging,
  isDragOver,
  dragHandlers,
}: WidgetShellProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      data-widget-id={id}
      draggable
      onDragStart={(e) => {
        // Only allow drag when starting from the header (grip area)
        const header = headerRef.current;
        if (header && !header.contains(e.target as Node)) {
          e.preventDefault();
          return;
        }
        dragHandlers?.onDragStart(e);
      }}
      onDragEnd={dragHandlers?.onDragEnd}
      onDragOver={dragHandlers?.onDragOver}
      onDragLeave={dragHandlers?.onDragLeave}
      onDrop={dragHandlers?.onDrop}
      style={{
        background: 'var(--surface)',
        border: isDragOver
          ? '2px solid var(--accent2)'
          : '1px solid var(--border)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        opacity: isDragging ? 0.35 : 1,
        boxShadow: isDragOver ? '0 0 20px var(--accent-glow-strong), inset 0 0 20px var(--accent-glow)' : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s, opacity 0.15s',
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

      {/* Header - drag handle zone */}
      <div
        ref={headerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid var(--border)',
          background: accentGlow,
          flexShrink: 0,
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <GripVertical size={12} color="var(--muted)" style={{ opacity: 0.5, flexShrink: 0 }} />
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

        {/* Remove button */}
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            onMouseDown={(e) => e.stopPropagation()}
            style={removeBtnStyle}
            title="Retirer"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {/* Content - scrollable */}
      <div style={{ flex: 1, padding: 12, overflowY: 'auto', minHeight: 0 }}>
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
