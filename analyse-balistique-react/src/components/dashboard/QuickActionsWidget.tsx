import { Crosshair, BookOpen, Box, Upload } from 'lucide-react';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import { useAnalysisStore } from '../../stores/analysisStore';

export function QuickActionsWidget() {
  const navigate = useTransitionNavigate();
  const hasAnalysis = useAnalysisStore((s) => s.impacts.length > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'center' }}>
      <ActionBtn icon={<Crosshair size={14} />} label="Nouvelle analyse" color="var(--accent2)" borderColor="var(--border-light)"
        onClick={() => { useAnalysisStore.getState().resetAnalysis(); navigate('/analyse'); }} />
      <ActionBtn icon={<BookOpen size={14} />} label="Bibliothèque" color="var(--blue)" borderColor="rgba(68,170,255,0.25)"
        onClick={() => navigate('/bibliotheque')} />
      {hasAnalysis && (
        <>
          <ActionBtn icon={<Upload size={14} />} label={`Reprendre (${useAnalysisStore.getState().impacts.length} impacts)`} color="var(--amber)" borderColor="rgba(255,170,0,0.25)"
            onClick={() => navigate('/analyse')} />
          <ActionBtn icon={<Box size={14} />} label="Vue 3D" color="var(--purple)" borderColor="rgba(170,102,255,0.25)"
            onClick={() => navigate('/3d')} />
        </>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, color, borderColor, onClick }: {
  icon: React.ReactNode; label: string; color: string; borderColor: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
      background: `${color}10`, border: `1px solid ${borderColor}`, cursor: 'pointer', transition: 'all 0.15s',
    }}
      onMouseOver={(e) => { e.currentTarget.style.background = `${color}20`; }}
      onMouseOut={(e) => { e.currentTarget.style.background = `${color}10`; }}
    >
      <div style={{ color, display: 'flex' }}>{icon}</div>
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color, fontFamily: 'var(--font-mono)' }}>{label}</span>
    </button>
  );
}
