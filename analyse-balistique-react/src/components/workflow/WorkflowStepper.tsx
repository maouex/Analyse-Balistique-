import { useEffect, useRef } from 'react';
import { Upload, Ruler, Crosshair, Circle, BarChart3, Check } from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';

interface Step {
  key: string;
  label: string;
  icon: React.ReactNode;
  hint: string;
}

const STEPS: Step[] = [
  { key: 'image', label: 'Image', icon: <Upload size={12} />, hint: 'Chargez une photo de cible' },
  { key: 'scale', label: 'Échelle', icon: <Ruler size={12} />, hint: 'Tracez une référence connue (2 points)' },
  { key: 'center', label: 'Centre', icon: <Crosshair size={12} />, hint: 'Cliquez sur le point visé de la cible' },
  { key: 'impacts', label: 'Impacts', icon: <Circle size={12} />, hint: 'Marquez chaque impact ou utilisez la détection auto' },
  { key: 'results', label: 'Résultats', icon: <BarChart3 size={12} />, hint: 'Analyse terminée — exportez ou sauvegardez' },
];

export function WorkflowStepper() {
  const store = useAnalysisStore();
  const prevStep = useRef(-1);

  let currentStep = 0;
  if (!store.imageLoaded) currentStep = 0;
  else if (!store.scale.pixelsPerCm) currentStep = 1;
  else if (!store.center) currentStep = 2;
  else if (store.impacts.length < 3) currentStep = 3;
  else currentStep = 4;

  useEffect(() => {
    if (currentStep === prevStep.current) return;
    prevStep.current = currentStep;
    switch (currentStep) {
      case 1: store.setMode('scale'); break;
      case 2: store.setMode('center'); break;
      case 3: store.setMode('impact'); break;
    }
  }, [currentStep, store]);

  const progress = (currentStep / (STEPS.length - 1)) * 100;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '8px 18px',
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Progress bar background */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        background: 'var(--border)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          borderRadius: 1,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 8px var(--accent-glow)',
        }} />
      </div>

      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive
                ? 'var(--accent-glow)'
                : isDone ? 'var(--green-glow)' : 'transparent',
              color: isActive
                ? 'var(--accent2)'
                : isDone ? 'var(--green)' : 'var(--muted)',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: isActive
                  ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                  : isDone ? 'var(--green)' : 'var(--surface3)',
                color: (isActive || isDone) ? '#fff' : 'var(--muted)',
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 2px 10px var(--accent-glow)' : 'none',
              }}>
                {isDone ? <Check size={11} strokeWidth={3} /> : step.icon}
              </span>
              {step.label}
            </div>

            {i < STEPS.length - 1 && (
              <div style={{
                width: 28,
                height: 2,
                margin: '0 2px',
                borderRadius: 1,
                background: i < currentStep
                  ? 'var(--green)'
                  : 'var(--border)',
                transition: 'background 0.4s ease',
                opacity: i < currentStep ? 0.6 : 0.4,
              }} />
            )}
          </div>
        );
      })}

      <div style={{
        marginLeft: 'auto',
        fontSize: 11,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        whiteSpace: 'nowrap',
        paddingLeft: 14,
        opacity: 0.8,
      }}>
        {STEPS[currentStep]?.hint}
      </div>
    </div>
  );
}
