import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart, RadialGauge } from './SvgCharts';
import type { WidgetSize } from '../../stores/dashboardStore';

export function DensityWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const withSnap = store.munitions.filter((m) => m.snap);
  if (withSnap.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Pas de données</div>;
  }

  const totalImpacts = withSnap.reduce((a, m) => a + (m.snap?.nbImpacts ?? 0), 0);
  const totalIn50 = withSnap.reduce((a, m) => a + (m.snap?.impacts50cm ?? 0), 0);
  const totalIn100 = withSnap.reduce((a, m) => a + (m.snap?.impacts100cm ?? 0), 0);
  const outside = Math.max(0, totalImpacts - totalIn100);
  const pct50 = totalImpacts > 0 ? (totalIn50 / totalImpacts) * 100 : 0;
  const pct100 = totalImpacts > 0 ? (totalIn100 / totalImpacts) * 100 : 0;

  const segments = [
    { value: totalIn50, color: 'var(--accent2)', label: '<50cm' },
    { value: totalIn100 - totalIn50, color: 'var(--amber)', label: '50-100' },
    { value: outside, color: 'var(--red)', label: '>100cm' },
  ];

  if (size === 'S') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <RadialGauge value={pct50} size={85} strokeWidth={7} label="50cm" color="var(--accent2)" />
      </div>
    );
  }

  if (size === 'L') {
    const avgDisp = withSnap.reduce((a, m) => a + (m.snap?.dispMoy ?? 0), 0) / withSnap.length;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 16 }}>
        <DonutChart segments={segments} size={110} strokeWidth={14} centerValue={String(totalImpacts)} centerLabel="imp." />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <RadialGauge value={pct50} size={85} strokeWidth={8} label="50cm" color="var(--accent2)" />
          <RadialGauge value={pct100} size={85} strokeWidth={8} label="100cm" color="var(--amber)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="stat-card" style={{ textAlign: 'center', padding: '5px 8px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{avgDisp.toFixed(1)}cm</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Disp. moy.</div>
          </div>
          <div className="stat-card" style={{ textAlign: 'center', padding: '5px 8px' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--purple)', fontFamily: 'var(--font-mono)' }}>{withSnap.length}</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Analyses</div>
          </div>
        </div>
      </div>
    );
  }

  // M
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 8 }}>
      <DonutChart segments={segments} size={100} strokeWidth={12} centerValue={String(totalImpacts)} centerLabel="imp." />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <RadialGauge value={pct50} size={75} strokeWidth={7} label="50cm" color="var(--accent2)" />
        <RadialGauge value={pct100} size={75} strokeWidth={7} label="100cm" color="var(--amber)" />
      </div>
    </div>
  );
}
