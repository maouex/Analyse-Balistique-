import { useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';

export function TopScoresWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const ranked = [...store.munitions]
    .filter((m) => m.snap)
    .sort((a, b) => (b.snap?.score ?? 0) - (a.snap?.score ?? 0))
    .slice(0, 5);

  if (ranked.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '20px 0',
        color: 'var(--muted)',
      }}>
        <Trophy size={24} color="var(--border-light)" />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          Aucun score enregistré
        </span>
      </div>
    );
  }

  const medalColors = ['var(--amber)', 'var(--text-secondary)', '#cd7f32', 'var(--muted)', 'var(--muted)'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {ranked.map((m, i) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            background: i === 0 ? 'rgba(255,170,0,0.06)' : 'var(--surface2)',
            border: `1px solid ${i === 0 ? 'rgba(255,170,0,0.2)' : 'var(--border)'}`,
          }}
        >
          {/* Rank */}
          <div style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {i < 3 ? (
              <Medal size={16} color={medalColors[i]} />
            ) : (
              <span style={{
                fontSize: 11,
                fontWeight: 800,
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                {i + 1}
              </span>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {m.nom || 'Sans nom'}
            </div>
            <div style={{
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
            }}>
              {m.calibre} — {m.snap?.nbImpacts} impacts
            </div>
          </div>

          {/* Score */}
          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: (m.snap?.score ?? 0) >= 80 ? 'var(--accent2)' : (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)',
            fontFamily: 'var(--font-mono)',
            textShadow: i === 0 ? '0 0 10px var(--amber-glow)' : 'none',
            flexShrink: 0,
          }}>
            {m.snap?.score}
          </div>
        </div>
      ))}
    </div>
  );
}
