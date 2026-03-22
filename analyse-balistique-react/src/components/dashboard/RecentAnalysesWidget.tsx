import { useEffect } from 'react';
import { Play, Box, Crosshair } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import type { Munition } from '../../types';
import type { WidgetSize } from '../../stores/dashboardStore';

export function RecentAnalysesWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  const loadProject = useAnalysisStore((s) => s.loadProject);
  const navigate = useTransitionNavigate();
  useEffect(() => { load(); }, [load]);

  const count = size === 'S' ? 1 : size === 'M' ? 3 : 5;
  const recents = [...store.munitions].filter((m) => m.savedAnalysis)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, count);

  const resume = async (m: Munition) => { if (m.savedAnalysis) { await loadProject(m.savedAnalysis); navigate('/analyse'); } };
  const view3D = async (m: Munition) => { if (m.savedAnalysis) { await loadProject(m.savedAnalysis); navigate('/3d'); } };

  if (recents.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--muted)' }}>
        <Crosshair size={22} color="var(--border-light)" />
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>Aucune analyse</span>
      </div>
    );
  }

  if (size === 'S') {
    const m = recents[0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{m.snap?.score ?? '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{m.nom || 'Sans nom'}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, justifyContent: 'center' }}>
      {recents.map((m) => (
        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{
            width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: (m.snap?.score ?? 0) >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)',
            border: `1px solid ${(m.snap?.score ?? 0) >= 60 ? 'rgba(0,255,65,0.2)' : 'rgba(255,170,0,0.2)'}`,
          }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: (m.snap?.score ?? 0) >= 60 ? 'var(--green)' : 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{m.snap?.score ?? '—'}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom || 'Sans nom'}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{m.calibre} — {m.snap?.nbImpacts ?? 0} imp.</div>
          </div>
          {size === 'L' && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button className="btn btn-sm btn-primary" onClick={() => resume(m)} style={{ padding: '4px 8px', fontSize: 10, gap: 4 }}><Play size={10} /> Go</button>
              <button className="btn btn-sm" onClick={() => view3D(m)} style={{ padding: '4px 8px', fontSize: 10, gap: 4, background: 'var(--purple-glow)', borderColor: 'rgba(170,102,255,0.2)', color: 'var(--purple)' }}><Box size={10} /> 3D</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
