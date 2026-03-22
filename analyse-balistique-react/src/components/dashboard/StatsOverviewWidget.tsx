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
    ? withSnap.reduce((acc, m) => acc + (m.snap?.score ?? 0), 0) / withSnap.length : 0;
  const avgR90 = withSnap.length > 0
    ? withSnap.reduce((acc, m) => acc + (m.snap?.r90 ?? 0), 0) / withSnap.length : 0;

  const scoreBuckets = [
    { label: '0-40', value: 0, color: 'var(--red)' },
    { label: '40-60', value: 0, color: 'var(--amber)' },
    { label: '60-80', value: 0, color: 'var(--green)' },
    { label: '80+', value: 0, color: 'var(--accent2)' },
  ];
  withSnap.forEach((m) => {
    const s = m.snap?.score ?? 0;
    if (s < 40) scoreBuckets[0].value++;
    else if (s < 60) scoreBuckets[1].value++;
    else if (s < 80) scoreBuckets[2].value++;
    else scoreBuckets[3].value++;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 4 }}>
        <RadialGauge value={avgScore} size={70} strokeWidth={7} label="Score" color="auto" />
        {withSnap.length > 0 ? (
          <DonutChart segments={scoreBuckets} size={70} strokeWidth={10} centerValue={String(withSnap.length)} centerLabel="anal." />
        ) : (
          <div style={{ width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border)', color: 'var(--muted)', fontSize: 8, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
            Pas de données
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <MS label="Impacts" value={String(totalImpacts)} color="var(--accent2)" />
        <MS label="R90 moy." value={avgR90 > 0 ? `${avgR90.toFixed(1)}` : '—'} color="var(--blue)" />
      </div>
    </div>
  );
}

function MS({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="stat-card" style={{ textAlign: 'center', padding: '3px 4px', flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
      <div style={{ fontSize: 7, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}
