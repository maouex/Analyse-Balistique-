import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';

interface PenetrationModeProps {
  impacts: Impact3D[];
  penetrationCm: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
}

const SCALE = 0.01;
const DEPTH_SCALE = 0.015; // exaggerate depth for visibility

export function PenetrationMode({
  impacts,
  penetrationCm,
  circle1RadiusCm,
  circle2RadiusCm,
}: PenetrationModeProps) {
  const extent = circle2RadiusCm * SCALE * 1.2;

  return (
    <group>
      {/* Gel block - cross section */}
      <mesh position={[0, -penetrationCm * DEPTH_SCALE / 2, 0]}>
        <boxGeometry args={[extent * 2, penetrationCm * DEPTH_SCALE, extent * 0.6]} />
        <meshStandardMaterial
          color="#e8c170"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gel block wireframe */}
      <mesh position={[0, -penetrationCm * DEPTH_SCALE / 2, 0]}>
        <boxGeometry args={[extent * 2, penetrationCm * DEPTH_SCALE, extent * 0.6]} />
        <meshStandardMaterial
          color="#e8c170"
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>

      {/* Surface plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[extent * 2, extent * 0.6]} />
        <meshStandardMaterial
          color="#191c25"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Reference circles on surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[circle1RadiusCm * SCALE - 0.002, circle1RadiusCm * SCALE, 64]} />
        <meshBasicMaterial color="#2ecc71" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[circle2RadiusCm * SCALE - 0.002, circle2RadiusCm * SCALE, 64]} />
        <meshBasicMaterial color="#f59f00" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Impact pellets with depth channels */}
      {impacts.map((imp) => {
        const depth = imp.z * DEPTH_SCALE;
        const color = getZoneColor(imp.zone);

        return (
          <group key={imp.index}>
            {/* Entry point on surface */}
            <mesh position={[imp.x * SCALE, 0.003, -imp.y * SCALE]}>
              <cylinderGeometry args={[0.006, 0.006, 0.003, 8]} />
              <meshStandardMaterial color={color} />
            </mesh>

            {/* Penetration channel */}
            <mesh position={[imp.x * SCALE, -depth / 2, -imp.y * SCALE]}>
              <cylinderGeometry args={[0.002, 0.003, depth, 6]} />
              <meshStandardMaterial
                color={color}
                transparent
                opacity={0.4}
              />
            </mesh>

            {/* Pellet at depth */}
            <mesh position={[imp.x * SCALE, -depth, -imp.y * SCALE]}>
              <sphereGeometry args={[0.008, 10, 10]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Depth label for a few pellets */}
            {imp.index <= 5 && (
              <Text
                position={[imp.x * SCALE + 0.02, -depth, -imp.y * SCALE]}
                fontSize={0.018}
                color="#a0a4b8"
                anchorX="left"
              >
                {`${imp.z.toFixed(1)}cm`}
              </Text>
            )}
          </group>
        );
      })}

      {/* Depth ruler */}
      <group position={[-extent - 0.05, 0, 0]}>
        {[0, 25, 50, 75, 100].map((pct) => {
          const depthCm = (penetrationCm * pct) / 100;
          const y = -depthCm * DEPTH_SCALE;
          return (
            <group key={pct}>
              <mesh position={[0, y, 0]}>
                <boxGeometry args={[0.03, 0.001, 0.001]} />
                <meshBasicMaterial color="#606474" />
              </mesh>
              <Text
                position={[-0.02, y, 0]}
                fontSize={0.018}
                color="#606474"
                anchorX="right"
              >
                {`${depthCm.toFixed(0)}cm`}
              </Text>
            </group>
          );
        })}
        <Text
          position={[-0.02, 0.03, 0]}
          fontSize={0.022}
          color="#a0a4b8"
          anchorX="right"
        >
          Profondeur
        </Text>
      </group>

      {/* Labels */}
      <Text
        position={[0, 0.08, extent * 0.35]}
        fontSize={0.035}
        color="#e8c170"
      >
        Gel balistique — Vue en coupe
      </Text>
      <Text
        position={[0, 0.05, extent * 0.35]}
        fontSize={0.025}
        color="#a0a4b8"
      >
        {`Pénétration max: ${penetrationCm}cm`}
      </Text>
    </group>
  );
}
