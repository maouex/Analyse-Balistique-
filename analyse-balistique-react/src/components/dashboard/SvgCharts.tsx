/* ─── SVG Chart Components for Dashboard Widgets ─── */

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  centerColor?: string;
}

export function DonutChart({
  segments,
  size = 120,
  strokeWidth = 14,
  centerLabel,
  centerValue,
  centerColor = 'var(--accent2)',
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  if (total === 0) return null;

  let offset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.value / total;
    const dash = pct * circumference;
    const gap = circumference - dash;
    const rotation = (offset / total) * 360 - 90;
    offset += seg.value;
    return { ...seg, dash, gap, rotation, pct };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--surface2)" strokeWidth={strokeWidth}
        />
        {/* Segments */}
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={0}
            transform={`rotate(${arc.rotation} ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        {/* Center text */}
        {centerValue && (
          <>
            <text
              x={size / 2} y={size / 2 - 4}
              textAnchor="middle" dominantBaseline="middle"
              fill={centerColor}
              style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-mono)' }}
            >
              {centerValue}
            </text>
            {centerLabel && (
              <text
                x={size / 2} y={size / 2 + 12}
                textAnchor="middle" dominantBaseline="middle"
                fill="var(--muted)"
                style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
              >
                {centerLabel}
              </text>
            )}
          </>
        )}
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
        {arcs.filter((a) => a.value > 0).map((arc, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, background: arc.color, flexShrink: 0 }} />
            <span style={{ fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
              {arc.label} ({(arc.pct * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Radial Gauge ─── */

interface RadialGaugeProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function RadialGauge({
  value,
  size = 100,
  strokeWidth = 10,
  label,
  color = 'var(--accent2)',
}: RadialGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = 0.75; // 270 degrees
  const totalArc = circumference * arcLength;
  const filled = (Math.min(100, Math.max(0, value)) / 100) * totalArc;
  const startAngle = 135; // start from bottom-left

  const getColor = () => {
    if (value >= 80) return 'var(--accent2)';
    if (value >= 60) return 'var(--green)';
    if (value >= 40) return 'var(--amber)';
    return 'var(--red)';
  };

  const dynamicColor = color === 'auto' ? getColor() : color;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--surface2)" strokeWidth={strokeWidth}
          strokeDasharray={`${totalArc} ${circumference - totalArc}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
        />
        {/* Value arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={dynamicColor} strokeWidth={strokeWidth}
          strokeDasharray={`${filled} ${circumference - filled}`}
          strokeLinecap="round"
          transform={`rotate(${startAngle} ${size / 2} ${size / 2})`}
          style={{
            transition: 'stroke-dasharray 0.8s ease, stroke 0.3s ease',
            filter: `drop-shadow(0 0 4px ${dynamicColor}40)`,
          }}
        />
        {/* Value text */}
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill={dynamicColor}
          style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)' }}
        >
          {Math.round(value)}
        </text>
        {label && (
          <text
            x={size / 2} y={size / 2 + 14}
            textAnchor="middle" dominantBaseline="middle"
            fill="var(--muted)"
            style={{ fontSize: 7, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

/* ─── Sparkline / Mini Area Chart ─── */

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
  showDots?: boolean;
  labels?: string[];
}

export function Sparkline({
  data,
  width = 200,
  height = 60,
  color = 'var(--accent2)',
  fillOpacity = 0.15,
  showDots = true,
  labels,
}: SparklineProps) {
  if (data.length < 2) return null;

  const padding = { top: 4, right: 4, bottom: labels ? 16 : 4, left: 4 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: padding.left + (i / (data.length - 1)) * w,
    y: padding.top + h - ((v - min) / range) * h,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + h} L${points[0].x},${padding.top + h} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Fill */}
      <path d={areaPath} fill={color} opacity={fillOpacity} />
      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      {/* Dots */}
      {showDots && points.map((p, i) => (
        <circle
          key={i} cx={p.x} cy={p.y} r={2.5}
          fill="var(--surface)" stroke={color} strokeWidth={1.5}
        />
      ))}
      {/* Labels */}
      {labels && labels.map((l, i) => (
        <text
          key={i}
          x={points[i]?.x ?? 0}
          y={height - 2}
          textAnchor="middle"
          fill="var(--muted)"
          style={{ fontSize: 7, fontFamily: 'var(--font-mono)' }}
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

/* ─── Horizontal Bar Chart ─── */

interface BarItem {
  label: string;
  value: number;
  color: string;
  subLabel?: string;
}

interface HBarChartProps {
  items: BarItem[];
  maxValue?: number;
}

export function HBarChart({ items, maxValue }: HBarChartProps) {
  const max = maxValue ?? Math.max(...items.map((it) => it.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.3px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>
              {item.label}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {item.subLabel && (
                <span style={{ fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{item.subLabel}</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {item.value}
              </span>
            </div>
          </div>
          <div style={{ height: 6, background: 'var(--surface2)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(item.value / max) * 100}%`,
              background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
              transition: 'width 0.5s ease',
              boxShadow: `0 0 8px ${item.color}30`,
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Radar Chart ─── */

interface RadarAxis {
  label: string;
  value: number; // 0-100
}

interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
  color?: string;
}

export function RadarChart({ axes, size = 140, color = 'var(--accent2)' }: RadarChartProps) {
  if (axes.length < 3) return null;

  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 20;
  const n = axes.length;

  const getPoint = (i: number, r: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
  };

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0];

  // Data polygon
  const dataPoints = axes.map((a, i) => getPoint(i, (a.value / 100) * maxR));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((r, i) => {
          const ringPoints = Array.from({ length: n }, (_, j) => getPoint(j, r * maxR));
          const ringPath = ringPoints.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
          return (
            <path key={i} d={ringPath} fill="none" stroke="var(--border)" strokeWidth={0.5} opacity={0.5} />
          );
        })}
        {/* Axes lines */}
        {axes.map((_, i) => {
          const p = getPoint(i, maxR);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth={0.5} opacity={0.3} />;
        })}
        {/* Data fill */}
        <path d={dataPath} fill={color} opacity={0.15} />
        {/* Data stroke */}
        <path d={dataPath} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 3px ${color}40)` }}
        />
        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="var(--surface)" stroke={color} strokeWidth={1.5} />
        ))}
        {/* Labels */}
        {axes.map((a, i) => {
          const p = getPoint(i, maxR + 12);
          return (
            <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
              fill="var(--muted)"
              style={{ fontSize: 7, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}
            >
              {a.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
