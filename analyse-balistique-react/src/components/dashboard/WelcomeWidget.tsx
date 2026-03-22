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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 48,
          height: 48,
          border: '1px solid var(--border-light)',
          background: 'var(--accent-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Crosshair size={24} color="var(--accent2)" strokeWidth={1.5} />
        </div>
        <div>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '1px',
            color: 'var(--accent2)',
            textShadow: '0 0 15px var(--accent-glow)',
          }}>
            {greeting}, Opérateur
          </div>
          <div style={{
            fontSize: 10,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.5px',
            marginTop: 2,
          }}>
            S.A.G. — Système d'Analyse de Gerbe v2.0 — {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Quick stats bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 10,
      }}>
        <QuickStat
          icon={<Database size={14} />}
          label="Munitions"
          value={String(totalMunitions)}
          color="var(--blue)"
          glow="var(--blue-glow)"
        />
        <QuickStat
          icon={<Crosshair size={14} />}
          label="Analyses"
          value={String(withAnalysis)}
          color="var(--accent2)"
          glow="var(--accent-glow)"
        />
        <QuickStat
          icon={<Activity size={14} />}
          label="Score moyen"
          value={totalMunitions > 0 ? avgScore.toFixed(0) : '—'}
          color="var(--amber)"
          glow="var(--amber-glow)"
        />
        <QuickStat
          icon={<Shield size={14} />}
          label="Statut"
          value="OPÉRATIONNEL"
          color="var(--accent2)"
          glow="var(--accent-glow)"
          isText
        />
      </div>
    </div>
  );
}

function QuickStat({ icon, label, value, color, glow, isText }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  glow: string;
  isText?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: glow,
      border: `1px solid ${color}20`,
    }}>
      <div style={{ color, display: 'flex', alignItems: 'center' }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: isText ? 9 : 16,
          fontWeight: 800,
          color,
          letterSpacing: isText ? '1px' : '-0.3px',
          fontFamily: 'var(--font-mono)',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: 9,
          color: 'var(--muted)',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
      </div>
    </div>
  );
}
