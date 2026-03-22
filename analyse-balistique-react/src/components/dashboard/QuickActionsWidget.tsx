import { Crosshair, BookOpen, Box, Upload } from 'lucide-react';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import { useAnalysisStore } from '../../stores/analysisStore';
import type { WidgetSize } from '../../stores/dashboardStore';

export function QuickActionsWidget({ size = 'M' }: { size?: WidgetSize }) {
  const navigate = useTransitionNavigate();
  const hasAnalysis = useAnalysisStore((s) => s.impacts.length > 0);

  const goNew = () => { useAnalysisStore.getState().resetAnalysis(); navigate('/analyse'); };

  if (size === 'S') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <button onClick={goNew} style={{ border: '1px solid var(--border-light)', background: 'var(--accent-glow)', cursor: 'pointer', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Crosshair size={15} color="var(--accent2)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>ANALYSE</span>
        </button>
      </div>
    );
  }

  const actions = [
    { icon: <Crosshair size={16} />, label: 'Nouvelle analyse', color: 'var(--accent2)', onClick: goNew },
    { icon: <BookOpen size={16} />, label: 'Bibliothèque', color: 'var(--blue)', onClick: () => navigate('/bibliotheque') },
    ...(hasAnalysis ? [
      { icon: <Upload size={16} />, label: `Reprendre (${useAnalysisStore.getState().impacts.length})`, color: 'var(--amber)', onClick: () => navigate('/analyse') },
      { icon: <Box size={16} />, label: 'Vue 3D', color: 'var(--purple)', onClick: () => navigate('/3d') },
    ] : []),
  ];

  const shown = size === 'L' ? actions : actions.slice(0, 3);
  const dir = size === 'L' ? 'row' : 'column';

  return (
    <div style={{ display: 'flex', flexDirection: dir as 'row' | 'column', gap: 8, justifyContent: 'center', flexWrap: size === 'L' ? 'wrap' : undefined }}>
      {shown.map((a) => (
        <button key={a.label} onClick={a.onClick} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', flex: size === 'L' ? '1 1 40%' : undefined,
          background: `${a.color}10`, border: `1px solid ${a.color}25`, cursor: 'pointer', transition: 'all 0.15s',
        }}>
          <div style={{ color: a.color, display: 'flex' }}>{a.icon}</div>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: a.color, fontFamily: 'var(--font-mono)' }}>{a.label}</span>
        </button>
      ))}
    </div>
  );
}
