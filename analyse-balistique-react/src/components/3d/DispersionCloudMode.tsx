import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import { InstancedPellets } from './InstancedPellets';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import type { BallisticParams, SimulationResult } from '../../lib/ballistics-sim';
import { WORLD_SCALE } from './constants';

interface DispersionCloudModeProps {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  velocityMs: number;
  ballisticParams?: BallisticParams | null;
  simResult?: SimulationResult | null;
}

const CYCLE_DURATION = 6;

/**
 * Batched cloud animation: single useFrame updates ALL pellet positions
 * via InstancedMesh matrix manipulation. N useFrame calls → 1.
 */
export function DispersionCloudMode({
  impacts,
  distanceM,
  circle1RadiusCm,
  circle2RadiusCm,
  ballisticParams,
  simResult,
}: DispersionCloudModeProps) {
  const pelletDiam = ballisticParams?.pelletDiameterMm ?? 3.0;
  const pelletRadius = Math.max(0.004, (pelletDiam / 2) * WORLD_SCALE * 0.6);
  const enhanced = !!ballisticParams && !!simResult;

  const cloudMeshRef = useRef<THREE.InstancedMesh>(null);
  const trailMeshRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  const count = impacts.length;

  // Pre-compute target positions (stable)
  const targetPositions = useMemo(
    () => impacts.map(imp => [imp.x * WORLD_SCALE, -imp.y * WORLD_SCALE] as [number, number]),
    [impacts]
  );

  // Max radius (memoized — not recalculated every frame)
  const maxR = useMemo(
    () => Math.max(1, ...impacts.map(imp => Math.sqrt(imp.x * imp.x + imp.y * imp.y))),
    [impacts]
  );

  // Shared geometry & material
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(pelletRadius, 10, 10), [pelletRadius]);
  const trailGeom = useMemo(() => new THREE.SphereGeometry(pelletRadius * 0.6, 6, 6), [pelletRadius]);
  const cloudMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c0c0c0', metalness: 0.85, roughness: 0.15, emissiveIntensity: 0.2,
  }), []);
  const trailMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#888', transparent: true, opacity: 0.15,
  }), []);

  const _obj = useMemo(() => new THREE.Object3D(), []);
  const _color = useMemo(() => new THREE.Color(), []);

  // Set initial instance colors
  useEffect(() => {
    const cloud = cloudMeshRef.current;
    if (!cloud) return;
    for (let i = 0; i < count; i++) {
      _color.set(getZoneColor(impacts[i].zone));
      cloud.setColorAt(i, _color);
    }
    if (cloud.instanceColor) cloud.instanceColor.needsUpdate = true;
  }, [impacts, count, _color]);

  // SINGLE useFrame callback for ALL pellets + ring
  useFrame(({ clock }) => {
    const cloud = cloudMeshRef.current;
    const trail = trailMeshRef.current;
    if (!cloud) return;

    const elapsed = clock.getElapsedTime();
    const distScale = distanceM * WORLD_SCALE;

    for (let i = 0; i < count; i++) {
      const t = ((elapsed + i * 0.02) % CYCLE_DURATION) / CYCLE_DURATION;
      const [tx, tz] = targetPositions[i];

      // Main pellet
      const y = (1 - t) * distScale;
      const spread = t;
      const gravDrop = t * t * distScale * 0.01;
      const scale = 0.7 + t * 0.3;

      _obj.position.set(tx * spread, y - gravDrop, tz * spread);
      _obj.scale.setScalar(scale);
      _obj.updateMatrix();
      cloud.setMatrixAt(i, _obj.matrix);

      // Trail ghost (slightly behind)
      if (trail) {
        const tTrail = Math.max(0, t - 0.03);
        const yTrail = (1 - tTrail) * distScale;
        _obj.position.set(tx * tTrail, yTrail - tTrail * tTrail * distScale * 0.01, tz * tTrail);
        _obj.scale.setScalar(1);
        _obj.updateMatrix();
        trail.setMatrixAt(i, _obj.matrix);
      }
    }

    cloud.instanceMatrix.needsUpdate = true;
    if (trail) trail.instanceMatrix.needsUpdate = true;

    // Spread ring
    if (ringRef.current) {
      const t = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;
      const y = (1 - t) * distScale;
      const currentR = maxR * t * WORLD_SCALE;
      ringRef.current.position.y = y;
      const s = Math.max(0.001, currentR / 0.5);
      ringRef.current.scale.set(s, 1, s);
    }
  });

  // Distance markers
  const markers = useMemo(() => {
    const result: { y: number; label: string }[] = [];
    const step = distanceM <= 20 ? 5 : 10;
    for (let d = step; d < distanceM; d += step) {
      result.push({ y: (1 - d / distanceM) * distanceM * WORLD_SCALE, label: `${d}m` });
    }
    return result;
  }, [distanceM]);

  return (
    <group>
      <TargetPlane circle1RadiusCm={circle1RadiusCm} circle2RadiusCm={circle2RadiusCm} scale={WORLD_SCALE} />

      {/* Barrel */}
      <mesh position={[0, distanceM * WORLD_SCALE, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.04, 12]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </mesh>
      <Text position={[0.06, distanceM * WORLD_SCALE, 0]} fontSize={0.04} color="#ff6b6b" anchorX="left">
        {`Canon (${distanceM}m)`}
      </Text>
      {enhanced && (
        <Text position={[0.06, distanceM * WORLD_SCALE - 0.06, 0]} fontSize={0.022} color="#c084fc" anchorX="left">
          {`∅${pelletDiam}mm | V₀=${ballisticParams!.muzzleVelocity}m/s`}
        </Text>
      )}

      {/* Distance markers */}
      {markers.map(m => (
        <group key={m.label}>
          <mesh position={[0, m.y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.002, 0.004, 32]} />
            <meshBasicMaterial color="#3a3f55" transparent opacity={0.6} />
          </mesh>
          <Text position={[-0.08, m.y, 0]} fontSize={0.025} color="#5c6378" anchorX="right">
            {m.label}
          </Text>
        </group>
      ))}

      {/* Spread ring */}
      <group ref={ringRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.48, 0.5, 64]} />
          <meshBasicMaterial color="#4dabf7" transparent opacity={0.35} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Central axis */}
      <mesh position={[0, distanceM * WORLD_SCALE / 2, 0]}>
        <cylinderGeometry args={[0.001, 0.001, distanceM * WORLD_SCALE, 4]} />
        <meshBasicMaterial color="#2b2f3d" transparent opacity={0.3} />
      </mesh>

      {/* Animated pellet cloud (instanced — 1 draw call) */}
      {count > 0 && (
        <>
          <instancedMesh ref={cloudMeshRef} args={[sphereGeom, cloudMat, count]} frustumCulled={false} />
          <instancedMesh ref={trailMeshRef} args={[trailGeom, trailMat, count]} frustumCulled={false} />
        </>
      )}

      {/* Static target impact ghosts (instanced) */}
      <InstancedPellets
        impacts={impacts}
        yOffset={0.005}
        pelletRadius={0.006}
        emissiveIntensity={0.3}
        metalness={0.3}
        roughness={0.7}
      />

      <Text position={[-circle2RadiusCm * WORLD_SCALE * 1.2, 0.02, circle2RadiusCm * WORLD_SCALE * 0.8]} fontSize={0.025} color="#a0a4b8" anchorX="left">
        {`${count} plombs | Dispersion progressive`}
      </Text>
    </group>
  );
}
