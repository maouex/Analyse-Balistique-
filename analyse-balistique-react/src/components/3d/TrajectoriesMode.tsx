import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import type { BallisticParams, SimulationResult } from '../../lib/ballistics-sim';

interface TrajectoriesModeProps {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  velocityMs: number;
  ballisticParams?: BallisticParams | null;
  simResult?: SimulationResult | null;
}

const SCALE = 0.01;

/** Interpolate between red (fast) and blue (slow) based on velocity ratio */
function velocityToColor(velocityRatio: number): THREE.Color {
  // ratio: 1.0 = muzzle velocity (red), 0.0 = stopped (blue)
  const r = Math.min(1, velocityRatio * 2);
  const g = velocityRatio > 0.5 ? (1 - velocityRatio) * 2 * 0.6 : velocityRatio * 2 * 0.6;
  const b = Math.min(1, (1 - velocityRatio) * 2);
  return new THREE.Color(r, g, b);
}

function Pellet({ impact, distanceM, velocityMs, trajectoryPoints, muzzleVelocity }: {
  impact: Impact3D;
  distanceM: number;
  velocityMs: number;
  trajectoryPoints?: Array<{ x: number; y: number; z: number; speed: number }> | null;
  muzzleVelocity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [arrived, setArrived] = useState(false);
  const progressRef = useRef(0);

  const hasPhysics = trajectoryPoints && trajectoryPoints.length > 2;

  const firingPoint = useMemo(() => new THREE.Vector3(0, distanceM * SCALE, 0), [distanceM]);
  const targetPoint = useMemo(
    () => new THREE.Vector3(impact.x * SCALE, 0.01, -impact.y * SCALE),
    [impact]
  );

  const flightDuration = distanceM / velocityMs * 8;

  // Build trajectory with velocity-colored segments
  const { trailGeometry, physicsPositions } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const colors: number[] = [];

    if (hasPhysics) {
      for (const pt of trajectoryPoints) {
        const progress = pt.z / distanceM;
        const y3d = (1 - progress) * distanceM * SCALE;
        const x3d = impact.x * SCALE * progress;
        const z3d = -impact.y * SCALE * progress;
        points.push(new THREE.Vector3(x3d, y3d + pt.y * SCALE, z3d));

        // Velocity gradient color
        const vRatio = pt.speed / muzzleVelocity;
        const col = velocityToColor(vRatio);
        colors.push(col.r, col.g, col.b);
      }
      points.push(new THREE.Vector3(impact.x * SCALE, 0.01, -impact.y * SCALE));
      // Final point color (lowest velocity)
      const lastSpeed = trajectoryPoints[trajectoryPoints.length - 1].speed;
      const finalCol = velocityToColor(lastSpeed / muzzleVelocity);
      colors.push(finalCol.r, finalCol.g, finalCol.b);
    } else {
      // Simple parabola with fake velocity gradient
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const pos = new THREE.Vector3().lerpVectors(firingPoint, targetPoint, t);
        pos.y += Math.sin(t * Math.PI) * distanceM * SCALE * 0.02;
        points.push(pos);

        // Simulate velocity decay (rough exponential)
        const vRatio = Math.exp(-t * 0.8);
        const col = velocityToColor(vRatio);
        colors.push(col.r, col.g, col.b);
      }
    }

    const geom = new THREE.BufferGeometry().setFromPoints(points);
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    return {
      trailGeometry: geom,
      physicsPositions: points,
    };
  }, [hasPhysics, trajectoryPoints, firingPoint, targetPoint, distanceM, impact, muzzleVelocity]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    progressRef.current += delta;
    const t = Math.max(0, progressRef.current / flightDuration);

    if (t >= 1) {
      meshRef.current.position.copy(targetPoint);
      if (!arrived) setArrived(true);
      return;
    }

    if (t < 0) return;

    // Interpolate along trajectory
    const idx = t * (physicsPositions.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, physicsPositions.length - 1);
    const frac = idx - lo;
    const pos = new THREE.Vector3().lerpVectors(physicsPositions[lo], physicsPositions[hi], frac);
    meshRef.current.position.copy(pos);
    meshRef.current.visible = true;

    // Update pellet color based on velocity
    if (materialRef.current && hasPhysics && trajectoryPoints) {
      const ptIdx = Math.min(Math.floor(t * trajectoryPoints.length), trajectoryPoints.length - 1);
      const vRatio = trajectoryPoints[ptIdx].speed / muzzleVelocity;
      const col = velocityToColor(vRatio);
      materialRef.current.color.copy(col);
      materialRef.current.emissive.copy(col);
    }
  });

  const color = getZoneColor(impact.zone);

  return (
    <group>
      {/* Velocity-gradient trail */}
      <line>
        <bufferGeometry attach="geometry" {...trailGeometry} />
        <lineBasicMaterial vertexColors transparent opacity={0.4} />
      </line>

      {/* Flying pellet */}
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.009, 10, 10]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#ff4444"
          emissive="#ff4444"
          emissiveIntensity={0.7}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Impact marker */}
      {arrived && (
        <mesh position={[impact.x * SCALE, 0.01, -impact.y * SCALE]}>
          <sphereGeometry args={[0.01, 10, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.2}
          />
        </mesh>
      )}
    </group>
  );
}

