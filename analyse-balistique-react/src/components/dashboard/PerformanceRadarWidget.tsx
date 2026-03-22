import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { RadarChart } from './SvgCharts';

export function PerformanceRadarWidget() {
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
        Analysez des munitions pour voir le radar
      </div>
    );
  }

  const avgScore = withSnap.reduce((a, m) => a + (m.snap?.score ?? 0), 0) / withSnap.length;
  const avgDensity50 = withSnap.reduce((a, m) => a + parseFloat(m.snap?.pct50cm ?? '0'), 0) / withSnap.length;
  const avgDensity100 = withSnap.reduce((a, m) => a + parseFloat(m.snap?.pct100cm ?? '0'), 0) / withSnap.length;
  const avgR90 = withSnap.reduce((a, m) => a + (m.snap?.r90 ?? 0), 0) / withSnap.length;
  const avgImpacts = withSnap.reduce((a, m) => a + (m.snap?.nbImpacts ?? 0), 0) / withSnap.length;

  // Normalize R90 inversely (lower is better) - assume max 30cm
  const r90Score = Math.max(0, 100 - (avgR90 / 30) * 100);
  // Normalize impact count (assume max ~200)
  const impactScore = Math.min(100, (avgImpacts / 200) * 100);

  const axes = [
    { label: 'Score', value: avgScore },
    { label: 'Densité 50', value: avgDensity50 },
    { label: 'Densité 100', value: avgDensity100 },
    { label: 'Précision', value: r90Score },
    { label: 'Volume', value: impactScore },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <RadarChart axes={axes} size={150} color="var(--accent2)" />
      <div style={{
        fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
        letterSpacing: '0.5px', textAlign: 'center',
      }}>
        Moyenne sur {withSnap.length} analyse{withSnap.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
