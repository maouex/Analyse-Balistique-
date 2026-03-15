import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import type { BallisticParams, DenseSimulationResult, DensePelletResult } from '../../lib/ballistics-sim';
import { simulateSpreadDense } from '../../lib/ballistics-sim';

// ─── Types ──────────────────────────────────────────────────

export interface SimulationTimeState {
  currentTime: number;
  playing: boolean;
  speed: number;
}

interface RealisticSimulationModeProps {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  ballisticParams: BallisticParams | null;
  timeState: SimulationTimeState;
  onTimeUpdate: (t: number) => void;
  onSimReady: (sim: DenseSimulationResult) => void;
}

// ─── Color palette ──────────────────────────────────────────
// Clean, high-contrast palette on dark blue-grey background
const COL = {
  // Background / environment
  sky:          '#141820',   // fond principal — bleu-gris très foncé
  fog:          '#141820',
  ground:       '#1c1f2a',   // sol — gris ardoise foncé
  gridMajor:    '#2a2e3c',   // grille principale
  gridMinor:    '#21242f',   // grille secondaire

  // Structure / markers
  markerPost:   '#3d4255',   // piquets de distance — gris moyen
  markerText:   '#8892aa',   // textes distance — gris clair bleuté
  markerLine:   '#2d3142',   // lignes au sol

  // Scale ruler
  ruler:        '#e8e8e8',   // blanc cassé — très visible
  rulerText:    '#e8e8e8',

  // Barrel / weapon
  barrelMetal:  '#3a3d45',   // acier foncé
  barrelRing:   '#555860',   // anneau de bouche
  stock:        '#5c4433',   // bois noyer
  barrelLabel:  '#d0d4e0',   // label "Canon" — blanc doux

  // Target
  board:        '#e8e4d8',   // carton beige clair
  targetPost:   '#4a4030',   // poteau bois
  targetLabel:  '#90949e',   // label distance
  crosshair:    '#222',      // centre de cible
  circle1:      '#34d399',   // cercle 1 — vert émeraude
  circle2:      '#fbbf24',   // cercle 2 — jaune ambre

  // Muzzle flash
  flashColor:   '#ffc940',   // jaune chaud
  flashEmit:    '#ff8c00',   // orange vif
  flashLight:   '#ffaa33',

  // Wad
  wad:          '#d94040',   // rouge plastique

  // Pellets
  pelletBase:   '#e8ecf4',   // blanc argenté — très lumineux
  pelletEmit:   '#ff9944',   // lueur chaude pour visibilité
  pelletTrail:  '#667080',   // gris translucide (opacité basse)

  // Velocity gradient (pellets) — orange chaud → blanc → bleu glacier
  // Computed dynamically, see velColor()

  // Spread ring
  spreadRing:   '#60a5fa',   // bleu ciel — visible mais pas agressif

  // Impact marks
  impactBase:   '#1a1a1a',

  // Bore axis
  boreAxis:     '#ef4444',   // rouge net

  // Time annotation
  timeText:     '#e2e8f0',   // blanc légèrement bleuté

  // Lighting
  lightSky:     '#94b8db',   // bleu doux pour la lumière du ciel
  lightGround:  '#1c1f2a',   // même que le sol
};

/** Velocity ratio → color: orange(fast) → white(mid) → bleu(slow) */
function velColor(vRatio: number): [number, number, number] {
  // vRatio 1.0 = muzzle speed, 0.0 = stopped
  if (vRatio > 0.6) {
    // Orange → white
    const t = (vRatio - 0.6) / 0.4;
    return [1.0, 0.55 + t * 0.45, 0.2 + t * 0.8]; // orange → white
  }
  // White → blue
  const t = vRatio / 0.6;
  return [0.3 + t * 0.7, 0.5 + t * 0.5, 1.0]; // blue → white
}

// ─── Constants ──────────────────────────────────────────────

