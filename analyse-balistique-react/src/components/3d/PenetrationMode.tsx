import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import type { BallisticParams, SimulationResult } from '../../lib/ballistics-sim';

interface PenetrationModeProps {
  impacts: Impact3D[];
  penetrationCm: number;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  ballisticParams?: BallisticParams | null;
  simResult?: SimulationResult | null;
}

const SCALE = 0.01;
const DEPTH_SCALE = 0.015;

// Wound channel component: temporary cavity (pulsing) + permanent cavity (tunnel)
function WoundChannel({ impact, penetrationCm, pelletRadius, impactVelocity, energyJ, index, enhanced }: {
  impact: Impact3D;
  penetrationCm: number;
  pelletRadius: number;
  impactVelocity: number;
  energyJ: number;
  index: number;
  enhanced: boolean;
}) {
  const tempCavityRef = useRef<THREE.Mesh>(null);
  const depth = penetrationCm * DEPTH_SCALE;
  const color = getZoneColor(impact.zone);

  // Temporary cavity size based on energy (higher energy = bigger cavity)
  const tempCavityRadius = enhanced
    ? Math.max(0.008, Math.sqrt(energyJ) * 0.012)
    : 0.015;

  // Permanent cavity is smaller (the actual wound track)
  const permCavityRadius = pelletRadius * 1.2;

  // Pulsing animation for temporary cavity
  useFrame(({ clock }) => {
    if (tempCavityRef.current) {
      const t = clock.getElapsedTime();
      // Pulse effect: expands then contracts
      const pulse = 1 + Math.sin(t * 2 + index * 0.7) * 0.2;
      tempCavityRef.current.scale.set(pulse, 1, pulse);
    }
  });

  // Generate wound channel profile (hourglass shape)
  const channelShape = useMemo(() => {
    const points: THREE.Vector2[] = [];
    const segments = 20;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments; // 0 = surface, 1 = max depth
      const y = -t * depth;

      // Wound channel widens then narrows (temporary cavity is widest at ~30% depth)
      let radius: number;
      if (t < 0.1) {
        // Entry wound (small)
        radius = permCavityRadius + (tempCavityRadius - permCavityRadius) * (t / 0.1);
      } else if (t < 0.4) {
        // Temporary cavity expands (widest part)
        const localT = (t - 0.1) / 0.3;
        radius = tempCavityRadius * (1 + Math.sin(localT * Math.PI) * 0.5);
      } else if (t < 0.8) {
        // Narrowing
        const localT = (t - 0.4) / 0.4;
        radius = tempCavityRadius * (1 - localT * 0.6);
      } else {
        // Terminal cavity (pellet resting point)
        const localT = (t - 0.8) / 0.2;
        radius = tempCavityRadius * 0.4 * (1 + Math.sin(localT * Math.PI) * 0.3);
      }

      points.push(new THREE.Vector2(radius, y));
    }
    return points;
  }, [depth, tempCavityRadius, permCavityRadius]);

  return (
    <group position={[impact.x * SCALE, 0, -impact.y * SCALE]}>
      {/* Entry wound on surface */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0, pelletRadius * 1.5, 12]} />
        <meshStandardMaterial color="#220000" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[pelletRadius * 1.2, pelletRadius * 1.8, 12]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Permanent wound channel (lathe from profile) */}
      <mesh>
        <latheGeometry args={[channelShape, 12]} />
        <meshStandardMaterial
          color="#8b0000"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Temporary cavity (pulsing, semi-transparent) */}
      <mesh
        ref={tempCavityRef}
        position={[0, -depth * 0.3, 0]}
      >
        <sphereGeometry args={[tempCavityRadius, 16, 16]} />
        <meshStandardMaterial
          color="#ff4444"
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Pellet at rest (at max depth) */}
      <mesh position={[0, -depth, 0]}>
        <sphereGeometry args={[pelletRadius, 12, 12]} />
        <meshStandardMaterial
          color="#c0c0c0"
          metalness={0.9}
          roughness={0.1}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Depth + energy labels */}
      {index <= 6 && (
        <>
          <Text
            position={[0.025, -depth, 0]}
            fontSize={0.016}
            color="#a0a4b8"
            anchorX="left"
          >
            {`${penetrationCm.toFixed(1)}cm`}
          </Text>
          {enhanced && (
            <Text
              position={[0.025, -depth - 0.022, 0]}
              fontSize={0.013}
              color="#c084fc"
              anchorX="left"
            >
              {`${impactVelocity.toFixed(0)}m/s | ${energyJ.toFixed(1)}J`}
            </Text>
          )}
        </>
      )}
    </group>
  );
}

