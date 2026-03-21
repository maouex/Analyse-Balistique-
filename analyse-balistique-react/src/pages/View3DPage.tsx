import { lazy, Suspense } from 'react';
import { useTransitionNavigate } from '../components/transitions/TransitionContext';
import { useAnalysisStore } from '../stores/analysisStore';
import { Crosshair, Box, ArrowRight, Loader2 } from 'lucide-react';

const Scene3D = lazy(() => import('../components/3d/Scene3D').then(m => ({ default: m.Scene3D })));

export function View3DPage() {
  const navigate = useTransitionNavigate();
  const hasImpacts = useAnalysisStore((s) => s.impacts.length > 0);
  const hasScale = useAnalysisStore((s) => !!s.scale.pixelsPerCm);
  const hasCenter = useAnalysisStore((s) => !!s.center);
  const impactCount = useAnalysisStore((s) => s.impacts.length);

  // No data: show guided empty state
  if (!hasImpacts || !hasScale || !hasCenter) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 20,
        padding: 32,
        textAlign: 'center',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: 'var(--purple-glow)',
          border: '1px solid rgba(192,132,252,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Box size={32} color="var(--purple)" strokeWidth={1.5} />
        </div>

        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            Mod{'\u00E9'}lisation 3D
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 360, lineHeight: 1.6 }}>
            La vue 3D n{'\u00E9'}cessite une analyse compl{'\u00E8'}te avec des impacts plac{'\u00E9'}s.
          </p>
        </div>

        {/* Checklist */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          minWidth: 260,
        }}>
          <CheckItem done={hasScale} label={"\u00C9chelle calibr\u00E9e"} />
          <CheckItem done={hasCenter} label="Centre plac\u00E9" />
          <CheckItem done={hasImpacts} label="Impacts marqu\u00E9s (min. 3)" />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/analyse')}
          style={{ gap: 8 }}
        >
          <Crosshair size={15} /> Lancer une analyse <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        color: 'var(--text-secondary)',
        fontSize: 14,
      }}>
        <Loader2 size={24} className="spin" color="var(--accent2)" />
        <span>Chargement de la vue 3D...</span>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {impactCount} impacts {'à'} visualiser
        </span>
      </div>
    }>
      <Scene3D />
    </Suspense>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      fontWeight: 600,
      color: done ? 'var(--green)' : 'var(--muted)',
    }}>
      <span style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: `2px solid ${done ? 'var(--green)' : 'var(--border)'}`,
        background: done ? 'var(--green-glow)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        flexShrink: 0,
      }}>
        {done ? '\u2713' : ''}
      </span>
      {label}
    </div>
  );
}
