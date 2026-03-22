import { useEffect } from 'react';
import { Play, Box, Clock, Crosshair } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import type { Munition } from '../../types';

export function RecentAnalysesWidget() {
  const store = useMunitionsStore();
  const load = store.load;
  const loadProject = useAnalysisStore((s) => s.loadProject);
  const navigate = useTransitionNavigate();

  useEffect(() => { load(); }, [load]);

  const recents = [...store.munitions]
    .filter((m) => m.savedAnalysis)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const handleResume = async (m: Munition) => {
    if (!m.savedAnalysis) return;
    await loadProject(m.savedAnalysis);
    navigate('/analyse');
  };

  const handleView3D = async (m: Munition) => {
    if (!m.savedAnalysis) return;
    await loadProject(m.savedAnalysis);
    navigate('/3d');
  };

  if (recents.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '24px 0',
        color: 'var(--muted)',
      }}>
        <Crosshair size={28} color="var(--border-light)" />
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
          Aucune analyse récente
        </div>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => navigate('/analyse')}
          style={{ gap: 5 }}
        >
          <Crosshair size={12} /> Lancer une analyse
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {recents.map((m) => (
        <div
          key={m.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 12px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            transition: 'all 0.15s',
          }}
        >
          {/* Score badge */}
          <div style={{
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            background: (m.snap?.score ?? 0) >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)',
            border: `1px solid ${(m.snap?.score ?? 0) >= 60 ? 'rgba(0,255,65,0.2)' : 'rgba(255,170,0,0.2)'}`,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 800,
              color: (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)',
              fontFamily: 'var(--font-mono)',
            }}>
              {m.snap?.score ?? '—'}
            </span>
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {m.nom || 'Sans nom'}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: 2,
            }}>
              <span>{m.calibre}</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span>{m.snap?.nbImpacts ?? 0} impacts</span>
              <span style={{ opacity: 0.3 }}>|</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={8} />
                {formatRelative(m.updatedAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleResume(m)}
              style={{ padding: '4px 8px', gap: 4 }}
            >
              <Play size={10} /> Reprendre
            </button>
            <button
              className="btn btn-sm"
              onClick={() => handleView3D(m)}
              style={{
                padding: '4px 8px',
                gap: 4,
                background: 'var(--purple-glow)',
                borderColor: 'rgba(170,102,255,0.2)',
                color: 'var(--purple)',
              }}
            >
              <Box size={10} /> 3D
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
