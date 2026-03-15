import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { TargetPlane } from './TargetPlane';
import type { Impact3D } from '../../lib/3d-utils';
import type { BallisticParams, SimulationResult } from '../../lib/ballistics-sim';

interface EnergyHeatmapModeProps {
  impacts: Impact3D[];
  circle1RadiusCm: number;
  circle2RadiusCm: number;
  ballisticParams: BallisticParams | null;
  simResult: SimulationResult | null;
}

const SCALE = 0.01;
const GRID_RES = 40;

// Energy thresholds (Joules)
const LETHAL_J = 5;      // Sufficient to kill small game
const WOUNDING_J = 2;    // Can cause significant wound
const MINIMUM_J = 0.5;   // Minimum effective energy

function getEnergyColor(energyJ: number): string {
  if (energyJ >= LETHAL_J) return '#ff1744';      // Red - lethal
  if (energyJ >= WOUNDING_J) return '#ff9100';     // Orange - wounding
  if (energyJ >= MINIMUM_J) return '#ffea00';      // Yellow - marginal
  return '#2979ff';                                  // Blue - ineffective
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

  const heatmapData = useMemo(() => {
    if (impacts.length === 0) return null;

    const extent = circle2RadiusCm * 1.2;
    const cellSize = (extent * 2) / GRID_RES;

    // Build per-impact energy values
    const impactEnergies = impacts.map((_, i) => {
      if (enhanced && simResult!.pellets[i]) {
        return simResult!.pellets[i].energyJoules;
      }
      // Fallback: estimate from zone (rough approximation)
      return [8, 4, 1.5][impacts[i].zone - 1];
    });

    // Gaussian kernel weighted by energy
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
          const dist2 = dx * dx + dy * dy;
          grid[gy][gx] += energy * Math.exp(-dist2 / sigma2);
        }
      }
    }

    // Find max for normalization
    let maxVal = 0;
    for (const row of grid) for (const v of row) if (v > maxVal) maxVal = v;
    if (maxVal === 0) maxVal = 1;

    const cells: { x: number; z: number; height: number; energyJ: number }[] = [];
    for (let gy = 0; gy < GRID_RES; gy++) {
      for (let gx = 0; gx < GRID_RES; gx++) {
        const energyJ = grid[gy][gx];
        if (energyJ < 0.1) continue;
        const cmX = -extent + gx * cellSize + cellSize / 2;
        const cmY = -extent + gy * cellSize + cellSize / 2;
        const normalized = energyJ / maxVal;
        cells.push({
          x: cmX * SCALE,
          z: cmY * SCALE,
          height: normalized * 0.35,
          energyJ,
        });
      }
    }

    return { cells, cellSize: cellSize * SCALE };
  }, [impacts, circle1RadiusCm, circle2RadiusCm, enhanced, simResult]);

  return (
    <group>
      <TargetPlane
        circle1RadiusCm={circle1RadiusCm}
        circle2RadiusCm={circle2RadiusCm}
        scale={SCALE}
      />

      {/* Energy bars */}
      {heatmapData?.cells.map((cell, i) => {
        const color = getEnergyColor(cell.energyJ);
        return (
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
              color={color}
              transparent
              opacity={0.6 + (cell.height / 0.35) * 0.3}
              emissive={color}
              emissiveIntensity={(cell.height / 0.35) * 0.4}
            />
          </mesh>
        );
      })}

      {/* Impact pellets with energy color */}
      {impacts.map((imp, i) => {
        const energy = enhanced && simResult!.pellets[i]
          ? simResult!.pellets[i].energyJoules
          : [8, 4, 1.5][imp.zone - 1];
        const color = getEnergyColor(energy);
        return (
          <group key={imp.index}>
            <mesh position={[imp.x * SCALE, 0.36, -imp.y * SCALE]}>
              <sphereGeometry args={[0.01, 10, 10]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.6}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            {/* Energy label for first few */}
            {imp.index <= 4 && (
              <Text
                position={[imp.x * SCALE + 0.02, 0.36, -imp.y * SCALE]}
                fontSize={0.018}
                color={color}
                anchorX="left"
              >
                {`${energy.toFixed(1)}J`}
              </Text>
            )}
          </group>
        );
      })}

      {/* Legend */}
      <group position={[circle2RadiusCm * SCALE * 1.3, 0.35, 0]}>
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

      {/* Stats overlay */}
      {enhanced && simResult && (
        <group position={[-circle2RadiusCm * SCALE * 1.3, 0.35, 0]}>
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
