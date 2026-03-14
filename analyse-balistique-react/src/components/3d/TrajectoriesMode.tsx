import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';

interface TrajectoriesModeProps {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  velocityMs: number;
}

const SCALE = 0.01;

function Pellet({ impact, distanceM, velocityMs }: {
  impact: Impact3D;
  distanceM: number;
  velocityMs: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const [arrived, setArrived] = useState(false);
  const progressRef = useRef(0);

  const firingPoint = useMemo(() => new THREE.Vector3(0, distanceM * SCALE, 0), [distanceM]);
  const targetPoint = useMemo(
    () => new THREE.Vector3(impact.x * SCALE, 0.01, -impact.y * SCALE),
    [impact]
  );

  // Duration based on velocity (simplified)
  const flightDuration = distanceM / velocityMs * 8; // slowed for visual

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

    // Parabolic trajectory with gravity drop
    const pos = new THREE.Vector3().lerpVectors(firingPoint, targetPoint, t);
    // Add slight arc
    const arc = Math.sin(t * Math.PI) * distanceM * SCALE * 0.02;
    pos.y += arc;

    meshRef.current.position.copy(pos);
    meshRef.current.visible = true;
  });

  const color = getZoneColor(impact.zone);

  // Trail line
  const trailGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const pos = new THREE.Vector3().lerpVectors(firingPoint, targetPoint, t);
      pos.y += Math.sin(t * Math.PI) * distanceM * SCALE * 0.02;
      points.push(pos);
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [firingPoint, targetPoint, distanceM]);

  return (
    <group>
      {/* Trail */}
      <line ref={trailRef as never}>
        <bufferGeometry attach="geometry" {...trailGeometry} />
        <lineBasicMaterial color={color} transparent opacity={0.15} />
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
}: TrajectoriesModeProps) {
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
        {`V₀ = ${velocityMs} m/s`}
      </Text>

      {/* Pellets with staggered launch */}
      {impacts.map((imp) => (
        <Pellet
          key={imp.index}
          impact={imp}
          distanceM={distanceM}
          velocityMs={velocityMs}
        />
      ))}
    </group>
  );
}
