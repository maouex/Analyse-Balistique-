import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Crosshair, Ruler, Circle as CircleIcon, BarChart3, Download } from 'lucide-react';
import { tutorialStorage } from '../../lib/storage';

interface TutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Upload,
    title: 'Charger une image',
    description: "Importez une photo de votre cible via le bouton \u00AB Charger \u00BB ou en la glissant sur le canvas.",
    color: 'var(--blue)',
    glow: 'var(--blue-glow)',
  },
  {
    icon: Ruler,
    title: "\u00C9talonner l'\u00E9chelle",
    description: "Utilisez l'outil \u00AB \u00C9chelle \u00BB pour tracer un trait de r\u00E9f\u00E9rence dont vous connaissez la longueur r\u00E9elle.",
    color: 'var(--green)',
    glow: 'var(--green-glow)',
  },
  {
    icon: Crosshair,
    title: 'Placer le centre',
    description: "Avec l'outil \u00AB Centre \u00BB, cliquez sur le point vis\u00E9 de votre cible.",
    color: 'var(--accent2)',
    glow: 'var(--accent-glow)',
  },
  {
    icon: CircleIcon,
    title: 'Marquer les impacts',
    description: "S\u00E9lectionnez l'outil \u00AB Impacts \u00BB et cliquez sur chaque impact de plomb visible.",
    color: 'var(--red)',
    glow: 'var(--red-glow)',
  },
  {
    icon: BarChart3,
    title: 'Analyser les r\u00E9sultats',
    description: "Le panneau de droite affiche en temps r\u00E9el le score, les zones et les statistiques de dispersion.",
    color: 'var(--purple)',
    glow: 'var(--purple-glow)',
  },
  {
    icon: Download,
    title: 'Exporter et sauvegarder',
    description: "Exportez votre analyse en PNG ou sauvegardez-la dans votre biblioth\u00E8que de munitions.",
    color: 'var(--amber)',
    glow: 'var(--amber-glow)',
  },
];

export function Tutorial({ onComplete }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleFinish = () => {
    if (dontShowAgain) tutorialStorage.markSeen();
    onComplete();
  };

  const isLast = currentStep === steps.length - 1;
  const step = steps[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          maxWidth: 520,
          width: '100%',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 14px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--accent2)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Guide de d{'\u00E9'}marrage — {'\u00C9'}tape {currentStep + 1}/{steps.length}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{
              padding: '0 32px 28px',
              textAlign: 'center',
            }}
          >
            {/* Icon with colored glow */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: 20,
              background: step.glow,
              border: `1px solid ${step.color}22`,
              marginBottom: 20,
            }}>
              {(() => {
                const Icon = step.icon;
                return <Icon size={34} color={step.color} strokeWidth={1.5} />;
              })()}
            </div>

            <h3 style={{
              fontSize: 22,
              fontWeight: 800,
              marginBottom: 10,
              letterSpacing: '-0.3px',
            }}>
              {step.title}
            </h3>
            <p style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              maxWidth: 380,
              margin: '0 auto',
            }}>
              {step.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 20 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentStep
                  ? step.color
                  : i < currentStep ? 'var(--text-secondary)' : 'var(--border)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                boxShadow: i === currentStep ? `0 0 10px ${step.glow}` : 'none',
              }}
              onClick={() => setCurrentStep(i)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: 'var(--muted)',
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
            Ne plus afficher
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            {currentStep > 0 && (
              <button className="btn btn-sm" onClick={() => setCurrentStep((s) => s - 1)}>
                Pr{'\u00E9'}c{'\u00E9'}dent
              </button>
            )}
            {isLast ? (
              <button className="btn btn-sm btn-primary" onClick={handleFinish}>
                Commencer
              </button>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={() => setCurrentStep((s) => s + 1)}>
                Suivant
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
