import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { DonutChart, HBarChart } from './SvgCharts';
import type { WidgetSize } from '../../stores/dashboardStore';

const COLORS = ['var(--accent2)', 'var(--blue)', 'var(--amber)', 'var(--purple)', 'var(--red)', 'var(--green)'];

export function CalibreBreakdownWidget({ size = 'M' }: { size?: WidgetSize }) {
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
    })).sort((a, b) => b.count - a.count);

  if (calibres.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>Aucune donnée</div>;
  }

  if (size === 'S') {
    return (
      <div className="widget-chart-container">
        <DonutChart segments={calibres.map((c) => ({ value: c.count, color: c.color, label: c.calibre }))} size={75} strokeWidth={10} centerValue={String(store.munitions.length)} centerLabel="total" />
      </div>
    );
  }

  if (size === 'L') {
    const barItems = calibres.filter((c) => c.avgScore !== null).slice(0, 5).map((c) => ({
      label: c.calibre, value: Math.round(c.avgScore!), color: c.color, subLabel: `${c.count} mun.`,
    }));
    return (
      <div className="widget-content-flex">
        <DonutChart segments={calibres.map((c) => ({ value: c.count, color: c.color, label: c.calibre }))} size={90} strokeWidth={12} centerValue={String(store.munitions.length)} centerLabel="total" />
        {barItems.length > 0 && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>Score par calibre</div>
            <HBarChart items={barItems} maxValue={100} />
          </div>
        )}
      </div>
    );
  }

  // M
  return (
    <div className="widget-content-flex">
      <DonutChart segments={calibres.map((c) => ({ value: c.count, color: c.color, label: c.calibre }))} size={80} strokeWidth={10} centerValue={String(store.munitions.length)} centerLabel="total" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        {calibres.slice(0, 4).map((c) => (
          <div key={c.calibre} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, background: c.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.calibre}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.color, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
