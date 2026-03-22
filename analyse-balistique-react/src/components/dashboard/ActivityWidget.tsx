import { useEffect } from 'react';
import { Plus, Edit3, Clock } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import type { WidgetSize } from '../../stores/dashboardStore';

export function ActivityWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const activities: { id: string; type: 'created' | 'updated'; name: string; date: Date }[] = [];
  store.munitions.forEach((m) => {
    activities.push({ id: m.id + '-c', type: 'created', name: m.nom || 'Sans nom', date: new Date(m.createdAt) });
    if (m.updatedAt !== m.createdAt) activities.push({ id: m.id + '-u', type: 'updated', name: m.nom || 'Sans nom', date: new Date(m.updatedAt) });
  });
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  const count = size === 'S' ? 1 : size === 'M' ? 3 : 5;
  const recent = activities.slice(0, count);

  if (recent.length === 0) {
    return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--muted)' }}><Clock size={16} color="var(--border-light)" /><span style={{ fontSize: 9, fontFamily: 'var(--font-mono)' }}>Aucune</span></div>;
  }

  if (size === 'S') {
    const e = recent[0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        {e.type === 'created' ? <Plus size={12} color="var(--accent2)" /> : <Edit3 size={12} color="var(--blue)" />}
        <div style={{ fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{e.name}</div>
        <div style={{ fontSize: 7, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmt(e.date)}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
      {recent.map((e) => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: e.type === 'created' ? 'var(--accent-glow)' : 'var(--blue-glow)', border: `1px solid ${e.type === 'created' ? 'rgba(0,255,65,0.2)' : 'rgba(68,170,255,0.2)'}` }}>
            {e.type === 'created' ? <Plus size={8} color="var(--accent2)" /> : <Edit3 size={8} color="var(--blue)" />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
          </div>
          <span style={{ fontSize: 7, color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{fmt(e.date)}</span>
        </div>
      ))}
    </div>
  );
}

function fmt(d: Date): string {
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}min`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h`;
  const days = Math.floor(diff / 86400000);
  if (days < 7) return `${days}j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
