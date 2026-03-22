import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart, RadialGauge } from './SvgCharts';

export function DensityWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const withSnap = store.munitions.filter((m) => m.snap);

  if (withSnap.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        Aucune donnée de densité
      </div>
    );
  }

  const totalImpacts = withSnap.reduce((a, m) => a + (m.snap?.nbImpacts ?? 0), 0);
  const totalIn50 = withSnap.reduce((a, m) => a + (m.snap?.impacts50cm ?? 0), 0);
  const totalIn100 = withSnap.reduce((a, m) => a + (m.snap?.impacts100cm ?? 0), 0);
  const outside = Math.max(0, totalImpacts - totalIn100);
  const pct50 = totalImpacts > 0 ? (totalIn50 / totalImpacts) * 100 : 0;
  const pct100 = totalImpacts > 0 ? (totalIn100 / totalImpacts) * 100 : 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 6, height: '100%' }}>
      <DonutChart
        segments={[
          { value: totalIn50, color: 'var(--accent2)', label: '<50cm' },
          { value: totalIn100 - totalIn50, color: 'var(--amber)', label: '50-100' },
          { value: outside, color: 'var(--red)', label: '>100cm' },
        ]}
        size={75} strokeWidth={11}
        centerValue={String(totalImpacts)}
        centerLabel="imp."
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <RadialGauge value={pct50} size={55} strokeWidth={6} label="50cm" color="var(--accent2)" />
        <RadialGauge value={pct100} size={55} strokeWidth={6} label="100cm" color="var(--amber)" />
      </div>
    </div>
  );
}
