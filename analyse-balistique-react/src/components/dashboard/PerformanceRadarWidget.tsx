import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { RadarChart, RadialGauge } from './SvgCharts';
import type { WidgetSize } from '../../stores/dashboardStore';

export function PerformanceRadarWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const withSnap = store.munitions.filter((m) => m.snap);
  if (withSnap.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>Pas de données</div>;
  }

  const avgScore = withSnap.reduce((a, m) => a + (m.snap?.score ?? 0), 0) / withSnap.length;
  const avgD50 = withSnap.reduce((a, m) => a + parseFloat(m.snap?.pct50cm ?? '0'), 0) / withSnap.length;
  const avgD100 = withSnap.reduce((a, m) => a + parseFloat(m.snap?.pct100cm ?? '0'), 0) / withSnap.length;
  const avgR90 = withSnap.reduce((a, m) => a + (m.snap?.r90 ?? 0), 0) / withSnap.length;
  const avgImp = withSnap.reduce((a, m) => a + (m.snap?.nbImpacts ?? 0), 0) / withSnap.length;

  const axes = [
    { label: 'Score', value: avgScore },
    { label: 'D.50', value: avgD50 },
    { label: 'D.100', value: avgD100 },
    { label: 'Préc.', value: Math.max(0, 100 - (avgR90 / 30) * 100) },
    { label: 'Vol.', value: Math.min(100, (avgImp / 200) * 100) },
  ];

  if (size === 'S') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <RadialGauge value={avgScore} size={60} strokeWidth={5} label="Perf." color="auto" />
      </div>
    );
  }

  const radarSize = size === 'L' ? 130 : 105;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <RadarChart axes={axes} size={radarSize} color="var(--accent2)" />
    </div>
  );
}
