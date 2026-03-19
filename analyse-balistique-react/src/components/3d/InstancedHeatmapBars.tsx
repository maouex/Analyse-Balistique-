import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface HeatmapCell {
  x: number;
  z: number;
  height: number;
  intensity: number;
  energyJ?: number;
}

interface InstancedHeatmapBarsProps {
  cells: HeatmapCell[];
  cellWorldSize: number;
  colorFn: (intensity: number, energyJ: number) => string;
  baseOpacity?: number;
}

const _obj = new THREE.Object3D();
const _color = new THREE.Color();

/**
 * Renders all heatmap bars as a single InstancedMesh.
 * Reduces 300-500 draw calls to 1.
 */
export function InstancedHeatmapBars({
  cells,
  cellWorldSize,
  colorFn,
  baseOpacity = 0.6,
}: InstancedHeatmapBarsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = cells.length;

  // Single unit box geometry — we scale per instance
  const geometry = useMemo(
    () => new THREE.BoxGeometry(1, 1, 1),
    []
  );

  const material = useMemo(
    () => new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: baseOpacity,
      emissiveIntensity: 0.25,
    }),
    [baseOpacity]
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || count === 0) return;

    const barW = cellWorldSize * 0.9;

    for (let i = 0; i < count; i++) {
      const cell = cells[i];

      // Position bar so bottom sits at y=0.003
      _obj.position.set(cell.x, cell.height / 2 + 0.003, -cell.z);
      _obj.scale.set(barW, cell.height, barW);
      _obj.updateMatrix();
      mesh.setMatrixAt(i, _obj.matrix);

      // Color based on energy (absolute) or intensity (fallback)
      const col = colorFn(cell.intensity, cell.energyJ ?? 0);
      _color.set(col);
      mesh.setColorAt(i, _color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [cells, count, cellWorldSize, colorFn]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
