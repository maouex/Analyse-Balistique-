import type { Munition } from '../../types';

const AXES = [
  { key: 'score', label: 'Score', max: 100, getValue: (m: Munition) => m.snap?.score ?? 0 },
  { key: 'nbImpacts', label: 'Impacts', max: 100, getValue: (m: Munition) => m.snap?.nbImpacts ?? 0 },
  { key: 'pct50', label: '%∅50cm', max: 100, getValue: (m: Munition) => parseFloat(m.snap?.pct50cm ?? '0') },
  { key: 'pct100', label: '%∅100cm', max: 100, getValue: (m: Munition) => parseFloat(m.snap?.pct100cm ?? '0') },
  { key: 'r90inv', label: 'Précision', max: 100, getValue: (m: Munition) => m.snap?.r90 ? Math.max(0, 100 - m.snap.r90 * 2) : 0 },
  { key: 'dispInv', label: 'Régularité', max: 100, getValue: (m: Munition) => m.snap?.dispMoy ? Math.max(0, 100 - m.snap.dispMoy * 2) : 0 },
];

const COLORS = ['#4dabf7', '#2ecc71', '#f0a030', '#e05252'];

interface RadarChartProps {
  munitions: Munition[];
}

export function RadarChart({ munitions }: RadarChartProps) {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 50;
  const n = AXES.length;

  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2; // top

  const getPoint = (axisIdx: number, value: number) => {
    const angle = startAngle + axisIdx * angleStep;
    const r = (value / 100) * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid rings
  const rings = [20, 40, 60, 80, 100];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {rings.map((pct) => {
          const r = (pct / 100) * maxR;
          return (
            <circle
              key={pct}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke="var(--border)"
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Axis lines + labels */}
        {AXES.map((axis, i) => {
          const angle = startAngle + i * angleStep;
          const x2 = cx + maxR * Math.cos(angle);
          const y2 = cy + maxR * Math.sin(angle);
          const lx = cx + (maxR + 22) * Math.cos(angle);
          const ly = cy + (maxR + 22) * Math.sin(angle);
          return (
            <g key={axis.key}>
              <line
                x1={cx}
                y1={cy}
                x2={x2}
                y2={y2}
                stroke="var(--border)"
                strokeWidth={1}
                opacity={0.5}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="var(--muted)"
                fontSize={10}
                fontWeight={600}
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Data polygons */}
        {munitions.map((m, mi) => {
          if (!m.snap) return null;
          const points = AXES.map((axis, i) => {
            const val = Math.min(100, Math.max(0, axis.getValue(m)));
            return getPoint(i, val);
          });
          const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
          const color = COLORS[mi % COLORS.length];

          return (
            <g key={m.id}>
              <path
                d={pathD}
                fill={color}
                fillOpacity={0.1}
                stroke={color}
                strokeWidth={2}
                strokeOpacity={0.8}
              />
              {points.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={color}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {munitions.map((m, i) => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              background: COLORS[i % COLORS.length],
            }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{m.nom || 'Sans nom'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
