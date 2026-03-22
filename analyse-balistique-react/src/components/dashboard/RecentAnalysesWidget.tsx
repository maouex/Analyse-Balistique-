import { useEffect } from 'react';
import { Play, Box, Crosshair } from 'lucide-react';
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
    .slice(0, 3);

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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%', color: 'var(--muted)' }}>
        <Crosshair size={22} color="var(--border-light)" />
        <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)' }}>Aucune analyse récente</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, height: '100%', justifyContent: 'center' }}>
      {recents.map((m) => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: (m.snap?.score ?? 0) >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)',
            border: `1px solid ${(m.snap?.score ?? 0) >= 60 ? 'rgba(0,255,65,0.2)' : 'rgba(255,170,0,0.2)'}`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--font-mono)' }}>
              {m.snap?.score ?? '—'}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom || 'Sans nom'}</div>
            <div style={{ fontSize: 8, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{m.calibre} — {m.snap?.nbImpacts ?? 0} imp.</div>
          </div>
          <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
            <button className="btn btn-sm btn-primary" onClick={() => handleResume(m)} style={{ padding: '2px 6px', fontSize: 8, gap: 3 }}>
              <Play size={8} /> Go
            </button>
            <button className="btn btn-sm" onClick={() => handleView3D(m)} style={{ padding: '2px 6px', fontSize: 8, gap: 3, background: 'var(--purple-glow)', borderColor: 'rgba(170,102,255,0.2)', color: 'var(--purple)' }}>
              <Box size={8} /> 3D
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