const GROUND_Y = 0;
const BARREL_HEIGHT = 1.2;
const PELLET_VISUAL_SCALE = 3;

// ─── Sub-components ────────────────────────────────────────

function Ground({ distanceM }: { distanceM: number }) {
  const length = distanceM + 10;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y - 0.01, length / 2 - 3]}>
        <planeGeometry args={[20, length]} />
        <meshStandardMaterial color={COL.ground} side={THREE.DoubleSide} />
      </mesh>
      <gridHelper
        args={[length, Math.ceil(length), COL.gridMajor, COL.gridMinor]}
        position={[0, GROUND_Y, length / 2 - 3]}
      />
    </group>
  );
}

function DistanceMarkers({ distanceM }: { distanceM: number }) {
  const markers = useMemo(() => {
    const result: number[] = [];
    const step = distanceM <= 20 ? 2 : distanceM <= 50 ? 5 : 10;
    for (let d = step; d <= distanceM; d += step) result.push(d);
    return result;
  }, [distanceM]);

  return (
    <group>
      {markers.map(d => (
        <group key={d} position={[0, 0, d]}>
          <mesh position={[-3, 0.5, 0]}>
            <boxGeometry args={[0.03, 1, 0.03]} />
            <meshStandardMaterial color={COL.markerPost} />
          </mesh>
          <Text
            position={[-3.3, 0.8, 0]}
            fontSize={0.35}
            color={COL.markerText}
            anchorX="right"
            rotation={[0, Math.PI / 2, 0]}
          >
            {`${d}m`}
          </Text>
          <mesh position={[0, GROUND_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 0.02]} />
            <meshBasicMaterial color={COL.markerLine} transparent opacity={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ScaleRuler() {
  return (
    <group position={[-4, GROUND_Y + 0.01, -1]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.04, 1, 0.04]} />
        <meshStandardMaterial color={COL.ruler} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color={COL.ruler} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color={COL.ruler} />
      </mesh>
      <Text position={[-0.3, 0.5, 0]} fontSize={0.25} color={COL.rulerText} anchorX="right" rotation={[0, Math.PI / 2, 0]}>
        1m
      </Text>
    </group>
  );
}

function Barrel({ barrelDiamMm }: { barrelDiamMm: number }) {
  const boreDiam = barrelDiamMm / 1000;
  return (
    <group position={[0, BARREL_HEIGHT, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.35]}>
        <cylinderGeometry args={[boreDiam * 0.8, boreDiam * 0.7, 0.7, 16]} />
        <meshStandardMaterial color={COL.barrelMetal} metalness={0.95} roughness={0.15} />
      </mesh>
      <mesh position={[0, -0.05, -0.25]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.04, 0.12, 0.5]} />
        <meshStandardMaterial color={COL.stock} roughness={0.8} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.7]}>
        <torusGeometry args={[boreDiam * 0.8, 0.003, 8, 16]} />
        <meshStandardMaterial color={COL.barrelRing} metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0, 0.35, 0.4]} fontSize={0.15} color={COL.barrelLabel} anchorX="center">
        Canon
      </Text>
    </group>
  );
}

function TargetBoard({ distanceM, circle1RadiusCm, circle2RadiusCm }: {
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
}) {
  const r1 = circle1RadiusCm / 100;
  const r2 = circle2RadiusCm / 100;
  const boardSize = Math.max(r2 * 3, 1.5);

  return (
    <group position={[0, BARREL_HEIGHT, distanceM]}>
      <mesh>
        <planeGeometry args={[boardSize, boardSize]} />
        <meshStandardMaterial color={COL.board} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[r1 - 0.005, r1, 64]} />
        <meshBasicMaterial color={COL.circle1} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[r2 - 0.005, r2, 64]} />
        <meshBasicMaterial color={COL.circle2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[0.01, r1 * 0.6]} />
        <meshBasicMaterial color={COL.crosshair} />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[r1 * 0.6, 0.01]} />
        <meshBasicMaterial color={COL.crosshair} />
      </mesh>
      <mesh position={[0, -boardSize / 2 - 0.3, 0]}>
        <boxGeometry args={[0.08, boardSize / 2 + BARREL_HEIGHT - 0.3, 0.08]} />
        <meshStandardMaterial color={COL.targetPost} roughness={0.9} />
      </mesh>
      <Text position={[boardSize / 2 + 0.2, boardSize / 2 - 0.1, 0]} fontSize={0.2} color={COL.targetLabel} anchorX="left">
        {`${distanceM}m`}
      </Text>
    </group>
  );
}

