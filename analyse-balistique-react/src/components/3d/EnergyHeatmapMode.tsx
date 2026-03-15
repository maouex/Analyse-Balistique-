import { useMemo, useCallback } from 'react';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import { InstancedPellets } from './InstancedPellets';
import { InstancedHeatmapBars } from './InstancedHeatmapBars';
import type { Impact3D } from '../../lib/3d-utils';
import type { SimulationResult } from '../../lib/ballistics-sim';
import { WORLD_SCALE } from './constants';

interface EnergyHeatmapModeProps {
  impacts: Impact3D[];
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  ballisticParams: { pelletDiameterMm: number } | null;
  simResult: SimulationResult | null;
}

const GRID_RES = 40;
const LETHAL_J = 5;
const WOUNDING_J = 2;
const MINIMUM_J = 0.5;

function getEnergyColor(energyJ: number): string {
  if (energyJ >= LETHAL_J) return '#ff1744';
  if (energyJ >= WOUNDING_J) return '#ff9100';
  if (energyJ >= MINIMUM_J) return '#ffea00';
  return '#2979ff';
}

function getEnergyLabel(energyJ: number): string {
  if (energyJ >= LETHAL_J) return 'Létal';
  if (energyJ >= WOUNDING_J) return 'Blessant';
  if (energyJ >= MINIMUM_J) return 'Marginal';
  return 'Inefficace';
}

