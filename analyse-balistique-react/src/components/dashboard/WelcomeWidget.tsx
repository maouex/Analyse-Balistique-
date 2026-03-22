import { Shield, Activity, Database, Crosshair } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { useEffect } from 'react';

export function WelcomeWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const totalMunitions = store.munitions.length;
  const withAnalysis = store.munitions.filter((m) => m.savedAnalysis).length;
  const avgScore = store.munitions.filter((m) => m.snap).reduce((acc, m) => acc + (m.snap?.score ?? 0), 0) / (store.munitions.filter((m) => m.snap).length || 1);

  const now = new Date();
  const hours = now.getHours();
  const greeting = hours < 12 ? 'Bonjour' : hours < 18 ? 'Bon après-midi' : 'Bonsoir';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', justifyContent: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Crosshair size={20} color="var(--accent2)" strokeWidth={1.5} style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '1px', color: 'var(--accent2)', textShadow: '0 0 15px var(--accent-glow)' }}>
            {greeting}, Opérateur
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
            S.A.G. v2.0 — {now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <QS icon={<Database size={11} />} label="Munitions" value={String(totalMunitions)} color="var(--blue)" />
        <QS icon={<Crosshair size={11} />} label="Analyses" value={String(withAnalysis)} color="var(--accent2)" />
        <QS icon={<Activity size={11} />} label="Score moy." value={totalMunitions > 0 ? avgScore.toFixed(0) : '—'} color="var(--amber)" />
        <QS icon={<Shield size={11} />} label="Statut" value="OK" color="var(--accent2)" />
      </div>
    </div>
  );
}

function QS({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px', background: `${color}10`, border: `1px solid ${color}20`, flex: '1 1 70px', minWidth: 0 }}>
      <div style={{ color, display: 'flex' }}>{icon}</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
        <div style={{ fontSize: 7, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{label}</div>
      </div>
    </div>
  );
}
