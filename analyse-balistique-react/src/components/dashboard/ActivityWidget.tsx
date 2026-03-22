import { useEffect } from 'react';
import { Plus, Edit3, Clock } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';

interface ActivityEntry {
  id: string;
  type: 'created' | 'updated';
  name: string;
  calibre: string;
  date: Date;
  score: number | null;
}

export function ActivityWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  // Build activity feed from munitions created/updated dates
  const activities: ActivityEntry[] = [];

  store.munitions.forEach((m) => {
    activities.push({
      id: m.id + '-created',
      type: 'created',
      name: m.nom || 'Sans nom',
      calibre: m.calibre,
      date: new Date(m.createdAt),
      score: m.snap?.score ?? null,
    });
    if (m.updatedAt !== m.createdAt) {
      activities.push({
        id: m.id + '-updated',
        type: 'updated',
        name: m.nom || 'Sans nom',
        calibre: m.calibre,
        date: new Date(m.updatedAt),
        score: m.snap?.score ?? null,
      });
    }
  });

  activities.sort((a, b) => b.date.getTime() - a.date.getTime());
  const recent = activities.slice(0, 8);

  if (recent.length === 0) {
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
        <Clock size={24} color="var(--border-light)" />
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          Aucune activité récente
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {recent.map((entry, i) => (
        <div
          key={entry.id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '8px 0',
            borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          {/* Timeline dot */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 2,
            flexShrink: 0,
          }}>
            <div style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: entry.type === 'created' ? 'var(--accent-glow)' : 'var(--blue-glow)',
              border: `1px solid ${entry.type === 'created' ? 'rgba(0,255,65,0.2)' : 'rgba(68,170,255,0.2)'}`,
            }}>
              {entry.type === 'created' ? (
                <Plus size={10} color="var(--accent2)" />
              ) : (
                <Edit3 size={10} color="var(--blue)" />
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {entry.name}
              </span>
              {entry.score !== null && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: entry.score >= 60 ? 'var(--green)' : 'var(--amber)',
                  fontFamily: 'var(--font-mono)',
                  padding: '1px 5px',
                  background: entry.score >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)',
                  border: `1px solid ${entry.score >= 60 ? 'rgba(0,255,65,0.15)' : 'rgba(255,170,0,0.15)'}`,
                }}>
                  {entry.score}
                </span>
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: 2,
            }}>
              <span>{entry.type === 'created' ? 'Créé' : 'Modifié'}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>{entry.calibre}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={8} />
                {formatDate(entry.date)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
