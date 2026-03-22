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
    .slice(0, 3);

  if (ranked.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: '100%', color: 'var(--muted)' }}>
        <Trophy size={20} color="var(--border-light)" />
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>Aucun score</span>
      </div>
    );
  }

  const medalColors = ['var(--amber)', 'var(--text-secondary)', '#cd7f32'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', justifyContent: 'center' }}>
      {ranked.map((m, i) => (
        <div key={m.id} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
          background: i === 0 ? 'rgba(255,170,0,0.06)' : 'var(--surface2)',
          border: `1px solid ${i === 0 ? 'rgba(255,170,0,0.2)' : 'var(--border)'}`,
        }}>
          <Medal size={14} color={medalColors[i]} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom || 'Sans nom'}</div>
            <div style={{ fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{m.calibre} — {m.snap?.nbImpacts} imp.</div>
          </div>
          <div style={{
            fontSize: 14, fontWeight: 800, flexShrink: 0, fontFamily: 'var(--font-mono)',
            color: (m.snap?.score ?? 0) >= 80 ? 'var(--accent2)' : (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)',
          }}>
            {m.snap?.score}
          </div>
        </div>
      ))}
    </div>
  );
}
