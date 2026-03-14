import { useMemo } from 'react';
import * as THREE from 'three';
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

    const cells: { x: number; z: number; height: number; intensity: number; cmX: number; cmY: number }[] = [];
    for (let gy = 0; gy < GRID_RES; gy++) {
      for (let gx = 0; gx < GRID_RES; gx++) {
        const intensity = grid[gy][gx] / maxVal;
        if (intensity < 0.02) continue;
        const cmX = -extent + gx * cellSize + cellSize / 2;
        const cmY = -extent + gy * cellSize + cellSize / 2;
        cells.push({
          x: cmX * SCALE,
          z: cmY * SCALE,
          height: intensity * 0.3,
          intensity,
          cmX,
          cmY,
        });
      }
    }

    // Compute the max bar height at each circle's radius to position hoops
    const tolerance = cellSize * 1.2; // how close a bar center must be to the ring
    let maxHeightAtR1 = 0;
    let maxHeightAtR2 = 0;
    for (const cell of cells) {
      const dist = Math.sqrt(cell.cmX * cell.cmX + cell.cmY * cell.cmY);
      if (Math.abs(dist - circle1RadiusCm) < tolerance) {
        maxHeightAtR1 = Math.max(maxHeightAtR1, cell.height);
      }
      if (Math.abs(dist - circle2RadiusCm) < tolerance) {
        maxHeightAtR2 = Math.max(maxHeightAtR2, cell.height);
      }
    }

    return { cells, cellSize: cellSize * SCALE, hoopY1: maxHeightAtR1 + 0.005, hoopY2: maxHeightAtR2 + 0.005 };
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

      {/* Circle hoops sitting on top of bars */}
      {heatmapData && (
        <>
          {/* Circle 1 hoop (50cm) */}
          <mesh
            position={[0, heatmapData.hoopY1, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[circle1RadiusCm * SCALE, 0.004, 12, 64]} />
            <meshStandardMaterial
              color="#2ecc71"
              emissive="#2ecc71"
              emissiveIntensity={0.4}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Text
            position={[circle1RadiusCm * SCALE + 0.02, heatmapData.hoopY1 + 0.015, 0]}
            fontSize={0.03}
            color="#2ecc71"
            anchorX="left"
          >
            {`∅${circle1RadiusCm * 2}cm`}
          </Text>

          {/* Circle 2 hoop (100cm) */}
          <mesh
            position={[0, heatmapData.hoopY2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[circle2RadiusCm * SCALE, 0.004, 12, 64]} />
            <meshStandardMaterial
              color="#f59f00"
              emissive="#f59f00"
              emissiveIntensity={0.4}
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
          <Text
            position={[circle2RadiusCm * SCALE + 0.02, heatmapData.hoopY2 + 0.015, 0]}
            fontSize={0.03}
            color="#f59f00"
            anchorX="left"
          >
            {`∅${circle2RadiusCm * 2}cm`}
          </Text>
        </>
      )}

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

      {/* Legend - elevated above bars */}
      <group position={[circle2RadiusCm * SCALE * 1.3, 0.35, 0]}>
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
