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
  { key: 'image', label: 'Image', icon: <Upload size={13} />, hint: 'Chargez une photo de cible' },
  { key: 'scale', label: 'Échelle', icon: <Ruler size={13} />, hint: 'Tracez une référence connue (2 points)' },
  { key: 'center', label: 'Centre', icon: <Crosshair size={13} />, hint: 'Cliquez sur le point visé de la cible' },
  { key: 'impacts', label: 'Impacts', icon: <Circle size={13} />, hint: 'Marquez chaque impact ou utilisez la détection auto' },
  { key: 'results', label: 'Résultats', icon: <BarChart3 size={13} />, hint: 'Analyse terminée — exportez ou sauvegardez' },
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

  // Auto-switch tool mode when step changes
  useEffect(() => {
    if (currentStep === prevStep.current) return;
    prevStep.current = currentStep;

    switch (currentStep) {
      case 1: // Image loaded → switch to scale tool
        store.setMode('scale');
        break;
      case 2: // Scale done → switch to center tool
        store.setMode('center');
        break;
      case 3: // Center placed → switch to impact tool
        store.setMode('impact');
        break;
    }
  }, [currentStep, store]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      padding: '6px 16px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {STEPS.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Step pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              transition: 'all 0.25s ease',
              background: isActive
                ? 'var(--accent-glow)'
                : isDone ? 'rgba(46, 204, 113, 0.12)' : 'transparent',
              color: isActive
                ? 'var(--accent2)'
                : isDone ? 'var(--green)' : 'var(--muted)',
              whiteSpace: 'nowrap',
            }}>
              {/* Icon / check */}
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: isActive
                  ? 'var(--accent)'
                  : isDone ? 'var(--green)' : 'var(--border)',
                color: (isActive || isDone) ? '#fff' : 'var(--muted)',
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {isDone ? <Check size={11} /> : step.icon}
              </span>
              {step.label}
            </div>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div style={{
                width: 24,
                height: 2,
                margin: '0 2px',
                borderRadius: 1,
                background: i < currentStep ? 'var(--green)' : 'var(--border)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}

      {/* Hint text */}
      <div style={{
        marginLeft: 'auto',
        fontSize: 11,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        whiteSpace: 'nowrap',
        paddingLeft: 12,
      }}>
        {STEPS[currentStep]?.hint}
      </div>
    </div>
  );
}
