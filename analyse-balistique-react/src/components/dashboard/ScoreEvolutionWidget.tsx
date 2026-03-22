import { useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { Sparkline } from './SvgCharts';

export function ScoreEvolutionWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const withSnap = [...store.munitions]
    .filter((m) => m.snap)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  if (withSnap.length < 2) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        Min. 2 analyses requises
      </div>
    );
  }

  const scores = withSnap.map((m) => m.snap?.score ?? 0);
  const labels = withSnap.map((m) => { const d = new Date(m.createdAt); return `${d.getDate()}/${d.getMonth() + 1}`; });

  const last3 = scores.slice(-3);
  const first3 = scores.slice(0, 3);
  const trend = (last3.reduce((a, b) => a + b, 0) / last3.length) - (first3.reduce((a, b) => a + b, 0) / first3.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          background: trend > 2 ? 'var(--green-glow)' : trend < -2 ? 'var(--red-glow)' : 'var(--surface2)',
          border: `1px solid ${trend > 2 ? 'rgba(0,255,65,0.2)' : trend < -2 ? 'rgba(255,68,68,0.2)' : 'var(--border)'}`,
        }}>
          {trend > 2 ? <TrendingUp size={11} color="var(--green)" /> :
           trend < -2 ? <TrendingDown size={11} color="var(--red)" /> :
           <Minus size={11} color="var(--muted)" />}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {trend > 2 ? 'Progression' : trend < -2 ? 'Baisse' : 'Stable'}
          </div>
          <div style={{ fontSize: 7, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)} pts
          </div>
        </div>
      </div>
      <Sparkline data={scores} width={260} height={50} color="var(--accent2)" labels={labels.length <= 8 ? labels : undefined} />
    </div>
  );
}
