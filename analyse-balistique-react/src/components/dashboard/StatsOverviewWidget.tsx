import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart, RadialGauge, AnimatedValue } from './SvgCharts';
import type { WidgetSize } from '../../stores/dashboardStore';

export function StatsOverviewWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const withSnap = store.munitions.filter((m) => m.snap);
  const totalImpacts = withSnap.reduce((a, m) => a + (m.snap?.nbImpacts ?? 0), 0);
  const avgScore = withSnap.length > 0 ? withSnap.reduce((a, m) => a + (m.snap?.score ?? 0), 0) / withSnap.length : 0;
  const avgR90 = withSnap.length > 0 ? withSnap.reduce((a, m) => a + (m.snap?.r90 ?? 0), 0) / withSnap.length : 0;

  const buckets = [
    { label: '0-40', value: 0, color: 'var(--red)' },
    { label: '40-60', value: 0, color: 'var(--amber)' },
    { label: '60-80', value: 0, color: 'var(--green)' },
    { label: '80+', value: 0, color: 'var(--accent2)' },
  ];
  withSnap.forEach((m) => { const s = m.snap?.score ?? 0; buckets[s < 40 ? 0 : s < 60 ? 1 : s < 80 ? 2 : 3].value++; });

  if (size === 'S') {
    return (
      <div className="widget-chart-container">
        <RadialGauge value={avgScore} size={80} strokeWidth={7} label="Score" color="auto" />
      </div>
    );
  }

  if (size === 'L') {
    const totalIn50 = withSnap.reduce((a, m) => a + (m.snap?.impacts50cm ?? 0), 0);
    const pct50 = totalImpacts > 0 ? (totalIn50 / totalImpacts) * 100 : 0;
    return (
      <div className="widget-content-flex">
        <RadialGauge value={avgScore} size={90} strokeWidth={8} label="Score moy." color="auto" />
        <DonutChart segments={buckets} size={90} strokeWidth={12} centerValue={String(withSnap.length)} centerLabel="analyses" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 80 }}>
          <MS label="Impacts" value={String(totalImpacts)} color="var(--accent2)" />
          <MS label="R90 moy." value={avgR90 > 0 ? `${avgR90.toFixed(1)}cm` : '—'} color="var(--blue)" />
          <MS label="Densité 50cm" value={pct50 > 0 ? `${pct50.toFixed(0)}%` : '—'} color="var(--amber)" />
        </div>
      </div>
    );
  }

  // M
  return (
    <div className="widget-content-flex">
      <RadialGauge value={avgScore} size={80} strokeWidth={7} label="Score" color="auto" />
      {withSnap.length > 0 ? (
        <DonutChart segments={buckets} size={80} strokeWidth={10} centerValue={String(withSnap.length)} centerLabel="anal." />
      ) : (
        <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>Pas de données</div>
      )}
    </div>
  );
}

function MS({ label, value, color }: { label: string; value: string; color: string }) {
  const numVal = parseFloat(value);
  const hasDecimals = value.includes('.');
  return (
    <div className="stat-card" style={{ textAlign: 'center', padding: '5px 8px' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
        {!isNaN(numVal) ? <AnimatedValue value={numVal} decimals={hasDecimals ? 1 : 0} suffix={value.replace(/[\d.]+/, '')} style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }} /> : value}
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
