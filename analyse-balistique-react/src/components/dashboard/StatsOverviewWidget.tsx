import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';

export function StatsOverviewWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const munitions = store.munitions;
  const withSnap = munitions.filter((m) => m.snap);
  const totalImpacts = withSnap.reduce((acc, m) => acc + (m.snap?.nbImpacts ?? 0), 0);
  const avgScore = withSnap.length > 0
    ? withSnap.reduce((acc, m) => acc + (m.snap?.score ?? 0), 0) / withSnap.length
    : 0;
  const bestScore = withSnap.length > 0
    ? Math.max(...withSnap.map((m) => m.snap?.score ?? 0))
    : 0;
  const avgR90 = withSnap.length > 0
    ? withSnap.reduce((acc, m) => acc + (m.snap?.r90 ?? 0), 0) / withSnap.length
    : 0;

  const stats = [
    { label: 'Total impacts', value: String(totalImpacts), color: 'var(--accent2)' },
    { label: 'Score moyen', value: avgScore > 0 ? avgScore.toFixed(1) : '—', color: 'var(--amber)' },
    { label: 'Meilleur score', value: bestScore > 0 ? String(bestScore) : '—', color: 'var(--green)' },
    { label: 'R90 moyen', value: avgR90 > 0 ? `${avgR90.toFixed(1)} cm` : '—', color: 'var(--blue)' },
  ];

  // Score distribution bar
  const scoreBuckets = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
  withSnap.forEach((m) => {
    const s = m.snap?.score ?? 0;
    const idx = Math.min(Math.floor(s / 20), 4);
    scoreBuckets[idx]++;
  });
  const maxBucket = Math.max(...scoreBuckets, 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stat grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 8,
      }}>
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              color: s.color,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '-0.5px',
            }}>
              {s.value}
            </div>
            <div style={{
              fontSize: 9,
              color: 'var(--muted)',
              fontWeight: 600,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Score distribution */}
      {withSnap.length > 0 && (
        <div>
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--text-secondary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            marginBottom: 8,
          }}>
            Distribution des scores
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 40 }}>
            {scoreBuckets.map((count, i) => {
              const height = (count / maxBucket) * 100;
              const colors = ['var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)', 'var(--accent2)'];
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    width: '100%',
                    height: `${Math.max(height, 4)}%`,
                    background: `${colors[i]}30`,
                    border: `1px solid ${colors[i]}40`,
                    transition: 'height 0.3s ease',
                    position: 'relative',
                  }}>
                    {count > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: -14,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: 8,
                        fontWeight: 700,
                        color: colors[i],
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {count}
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: 7,
                    color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {i * 20}-{(i + 1) * 20}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