function MuzzleFlash({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(() => { if (meshRef.current) meshRef.current.rotation.z += 0.3; });
  if (!visible) return null;

  return (
    <group position={[0, BARREL_HEIGHT, 0.75]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color={COL.flashColor}
          emissive={COL.flashEmit}
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      <pointLight color={COL.flashLight} intensity={3} distance={5} />
    </group>
  );
}

function Wad({ simTime, distanceM }: { simTime: number; distanceM: number }) {
  const wadZ = useMemo(() => {
    const maxWadDist = Math.min(5, distanceM * 0.15);
    if (simTime <= 0) return 0.7;
    const wadT = Math.min(simTime * 300, maxWadDist);
    return 0.7 + wadT;
  }, [simTime, distanceM]);

  const wadDrop = simTime * simTime * 9.81 * 0.5;
  const visible = simTime > 0 && simTime < 0.02 && wadZ < 6;
  if (!visible) return null;

  return (
    <mesh position={[0, BARREL_HEIGHT - wadDrop, wadZ]}>
      <cylinderGeometry args={[0.009, 0.012, 0.025, 8]} />
      <meshStandardMaterial color={COL.wad} roughness={0.8} />
    </mesh>
  );
}

// ─── Instanced pellet cloud ─────────────────────────────────

function PelletCloud({ denseSim, currentTime, pelletDiamMm, muzzleVelocity }: {
  denseSim: DenseSimulationResult;
  currentTime: number;
  pelletDiamMm: number;
  muzzleVelocity: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const trailMeshRef = useRef<THREE.InstancedMesh>(null);
  const count = denseSim.pellets.length;

  const pelletR = Math.max(0.003, (pelletDiamMm / 2000) * PELLET_VISUAL_SCALE);

  const sphereGeom = useMemo(() => new THREE.SphereGeometry(pelletR, 12, 12), [pelletR]);
  const trailGeom = useMemo(() => new THREE.SphereGeometry(pelletR * 0.5, 6, 6), [pelletR]);
  const pelletMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: COL.pelletBase,
    metalness: 0.4,
    roughness: 0.3,
    emissive: new THREE.Color(COL.pelletEmit),
    emissiveIntensity: 0.35,
  }), []);
  const trailMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#99aabb', transparent: true, opacity: 0.35,
    emissive: new THREE.Color('#667899'), emissiveIntensity: 0.2,
  }), []);

  const _obj = useMemo(() => new THREE.Object3D(), []);
  const _color = useMemo(() => new THREE.Color(), []);

  const interpolate = useCallback((pellet: DensePelletResult, t: number) => {
    const pts = pellet.points;
    if (t <= 0 || pts.length === 0) return null;
    if (t >= pellet.flightTime) return pts[pts.length - 1];

    let lo = 0, hi = pts.length - 1;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].t <= t) lo = mid; else hi = mid;
    }

    const p0 = pts[lo];
    const p1 = pts[hi];
    const dt = p1.t - p0.t;
    if (dt <= 0) return p0;
    const frac = (t - p0.t) / dt;

    return {
      x: p0.x + (p1.x - p0.x) * frac,
      y: p0.y + (p1.y - p0.y) * frac,
      z: p0.z + (p1.z - p0.z) * frac,
      speed: p0.speed + (p1.speed - p0.speed) * frac,
    };
  }, []);

  useFrame(() => {
    const mesh = meshRef.current;
    const trail = trailMeshRef.current;
    if (!mesh) return;

    for (let i = 0; i < count; i++) {
      const pellet = denseSim.pellets[i];
      const pos = interpolate(pellet, currentTime);

      if (!pos || currentTime <= 0) {
        _obj.position.set(0, -100, 0);
        _obj.scale.setScalar(0.001);
        _obj.updateMatrix();
        mesh.setMatrixAt(i, _obj.matrix);
        if (trail) trail.setMatrixAt(i, _obj.matrix);
        continue;
      }

      _obj.position.set(pos.x, BARREL_HEIGHT + pos.y, pos.z);
      _obj.scale.setScalar(1);
      _obj.updateMatrix();
      mesh.setMatrixAt(i, _obj.matrix);

      // Velocity gradient: orange → white → blue
      const vRatio = Math.min(1, pos.speed / muzzleVelocity);
      const [r, g, b] = velColor(vRatio);
      _color.setRGB(r, g, b);
      mesh.setColorAt(i, _color);

      if (trail) {
        const trailPos = interpolate(pellet, Math.max(0, currentTime - 0.001));
        if (trailPos) {
          _obj.position.set(trailPos.x, BARREL_HEIGHT + trailPos.y, trailPos.z);
          _obj.scale.setScalar(1);
          _obj.updateMatrix();
          trail.setMatrixAt(i, _obj.matrix);
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (trail) trail.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={meshRef} args={[sphereGeom, pelletMat, count]} frustumCulled={false} />
      <instancedMesh ref={trailMeshRef} args={[trailGeom, trailMat, count]} frustumCulled={false} />
    </>
  );
}

function SpreadIndicator({ denseSim, currentTime }: {
  denseSim: DenseSimulationResult;
  currentTime: number;
}) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ringRef.current || currentTime <= 0) {
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }

    let maxLateral = 0;
    let meanZ = 0;
    let meanY = 0;
    let activeCount = 0;

    for (const pellet of denseSim.pellets) {
      if (currentTime > pellet.flightTime) continue;
      const pts = pellet.points;
      let pos = pts[0];
      for (let j = 0; j < pts.length - 1; j++) {
        if (pts[j + 1].t >= currentTime) {
          const frac = (currentTime - pts[j].t) / (pts[j + 1].t - pts[j].t);
          pos = {
            ...pts[j],
            x: pts[j].x + (pts[j + 1].x - pts[j].x) * frac,
            y: pts[j].y + (pts[j + 1].y - pts[j].y) * frac,
            z: pts[j].z + (pts[j + 1].z - pts[j].z) * frac,
          };
          break;
        }
      }
      const lateral = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
      if (lateral > maxLateral) maxLateral = lateral;
      meanZ += pos.z;
      meanY += pos.y;
      activeCount++;
    }

    if (activeCount === 0) { ringRef.current.visible = false; return; }

    meanZ /= activeCount;
    meanY /= activeCount;
    ringRef.current.visible = true;
    ringRef.current.position.set(0, BARREL_HEIGHT + meanY, meanZ);
    const spreadR = Math.max(0.01, maxLateral);
    ringRef.current.scale.set(spreadR * 2, spreadR * 2, 1);
  });

  return (
    <mesh ref={ringRef} visible={false}>
      <ringGeometry args={[0.48, 0.5, 48]} />
      <meshBasicMaterial color={COL.spreadRing} transparent opacity={0.3} side={THREE.DoubleSide} />
    </mesh>
  );
}

