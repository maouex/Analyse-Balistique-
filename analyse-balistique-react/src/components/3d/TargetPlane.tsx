import * as THREE from 'three';
import { Text } from '@react-three/drei';

interface TargetPlaneProps {
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  circle1Color?: string;
  circle2Color?: string;
  scale?: number;
}

export function TargetPlane({
  circle1RadiusCm,
  circle2RadiusCm,
  circle1Color = '#2ecc71',
  circle2Color = '#f59f00',
  scale = 0.01,
}: TargetPlaneProps) {
  const r1 = circle1RadiusCm * scale;
  const r2 = circle2RadiusCm * scale;
  const planeSize = r2 * 3;

  return (
    <group>
      {/* Target background plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshStandardMaterial
          color="#4a5468"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[planeSize, 20, '#3d4558', '#4e586c']}
        position={[0, 0.001, 0]}
      />

      {/* Circle 1 (50cm) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[r1 - 0.003, r1, 64]} />
        <meshBasicMaterial color={circle1Color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Circle 2 (100cm) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[r2 - 0.003, r2, 64]} />
        <meshBasicMaterial color={circle2Color} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Center cross */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.005, r1 * 0.4]} />
        <meshBasicMaterial color="#4dabf7" transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        <planeGeometry args={[0.005, r1 * 0.4]} />
        <meshBasicMaterial color="#4dabf7" transparent opacity={0.6} />
      </mesh>

      {/* Labels */}
      <Text
        position={[r1 + 0.05, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.04}
        color={circle1Color}
        anchorX="left"
      >
        {`∅${circle1RadiusCm * 2}cm`}
      </Text>
      <Text
        position={[r2 + 0.05, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.04}
        color={circle2Color}
        anchorX="left"
      >
        {`∅${circle2RadiusCm * 2}cm`}
      </Text>
    </group>
  );
}
