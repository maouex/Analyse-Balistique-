import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import type { BallisticParams, SimulationResult } from '../../lib/ballistics-sim';

interface DispersionCloudModeProps {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  velocityMs: number;
  ballisticParams?: BallisticParams | null;
  simResult?: SimulationResult | null;
}

const SCALE = 0.01;
const CYCLE_DURATION = 6; // seconds for full cycle

function CloudPellet({ impact, distanceM, index, pelletDiamMm }: {
  impact: Impact3D;
  distanceM: number;
  index: number;
  pelletDiamMm: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailMeshRef = useRef<THREE.Mesh>(null);

  const targetPos = useMemo(
    () => new THREE.Vector3(impact.x * SCALE, 0.01, -impact.y * SCALE),
    [impact]
  );

  // Pellet visual radius based on actual diameter
  const pelletRadius = Math.max(0.004, (pelletDiamMm / 2) * SCALE * 0.6);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;

    // Global animation progress (0→1 repeating)
    const elapsed = clock.getElapsedTime();
    const t = ((elapsed + index * 0.02) % CYCLE_DURATION) / CYCLE_DURATION;

    // Position: from barrel (y = distanceM) to target (y = 0)
    const y = (1 - t) * distanceM * SCALE;

    // Lateral spread increases with distance from barrel
    const spreadFactor = t; // 0 at barrel, 1 at target
    const x = targetPos.x * spreadFactor;
    const z = targetPos.z * spreadFactor;

    // Add slight arc for gravity
    const gravDrop = t * t * distanceM * SCALE * 0.01;

    meshRef.current.position.set(x, y - gravDrop, z);

    // Scale: slightly smaller when far, bigger when close
    const s = 0.7 + t * 0.3;
    meshRef.current.scale.setScalar(s);

    // Trail sphere (at slightly earlier position)
    if (trailMeshRef.current) {
      const tTrail = Math.max(0, t - 0.03);
      const yTrail = (1 - tTrail) * distanceM * SCALE;
      const spreadTrail = tTrail;
      trailMeshRef.current.position.set(
        targetPos.x * spreadTrail,
        yTrail - tTrail * tTrail * distanceM * SCALE * 0.01,
        targetPos.z * spreadTrail
      );
    }
  });

  const color = getZoneColor(impact.zone);

  return (
    <group>
      {/* Trail ghost */}
      <mesh ref={trailMeshRef}>
        <sphereGeometry args={[pelletRadius * 0.6, 6, 6]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Main pellet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[pelletRadius, 10, 10]} />
        <meshStandardMaterial
          color="#c0c0c0"
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.85}
          roughness={0.15}
        />
      </mesh>
    </group>
  );
}

// Animated cross-section ring showing spread at current distance
function SpreadRing({ impacts, distanceM }: {
  impacts: Impact3D[];
  distanceM: number;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = (clock.getElapsedTime() % CYCLE_DURATION) / CYCLE_DURATION;
    const y = (1 - t) * distanceM * SCALE;

    // Compute spread radius at this distance fraction
    const maxR = Math.max(...impacts.map(imp =>
      Math.sqrt(imp.x * imp.x + imp.y * imp.y)
    ));
    const currentR = maxR * t * SCALE;

    ringRef.current.position.y = y;
    ringRef.current.scale.set(
      Math.max(0.001, currentR / 0.5),
      1,
      Math.max(0.001, currentR / 0.5)
    );

    if (textRef.current) {
      textRef.current.position.y = y;
      textRef.current.position.x = Math.max(0.1, currentR) + 0.04;
    }
  });

  return (
    <group>
      <group ref={ringRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.5, 64]} />
          <meshBasicMaterial color="#4dabf7" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

// Distance markers along the flight path
function DistanceMarkers({ distanceM }: { distanceM: number }) {
  const markers = useMemo(() => {
    const result: { y: number; label: string }[] = [];
    const step = distanceM <= 20 ? 5 : 10;
    for (let d = step; d < distanceM; d += step) {
      result.push({
        y: (1 - d / distanceM) * distanceM * SCALE,
        label: `${d}m`,
      });
    }
    return result;
  }, [distanceM]);

  return (
    <group>
      {markers.map((m) => (
        <group key={m.label}>
          {/* Dashed ring at this distance */}
          <mesh position={[0, m.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.002, 0.004, 32]} />
            <meshBasicMaterial color="#3a3f55" transparent opacity={0.6} />
          </mesh>
          <Text
            position={[-0.08, m.y, 0]}
            fontSize={0.025}
            color="#5c6378"
            anchorX="right"
          >
            {m.label}
          </Text>
        </group>
      ))}
    </group>
  );
}

export function DispersionCloudMode({
  impacts,
  distanceM,
  circle1RadiusCm,
  circle2RadiusCm,
  ballisticParams,
  simResult,
}: DispersionCloudModeProps) {
  const pelletDiam = ballisticParams?.pelletDiameterMm ?? 3.0;
  const enhanced = !!ballisticParams && !!simResult;

  return (
    <group>
      <TargetPlane
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
        scale={SCALE}
      />

      {/* Barrel point */}
      <mesh position={[0, distanceM * SCALE, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.04, 12]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text
        position={[0.06, distanceM * SCALE, 0]}
        fontSize={0.04}
        color="#ff6b6b"
        anchorX="left"
      >
        {`Canon (${distanceM}m)`}
      </Text>

      {enhanced && (
        <Text
          position={[0.06, distanceM * SCALE - 0.06, 0]}
          fontSize={0.022}
          color="#c084fc"
          anchorX="left"
        >
          {`∅${pelletDiam}mm | V₀=${ballisticParams!.muzzleVelocity}m/s`}
        </Text>
      )}

      {/* Distance markers */}
      <DistanceMarkers distanceM={distanceM} />

      {/* Animated spread ring */}
      <SpreadRing impacts={impacts} distanceM={distanceM} />

      {/* Central axis */}
      <mesh position={[0, distanceM * SCALE / 2, 0]}>
        <cylinderGeometry args={[0.001, 0.001, distanceM * SCALE, 4]} />
        <meshBasicMaterial color="#2b2f3d" transparent opacity={0.3} />
      </mesh>

      {/* Cloud of pellets */}
      {impacts.map((imp) => (
        <CloudPellet
          key={imp.index}
          impact={imp}
          distanceM={distanceM}
          index={imp.index}
          pelletDiamMm={pelletDiam}
        />
      ))}

      {/* Target impact markers (static, always visible) */}
      {impacts.map((imp) => (
        <mesh
          key={`target-${imp.index}`}
          position={[imp.x * SCALE, 0.005, -imp.y * SCALE]}
        >
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial
            color={getZoneColor(imp.zone)}
            emissive={getZoneColor(imp.zone)}
            emissiveIntensity={0.3}
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      {/* Info */}
      <Text
        position={[-circle2RadiusCm * SCALE * 1.2, 0.02, circle2RadiusCm * SCALE * 0.8]}
        fontSize={0.025}
        color="#a0a4b8"
        anchorX="left"
      >
        {`${impacts.length} plombs | Dispersion progressive`}
      </Text>
    </group>
  );
}
