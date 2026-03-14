import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import type { Impact3D } from '../../lib/3d-utils';

interface HeatmapModeProps {
  impacts: Impact3D[];
  circle1RadiusCm: number;
  circle2RadiusCm: number;
}

const SCALE = 0.01;
const GRID_RES = 40;

export function HeatmapMode({ impacts, circle1RadiusCm, circle2RadiusCm }: HeatmapModeProps) {
  const heatmapData = useMemo(() => {
    if (impacts.length === 0) return null;

    const extent = circle2RadiusCm * 1.2;
    const cellSize = (extent * 2) / GRID_RES;
    const grid: number[][] = Array.from({ length: GRID_RES }, () => Array(GRID_RES).fill(0));

    // Gaussian kernel for each impact
    const sigma = circle1RadiusCm * 0.3;
    const sigma2 = 2 * sigma * sigma;

    for (const imp of impacts) {
      for (let gy = 0; gy < GRID_RES; gy++) {
        for (let gx = 0; gx < GRID_RES; gx++) {
          const cx = -extent + gx * cellSize + cellSize / 2;
          const cy = -extent + gy * cellSize + cellSize / 2;
          const dx = cx - imp.x;
          const dy = cy - imp.y;
          const dist2 = dx * dx + dy * dy;
          grid[gy][gx] += Math.exp(-dist2 / sigma2);
        }
      }
    }

    // Normalize
    let maxVal = 0;
    for (const row of grid) for (const v of row) if (v > maxVal) maxVal = v;
    if (maxVal === 0) maxVal = 1;

    const cells: { x: number; z: number; height: number; intensity: number }[] = [];
    for (let gy = 0; gy < GRID_RES; gy++) {
      for (let gx = 0; gx < GRID_RES; gx++) {
        const intensity = grid[gy][gx] / maxVal;
        if (intensity < 0.02) continue;
        cells.push({
          x: (-extent + gx * cellSize + cellSize / 2) * SCALE,
          z: (-extent + gy * cellSize + cellSize / 2) * SCALE,
          height: intensity * 0.3,
          intensity,
        });
      }
    }

    return { cells, cellSize: cellSize * SCALE };
  }, [impacts, circle1RadiusCm, circle2RadiusCm]);

  const getHeatColor = (intensity: number): string => {
    if (intensity > 0.7) return '#ff2222';
    if (intensity > 0.5) return '#ff6600';
    if (intensity > 0.3) return '#ffaa00';
    if (intensity > 0.15) return '#ffdd44';
    return '#2266ff';
  };

  return (
    <group>
      <TargetPlane
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
        scale={SCALE}
      />

      {/* Heatmap bars */}
      {heatmapData?.cells.map((cell, i) => (
        <mesh
          key={i}
          position={[cell.x, cell.height / 2 + 0.003, -cell.z]}
        >
          <boxGeometry args={[
            heatmapData.cellSize * 0.9,
            cell.height,
            heatmapData.cellSize * 0.9,
          ]} />
          <meshStandardMaterial
            color={getHeatColor(cell.intensity)}
            transparent
            opacity={0.5 + cell.intensity * 0.4}
            emissive={getHeatColor(cell.intensity)}
            emissiveIntensity={cell.intensity * 0.3}
          />
        </mesh>
      ))}

      {/* Impact points on top */}
      {impacts.map((imp) => (
        <mesh
          key={imp.index}
          position={[imp.x * SCALE, 0.32, -imp.y * SCALE]}
        >
          <sphereGeometry args={[0.008, 10, 10]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Legend */}
      <group position={[circle2RadiusCm * SCALE * 1.3, 0.15, 0]}>
        <Text position={[0, 0.12, 0]} fontSize={0.03} color="#dde0e8" anchorX="left">
          Densité d'impacts
        </Text>
        {[
          { label: 'Très dense', color: '#ff2222', y: 0.08 },
          { label: 'Dense', color: '#ff6600', y: 0.05 },
          { label: 'Moyen', color: '#ffaa00', y: 0.02 },
          { label: 'Faible', color: '#2266ff', y: -0.01 },
        ].map(({ label, color, y }) => (
          <group key={label} position={[0, y, 0]}>
            <mesh position={[0.01, 0, 0]}>
              <boxGeometry args={[0.015, 0.015, 0.015]} />
              <meshStandardMaterial color={color} />
            </mesh>
            <Text position={[0.03, 0, 0]} fontSize={0.02} color="#a0a4b8" anchorX="left">
              {label}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );
}
