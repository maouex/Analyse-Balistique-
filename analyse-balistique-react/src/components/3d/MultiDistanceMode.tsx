import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import type { BallisticParams } from '../../lib/ballistics-sim';
import { simulateSpread } from '../../lib/ballistics-sim';

interface MultiDistanceModeProps {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  ballisticParams: BallisticParams | null;
}

const SCALE = 0.01;
const SPACING = 1.8; // horizontal spacing between targets

function TargetAtDistance({
  impacts,
  distanceM,
  circle1RadiusCm,
  circle2RadiusCm,
  offsetX,
  ballisticParams,
  isActual,
}: {
  impacts: Impact3D[];
  distanceM: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  offsetX: number;
  ballisticParams: BallisticParams | null;
  isActual: boolean;
}) {
  // Run simulation for this distance
  const simResult = useMemo(() => {
    if (!ballisticParams) return null;
    const positions = impacts.map(imp => ({ x: imp.x, y: imp.y }));
    return simulateSpread(ballisticParams, distanceM, positions);
  }, [ballisticParams, distanceM, impacts]);

  const r1 = circle1RadiusCm * SCALE;
  const r2 = circle2RadiusCm * SCALE;
  const planeSize = r2 * 3;

  // Scale factor: at longer distances, spread is wider proportionally
  const scaleFactor = isActual ? 1 : distanceM / (impacts.length > 0 ? 35 : 35);

  return (
    <group position={[offsetX, 0, 0]}>
      {/* Target plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[planeSize, planeSize]} />
        <meshStandardMaterial
          color="#4a5468"
          transparent
          opacity={isActual ? 0.9 : 0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Grid */}
      <gridHelper
        args={[planeSize, 16, '#2b2f3d', '#1a1d26']}
        position={[0, 0.001, 0]}
      />

      {/* Circles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[r1 - 0.002, r1, 48]} />
        <meshBasicMaterial color="#2ecc71" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[r2 - 0.002, r2, 48]} />
        <meshBasicMaterial color="#f59f00" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Impact pellets */}
      {impacts.map((imp) => {
        const color = getZoneColor(imp.zone);
        return (
          <mesh
            key={imp.index}
            position={[imp.x * SCALE * scaleFactor, 0.01, -imp.y * SCALE * scaleFactor]}
          >
            <sphereGeometry args={[0.01, 10, 10]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      {/* Distance label */}
      <Text
        position={[0, 0.08, planeSize / 2 + 0.04]}
        fontSize={0.06}
        color={isActual ? '#4dabf7' : '#a0a4b8'}
        fontWeight={isActual ? 'bold' : 'normal'}
      >
        {`${distanceM}m`}
      </Text>

      {/* "Actual" badge */}
      {isActual && (
        <Text
          position={[0, 0.04, planeSize / 2 + 0.04]}
          fontSize={0.025}
          color="#4dabf7"
        >
          (distance réelle)
        </Text>
      )}

      {/* Stats below */}
      {simResult && (
        <group position={[0, 0.01, -planeSize / 2 - 0.04]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.025}
            color="#c084fc"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {`V: ${simResult.avgImpactVelocity.toFixed(0)}m/s | É: ${simResult.avgEnergy.toFixed(1)}J`}
          </Text>
          <Text
            position={[0, 0, 0.04]}
            fontSize={0.022}
            color="#a0a4b8"
            rotation={[-Math.PI / 2, 0, 0]}
          >
            {`Pén: ${simResult.avgPenetration.toFixed(1)}cm | Rét: ${simResult.velocityRetention.toFixed(0)}%`}
          </Text>
        </group>
      )}

      {/* Without enhanced params, show simplified info */}
      {!simResult && (
        <Text
          position={[0, 0.01, -planeSize / 2 - 0.04]}
          fontSize={0.022}
          color="#5c6378"
          rotation={[-Math.PI / 2, 0, 0]}
        >
          Activer balistique avancée pour les données
        </Text>
      )}
    </group>
  );
}

export function MultiDistanceMode({
  impacts,
  distanceM,
  circle1RadiusCm,
  circle2RadiusCm,
  ballisticParams,
}: MultiDistanceModeProps) {
  // Three distances: short, actual, long
  const distances = useMemo(() => {
    const short = Math.max(10, Math.round(distanceM * 0.6 / 5) * 5);
    const long = Math.round(distanceM * 1.5 / 5) * 5;
    return [
      { d: short, offset: -SPACING },
      { d: distanceM, offset: 0 },
      { d: long, offset: SPACING },
    ];
  }, [distanceM]);

  return (
    <group>
      {distances.map(({ d, offset }) => (
        <TargetAtDistance
          key={d}
          impacts={impacts}
          distanceM={d}
          circle1RadiusCm={circle1RadiusCm}
          circle2RadiusCm={circle2RadiusCm}
          offsetX={offset}
          ballisticParams={ballisticParams}
          isActual={d === distanceM}
        />
      ))}

      {/* Connecting lines between targets */}
      <mesh position={[0, 0.001, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.001, 0.001, SPACING * 2.2, 4]} />
        <meshBasicMaterial color="#2b2f3d" transparent opacity={0.3} />
      </mesh>

      {/* Title */}
      <Text
        position={[0, 0.25, 0]}
        fontSize={0.05}
        color="#dde0e8"
      >
        Comparaison multi-distance
      </Text>
    </group>
  );
}