function ImpactMarkers({ impacts, denseSim, currentTime, distanceM }: {
  impacts: Impact3D[];
  denseSim: DenseSimulationResult;
  currentTime: number;
  distanceM: number;
}) {
  return (
    <group position={[0, BARREL_HEIGHT, distanceM + 0.005]}>
      {impacts.map((imp, i) => {
        const pellet = denseSim.pellets[i];
        if (!pellet || currentTime < pellet.flightTime) return null;

        const color = getZoneColor(imp.zone);
        const x = imp.x / 100;
        const y = imp.y / 100;

        return (
          <mesh key={imp.index} position={[x, -y, 0]}>
            <circleGeometry args={[0.008, 12]} />
            <meshStandardMaterial
              color={COL.impactBase}
              emissive={color}
              emissiveIntensity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Main component ─────────────────────────────────────────

export function RealisticSimulationMode({
  impacts,
  distanceM,
  circle1RadiusCm,
  circle2RadiusCm,
  ballisticParams,
  timeState,
  onTimeUpdate,
  onSimReady,
}: RealisticSimulationModeProps) {
  const params: BallisticParams = ballisticParams ?? {
    muzzleVelocity: 400,
    dragCoefficient: 0.47,
    pelletDiameterMm: 3.0,
    pelletMassGrams: 0,
    barrelDiameterMm: 18.5,
  };

  const denseSim = useMemo(() => {
    const positions = impacts.map(imp => ({ x: imp.x, y: imp.y }));
    return simulateSpreadDense(params, distanceM, positions, 0.0005);
  }, [impacts, distanceM, params.muzzleVelocity, params.dragCoefficient, params.pelletDiameterMm, params.pelletMassGrams, params.barrelDiameterMm]);

  useEffect(() => { onSimReady(denseSim); }, [denseSim, onSimReady]);

  useFrame((_, delta) => {
    if (timeState.playing && timeState.currentTime < denseSim.maxFlightTime * 1.2) {
      onTimeUpdate(Math.min(
        timeState.currentTime + delta * timeState.speed,
        denseSim.maxFlightTime * 1.2
      ));
    }
  });

  const currentTime = timeState.currentTime;
  const showFlash = currentTime > 0 && currentTime < 0.003;

  return (
    <group>
      {/* Environment */}
      <Ground distanceM={distanceM} />
      <DistanceMarkers distanceM={distanceM} />
      <ScaleRuler />

      {/* Fog matching background */}
      <fog attach="fog" args={[COL.fog, distanceM * 0.8, distanceM * 2.5]} />

      <Barrel barrelDiamMm={params.barrelDiameterMm} />
      <MuzzleFlash visible={showFlash} />
      <Wad simTime={currentTime} distanceM={distanceM} />

      <TargetBoard
        distanceM={distanceM}
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
      />

      <PelletCloud
        denseSim={denseSim}
        currentTime={currentTime}
        pelletDiamMm={params.pelletDiameterMm}
        muzzleVelocity={params.muzzleVelocity}
      />

      <SpreadIndicator denseSim={denseSim} currentTime={currentTime} />

      <ImpactMarkers
        impacts={impacts}
        denseSim={denseSim}
        currentTime={currentTime}
        distanceM={distanceM}
      />

      {/* Bore axis — fine, low opacity */}
      <mesh position={[0, BARREL_HEIGHT, distanceM / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.001, 0.001, distanceM, 4]} />
        <meshBasicMaterial color={COL.boreAxis} transparent opacity={0.06} />
      </mesh>

      {/* Time annotation */}
      <Text
        position={[-3, BARREL_HEIGHT + 1, distanceM / 2]}
        fontSize={0.4}
        color={COL.timeText}
        anchorX="right"
        rotation={[0, Math.PI / 2, 0]}
      >
        {currentTime > 0 ? `t = ${(currentTime * 1000).toFixed(1)} ms` : 'Prêt'}
      </Text>

      {/* Lighting — neutral, balanced */}
      <directionalLight position={[10, 20, 10]} intensity={0.7} castShadow />
      <directionalLight position={[-5, 15, distanceM / 2]} intensity={0.25} color={COL.lightSky} />
      <hemisphereLight args={[COL.lightSky, COL.lightGround, 0.35]} />
    </group>
  );
}
