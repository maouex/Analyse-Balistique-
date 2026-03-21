import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toolbar } from '../components/toolbar/Toolbar';
import { AnalysisCanvas } from '../components/canvas/AnalysisCanvas';
import { StatsPanel } from '../components/stats/StatsPanel';
import { ExportModal } from '../components/export/ExportModal';
import { MunitionForm } from '../components/munitions/MunitionForm';
import { Tutorial } from '../components/tutorial/Tutorial';
import { WorkflowStepper } from '../components/workflow/WorkflowStepper';
import { ScalePrompt } from '../components/ui/ScalePrompt';
import { tutorialStorage } from '../lib/storage';
import { useAnalysisStore } from '../stores/analysisStore';

export function AnalysisPage() {
  const [showExport, setShowExport] = useState(false);
  const [showMunitionForm, setShowMunitionForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const activeMode = useAnalysisStore((s) => s.activeMode);
  const isImpactMode = activeMode === 'impact';

  // Pin state: when pinned, sidebars stay open even in impact mode
  const [leftPinned, setLeftPinned] = useState(false);
  const [rightPinned, setRightPinned] = useState(false);

  // Hover-expand state
  const [leftHovered, setLeftHovered] = useState(false);
  const [rightHovered, setRightHovered] = useState(false);

  const leftCollapsed = isImpactMode && !leftPinned && !leftHovered;
  const rightCollapsed = isImpactMode && !rightPinned && !rightHovered;

  const handleLeftExpand = useCallback(() => setLeftHovered(true), []);
  const handleLeftCollapse = useCallback(() => setLeftHovered(false), []);
  const handleRightExpand = useCallback(() => setRightHovered(true), []);
  const handleRightCollapse = useCallback(() => setRightHovered(false), []);

  useEffect(() => {
    if (!tutorialStorage.hasSeen()) {
      setShowTutorial(true);
    }
  }, []);

  return (
    <>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}>
        <WorkflowStepper />
        <div className="app-layout" style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}>
          <Toolbar
            collapsed={leftCollapsed}
            pinned={leftPinned}
            canCollapse={isImpactMode}
            onPin={() => setLeftPinned((p) => !p)}
            onExpand={handleLeftExpand}
            onCollapse={handleLeftCollapse}
          />
          <AnalysisCanvas />
          <StatsPanel
            onExport={() => setShowExport(true)}
            onSaveMunition={() => setShowMunitionForm(true)}
            collapsed={rightCollapsed}
            pinned={rightPinned}
            canCollapse={isImpactMode}
            onPin={() => setRightPinned((p) => !p)}
            onExpand={handleRightExpand}
            onCollapse={handleRightCollapse}
          />
        </div>
      </div>

      <ScalePrompt />
      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showMunitionForm && <MunitionForm onClose={() => setShowMunitionForm(false)} />}

      <AnimatePresence>
        {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      </AnimatePresence>
    </>
  );
}
