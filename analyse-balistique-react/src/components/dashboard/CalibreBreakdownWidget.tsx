import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';

export function CalibreBreakdownWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const calibreMap = new Map<string, { count: number; avgScore: number; scores: number[] }>();
  store.munitions.forEach((m) => {
    const key = m.calibre || 'Non spécifié';
    const entry = calibreMap.get(key) || { count: 0, avgScore: 0, scores: [] };
    entry.count++;
    if (m.snap) entry.scores.push(m.snap.score);
    calibreMap.set(key, entry);
  });

  const calibres = Array.from(calibreMap.entries())
    .map(([calibre, data]) => ({
      calibre,
      count: data.count,
      avgScore: data.scores.length > 0
        ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
        : null,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...calibres.map((c) => c.count), 1);

  if (calibres.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0',
        color: 'var(--muted)',
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
      }}>
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {calibres.map((c) => (
        <div key={c.calibre} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.3px',
              fontFamily: 'var(--font-mono)',
            }}>
              {c.calibre}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {c.avgScore !== null && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: c.avgScore >= 60 ? 'var(--green)' : 'var(--amber)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  Moy: {c.avgScore.toFixed(0)}
                </span>
              )}
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}>
                {c.count}
              </span>
            </div>
          </div>
          {/* Bar */}
          <div style={{
            height: 4,
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(c.count / maxCount) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent2), var(--accent))',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
