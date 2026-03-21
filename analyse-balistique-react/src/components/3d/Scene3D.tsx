import { Suspense, useState, useMemo, useRef, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useAnalysisStore } from '../../stores/analysisStore';
import { computeFullAnalysis } from '../../lib/ballistics';
import { impactsTo3D, getDistanceMeters, VIEW_3D_MODES } from '../../lib/3d-utils';
import type { View3DMode } from '../../lib/3d-utils';
import type { BallisticParams, DenseSimulationResult } from '../../lib/ballistics-sim';
import { useBallisticsWorker } from '../../lib/useBallisticsWorker';
import { ConeDispersionMode } from './ConeDispersionMode';
import { HeatmapMode } from './HeatmapMode';
import { EnergyHeatmapMode } from './EnergyHeatmapMode';
import { TrajectoriesMode } from './TrajectoriesMode';
import { DispersionCloudMode } from './DispersionCloudMode';
import { PenetrationMode } from './PenetrationMode';
import { MultiDistanceMode } from './MultiDistanceMode';
import { RealisticSimulationMode } from './RealisticSimulationMode';
import type { SimulationTimeState } from './RealisticSimulationMode';
import { TimelineControls } from './TimelineControls';
import { EnhancedBallisticsPanel } from './EnhancedBallisticsPanel';
import { Camera, RotateCcw, ArrowLeft } from 'lucide-react';
import { useTransitionNavigate } from '../transitions/TransitionContext';
import { SimColorMenu } from './SimColorMenu';
import { useSimColorStore } from '../../stores/simColorStore';

interface Scene3DProps {
  distanceStr?: string;
  velocityMs?: number;
  penetrationCm?: number;
}

