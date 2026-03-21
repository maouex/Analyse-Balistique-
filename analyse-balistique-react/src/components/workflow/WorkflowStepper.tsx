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
  { key: 'image', label: 'IMG', icon: <Upload size={10} />, hint: 'Chargez une photo de cible' },
  { key: 'scale', label: 'ECH', icon: <Ruler size={10} />, hint: 'Tracez une référence connue' },
  { key: 'center', label: 'CTR', icon: <Crosshair size={10} />, hint: 'Cliquez sur le point visé' },
  { key: 'impacts', label: 'IMP', icon: <Circle size={10} />, hint: 'Marquez les impacts' },
  { key: 'results', label: 'RES', icon: <BarChart3 size={10} />, hint: 'Analyse terminée' },
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
      padding: '6px 16px',
      background: 'rgba(1, 10, 1, 0.85)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'rgba(0,255,65,0.05)',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: '#00ff41',
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 0 8px rgba(0,255,65,0.3)',
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
              gap: 5,
              padding: '4px 10px',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '1.5px',
              fontFamily: 'var(--font-mono)',
              transition: 'all 0.3s',
              border: isActive
                ? '1px solid rgba(0,255,65,0.3)'
                : '1px solid transparent',
              background: isActive
                ? 'rgba(0,255,65,0.08)'
                : 'transparent',
              color: isActive
                ? '#00ff41'
                : isDone ? 'rgba(0,255,65,0.5)' : 'rgba(0,255,65,0.2)',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 18,
                height: 18,
                border: isActive
                  ? '1px solid rgba(0,255,65,0.5)'
                  : isDone ? '1px solid rgba(0,255,65,0.3)' : '1px solid rgba(0,255,65,0.1)',
                background: isActive
                  ? 'rgba(0,255,65,0.15)'
                  : isDone ? 'rgba(0,255,65,0.1)' : 'transparent',
                color: (isActive || isDone) ? '#00ff41' : 'rgba(0,255,65,0.2)',
                fontSize: 9,
                fontWeight: 700,
                flexShrink: 0,
                transition: 'all 0.3s',
                boxShadow: isActive ? '0 0 10px rgba(0,255,65,0.15)' : 'none',
              }}>
                {isDone ? <Check size={9} strokeWidth={3} /> : step.icon}
              </span>
              {step.label}
            </div>

            {i < STEPS.length - 1 && (
              <div style={{
                width: 20,
                height: 1,
                margin: '0 2px',
                background: i < currentStep
                  ? 'rgba(0,255,65,0.4)'
                  : 'rgba(0,255,65,0.08)',
                transition: 'background 0.4s ease',
              }} />
            )}
          </div>
        );
      })}

      <div style={{
        marginLeft: 'auto',
        fontSize: 9,
        color: 'rgba(0,255,65,0.35)',
        fontFamily: 'var(--font-mono)',
        whiteSpace: 'nowrap',
        paddingLeft: 14,
        letterSpacing: '0.5px',
      }}>
        {'>'} {STEPS[currentStep]?.hint}
      </div>
    </div>
  );
}
