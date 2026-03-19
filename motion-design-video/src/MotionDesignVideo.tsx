import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { WorkflowScene } from "./scenes/WorkflowScene";
import { AnalysisScene } from "./scenes/AnalysisScene";
import { Visu3DScene } from "./scenes/Visu3DScene";
import { LibraryScene } from "./scenes/LibraryScene";
import { TechScene } from "./scenes/TechScene";
import { OutroScene } from "./scenes/OutroScene";

// Video structure at 30fps:
// Scene 1: Intro          0-5s    (0-150 frames)
// Scene 2: Problem        5-10.5s (150-315 frames)
// Scene 3: Workflow        10.5-19s (315-570 frames)
// Scene 4: Analysis        19-28.5s (570-855 frames)
// Scene 5: 3D Visu         28.5-37s (855-1110 frames)
// Scene 6: Library         37-46.5s (1110-1395 frames)
// Scene 7: Tech Stack      46.5-54s (1395-1620 frames)
// Scene 8: Outro           54-62s  (1620-1860 frames)

export const MotionDesignVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#0a0a0f" }}>
      <Sequence from={0} durationInFrames={165} name="Intro">
        <IntroScene />
      </Sequence>

      <Sequence from={150} durationInFrames={175} name="Problématique">
        <ProblemScene />
      </Sequence>

      <Sequence from={310} durationInFrames={270} name="Workflow guidé">
        <WorkflowScene />
      </Sequence>

      <Sequence from={560} durationInFrames={300} name="Analyse en temps réel">
        <AnalysisScene />
      </Sequence>

      <Sequence from={840} durationInFrames={260} name="Visualisation 3D">
        <Visu3DScene />
      </Sequence>

      <Sequence from={1080} durationInFrames={290} name="Bibliothèque">
        <LibraryScene />
      </Sequence>

      <Sequence from={1350} durationInFrames={230} name="Technologies">
        <TechScene />
      </Sequence>

      <Sequence from={1560} durationInFrames={300} name="Outro">
        <OutroScene />
      </Sequence>
    </AbsoluteFill>
  );
};
