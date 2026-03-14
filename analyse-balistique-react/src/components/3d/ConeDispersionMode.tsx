import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import type { Impact3D } from '../../lib/3d-utils';
import type { CovarianceEllipse } from '../../types';
import { getZoneColor } from '../../lib/3d-utils';

interface ConeDispersionModeProps {
  impacts: Impact3D[];
  distanceM: number;
  r90Cm: number;
  ellipse: CovarianceEllipse | null;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
}

const SCALE = 0.01; // 1cm = 0.01 unit

export function ConeDispersionMode({
  impacts,
  distanceM,
  r90Cm,
  ellipse,
  circle1RadiusCm,
  circle2RadiusCm,
}: ConeDispersionModeProps) {
  const coneRef = useRef<THREE.Mesh>(null);
  const coneHeight = distanceM * SCALE;
  const coneRadius = r90Cm * SCALE;

  // Slowly rotate cone for visual effect
  useFrame((_, delta) => {
    if (coneRef.current) {
      coneRef.current.rotation.y += delta * 0.1;
    }
  });

  // Ellipse shape on the target plane
  const ellipseShape = useMemo(() => {
    if (!ellipse) return null;
    const curve = new THREE.EllipseCurve(
      0, 0,
      ellipse.semiMajor * SCALE,
      ellipse.semiMinor * SCALE,
      0, 2 * Math.PI,
      false,
      ellipse.angle
    );
    const points = curve.getPoints(64);
    return new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, 0.005, p.y))
    );
  }, [ellipse]);

  return (
    <group>
      <TargetPlane
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
        scale={SCALE}
      />

      {/* Dispersion cone (wireframe) */}
      <mesh
        ref={coneRef}
        position={[0, coneHeight / 2, 0]}
      >
        <coneGeometry args={[coneRadius, coneHeight, 32, 1, true]} />
        <meshStandardMaterial
          color="#f0a030"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          wireframe
        />
      </mesh>

      {/* Solid cone with low opacity */}
      <mesh position={[0, coneHeight / 2, 0]}>
        <coneGeometry args={[coneRadius, coneHeight, 32, 1, true]} />
        <meshStandardMaterial
          color="#f0a030"
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Firing point indicator */}
      <mesh position={[0, coneHeight, 0]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={0.5} />
      </mesh>
      <Text
        position={[0.06, coneHeight, 0]}
        fontSize={0.04}
        color="#ff6b6b"
        anchorX="left"
      >
        {`Point de tir (${distanceM}m)`}
      </Text>

      {/* PCA Ellipse on target */}
      {ellipseShape && (
        <line>
          <bufferGeometry attach="geometry" {...ellipseShape} />
          <lineBasicMaterial color="#4dabf7" transparent opacity={0.8} />
        </line>
      )}

      {/* Impact spheres */}
      {impacts.map((imp) => (
        <mesh
          key={imp.index}
          position={[imp.x * SCALE, 0.01, -imp.y * SCALE]}
        >
          <sphereGeometry args={[0.012, 12, 12]} />
          <meshStandardMaterial
            color={getZoneColor(imp.zone)}
            emissive={getZoneColor(imp.zone)}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* R90 circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <ringGeometry args={[r90Cm * SCALE - 0.002, r90Cm * SCALE, 64]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <Text
        position={[r90Cm * SCALE + 0.05, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.03}
        color="#c084fc"
        anchorX="left"
      >
        {`R90: ${r90Cm.toFixed(1)}cm`}
      </Text>
    </group>
  );
}
