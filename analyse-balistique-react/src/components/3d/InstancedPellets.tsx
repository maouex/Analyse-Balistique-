import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { Impact3D } from '../../lib/3d-utils';
import { getZoneColor } from '../../lib/3d-utils';
import { DEFAULT_PELLET_RADIUS } from './constants';

interface InstancedPelletsProps {
  impacts: Impact3D[];
  /** World-space Y offset for all pellets */
  yOffset?: number;
  /** Override pellet radius (world units) */
  pelletRadius?: number;
  /** Position transform: return [x,y,z] per impact */
  positionFn?: (imp: Impact3D, i: number) => [number, number, number];
  /** Color per impact (defaults to zone color) */
  colorFn?: (imp: Impact3D, i: number) => string;
  /** Metallic appearance */
  metalness?: number;
  roughness?: number;
  /** Emissive intensity for zone glow */
  emissiveIntensity?: number;
}

const SCALE = 0.01;

const _obj = new THREE.Object3D();
const _color = new THREE.Color();

/**
 * Renders all pellets as a single InstancedMesh — 1 draw call instead of N.
 * Supports per-instance color via instanceColor attribute.
 */
export function InstancedPellets({
  impacts,
  yOffset = 0.01,
  pelletRadius = DEFAULT_PELLET_RADIUS,
  positionFn,
  colorFn,
  metalness = 0.85,
  roughness = 0.15,
  emissiveIntensity = 0.2,
}: InstancedPelletsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const count = impacts.length;

  // Shared geometry (sphere at detail level proportional to count)
  const segments = count > 200 ? 8 : count > 50 ? 10 : 14;

  const geometry = useMemo(
    () => new THREE.SphereGeometry(pelletRadius, segments, segments),
    [pelletRadius, segments]
  );

  // Material: single shared material for all instances
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#c0c0c0',
      metalness,
      roughness,
      emissiveIntensity,
    });
  }, [metalness, roughness, emissiveIntensity]);

  // Update instance transforms and colors when impacts change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;

    for (let i = 0; i < count; i++) {
      const imp = impacts[i];

      // Position
      if (positionFn) {
        const [px, py, pz] = positionFn(imp, i);
        _obj.position.set(px, py, pz);
      } else {
        _obj.position.set(imp.x * SCALE, yOffset, -imp.y * SCALE);
      }
      _obj.updateMatrix();
      mesh.setMatrixAt(i, _obj.matrix);

      // Per-instance color
      const col = colorFn ? colorFn(imp, i) : getZoneColor(imp.zone);
      _color.set(col);
      mesh.setColorAt(i, _color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [impacts, count, positionFn, colorFn, yOffset]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
