import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart, HBarChart } from './SvgCharts';

const CALIBRE_COLORS = [
  'var(--accent2)', 'var(--blue)', 'var(--amber)', 'var(--purple)',
  'var(--red)', 'var(--green)', '#ff69b4', '#00cccc',
];

export function CalibreBreakdownWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const calibreMap = new Map<string, { count: number; scores: number[] }>();
  store.munitions.forEach((m) => {
    const key = m.calibre || 'N/A';
    const entry = calibreMap.get(key) || { count: 0, scores: [] };
    entry.count++;
    if (m.snap) entry.scores.push(m.snap.score);
    calibreMap.set(key, entry);
  });

  const calibres = Array.from(calibreMap.entries())
    .map(([calibre, data], i) => ({
      calibre,
      count: data.count,
      avgScore: data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : null,
      color: CALIBRE_COLORS[i % CALIBRE_COLORS.length],
    }))
    .sort((a, b) => b.count - a.count);

  if (calibres.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 0', color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
      }}>
        Aucune donnée disponible
      </div>
    );
  }

  // Donut segments
  const donutSegments = calibres.map((c) => ({
    value: c.count,
    color: c.color,
    label: c.calibre,
  }));

  // Bar chart items
  const barItems = calibres.map((c) => ({
    label: c.calibre,
    value: c.avgScore !== null ? Math.round(c.avgScore) : 0,
    color: c.color,
    subLabel: `${c.count} mun.`,
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Pie chart */}
      <DonutChart
        segments={donutSegments}
        size={100}
        strokeWidth={16}
        centerValue={String(store.munitions.length)}
        centerLabel="total"
      />

      {/* Score by calibre bars */}
      {barItems.some((b) => b.value > 0) && (
        <div>
          <div style={{
            fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6,
          }}>
            Score moyen par calibre
          </div>
          <HBarChart items={barItems.filter((b) => b.value > 0)} maxValue={100} />
        </div>
      )}
    </div>
  );
}
