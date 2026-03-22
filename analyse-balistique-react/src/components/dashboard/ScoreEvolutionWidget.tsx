import { useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { Sparkline } from './SvgCharts';
import type { WidgetSize } from '../../stores/dashboardStore';

export function ScoreEvolutionWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const withSnap = [...store.munitions].filter((m) => m.snap)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (withSnap.length < 2) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--muted)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>Min. 2 analyses</div>;
  }

  const scores = withSnap.map((m) => m.snap?.score ?? 0);
  const labels = withSnap.map((m) => { const d = new Date(m.createdAt); return `${d.getDate()}/${d.getMonth() + 1}`; });
  const last3 = scores.slice(-3);
  const first3 = scores.slice(0, 3);
  const trend = (last3.reduce((a, b) => a + b, 0) / last3.length) - (first3.reduce((a, b) => a + b, 0) / first3.length);

  if (size === 'S') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 2 }}>
        {trend > 2 ? <TrendingUp size={14} color="var(--green)" /> : trend < -2 ? <TrendingDown size={14} color="var(--red)" /> : <Minus size={14} color="var(--muted)" />}
        <div style={{ fontSize: 10, fontWeight: 800, fontFamily: 'var(--font-mono)', color: trend > 2 ? 'var(--green)' : trend < -2 ? 'var(--red)' : 'var(--muted)' }}>
          {trend > 0 ? '+' : ''}{trend.toFixed(0)}
        </div>
        <div style={{ fontSize: 7, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>pts</div>
      </div>
    );
  }

  const sparkW = size === 'L' ? 380 : 220;
  const r90s = size === 'L' ? withSnap.map((m) => m.snap?.r90 ?? 0) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: trend > 2 ? 'var(--green-glow)' : trend < -2 ? 'var(--red-glow)' : 'var(--surface2)', border: `1px solid ${trend > 2 ? 'rgba(0,255,65,0.2)' : trend < -2 ? 'rgba(255,68,68,0.2)' : 'var(--border)'}` }}>
          {trend > 2 ? <TrendingUp size={10} color="var(--green)" /> : trend < -2 ? <TrendingDown size={10} color="var(--red)" /> : <Minus size={10} color="var(--muted)" />}
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{trend > 2 ? 'Progression' : trend < -2 ? 'Baisse' : 'Stable'} ({trend > 0 ? '+' : ''}{trend.toFixed(1)}pts)</span>
      </div>
      <Sparkline data={scores} width={sparkW} height={45} color="var(--accent2)" labels={labels.length <= 8 ? labels : undefined} />
      {r90s && r90s.some((r) => r > 0) && (
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px', marginBottom: 2 }}>R90 (cm)</div>
          <Sparkline data={r90s} width={sparkW} height={35} color="var(--blue)" showDots={false} />
        </div>
      )}
    </div>
  );
}
