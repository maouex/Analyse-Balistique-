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
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 0', color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
        textAlign: 'center',
      }}>
        Minimum 2 analyses requises
      </div>
    );
  }

  const scores = withSnap.map((m) => m.snap?.score ?? 0);
  const labels = withSnap.map((m) => {
    const d = new Date(m.createdAt);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  });

  // Trend
  const lastThree = scores.slice(-3);
  const firstThree = scores.slice(0, 3);
  const recentAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;
  const earlyAvg = firstThree.reduce((a, b) => a + b, 0) / firstThree.length;
  const trend = recentAvg - earlyAvg;

  // R90 evolution
  const r90s = withSnap.map((m) => m.snap?.r90 ?? 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Trend indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: trend > 2 ? 'var(--green-glow)' : trend < -2 ? 'var(--red-glow)' : 'var(--surface2)',
          border: `1px solid ${trend > 2 ? 'rgba(0,255,65,0.2)' : trend < -2 ? 'rgba(255,68,68,0.2)' : 'var(--border)'}`,
        }}>
          {trend > 2 ? <TrendingUp size={14} color="var(--green)" /> :
           trend < -2 ? <TrendingDown size={14} color="var(--red)" /> :
           <Minus size={14} color="var(--muted)" />}
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {trend > 2 ? 'En progression' : trend < -2 ? 'En baisse' : 'Stable'}
          </div>
          <div style={{ fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)} pts sur {withSnap.length} analyses
          </div>
        </div>
      </div>

      {/* Score sparkline */}
      <div>
        <div style={{
          fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px',
          textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4,
        }}>
          Évolution des scores
        </div>
        <Sparkline data={scores} width={280} height={55} color="var(--accent2)" labels={labels} />
      </div>

      {/* R90 sparkline */}
      {r90s.some((r) => r > 0) && (
        <div>
          <div style={{
            fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4,
          }}>
            Évolution R90 (cm)
          </div>
          <Sparkline data={r90s} width={280} height={45} color="var(--blue)" labels={labels} />
        </div>
      )}
    </div>
  );
}
