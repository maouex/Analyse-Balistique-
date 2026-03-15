/** Shared 3D visualization constants */
export const WORLD_SCALE = 0.01;        // cm → Three.js world units
export const DEPTH_SCALE = 0.015;       // penetration depth scaling
export const DEFAULT_PELLET_RADIUS = 0.008; // fallback pellet sphere radius

/** Derive metallic pellet radius from ballistic params */
export function pelletWorldRadius(pelletDiamMm: number | undefined): number {
  if (!pelletDiamMm) return DEFAULT_PELLET_RADIUS;
  return Math.max(0.005, (pelletDiamMm / 2) * WORLD_SCALE * 0.7);
}
