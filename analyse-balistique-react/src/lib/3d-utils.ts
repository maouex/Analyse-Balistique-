import type { Impact, Point } from '../types';

export type View3DMode = 'cone' | 'heatmap' | 'energy' | 'trajectories' | 'cloud' | 'penetration' | 'multiDistance' | 'simulation';

export interface View3DConfig {
  mode: View3DMode;
  label: string;
  description: string;
  icon: string;
}

export const VIEW_3D_MODES: View3DConfig[] = [
  {
    mode: 'cone',
    label: 'Cône de dispersion',
    description: 'Visualise le cône de gerbe du canon vers la cible avec l\'ellipse de dispersion.',
    icon: '🔺',
  },
  {
    mode: 'heatmap',
    label: 'Densité',
    description: 'Carte de chaleur 3D montrant la densité des impacts sur la cible.',
    icon: '🌡',
  },
  {
    mode: 'energy',
    label: 'Carte d\'énergie',
    description: 'Énergie cinétique à l\'impact — zones létale, blessante et inefficace.',
    icon: '⚡',
  },
  {
    mode: 'trajectories',
    label: 'Trajectoires',
    description: 'Animation des plombs avec gradient de vitesse (rouge→bleu).',
    icon: '💨',
  },
  {
    mode: 'cloud',
    label: 'Nappe',
    description: 'Nuage de plombs animé montrant la dispersion progressive du canon à la cible.',
    icon: '☁️',
  },
  {
    mode: 'penetration',
    label: 'Pénétration',
    description: 'Vue en coupe du gel balistique avec cavités de blessure réalistes.',
    icon: '🎯',
  },
  {
    mode: 'multiDistance',
    label: 'Multi-distance',
    description: 'Comparaison du pattern à 3 distances différentes côte à côte.',
    icon: '📏',
  },
  {
    mode: 'simulation',
    label: 'Simulation',
    description: 'Simulation réaliste avec vue latérale, échelles 1:1 et timeline interactive.',
    icon: '🎬',
  },
];

export interface Impact3D {
  x: number; // horizontal (cm from center)
  y: number; // vertical (cm from center)
  z: number; // depth (penetration, cm)
  zone: 1 | 2 | 3;
  index: number;
  distanceCm: number;
}

export function impactsTo3D(
  impacts: Impact[],
  center: Point | null,
  pixelsPerCm: number | null,
  circle1DiamCm: number,
  circle2DiamCm: number,
  penetrationCm: number
): Impact3D[] {
  if (!center || !pixelsPerCm || pixelsPerCm <= 0) return [];

  return impacts.map((imp) => {
    const xCm = (imp.x - center.x) / pixelsPerCm;
    const yCm = (imp.y - center.y) / pixelsPerCm;
    const distCm = Math.sqrt(xCm * xCm + yCm * yCm);

    const zone: 1 | 2 | 3 =
      distCm <= circle1DiamCm / 2 ? 1 :
      distCm <= circle2DiamCm / 2 ? 2 : 3;

    // Penetration varies: center impacts penetrate more
    const maxDist = circle2DiamCm / 2;
    const normalizedDist = Math.min(distCm / maxDist, 1);
    const depth = penetrationCm * (1 - normalizedDist * 0.3);

    return {
      x: xCm,
      y: -yCm, // flip Y for 3D (Y-up)
      z: depth,
      zone,
      index: imp.index,
      distanceCm: distCm,
    };
  });
}

export function getZoneColor(zone: 1 | 2 | 3): string {
  switch (zone) {
    case 1: return '#00ff41';
    case 2: return '#ffaa00';
    case 3: return '#ff4444';
  }
}

export function getDistanceMeters(distanceStr: string): number {
  const match = distanceStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 35;
}
