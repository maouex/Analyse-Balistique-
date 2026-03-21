import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import { InstancedPellets } from './InstancedPellets';
import type { Impact3D } from '../../lib/3d-utils';
import type { CovarianceEllipse } from '../../types';
import type { BallisticParams, SimulationResult } from '../../lib/ballistics-sim';
import { pelletWorldRadius } from './constants';

interface ConeDispersionModeProps {
  impacts: Impact3D[];
  distanceM: number;
  r90Cm: number;
  ellipse: CovarianceEllipse | null;
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  pixelsPerCm: number | null;
  ballisticParams?: BallisticParams | null;
  simResult?: SimulationResult | null;
}

const SCALE = 0.01; // 1cm = 0.01 unit

export function ConeDispersionMode({
  impacts,
  distanceM,
  r90Cm,
  ellipse,
  circle1RadiusCm,
  circle2RadiusCm,
  pixelsPerCm,
  ballisticParams,
  simResult,
}: ConeDispersionModeProps) {
  const coneRef = useRef<THREE.Mesh>(null);
  const coneHeight = distanceM * SCALE;
  const coneRadius = r90Cm * SCALE;

  const enhanced = !!ballisticParams && !!simResult;

  // Slowly rotate cone for visual effect
  useFrame((_, delta) => {
    if (coneRef.current) {
      coneRef.current.rotation.y += delta * 0.1;
    }
  });

  // Ellipse shape on the target plane
  const ellipseShape = useMemo(() => {
    if (!ellipse || !pixelsPerCm) return null;
    const aCm = ellipse.semiMajor / pixelsPerCm;
    const bCm = ellipse.semiMinor / pixelsPerCm;
    const curve = new THREE.EllipseCurve(
      0, 0,
      aCm * SCALE,
      bCm * SCALE,
      0, 2 * Math.PI,
      false,
      ellipse.angle
    );
    const points = curve.getPoints(64);
    return new THREE.BufferGeometry().setFromPoints(
      points.map((p) => new THREE.Vector3(p.x, 0.005, p.y))
    );
  }, [ellipse, pixelsPerCm]);

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
          color={enhanced ? '#aa66ff' : '#00ff41'}
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
          color={enhanced ? '#aa66ff' : '#00ff41'}
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

      {/* Enhanced: show ballistic params at firing point */}
      {enhanced && (
        <>
          <Text
            position={[0.06, coneHeight - 0.06, 0]}
            fontSize={0.025}
            color="#c084fc"
            anchorX="left"
          >
            {`V₀ = ${ballisticParams!.muzzleVelocity} m/s | Cd = ${ballisticParams!.dragCoefficient}`}
          </Text>
          <Text
            position={[0.06, coneHeight - 0.1, 0]}
            fontSize={0.022}
            color="#a0a4b8"
            anchorX="left"
          >
            {`∅ plomb ${ballisticParams!.pelletDiameterMm}mm | ∅ canon ${ballisticParams!.barrelDiameterMm}mm`}
          </Text>
        </>
      )}

      {/* PCA Ellipse on target */}
      {ellipseShape && (
        <line>
          <bufferGeometry attach="geometry" {...ellipseShape} />
          <lineBasicMaterial color="#44aaff" transparent opacity={0.8} />
        </line>
      )}

      {/* Impact pellets (instanced — 1 draw call) */}
      <InstancedPellets
        impacts={impacts}
        pelletRadius={pelletWorldRadius(enhanced ? ballisticParams!.pelletDiameterMm : undefined)}
        yOffset={0.01}
      />

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

      {/* Enhanced: velocity & energy stats at target */}
      {enhanced && simResult && (
        <group position={[-circle2RadiusCm * SCALE * 1.2, 0.02, circle2RadiusCm * SCALE * 0.8]}>
          <Text fontSize={0.028} color="#c084fc" anchorX="left" position={[0, 0.06, 0]}>
            Balistique avancée
          </Text>
          <Text fontSize={0.022} color="#a0a4b8" anchorX="left" position={[0, 0.03, 0]}>
            {`V impact: ${simResult.avgImpactVelocity.toFixed(0)} m/s (${simResult.velocityRetention.toFixed(0)}%)`}
          </Text>
          <Text fontSize={0.022} color="#a0a4b8" anchorX="left" position={[0, 0.005, 0]}>
            {`Énergie: ${simResult.avgEnergy.toFixed(2)} J | Pénétration: ${simResult.avgPenetration.toFixed(1)} cm`}
          </Text>
        </group>
      )}
    </group>
  );
}
