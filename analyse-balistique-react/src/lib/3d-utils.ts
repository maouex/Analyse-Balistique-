import type { Impact, Point } from '../types';

export type View3DMode = 'cone' | 'heatmap' | 'trajectories' | 'penetration';

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
    label: 'Heatmap de densité',
    description: 'Carte de chaleur 3D montrant la densité des impacts sur la cible.',
    icon: '🌡',
  },
  {
    mode: 'trajectories',
    label: 'Trajectoires balistiques',
    description: 'Animation des plombs en vol du point de tir vers chaque impact.',
    icon: '💨',
  },
  {
    mode: 'penetration',
    label: 'Profil de pénétration',
    description: 'Vue en coupe montrant la profondeur de pénétration estimée des plombs.',
    icon: '🎯',
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
    case 1: return '#2ecc71';
    case 2: return '#f59f00';
    case 3: return '#e05252';
  }
}

export function getDistanceMeters(distanceStr: string): number {
  const match = distanceStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 35;
}
