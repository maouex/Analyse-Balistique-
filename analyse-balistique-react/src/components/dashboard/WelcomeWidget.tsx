import { Shield, Activity, Database, Crosshair } from 'lucide-react';
import { AnimNum } from '../../hooks/useAnimatedNumber';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { useEffect } from 'react';
import type { WidgetSize } from '../../stores/dashboardStore';

export function WelcomeWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const total = store.munitions.length;
  const analyses = store.munitions.filter((m) => m.savedAnalysis).length;
  const avgScore = store.munitions.filter((m) => m.snap).reduce((a, m) => a + (m.snap?.score ?? 0), 0) / (store.munitions.filter((m) => m.snap).length || 1);
  const hours = new Date().getHours();
  const greeting = hours < 12 ? 'Bonjour' : hours < 18 ? 'Bon après-midi' : 'Bonsoir';

  if (size === 'S') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Crosshair size={20} color="var(--accent2)" />
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>S.A.G.</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>SYS:OK</div>
      </div>
    );
  }

  if (size === 'L') {
    const now = new Date();
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 auto' }}>
          <Crosshair size={24} color="var(--accent2)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent2)', textShadow: '0 0 15px var(--accent-glow)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{greeting}, Opérateur</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              S.A.G. v2.0 — {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: '1 1 auto' }}>
          <QS icon={<Database size={12} />} label="Mun." value={String(total)} color="var(--blue)" />
          <QS icon={<Crosshair size={12} />} label="Anal." value={String(analyses)} color="var(--accent2)" />
          <QS icon={<Activity size={12} />} label="Score" value={total > 0 ? avgScore.toFixed(0) : '—'} color="var(--amber)" />
          <QS icon={<Shield size={12} />} label="Statut" value="OK" color="var(--accent2)" />
        </div>
      </div>
    );
  }

  // M
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Crosshair size={20} color="var(--accent2)" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent2)' }}>{greeting}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>S.A.G. v2.0</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <QS icon={<Database size={13} />} label="Mun." value={String(total)} color="var(--blue)" />
        <QS icon={<Activity size={13} />} label="Score" value={total > 0 ? avgScore.toFixed(0) : '—'} color="var(--amber)" />
      </div>
    </div>
  );
}

function QS({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const numVal = Number(value);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: `${color}10`, border: `1px solid ${color}20`, minWidth: 0 }}>
      <div style={{ color, display: 'flex' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>
          {!isNaN(numVal) ? <AnimNum value={numVal} /> : value}
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
}
