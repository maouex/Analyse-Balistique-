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
  currentTime: number;   // seconds
  playing: boolean;
  speed: number;         // multiplier (0.01 = 100× slow-mo, default)
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

// ─── Constants ──────────────────────────────────────────────

// Real-world scale: 1 unit = 1 meter
const GROUND_Y = 0;
const BARREL_HEIGHT = 1.2;   // shoulder height in meters
const PELLET_VISUAL_SCALE = 3; // make pellets 3× larger than real for visibility

// ─── Sub-components ────────────────────────────────────────

/** Ground plane with grass-like appearance */
function Ground({ distanceM }: { distanceM: number }) {
  const length = distanceM + 10;
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, GROUND_Y - 0.01, length / 2 - 3]}>
        <planeGeometry args={[20, length]} />
        <meshStandardMaterial color="#1a2614" side={THREE.DoubleSide} />
      </mesh>
      {/* Subtle grid on ground */}
      <gridHelper
        args={[length, Math.ceil(length), '#2a3a20', '#1e2e18']}
        position={[0, GROUND_Y, length / 2 - 3]}
      />
    </group>
  );
}

/** Distance markers every 5m along the range */
function DistanceMarkers({ distanceM }: { distanceM: number }) {
  const markers = useMemo(() => {
    const result: number[] = [];
    const step = distanceM <= 20 ? 2 : distanceM <= 50 ? 5 : 10;
    for (let d = step; d <= distanceM; d += step) {
      result.push(d);
    }
    return result;
  }, [distanceM]);

  return (
    <group>
      {markers.map(d => (
        <group key={d} position={[0, 0, d]}>
          {/* Vertical line marker */}
          <mesh position={[-3, 0.5, 0]}>
            <boxGeometry args={[0.03, 1, 0.03]} />
            <meshStandardMaterial color="#3a4a30" />
          </mesh>
          {/* Distance label */}
          <Text
            position={[-3.3, 0.8, 0]}
            fontSize={0.35}
            color="#7a9a60"
            anchorX="right"
            rotation={[0, Math.PI / 2, 0]}
          >
            {`${d}m`}
          </Text>
          {/* Ground line across range */}
          <mesh position={[0, GROUND_Y + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[8, 0.02]} />
            <meshBasicMaterial color="#3a4a30" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Scale ruler: real 1m reference bar */
function ScaleRuler() {
  return (
    <group position={[-4, GROUND_Y + 0.01, -1]}>
      {/* 1m bar */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.04, 1, 0.04]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      {/* End markers */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.04]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      <Text position={[-0.3, 0.5, 0]} fontSize={0.25} color="#ff6b6b" anchorX="right" rotation={[0, Math.PI / 2, 0]}>
        1m
      </Text>
    </group>
  );
}

/** Realistic shotgun barrel representation */
function Barrel({ barrelDiamMm }: { barrelDiamMm: number }) {
  const boreDiam = barrelDiamMm / 1000; // meters
  return (
    <group position={[0, BARREL_HEIGHT, 0]}>
      {/* Barrel tube */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.35]}>
        <cylinderGeometry args={[boreDiam * 0.8, boreDiam * 0.7, 0.7, 16]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.95} roughness={0.15} />
      </mesh>
      {/* Stock (simplified) */}
      <mesh position={[0, -0.05, -0.25]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.04, 0.12, 0.5]} />
        <meshStandardMaterial color="#4a3520" roughness={0.8} />
      </mesh>
      {/* Muzzle ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.7]}>
        <torusGeometry args={[boreDiam * 0.8, 0.003, 8, 16]} />
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Muzzle flash zone indicator */}
      <Text position={[0, 0.35, 0.4]} fontSize={0.15} color="#ff6b6b" anchorX="center">
        Canon
      </Text>
    </group>
  );
}

/** Target board at distance */
function TargetBoard({ distanceM, circle1RadiusCm, circle2RadiusCm }: {
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
}) {
  const r1 = circle1RadiusCm / 100; // meters
  const r2 = circle2RadiusCm / 100;
  const boardSize = Math.max(r2 * 3, 1.5);

  return (
    <group position={[0, BARREL_HEIGHT, distanceM]}>
      {/* Board */}
      <mesh>
        <planeGeometry args={[boardSize, boardSize]} />
        <meshStandardMaterial color="#f5f0e0" side={THREE.DoubleSide} />
      </mesh>
      {/* Circle 1 */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[r1 - 0.005, r1, 64]} />
        <meshBasicMaterial color="#2ecc71" side={THREE.DoubleSide} />
      </mesh>
      {/* Circle 2 */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[r2 - 0.005, r2, 64]} />
        <meshBasicMaterial color="#f59f00" side={THREE.DoubleSide} />
      </mesh>
      {/* Center cross */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[0.01, r1 * 0.6]} />
        <meshBasicMaterial color="#e05252" />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[r1 * 0.6, 0.01]} />
        <meshBasicMaterial color="#e05252" />
      </mesh>
      {/* Post */}
      <mesh position={[0, -boardSize / 2 - 0.3, 0]}>
        <boxGeometry args={[0.08, boardSize / 2 + BARREL_HEIGHT - 0.3, 0.08]} />
        <meshStandardMaterial color="#5a4a3a" roughness={0.9} />
      </mesh>
      {/* Distance label */}
      <Text position={[boardSize / 2 + 0.2, boardSize / 2 - 0.1, 0]} fontSize={0.2} color="#666" anchorX="left">
        {`${distanceM}m`}
      </Text>
    </group>
  );
}

/** Muzzle flash effect at t=0 */
function MuzzleFlash({ visible }: { visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.3;
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, BARREL_HEIGHT, 0.75]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff6600"
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
      <pointLight color="#ff8800" intensity={3} distance={5} />
    </group>
  );
}

/** Wad / sabot that separates from pellets */
function Wad({ simTime, distanceM }: { simTime: number; distanceM: number }) {
  // Wad separates ~2m from barrel, decelerates quickly due to large drag
  const wadZ = useMemo(() => {
    // Wad travels about 2-5m then falls away
    const maxWadDist = Math.min(5, distanceM * 0.15);
    if (simTime <= 0) return 0.7;
    // Wad speed: starts at muzzle velocity, decelerates fast
    const wadT = Math.min(simTime * 300, maxWadDist); // very rough
    return 0.7 + wadT;
  }, [simTime, distanceM]);

  const wadDrop = simTime * simTime * 9.81 * 0.5; // gravity
  const visible = simTime > 0 && simTime < 0.02 && wadZ < 6;

  if (!visible) return null;

  return (
    <mesh position={[0, BARREL_HEIGHT - wadDrop, wadZ]}>
      <cylinderGeometry args={[0.009, 0.012, 0.025, 8]} />
      <meshStandardMaterial color="#cc3333" roughness={0.8} />
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

  // Pellet visual radius (exaggerated for visibility but proportional)
  const pelletR = Math.max(0.003, (pelletDiamMm / 2000) * PELLET_VISUAL_SCALE);

  const sphereGeom = useMemo(() => new THREE.SphereGeometry(pelletR, 12, 12), [pelletR]);
  const trailGeom = useMemo(() => new THREE.SphereGeometry(pelletR * 0.5, 6, 6), [pelletR]);
  const pelletMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#aaaaaa', metalness: 0.92, roughness: 0.08,
  }), []);
  const trailMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#666', transparent: true, opacity: 0.2,
  }), []);

  const _obj = useMemo(() => new THREE.Object3D(), []);
  const _color = useMemo(() => new THREE.Color(), []);

  // Set zone colors once
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    // We'll update colors per-frame based on velocity
  }, []);

  // Interpolate pellet position at currentTime from dense trajectory
  const interpolate = useCallback((pellet: DensePelletResult, t: number) => {
    const pts = pellet.points;
    if (t <= 0 || pts.length === 0) return null;
    if (t >= pellet.flightTime) return pts[pts.length - 1];

    // Binary search for the right segment
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

  // Update instances every frame
  useFrame(() => {
    const mesh = meshRef.current;
    const trail = trailMeshRef.current;
    if (!mesh) return;

    for (let i = 0; i < count; i++) {
      const pellet = denseSim.pellets[i];
      const pos = interpolate(pellet, currentTime);

      if (!pos || currentTime <= 0) {
        // Hide: place far away
        _obj.position.set(0, -100, 0);
        _obj.scale.setScalar(0.001);
        _obj.updateMatrix();
        mesh.setMatrixAt(i, _obj.matrix);
        if (trail) trail.setMatrixAt(i, _obj.matrix);
        continue;
      }

      // Real-world coordinates: Z = downrange, X = lateral, Y = vertical
      _obj.position.set(pos.x, BARREL_HEIGHT + pos.y, pos.z);
      _obj.scale.setScalar(1);
      _obj.updateMatrix();
      mesh.setMatrixAt(i, _obj.matrix);

      // Velocity-based color
      const vRatio = Math.min(1, pos.speed / muzzleVelocity);
      const r = Math.min(1, vRatio * 2);
      const g = 0.1;
      const b = Math.min(1, (1 - vRatio) * 2);
      _color.setRGB(r, g, b);
      mesh.setColorAt(i, _color);

      // Trail: slightly behind
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

/** Real-time spread circle visualization */
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

    // Compute current spread radius and mean Z position
    let maxLateral = 0;
    let meanZ = 0;
    let meanY = 0;
    let activeCount = 0;

    for (const pellet of denseSim.pellets) {
      if (currentTime > pellet.flightTime) continue;
      const pts = pellet.points;
      // Find approx position
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

    if (activeCount === 0) {
      ringRef.current.visible = false;
      return;
    }

    meanZ /= activeCount;
    meanY /= activeCount;

    ringRef.current.visible = true;
    ringRef.current.position.set(0, BARREL_HEIGHT + meanY, meanZ);

    // Scale ring to spread radius
    const spreadR = Math.max(0.01, maxLateral);
    ringRef.current.scale.set(spreadR * 2, spreadR * 2, 1);
  });

  return (
    <mesh ref={ringRef} visible={false}>
      <ringGeometry args={[0.48, 0.5, 48]} />
      <meshBasicMaterial color="#4dabf7" transparent opacity={0.25} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Impact markers on target (appear when pellets arrive) */
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
        const x = imp.x / 100; // cm → m
        const y = imp.y / 100;

        return (
          <mesh key={imp.index} position={[x, -y, 0]}>
            <circleGeometry args={[0.008, 12]} />
            <meshStandardMaterial
              color="#222"
              emissive={color}
              emissiveIntensity={0.5}
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
  // Default ballistic params if none provided
  const params: BallisticParams = ballisticParams ?? {
    muzzleVelocity: 400,
    dragCoefficient: 0.47,
    pelletDiameterMm: 3.0,
    pelletMassGrams: 0,
    barrelDiameterMm: 18.5,
  };

  // Run dense simulation
  const denseSim = useMemo(() => {
    const positions = impacts.map(imp => ({ x: imp.x, y: imp.y }));
    const result = simulateSpreadDense(params, distanceM, positions, 0.0005);
    return result;
  }, [impacts, distanceM, params.muzzleVelocity, params.dragCoefficient, params.pelletDiameterMm, params.pelletMassGrams, params.barrelDiameterMm]);

  // Notify parent of sim ready
  useEffect(() => {
    onSimReady(denseSim);
  }, [denseSim, onSimReady]);

  // Auto-advance time when playing
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

  const pelletDiam = params.pelletDiameterMm;

  return (
    <group>
      {/* Environment */}
      <Ground distanceM={distanceM} />
      <DistanceMarkers distanceM={distanceM} />
      <ScaleRuler />

      {/* Sky color (fog) */}
      <fog attach="fog" args={['#0a0c12', distanceM * 0.8, distanceM * 2.5]} />

      {/* Barrel */}
      <Barrel barrelDiamMm={params.barrelDiameterMm} />

      {/* Muzzle flash */}
      <MuzzleFlash visible={showFlash} />

      {/* Wad */}
      <Wad simTime={currentTime} distanceM={distanceM} />

      {/* Target */}
      <TargetBoard
        distanceM={distanceM}
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
      />

      {/* Pellet cloud */}
      <PelletCloud
        denseSim={denseSim}
        currentTime={currentTime}
        pelletDiamMm={pelletDiam}
        muzzleVelocity={params.muzzleVelocity}
      />

      {/* Spread indicator ring */}
      <SpreadIndicator denseSim={denseSim} currentTime={currentTime} />

      {/* Impact marks on target */}
      <ImpactMarkers
        impacts={impacts}
        denseSim={denseSim}
        currentTime={currentTime}
        distanceM={distanceM}
      />

      {/* Bore axis line (laser-like reference) */}
      <mesh position={[0, BARREL_HEIGHT, distanceM / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.001, 0.001, distanceM, 4]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.08} />
      </mesh>

      {/* 3D text annotations */}
      <Text
        position={[-3, BARREL_HEIGHT + 1, distanceM / 2]}
        fontSize={0.4}
        color="#4dabf7"
        anchorX="right"
        rotation={[0, Math.PI / 2, 0]}
      >
        {currentTime > 0 ? `t = ${(currentTime * 1000).toFixed(1)} ms` : 'Prêt'}
      </Text>

      {/* Lighting for realism */}
      <directionalLight position={[10, 20, 10]} intensity={0.6} castShadow />
      <directionalLight position={[-5, 15, distanceM / 2]} intensity={0.3} color="#87ceeb" />
      <hemisphereLight args={['#87ceeb', '#1a2614', 0.3]} />
    </group>
  );
}