export function TrajectoriesMode({
  impacts,
  distanceM,
  circle1RadiusCm,
  circle2RadiusCm,
  velocityMs,
  ballisticParams,
  simResult,
}: TrajectoriesModeProps) {
  const enhanced = !!ballisticParams && !!simResult;
  const muzzleV = ballisticParams?.muzzleVelocity ?? velocityMs;

  return (
    <group>
      <TargetPlane
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
        scale={SCALE}
      />

      {/* Firing point */}
      <mesh position={[0, distanceM * SCALE, 0]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
      </mesh>
      <Text
        position={[0.06, distanceM * SCALE, 0]}
        fontSize={0.04}
        color="#ff6b6b"
        anchorX="left"
      >
        {`Canon (${distanceM}m)`}
      </Text>

      {/* Velocity info */}
      <Text
        position={[0.06, distanceM * SCALE - 0.06, 0]}
        fontSize={0.025}
        color="#a0a4b8"
        anchorX="left"
      >
        {enhanced
          ? `V₀ = ${muzzleV} m/s | Cd = ${ballisticParams!.dragCoefficient} | ∅${ballisticParams!.pelletDiameterMm}mm`
          : `V₀ = ${velocityMs} m/s`
        }
      </Text>

      {enhanced && simResult && (
        <Text
          position={[0.06, distanceM * SCALE - 0.1, 0]}
          fontSize={0.022}
          color="#c084fc"
          anchorX="left"
        >
          {`V impact = ${simResult.avgImpactVelocity.toFixed(0)} m/s (rétention ${simResult.velocityRetention.toFixed(0)}%)`}
        </Text>
      )}

      {/* Velocity gradient legend */}
      <group position={[circle2RadiusCm * SCALE * 1.4, distanceM * SCALE * 0.5, 0]}>
        <Text position={[0, 0.08, 0]} fontSize={0.025} color="#dde0e8" anchorX="left">
          Gradient de vitesse
        </Text>
        {[
          { label: 'Rapide', color: '#ff0000', y: 0.05 },
          { label: 'Moyen', color: '#996600', y: 0.025 },
          { label: 'Lent', color: '#0044ff', y: 0.0 },
        ].map(({ label, color, y }) => (
          <group key={label} position={[0, y, 0]}>
            <mesh position={[0.01, 0, 0]}>
              <sphereGeometry args={[0.008, 8, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <Text position={[0.025, 0, 0]} fontSize={0.018} color="#a0a4b8" anchorX="left">
              {label}
            </Text>
          </group>
        ))}
      </group>

      {/* Pellets with velocity gradient */}
      {impacts.map((imp, i) => (
        <Pellet
          key={imp.index}
          impact={imp}
          distanceM={distanceM}
          velocityMs={velocityMs}
          muzzleVelocity={muzzleV}
          trajectoryPoints={
            enhanced && simResult?.pellets[i]
              ? simResult.pellets[i].trajectory.map(pt => ({
                  x: pt.x, y: pt.y, z: pt.z,
                  speed: Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy + pt.vz * pt.vz),
                }))
              : null
          }
        />
      ))}

      {/* Gravity drop indicator */}
      {enhanced && simResult && simResult.pellets.length > 0 && (
        <group>
          <mesh position={[0, 0.005, simResult.pellets[0].gravityDropCm * SCALE / 2]}>
            <cylinderGeometry args={[0.002, 0.002, simResult.pellets[0].gravityDropCm * SCALE, 6]} />
            <meshStandardMaterial color="#fbbf24" transparent opacity={0.5} />
          </mesh>
          <Text
            position={[0.04, 0.01, simResult.pellets[0].gravityDropCm * SCALE]}
            fontSize={0.02}
            color="#fbbf24"
            anchorX="left"
          >
            {`Chute: ${simResult.pellets[0].gravityDropCm.toFixed(1)}cm`}
          </Text>
        </group>
      )}
    </group>
  );
}
