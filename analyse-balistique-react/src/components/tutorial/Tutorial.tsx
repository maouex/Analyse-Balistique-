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
    description: 'Importez une photo de votre cible via le bouton "Charger" ou en la glissant sur le canvas.',
  },
  {
    icon: Ruler,
    title: 'Étalonner l\'échelle',
    description: 'Utilisez l\'outil "Échelle" pour tracer un trait de référence dont vous connaissez la longueur réelle.',
  },
  {
    icon: Crosshair,
    title: 'Placer le centre',
    description: 'Avec l\'outil "Centre", cliquez sur le point visé de votre cible.',
  },
  {
    icon: CircleIcon,
    title: 'Marquer les impacts',
    description: 'Sélectionnez l\'outil "Impacts" et cliquez sur chaque impact de plomb visible.',
  },
  {
    icon: BarChart3,
    title: 'Analyser les résultats',
    description: 'Le panneau de droite affiche en temps réel le score, les zones et les statistiques de dispersion.',
  },
  {
    icon: Download,
    title: 'Exporter et sauvegarder',
    description: 'Exportez votre analyse en PNG ou sauvegardez-la dans votre bibliothèque de munitions.',
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 24,
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: 520,
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px 16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--accent2)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Guide de démarrage — Étape {currentStep + 1}/{steps.length}
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: '0 28px 24px',
              textAlign: 'center',
            }}
          >
            {(() => {
              const Icon = steps[currentStep].icon;
              return <Icon size={48} color="var(--accent2)" strokeWidth={1.5} style={{ marginBottom: 16 }} />;
            })()}
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
              {steps[currentStep].title}
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {steps[currentStep].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === currentStep ? 'var(--accent2)' : 'var(--border)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
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
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)', cursor: 'pointer' }}>
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
                Précédent
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
