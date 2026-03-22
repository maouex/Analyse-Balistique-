import { useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import type { WidgetSize } from '../../stores/dashboardStore';

export function TopScoresWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const count = size === 'S' ? 1 : size === 'M' ? 3 : 5;
  const ranked = [...store.munitions].filter((m) => m.snap).sort((a, b) => (b.snap?.score ?? 0) - (a.snap?.score ?? 0)).slice(0, count);

  if (ranked.length === 0) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--muted)' }}><Trophy size={22} color="var(--border-light)" /><span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>Aucun</span></div>;
  }

  if (size === 'S') {
    const m = ranked[0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Medal size={18} color="var(--amber)" />
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>{m.snap?.score}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{m.nom || 'Sans nom'}</div>
      </div>
    );
  }

  const colors = ['var(--amber)', 'var(--text-secondary)', '#cd7f32', 'var(--muted)', 'var(--muted)'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
      {ranked.map((m, i) => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: i === 0 ? 'rgba(255,170,0,0.06)' : 'var(--surface2)', border: `1px solid ${i === 0 ? 'rgba(255,170,0,0.2)' : 'var(--border)'}` }}>
          <Medal size={15} color={colors[i]} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom || 'Sans nom'}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{m.calibre} — {m.snap?.nbImpacts} imp.</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, flexShrink: 0, fontFamily: 'var(--font-mono)', color: (m.snap?.score ?? 0) >= 80 ? 'var(--accent2)' : (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)' }}>{m.snap?.score}</div>
        </div>
      ))}
    </div>
  );
}