export function PenetrationMode({
  impacts,
  penetrationCm,
  circle1RadiusCm,
  circle2RadiusCm,
  ballisticParams,
  simResult,
}: PenetrationModeProps) {
  const enhanced = !!ballisticParams && !!simResult;
  const extent = circle2RadiusCm * SCALE * 1.2;

  const maxPen = enhanced
    ? Math.max(...simResult!.pellets.map(p => p.penetrationCm), penetrationCm)
    : penetrationCm;

  const pelletRadius = enhanced
    ? Math.max(0.005, (ballisticParams!.pelletDiameterMm / 2) * SCALE * 0.8)
    : 0.008;

  return (
    <group>
      {/* Gel block - cross section */}
      <mesh position={[0, -maxPen * DEPTH_SCALE / 2, 0]}>
        <boxGeometry args={[extent * 2, maxPen * DEPTH_SCALE, extent * 0.6]} />
        <meshStandardMaterial
          color="#e8c170"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Gel block wireframe */}
      <mesh position={[0, -maxPen * DEPTH_SCALE / 2, 0]}>
        <boxGeometry args={[extent * 2, maxPen * DEPTH_SCALE, extent * 0.6]} />
        <meshStandardMaterial
          color="#e8c170"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>

      {/* Gel layers (subtle horizontal planes) */}
      {[0.2, 0.4, 0.6, 0.8].map((frac) => (
        <mesh key={frac} position={[0, -maxPen * DEPTH_SCALE * frac, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[extent * 2, extent * 0.6]} />
          <meshStandardMaterial
            color="#e8c170"
            transparent
            opacity={0.03}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Surface plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <planeGeometry args={[extent * 2, extent * 0.6]} />
        <meshStandardMaterial
          color="#4a5468"
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

      {/* Wound channels */}
      {impacts.map((imp, i) => {
        const pelletPen = enhanced && simResult!.pellets[i]
          ? simResult!.pellets[i].penetrationCm
          : imp.z;
        const impV = enhanced && simResult!.pellets[i]
          ? simResult!.pellets[i].impactVelocity
          : 300;
        const eJ = enhanced && simResult!.pellets[i]
          ? simResult!.pellets[i].energyJoules
          : 3;

        return (
          <WoundChannel
            key={imp.index}
            impact={imp}
            penetrationCm={pelletPen}
            pelletRadius={pelletRadius}
            impactVelocity={impV}
            energyJ={eJ}
            index={imp.index}
            enhanced={enhanced}
          />
        );
      })}

      {/* Depth ruler */}
      <group position={[-extent - 0.05, 0, 0]}>
        {[0, 25, 50, 75, 100].map((pct) => {
          const depthCm = (maxPen * pct) / 100;
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
        Gel balistique — Cavités de blessure
      </Text>
      <Text
        position={[0, 0.05, extent * 0.35]}
        fontSize={0.025}
        color="#a0a4b8"
      >
        {enhanced
          ? `∅${ballisticParams!.pelletDiameterMm}mm | Pén moy: ${simResult!.avgPenetration.toFixed(1)}cm | É moy: ${simResult!.avgEnergy.toFixed(2)}J`
          : `Pénétration max: ${penetrationCm}cm`
        }
      </Text>

      {/* Legend */}
      {enhanced && (
        <group position={[extent + 0.05, 0, 0]}>
          <Text position={[0, 0.04, 0]} fontSize={0.02} color="#dde0e8" anchorX="left">
            Légende
          </Text>
          <group position={[0, 0.015, 0]}>
            <mesh position={[0.01, 0, 0]}>
              <sphereGeometry args={[0.006, 8, 8]} />
              <meshStandardMaterial color="#ff4444" transparent opacity={0.3} />
            </mesh>
            <Text position={[0.025, 0, 0]} fontSize={0.015} color="#a0a4b8" anchorX="left">
              Cavité temporaire
            </Text>
          </group>
          <group position={[0, -0.005, 0]}>
            <mesh position={[0.01, 0, 0]}>
              <cylinderGeometry args={[0.004, 0.004, 0.01, 6]} />
              <meshStandardMaterial color="#8b0000" transparent opacity={0.5} />
            </mesh>
            <Text position={[0.025, 0, 0]} fontSize={0.015} color="#a0a4b8" anchorX="left">
              Canal permanent
            </Text>
          </group>
          <group position={[0, -0.025, 0]}>
            <mesh position={[0.01, 0, 0]}>
              <sphereGeometry args={[0.005, 8, 8]} />
              <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
            </mesh>
            <Text position={[0.025, 0, 0]} fontSize={0.015} color="#a0a4b8" anchorX="left">
              Plomb au repos
            </Text>
          </group>
        </group>
      )}
    </group>
  );
}
