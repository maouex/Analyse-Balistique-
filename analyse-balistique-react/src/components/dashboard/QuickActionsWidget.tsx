import { Crosshair, BookOpen, Box, Upload, Plus } from 'lucide-react';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import { useAnalysisStore } from '../../stores/analysisStore';

export function QuickActionsWidget() {
  const navigate = useTransitionNavigate();
  const hasAnalysis = useAnalysisStore((s) => s.impacts.length > 0);

  const actions = [
    {
      icon: <Crosshair size={18} />,
      label: 'Nouvelle analyse',
      description: 'Charger une image et analyser',
      color: 'var(--accent2)',
      glow: 'var(--accent-glow)',
      borderColor: 'var(--border-light)',
      onClick: () => {
        useAnalysisStore.getState().resetAnalysis();
        navigate('/analyse');
      },
    },
    {
      icon: <BookOpen size={18} />,
      label: 'Bibliothèque',
      description: 'Consulter vos munitions',
      color: 'var(--blue)',
      glow: 'var(--blue-glow)',
      borderColor: 'rgba(68,170,255,0.25)',
      onClick: () => navigate('/bibliotheque'),
    },
    ...(hasAnalysis ? [{
      icon: <Box size={18} />,
      label: 'Vue 3D',
      description: 'Modélisation en cours',
      color: 'var(--purple)',
      glow: 'var(--purple-glow)',
      borderColor: 'rgba(170,102,255,0.25)',
      onClick: () => navigate('/3d'),
    }] : []),
    ...(hasAnalysis ? [{
      icon: <Upload size={18} />,
      label: 'Reprendre analyse',
      description: `${useAnalysisStore.getState().impacts.length} impacts en cours`,
      color: 'var(--amber)',
      glow: 'var(--amber-glow)',
      borderColor: 'rgba(255,170,0,0.25)',
      onClick: () => navigate('/analyse'),
    }] : []),
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 10,
    }}>
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '18px 12px',
            background: action.glow,
            border: `1px solid ${action.borderColor}`,
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 8px 24px ${action.glow}`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{ color: action.color }}>
            {action.icon}
          </div>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: action.color,
            fontFamily: 'var(--font-mono)',
          }}>
            {action.label}
          </div>
          <div style={{
            fontSize: 9,
            color: 'var(--muted)',
            textAlign: 'center',
          }}>
            {action.description}
          </div>
        </button>
      ))}

      {/* Add placeholder */}
      {!hasAnalysis && (
        <button
          onClick={() => navigate('/analyse')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '18px 12px',
            background: 'transparent',
            border: '1px dashed var(--border)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            opacity: 0.5,
          }}
          onMouseOver={(e) => { e.currentTarget.style.opacity = '0.8'; }}
          onMouseOut={(e) => { e.currentTarget.style.opacity = '0.5'; }}
        >
          <Plus size={18} color="var(--muted)" />
          <div style={{
            fontSize: 9,
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.5px',
          }}>
            Démarrer une analyse
          </div>
        </button>
      )}
    </div>
  );
}
