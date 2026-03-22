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
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 0', color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
      }}>
        Aucune donnée de densité
      </div>
    );
  }

  // Aggregate density data
  const totalImpacts = withSnap.reduce((a, m) => a + (m.snap?.nbImpacts ?? 0), 0);
  const totalIn50 = withSnap.reduce((a, m) => a + (m.snap?.impacts50cm ?? 0), 0);
  const totalIn100 = withSnap.reduce((a, m) => a + (m.snap?.impacts100cm ?? 0), 0);
  const outside = totalImpacts - totalIn100;

  const pct50 = totalImpacts > 0 ? (totalIn50 / totalImpacts) * 100 : 0;
  const pct100 = totalImpacts > 0 ? (totalIn100 / totalImpacts) * 100 : 0;

  // Donut: zone distribution
  const zoneSegments = [
    { value: totalIn50, color: 'var(--accent2)', label: '< 50cm' },
    { value: totalIn100 - totalIn50, color: 'var(--amber)', label: '50-100cm' },
    { value: Math.max(0, outside), color: 'var(--red)', label: '> 100cm' },
  ];

  // Average dispersion
  const avgDisp = withSnap.reduce((a, m) => a + (m.snap?.dispMoy ?? 0), 0) / withSnap.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Zone distribution donut */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 12, flexWrap: 'wrap' }}>
        <DonutChart
          segments={zoneSegments}
          size={100}
          strokeWidth={14}
          centerValue={String(totalImpacts)}
          centerLabel="impacts"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <RadialGauge value={pct50} size={70} strokeWidth={7} label="50cm" color="var(--accent2)" />
          <RadialGauge value={pct100} size={70} strokeWidth={7} label="100cm" color="var(--amber)" />
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        <div className="stat-card" style={{ textAlign: 'center', padding: '6px 4px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>
            {avgDisp.toFixed(1)}cm
          </div>
          <div style={{ fontSize: 7, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Disp. moyenne
          </div>
        </div>
        <div className="stat-card" style={{ textAlign: 'center', padding: '6px 4px' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>
            {withSnap.length}
          </div>
          <div style={{ fontSize: 7, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Analyses
          </div>
        </div>
      </div>
    </div>
  );
}