export function EnergyHeatmapMode({
  impacts,
  circle1RadiusCm,
  circle2RadiusCm,
  ballisticParams,
  simResult,
}: EnergyHeatmapModeProps) {
  const enhanced = !!ballisticParams && !!simResult;

  // Pre-compute per-impact energy values (stable reference)
  const impactEnergies = useMemo(() =>
    impacts.map((imp, i) => {
      if (enhanced && simResult!.pellets[i]) return simResult!.pellets[i].energyJoules;
      return [8, 4, 1.5][imp.zone - 1];
    }),
    [impacts, enhanced, simResult]
  );

  // Fixed max energy reference for absolute scaling (not self-normalized)
  const maxEnergyRef = useMemo(() => {
    if (enhanced && simResult) {
      // Use muzzle energy as the theoretical max for scaling
      const maxPelletE = Math.max(...simResult.pellets.map(p => p.energyJoules), 1);
      // Kernel accumulation can stack overlapping pellets, so allow headroom
      return maxPelletE * 2.5;
    }
    return 20; // Default: 20J reference scale for non-enhanced mode
  }, [enhanced, simResult]);

  const heatmapData = useMemo(() => {
    if (impacts.length === 0) return null;

    const extent = circle2RadiusCm * 1.2;
    const cellSize = (extent * 2) / GRID_RES;

    const sigma = circle1RadiusCm * 0.35;
    const sigma2 = 2 * sigma * sigma;
    const grid: number[][] = Array.from({ length: GRID_RES }, () => Array(GRID_RES).fill(0));

    for (let idx = 0; idx < impacts.length; idx++) {
      const imp = impacts[idx];
      const energy = impactEnergies[idx];
      for (let gy = 0; gy < GRID_RES; gy++) {
        for (let gx = 0; gx < GRID_RES; gx++) {
          const cx = -extent + gx * cellSize + cellSize / 2;
          const cy = -extent + gy * cellSize + cellSize / 2;
          const dx = cx - imp.x;
          const dy = cy - imp.y;
          grid[gy][gx] += energy * Math.exp(-(dx * dx + dy * dy) / sigma2);
        }
      }
    }

    // Use FIXED energy reference for bar heights — NOT self-normalized
    const cells: { x: number; z: number; height: number; intensity: number; energyJ: number }[] = [];
    for (let gy = 0; gy < GRID_RES; gy++) {
      for (let gx = 0; gx < GRID_RES; gx++) {
        const energyJ = grid[gy][gx];
        if (energyJ < 0.05) continue;
        const cmX = -extent + gx * cellSize + cellSize / 2;
        const cmY = -extent + gy * cellSize + cellSize / 2;
        // Absolute scaling: bar height proportional to actual energy
        const absRatio = Math.min(energyJ / maxEnergyRef, 1);
        cells.push({
          x: cmX * WORLD_SCALE,
          z: cmY * WORLD_SCALE,
          height: absRatio * 0.4 + 0.005, // min visible height
          intensity: absRatio,
          energyJ,
        });
      }
    }

    return { cells, cellSize: cellSize * WORLD_SCALE };
  }, [impacts, circle1RadiusCm, circle2RadiusCm, impactEnergies, maxEnergyRef]);

  // Color function for instanced bars: use ACTUAL energy (Joules) for thresholds
  const energyColorFn = useCallback((_intensity: number, energyJ: number) => {
    if (energyJ >= LETHAL_J) return '#ff1744';      // ≥ 5J — lethal
    if (energyJ >= WOUNDING_J) return '#ff9100';     // ≥ 2J — wounding
    if (energyJ >= MINIMUM_J) return '#ffea00';      // ≥ 0.5J — marginal
    return '#2979ff';                                 // < 0.5J — ineffective
  }, []);

  // Color function for instanced pellets
  const pelletColorFn = useCallback((_imp: Impact3D, i: number) => {
    return getEnergyColor(impactEnergies[i] ?? 0);
  }, [impactEnergies]);

  return (
    <group>
      <TargetPlane circle1RadiusCm={circle1RadiusCm} circle2RadiusCm={circle2RadiusCm} scale={WORLD_SCALE} />

      {/* Instanced energy bars (1 draw call) */}
      {heatmapData && (
        <InstancedHeatmapBars
          cells={heatmapData.cells}
          cellWorldSize={heatmapData.cellSize}
          colorFn={energyColorFn}
          baseOpacity={0.7}
        />
      )}

      {/* Instanced pellets with energy coloring (1 draw call) */}
      <InstancedPellets
        impacts={impacts}
        yOffset={0.36}
        pelletRadius={0.01}
        colorFn={pelletColorFn}
        metalness={0.7}
        roughness={0.3}
        emissiveIntensity={0.6}
      />

      {/* Energy labels for first few impacts */}
      {impacts.slice(0, 5).map((imp, i) => {
        const energy = impactEnergies[i];
        return (
          <Text
            key={imp.index}
            position={[imp.x * WORLD_SCALE + 0.02, 0.36, -imp.y * WORLD_SCALE]}
            fontSize={0.018}
            color={getEnergyColor(energy)}
            anchorX="left"
          >
            {`${energy.toFixed(1)}J`}
          </Text>
        );
      })}

      {/* Legend */}
      <group position={[circle2RadiusCm * WORLD_SCALE * 1.3, 0.35, 0]}>
        <Text position={[0, 0.14, 0]} fontSize={0.032} color="#dde0e8" anchorX="left" fontWeight="bold">
          Carte d'énergie
        </Text>
        {[
          { label: `Létal (>${LETHAL_J}J)`, color: '#ff1744', y: 0.1 },
          { label: `Blessant (>${WOUNDING_J}J)`, color: '#ff9100', y: 0.07 },
          { label: `Marginal (>${MINIMUM_J}J)`, color: '#ffea00', y: 0.04 },
          { label: 'Inefficace', color: '#2979ff', y: 0.01 },
        ].map(({ label, color, y }) => (
          <group key={label} position={[0, y, 0]}>
            <mesh position={[0.01, 0, 0]}>
              <boxGeometry args={[0.015, 0.015, 0.015]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
            </mesh>
            <Text position={[0.03, 0, 0]} fontSize={0.02} color="#a0a4b8" anchorX="left">
              {label}
            </Text>
          </group>
        ))}
      </group>

      {/* Stats */}
      {enhanced && simResult && (
        <group position={[-circle2RadiusCm * WORLD_SCALE * 1.3, 0.35, 0]}>
          <Text position={[0, 0.1, 0]} fontSize={0.025} color="#a0a4b8" anchorX="right">
            {`É moy: ${simResult.avgEnergy.toFixed(2)}J`}
          </Text>
          <Text position={[0, 0.07, 0]} fontSize={0.025} color="#a0a4b8" anchorX="right">
            {`Efficacité: ${getEnergyLabel(simResult.avgEnergy)}`}
          </Text>
          <Text position={[0, 0.04, 0]} fontSize={0.025} color="#a0a4b8" anchorX="right">
            {`V impact: ${simResult.avgImpactVelocity.toFixed(0)} m/s`}
          </Text>
        </group>
      )}
    </group>
  );
}
