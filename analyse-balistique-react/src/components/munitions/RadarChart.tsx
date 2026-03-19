import type { Munition } from '../../types';

const AXES = [
  { key: 'score', label: 'Score', getValue: (m: Munition) => m.snap?.score ?? 0 },
  { key: 'nbImpacts', label: 'Impacts', getValue: (m: Munition) => Math.min(100, (m.snap?.nbImpacts ?? 0) * 2) },
  { key: 'pct50', label: '%50cm', getValue: (m: Munition) => parseFloat(m.snap?.pct50cm ?? '0') },
  { key: 'pct100', label: '%100cm', getValue: (m: Munition) => parseFloat(m.snap?.pct100cm ?? '0') },
  { key: 'r90inv', label: 'Précision', getValue: (m: Munition) => m.snap?.r90 ? Math.max(0, 100 - m.snap.r90 * 2) : 0 },
  { key: 'dispInv', label: 'Régularité', getValue: (m: Munition) => m.snap?.dispMoy ? Math.max(0, 100 - m.snap.dispMoy * 2) : 0 },
];

const COLORS = [
  { stroke: '#4dabf7', fill: 'rgba(77,171,247,0.12)' },
  { stroke: '#2ecc71', fill: 'rgba(46,204,113,0.12)' },
  { stroke: '#f0a030', fill: 'rgba(240,160,48,0.12)' },
  { stroke: '#e05252', fill: 'rgba(224,82,82,0.12)' },
];

interface RadarChartProps {
  munitions: Munition[];
}

export function RadarChart({ munitions }: RadarChartProps) {
  // Responsive: use viewBox, let SVG scale to container
  const vb = 400;
  const cx = vb / 2;
  const cy = vb / 2;
  const maxR = vb / 2 - 55;
  const n = AXES.length;
  const angleStep = (Math.PI * 2) / n;
  const startAngle = -Math.PI / 2;

  const pt = (axisIdx: number, pct: number) => {
    const angle = startAngle + axisIdx * angleStep;
    const r = (pct / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const rings = [25, 50, 75, 100];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
      <svg
        viewBox={`0 0 ${vb} ${vb}`}
        style={{ width: '100%', maxWidth: 520, height: 'auto', aspectRatio: '1' }}
      >
        {/* Grid rings */}
        {rings.map((pct) => (
          <circle
            key={pct}
            cx={cx} cy={cy} r={(pct / 100) * maxR}
            fill="none" stroke="var(--border)" strokeWidth={0.8} opacity={0.4}
          />
        ))}

        {/* Ring labels */}
        {rings.map((pct) => (
          <text
            key={'lbl' + pct}
            x={cx + 3} y={cy - (pct / 100) * maxR + 1}
            fill="var(--muted)" fontSize={9} opacity={0.6}
          >
            {String(pct)}
          </text>
        ))}

        {/* Axis lines + labels */}
        {AXES.map((axis, i) => {
          const angle = startAngle + i * angleStep;
          const x2 = cx + maxR * Math.cos(angle);
          const y2 = cy + maxR * Math.sin(angle);
          const lx = cx + (maxR + 30) * Math.cos(angle);
          const ly = cy + (maxR + 30) * Math.sin(angle);
          return (
            <g key={axis.key}>
              <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="var(--border)" strokeWidth={0.8} opacity={0.4} />
              <text
                x={lx} y={ly}
                textAnchor="middle" dominantBaseline="middle"
                fill="var(--text-secondary)" fontSize={11} fontWeight={600}
              >
                {axis.label}
              </text>
            </g>
          );
        })}

        {/* Data polygons */}
        {munitions.map((m, mi) => {
          if (!m.snap) return null;
          const c = COLORS[mi % COLORS.length];
          const points = AXES.map((axis, i) => {
            const val = Math.min(100, Math.max(0, axis.getValue(m)));
            return pt(i, val);
          });
          const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z';

          return (
            <g key={m.id}>
              <path d={d} fill={c.fill} stroke={c.stroke} strokeWidth={2.5} />
              {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={4} fill={c.stroke} stroke="#fff" strokeWidth={1.5} />
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
              width: 12, height: 4, borderRadius: 2,
              background: COLORS[i % COLORS.length].stroke,
            }} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>{m.nom || 'Sans nom'}</span>
            {m.snap && (
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                {'(score ' + String(m.snap.score) + ')'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
