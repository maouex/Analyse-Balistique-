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

function Pellet({ impact, distanceM, velocityMs, trajectoryPoints }: {
  impact: Impact3D;
  distanceM: number;
  velocityMs: number;
  trajectoryPoints?: Array<{ x: number; y: number; z: number }> | null;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const [arrived, setArrived] = useState(false);
  const progressRef = useRef(0);

  // If we have physics trajectory points, use them; otherwise fallback to simple parabola
  const hasPhysics = trajectoryPoints && trajectoryPoints.length > 2;

  const firingPoint = useMemo(() => new THREE.Vector3(0, distanceM * SCALE, 0), [distanceM]);
  const targetPoint = useMemo(
    () => new THREE.Vector3(impact.x * SCALE, 0.01, -impact.y * SCALE),
    [impact]
  );

  // Duration based on velocity (simplified for animation)
  const flightDuration = distanceM / velocityMs * 8; // slowed for visual

  // Build trajectory geometry
  const { trailGeometry, physicsPositions } = useMemo(() => {
    const points: THREE.Vector3[] = [];

    if (hasPhysics) {
      // Use real physics trajectory (z = downrange, x = lateral, y = vertical)
      // Map: physics z → 3D Y (height from target), physics x → 3D X, physics y → 3D Z
      for (const pt of trajectoryPoints) {
        const progress = pt.z / distanceM; // 0 at barrel, 1 at target
        const y3d = (1 - progress) * distanceM * SCALE; // height decreases from barrel to target
        const x3d = pt.x * 100 * SCALE; // lateral offset (m → cm → 3D)
        const z3d = -pt.y * 100 * SCALE; // vertical offset becomes depth
        // Add gravity drop visual
        points.push(new THREE.Vector3(
          impact.x * SCALE * progress + x3d * (1 - progress),
          y3d + pt.y * SCALE, // include gravity drop
          -impact.y * SCALE * progress + z3d * (1 - progress),
        ));
      }
      // Ensure last point is the actual impact
      points.push(new THREE.Vector3(impact.x * SCALE, 0.01, -impact.y * SCALE));
    } else {
      // Simple parabolic trajectory
      for (let i = 0; i <= 30; i++) {
        const t = i / 30;
        const pos = new THREE.Vector3().lerpVectors(firingPoint, targetPoint, t);
        pos.y += Math.sin(t * Math.PI) * distanceM * SCALE * 0.02;
        points.push(pos);
      }
    }

    return {
      trailGeometry: new THREE.BufferGeometry().setFromPoints(points),
      physicsPositions: points,
    };
  }, [hasPhysics, trajectoryPoints, firingPoint, targetPoint, distanceM, impact]);

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

    if (hasPhysics && physicsPositions.length > 0) {
      // Interpolate along physics trajectory
      const idx = t * (physicsPositions.length - 1);
      const lo = Math.floor(idx);
      const hi = Math.min(lo + 1, physicsPositions.length - 1);
      const frac = idx - lo;
      const pos = new THREE.Vector3().lerpVectors(physicsPositions[lo], physicsPositions[hi], frac);
      meshRef.current.position.copy(pos);
    } else {
      // Simple lerp + arc
      const pos = new THREE.Vector3().lerpVectors(firingPoint, targetPoint, t);
      pos.y += Math.sin(t * Math.PI) * distanceM * SCALE * 0.02;
      meshRef.current.position.copy(pos);
    }

    meshRef.current.visible = true;
  });

  const color = getZoneColor(impact.zone);

  return (
    <group>
      {/* Trail */}
      <line ref={trailRef as never}>
        <bufferGeometry attach="geometry" {...trailGeometry} />
        <lineBasicMaterial color={color} transparent opacity={hasPhysics ? 0.25 : 0.15} />
      </line>

      {/* Flying pellet */}
      <mesh ref={meshRef} visible={false}>
        <sphereGeometry args={[0.008, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Impact marker (appears when arrived) */}
      {arrived && (
        <mesh position={[impact.x * SCALE, 0.01, -impact.y * SCALE]}>
          <sphereGeometry args={[0.01, 10, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
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

      {/* Velocity label */}
      <Text
        position={[0.06, distanceM * SCALE - 0.06, 0]}
        fontSize={0.025}
        color="#a0a4b8"
        anchorX="left"
      >
        {enhanced
          ? `V₀ = ${ballisticParams!.muzzleVelocity} m/s | Cd = ${ballisticParams!.dragCoefficient} | ∅${ballisticParams!.pelletDiameterMm}mm`
          : `V₀ = ${velocityMs} m/s`
        }
      </Text>

      {/* Enhanced: show impact velocity */}
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

      {/* Pellets with staggered launch */}
      {impacts.map((imp, i) => (
        <Pellet
          key={imp.index}
          impact={imp}
          distanceM={distanceM}
          velocityMs={velocityMs}
          trajectoryPoints={
            enhanced && simResult?.pellets[i]
              ? simResult.pellets[i].trajectory.map(pt => ({ x: pt.x, y: pt.y, z: pt.z }))
              : null
          }
        />
      ))}

      {/* Enhanced: show gravity drop indicator */}
      {enhanced && simResult && simResult.pellets.length > 0 && (
        <group>
          {/* Gravity drop line at center */}
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
