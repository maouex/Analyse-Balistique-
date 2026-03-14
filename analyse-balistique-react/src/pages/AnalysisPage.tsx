import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toolbar } from '../components/toolbar/Toolbar';
import { AnalysisCanvas } from '../components/canvas/AnalysisCanvas';
import { StatsPanel } from '../components/stats/StatsPanel';
import { ExportModal } from '../components/export/ExportModal';
import { MunitionForm } from '../components/munitions/MunitionForm';
import { Tutorial } from '../components/tutorial/Tutorial';
import { tutorialStorage } from '../lib/storage';

export function AnalysisPage() {
  const [showExport, setShowExport] = useState(false);
  const [showMunitionForm, setShowMunitionForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (!tutorialStorage.hasSeen()) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <>
      <div className="app-layout" style={{
        display: 'flex',
        height: '100%',
        overflow: 'hidden',
      }}>
        <Toolbar />
        <AnalysisCanvas />
        <StatsPanel
          onExport={() => setShowExport(true)}
          onSaveMunition={() => setShowMunitionForm(true)}
        />
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showMunitionForm && <MunitionForm onClose={() => setShowMunitionForm(false)} />}

      <AnimatePresence>
        {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </>
  );
}