export function Scene3D({
  distanceStr = '35m',
  velocityMs = 400,
  penetrationCm = 25,
}: Scene3DProps) {
  const navigate = useTransitionNavigate();
  const [activeMode, setActiveMode] = useState<View3DMode>('cone');
  const [autoRotate, setAutoRotate] = useState(true);
  const [ballisticParams, setBallisticParams] = useState<BallisticParams | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Simulation timeline state
  const [simTimeState, setSimTimeState] = useState<SimulationTimeState>({
    currentTime: 0,
    playing: false,
    speed: 0.01, // 100× slow-mo by default
  });
  const [denseSim, setDenseSim] = useState<DenseSimulationResult | null>(null);

  const store = useAnalysisStore();

  const stats = useMemo(() =>
    computeFullAnalysis(
      store.impacts, store.center,
      store.circle1.diameterCm, store.circle2.diameterCm,
      store.scale.pixelsPerCm
    ),
    [store.impacts, store.center, store.circle1.diameterCm, store.circle2.diameterCm, store.scale.pixelsPerCm]
  );

  const impacts3D = useMemo(() =>
    impactsTo3D(
      store.impacts, store.center, store.scale.pixelsPerCm,
      store.circle1.diameterCm, store.circle2.diameterCm,
      penetrationCm
    ),
    [store.impacts, store.center, store.scale.pixelsPerCm, store.circle1.diameterCm, store.circle2.diameterCm, penetrationCm]
  );

  const distanceM = getDistanceMeters(distanceStr);
  const r90 = stats?.dispersion.r90 ?? 20;
  const c1r = store.circle1.diameterCm / 2;
  const c2r = store.circle2.diameterCm / 2;

  // Impact positions for worker
  const impactPositionsCm = useMemo(
    () => impacts3D.map(imp => ({ x: imp.x, y: imp.y })),
    [impacts3D]
  );

  // Standard sim (Web Worker)
  const { simResult, computing } = useBallisticsWorker(ballisticParams, distanceM, impactPositionsCm);

  const effectiveVelocity = ballisticParams?.muzzleVelocity ?? velocityMs;
  const effectivePenetration = simResult?.avgPenetration ?? penetrationCm;

  const enhancedImpacts3D = useMemo(() => {
    if (!simResult) return impacts3D;
    return impacts3D.map((imp, i) => {
      const pellet = simResult.pellets[i];
      if (!pellet) return imp;
      return { ...imp, z: pellet.penetrationCm };
    });
  }, [impacts3D, simResult]);

  const isSimMode = activeMode === 'simulation';
  const simColors = useSimColorStore(s => s.colors);

  // Camera config per mode
  const cameraPosition: [number, number, number] =
    isSimMode ? [0, 2.5, -4] // side view, slightly elevated
    : activeMode === 'penetration' ? [0.5, 0.2, 0.8]
    : activeMode === 'trajectories' || activeMode === 'cloud' ? [0.8, distanceM * 0.005 + 0.3, 0.8]
    : activeMode === 'multiDistance' ? [0, 1.5, 2.5]
    : [0.5, 0.4, 0.5];

  const cameraFov = isSimMode ? 60 : 50;
  const cameraTarget: [number, number, number] | undefined =
    isSimMode ? [0, 1.2, distanceM / 2] : undefined;

  // Simulation callbacks
  const handleTimeUpdate = useCallback((t: number) => {
    setSimTimeState(prev => ({ ...prev, currentTime: t }));
  }, []);

  const handleSimReady = useCallback((sim: DenseSimulationResult) => {
    setDenseSim(sim);
  }, []);

  const handlePlay = useCallback(() => {
    setSimTimeState(prev => ({ ...prev, playing: true }));
  }, []);

  const handlePause = useCallback(() => {
    setSimTimeState(prev => ({ ...prev, playing: false }));
  }, []);

  const handleReset = useCallback(() => {
    setSimTimeState(prev => ({ ...prev, currentTime: 0, playing: false }));
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimTimeState(prev => ({ ...prev, speed }));
  }, []);

  const handleScreenshot = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `analyse-3d-${activeMode}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Component that clears fog from the scene when not in simulation mode
  function ClearFog() {
    const { scene } = useThree();
    scene.fog = null;
    return null;
  }

  // Reset sim time when switching to/from sim mode
  const handleModeChange = useCallback((mode: View3DMode) => {
    setActiveMode(mode);
    if (mode === 'simulation') {
      setSimTimeState({ currentTime: 0, playing: false, speed: 0.01 });
    }
  }, []);

  if (impacts3D.length === 0) {
    return (
      <div style={{
        height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)', fontSize: 14, flexDirection: 'column', gap: 12,
      }}>
        <p>Effectuez d'abord une analyse avec des impacts pour activer la vue 3D.</p>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Mode selector toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        flexWrap: 'wrap',
      }}>
        <button className="btn btn-sm" onClick={() => navigate('/analyse')} style={{ gap: 5, marginRight: 4 }}>
          <ArrowLeft size={13} /> Analyse
        </button>
        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />
        {VIEW_3D_MODES.map((mode) => (
          <button
            key={mode.mode}
            className={`btn btn-sm ${activeMode === mode.mode ? 'active' : ''}`}
            onClick={() => handleModeChange(mode.mode)}
            title={mode.description}
            style={{
              fontSize: 11, padding: '4px 8px',
              ...(mode.mode === 'simulation' ? {
                background: activeMode === 'simulation' ? 'var(--purple-glow)' : undefined,
                color: activeMode === 'simulation' ? 'var(--purple)' : undefined,
                fontWeight: activeMode === 'simulation' ? 700 : undefined,
              } : {}),
            }}
          >
            <span style={{ fontSize: 12 }}>{mode.icon}</span> {mode.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <EnhancedBallisticsPanel
          onApply={setBallisticParams}
          onClear={() => setBallisticParams(null)}
          activeParams={ballisticParams}
          distanceM={distanceM}
        />
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        {!isSimMode && (
          <button
            className={`btn btn-sm ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Rotation automatique"
          >
            <RotateCcw size={12} /> Auto
          </button>
        )}
        <button className="btn btn-sm" onClick={handleScreenshot} title="Capture d'écran 3D">
          <Camera size={12} /> Capture
        </button>
      </div>

      {/* Mode description + ballistic status */}
      <div style={{
        padding: '6px 12px', fontSize: 11, color: 'var(--muted)',
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 4,
      }}>
        <span>
          {VIEW_3D_MODES.find((m) => m.mode === activeMode)?.description}
          {!isSimMode && (
            <span style={{ marginLeft: 12, color: 'var(--text-secondary)' }}>
              Souris: orbite | Molette: zoom | Clic droit: pan
            </span>
          )}
        </span>
        {computing && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--purple)',
            background: 'var(--purple-glow)', padding: '2px 8px', borderRadius: 6,
            animation: 'pulse 1s infinite',
          }}>
            Simulation...
          </span>
        )}
        {simResult && !computing && !isSimMode && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: 'var(--purple)',
            background: 'var(--purple-glow)', padding: '2px 8px', borderRadius: 6,
          }}>
            V: {simResult.avgImpactVelocity.toFixed(0)} m/s
            | Pén: {simResult.avgPenetration.toFixed(1)} cm
            | Rét: {simResult.velocityRetention.toFixed(0)}%
          </span>
        )}
      </div>

      {/* 3D Canvas + Timeline */}
      <div ref={canvasContainerRef} style={{ flex: 1, minHeight: 0, position: 'relative', background: isSimMode ? simColors.sky : 'var(--canvas-bg)' }}>
        <Canvas
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          style={{ position: 'absolute', inset: 0 }}
          shadows={isSimMode}
        >
          <PerspectiveCamera
            makeDefault
            position={cameraPosition}
            fov={cameraFov}
          />
          <OrbitControls
            autoRotate={!isSimMode && autoRotate}
            autoRotateSpeed={1.5}
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI * 0.85}
            target={cameraTarget}
          />

          {!isSimMode && (
            <>
              <ClearFog />
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 10, 5]} intensity={0.8} />
              <directionalLight position={[-3, 8, -3]} intensity={0.3} color="#44aaff" />
              <pointLight position={[0, 2, 0]} intensity={0.5} color="#00ff41" />
            </>
          )}

          {isSimMode && (
            <ambientLight intensity={0.45} />
          )}

          <Suspense fallback={null}>
            {activeMode === 'cone' && (
              <ConeDispersionMode
                impacts={enhancedImpacts3D}
                distanceM={distanceM}
                r90Cm={r90}
                ellipse={stats?.ellipse ?? null}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                pixelsPerCm={store.scale.pixelsPerCm}
                ballisticParams={ballisticParams}
                simResult={simResult}
              />
            )}

            {activeMode === 'heatmap' && (
              <HeatmapMode
                impacts={enhancedImpacts3D}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
              />
            )}

            {activeMode === 'energy' && (
              <EnergyHeatmapMode
                impacts={enhancedImpacts3D}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                ballisticParams={ballisticParams}
                simResult={simResult}
              />
            )}

            {activeMode === 'trajectories' && (
              <TrajectoriesMode
                impacts={enhancedImpacts3D}
                distanceM={distanceM}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                velocityMs={effectiveVelocity}
                ballisticParams={ballisticParams}
                simResult={simResult}
              />
            )}

            {activeMode === 'cloud' && (
              <DispersionCloudMode
                impacts={enhancedImpacts3D}
                distanceM={distanceM}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                velocityMs={effectiveVelocity}
                ballisticParams={ballisticParams}
                simResult={simResult}
              />
            )}

            {activeMode === 'penetration' && (
              <PenetrationMode
                impacts={enhancedImpacts3D}
                penetrationCm={effectivePenetration}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                ballisticParams={ballisticParams}
                simResult={simResult}
              />
            )}

            {activeMode === 'multiDistance' && (
              <MultiDistanceMode
                impacts={enhancedImpacts3D}
                distanceM={distanceM}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                ballisticParams={ballisticParams}
              />
            )}

            {isSimMode && (
              <RealisticSimulationMode
                impacts={enhancedImpacts3D}
                distanceM={distanceM}
                circle1RadiusCm={c1r}
                circle2RadiusCm={c2r}
                ballisticParams={ballisticParams}
                timeState={simTimeState}
                onTimeUpdate={handleTimeUpdate}
                onSimReady={handleSimReady}
              />
            )}
          </Suspense>
        </Canvas>

        {/* Color menu overlay (only in simulation mode) */}
        {isSimMode && <SimColorMenu />}

        {/* Timeline overlay (only in simulation mode) */}
        {isSimMode && (
          <TimelineControls
            timeState={simTimeState}
            denseSim={denseSim}
            ballisticParams={ballisticParams}
            distanceM={distanceM}
            onPlay={handlePlay}
            onPause={handlePause}
            onReset={handleReset}
            onTimeChange={handleTimeUpdate}
            onSpeedChange={handleSpeedChange}
          />
        )}
      </div>
    </div>
  );
}
