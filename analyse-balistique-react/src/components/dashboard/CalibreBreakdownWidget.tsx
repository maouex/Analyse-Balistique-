import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart } from './SvgCharts';

const COLORS = ['var(--accent2)', 'var(--blue)', 'var(--amber)', 'var(--purple)', 'var(--red)', 'var(--green)'];

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
      calibre, count: data.count, color: COLORS[i % COLORS.length],
      avgScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : null,
    }))
    .sort((a, b) => b.count - a.count);

  if (calibres.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        Aucune donnée
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: '100%', justifyContent: 'center' }}>
      <DonutChart
        segments={calibres.map((c) => ({ value: c.count, color: c.color, label: c.calibre }))}
        size={80} strokeWidth={12}
        centerValue={String(store.munitions.length)}
        centerLabel="total"
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
        {calibres.slice(0, 4).map((c) => (
          <div key={c.calibre} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.calibre}</span>
            <span style={{ fontSize: 9, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{c.count}</span>
            {c.avgScore !== null && (
              <span style={{ fontSize: 8, color: c.avgScore >= 60 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                {c.avgScore.toFixed(0)}pts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
