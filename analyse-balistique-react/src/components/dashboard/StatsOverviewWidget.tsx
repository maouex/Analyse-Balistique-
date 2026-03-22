import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart, RadialGauge } from './SvgCharts';

export function StatsOverviewWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const munitions = store.munitions;
  const withSnap = munitions.filter((m) => m.snap);
  const totalImpacts = withSnap.reduce((acc, m) => acc + (m.snap?.nbImpacts ?? 0), 0);
  const avgScore = withSnap.length > 0
    ? withSnap.reduce((acc, m) => acc + (m.snap?.score ?? 0), 0) / withSnap.length
    : 0;
  const avgR90 = withSnap.length > 0
    ? withSnap.reduce((acc, m) => acc + (m.snap?.r90 ?? 0), 0) / withSnap.length
    : 0;

  // Score distribution for donut
  const scoreBuckets = [
    { label: '0-40', value: 0, color: 'var(--red)' },
    { label: '40-60', value: 0, color: 'var(--amber)' },
    { label: '60-80', value: 0, color: 'var(--green)' },
    { label: '80-100', value: 0, color: 'var(--accent2)' },
  ];
  withSnap.forEach((m) => {
    const s = m.snap?.score ?? 0;
    if (s < 40) scoreBuckets[0].value++;
    else if (s < 60) scoreBuckets[1].value++;
    else if (s < 80) scoreBuckets[2].value++;
    else scoreBuckets[3].value++;
  });

  // Impact density: % in 50cm
  const totalIn50 = withSnap.reduce((acc, m) => acc + (m.snap?.impacts50cm ?? 0), 0);
  const pct50 = totalImpacts > 0 ? (totalIn50 / totalImpacts) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Top row: gauge + donut */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8, flexWrap: 'wrap' }}>
        <RadialGauge value={avgScore} size={90} label="Score moy." color="auto" />
        {withSnap.length > 0 ? (
          <DonutChart
            segments={scoreBuckets}
            size={90}
            strokeWidth={12}
            centerValue={String(withSnap.length)}
            centerLabel="analyses"
          />
        ) : (
          <div style={{ width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 9, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            Pas de données
          </div>
        )}
      </div>

      {/* Bottom stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
        <MiniStat label="Impacts" value={String(totalImpacts)} color="var(--accent2)" />
        <MiniStat label="R90 moy." value={avgR90 > 0 ? `${avgR90.toFixed(1)}cm` : '—'} color="var(--blue)" />
        <MiniStat label="Densité 50cm" value={pct50 > 0 ? `${pct50.toFixed(0)}%` : '—'} color="var(--amber)" />
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card" style={{ textAlign: 'center', padding: '6px 4px' }}>
      <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
        {value}
      </div>
      <div style={{ fontSize: 7, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 1 }}>
        {label}
      </div>
    </div>
  );
}
