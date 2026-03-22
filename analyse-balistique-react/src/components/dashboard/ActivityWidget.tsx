import { useEffect } from 'react';
import { Plus, Edit3, Clock } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';

export function ActivityWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const activities: { id: string; type: 'created' | 'updated'; name: string; date: Date; score: number | null }[] = [];

  store.munitions.forEach((m) => {
    activities.push({ id: m.id + '-c', type: 'created', name: m.nom || 'Sans nom', date: new Date(m.createdAt), score: m.snap?.score ?? null });
    if (m.updatedAt !== m.createdAt) {
      activities.push({ id: m.id + '-u', type: 'updated', name: m.nom || 'Sans nom', date: new Date(m.updatedAt), score: m.snap?.score ?? null });
    }
  });

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recent = activities.slice(0, 4);

  if (recent.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: '100%', color: 'var(--muted)' }}>
        <Clock size={20} color="var(--border-light)" />
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>Aucune activité</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', justifyContent: 'center' }}>
      {recent.map((e) => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: e.type === 'created' ? 'var(--accent-glow)' : 'var(--blue-glow)',
            border: `1px solid ${e.type === 'created' ? 'rgba(0,255,65,0.2)' : 'rgba(68,170,255,0.2)'}`,
          }}>
            {e.type === 'created' ? <Plus size={9} color="var(--accent2)" /> : <Edit3 size={9} color="var(--blue)" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
            <div style={{ fontSize: 7, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {e.type === 'created' ? 'Créé' : 'Modifié'} — {fmt(e.date)}
            </div>
          </div>
          {e.score !== null && (
            <span style={{
              fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', flexShrink: 0, padding: '1px 4px',
              color: e.score >= 60 ? 'var(--green)' : 'var(--amber)',
              background: e.score >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)',
            }}>{e.score}</span>
          )}
        </div>
      ))}
    </div>
  );
}

function fmt(date: Date): string {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}min`;
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h`;
  const d = Math.floor(diff / 86400000);
  if (d < 7) return `${d}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
