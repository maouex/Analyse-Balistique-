import type {
  Point,
  Impact,
  AnalysisStats,
  ZoneStats,
  DistanceStats,
  DispersionCenter,
  DensityStats,
  CovarianceEllipse,
} from '../types';

// ─── Distance Calculation ───────────────────────────────────

export function distancePx(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function pxToCm(px: number, pixelsPerCm: number): number {
  return px / pixelsPerCm;
}

// ─── Zone Classification ────────────────────────────────────

export function classifyZone(
  distanceCm: number,
  zone1DiameterCm: number,
  zone2DiameterCm: number
): 1 | 2 | 3 {
  const r1 = zone1DiameterCm / 2;
  const r2 = zone2DiameterCm / 2;
  if (distanceCm <= r1) return 1;
  if (distanceCm <= r2) return 2;
  return 3;
}

// ─── Score Calculation ──────────────────────────────────────

export function calculateScore(zones: [ZoneStats, ZoneStats, ZoneStats], total: number): number {
  if (total === 0) return 0;
  const raw = (zones[0].count * 100 + zones[1].count * 60 + zones[2].count * 10) / (total * 100) * 100;
  return Math.round(raw);
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent groupement';
  if (score >= 60) return 'Bon groupement';
  if (score >= 40) return 'Groupement moyen';
  return 'Groupement dispersé';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#2ecc71';
  if (score >= 60) return '#f0a030';
  if (score >= 40) return '#d4a020';
  return '#e05252';
}

// ─── Distance Statistics ────────────────────────────────────

export function calculateDistanceStats(distances: number[]): DistanceStats {
  if (distances.length === 0) {
    return { mean: 0, min: 0, max: 0, stdDev: 0, cv: 0 };
  }

  const mean = distances.reduce((s, d) => s + d, 0) / distances.length;
  const min = Math.min(...distances);
  const max = Math.max(...distances);
  const variance = distances.reduce((s, d) => s + (d - mean) ** 2, 0) / distances.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  return { mean, min, max, stdDev, cv };
}

// ─── R90 Calculation ────────────────────────────────────────

export function calculateR90(distances: number[]): number {
  if (distances.length === 0) return 0;
  const sorted = [...distances].sort((a, b) => a - b);
  const idx = Math.ceil(0.9 * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

// ─── Dispersion Center ──────────────────────────────────────

export function calculateDispersionCenter(
  impacts: Impact[],
  center: Point,
  pixelsPerCm: number
): DispersionCenter {
  if (impacts.length === 0) return { cx: 0, cy: 0, r90: 0 };

  const meanX = impacts.reduce((s, p) => s + p.x, 0) / impacts.length;
  const meanY = impacts.reduce((s, p) => s + p.y, 0) / impacts.length;

  const cx = pxToCm(meanX - center.x, pixelsPerCm);
  const cy = pxToCm(meanY - center.y, pixelsPerCm);

  const distances = impacts.map((p) => pxToCm(distancePx(p, center), pixelsPerCm));
  const r90 = calculateR90(distances);

  return { cx, cy, r90 };
}

// ─── Covariance Ellipse (PCA) ───────────────────────────────

export function calculateCovarianceEllipse(
  impacts: Impact[],
  _pixelsPerCm: number
): CovarianceEllipse | null {
  if (impacts.length < 3) return null;

  // Mean position in pixel coordinates
  const meanX = impacts.reduce((s, p) => s + p.x, 0) / impacts.length;
  const meanY = impacts.reduce((s, p) => s + p.y, 0) / impacts.length;

  // Covariance matrix in pixel space
  let cxx = 0, cyy = 0, cxy = 0;
  for (const p of impacts) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    cxx += dx * dx;
    cyy += dy * dy;
    cxy += dx * dy;
  }
  cxx /= impacts.length;
  cyy /= impacts.length;
  cxy /= impacts.length;

  const trace = cxx + cyy;
  const det = cxx * cyy - cxy * cxy;
  const disc = Math.sqrt(Math.max(0, (trace / 2) ** 2 - det));

  const lambda1 = trace / 2 + disc;
  const lambda2 = trace / 2 - disc;

  // Semi-axes in pixels (not cm) — conversion happens at render time
  const semiMajor = Math.sqrt(Math.max(0, lambda1));
  const semiMinor = Math.sqrt(Math.max(0, lambda2));
  const angle = Math.atan2(2 * cxy, cxx - cyy) / 2;

  return {
    // Center in image pixel coordinates
    centerX: meanX,
    centerY: meanY,
    // Semi-axes in pixels
    semiMajor,
    semiMinor,
    angle,
  };
}

// ─── Full Analysis ──────────────────────────────────────────

export function computeFullAnalysis(
  impacts: Impact[],
  center: Point | null,
  circle1DiameterCm: number,
  circle2DiameterCm: number,
  pixelsPerCm: number | null
): AnalysisStats | null {
  if (!center || !pixelsPerCm || pixelsPerCm <= 0 || impacts.length === 0) return null;

  const distances = impacts.map((p) => pxToCm(distancePx(p, center), pixelsPerCm));

  const zones: [ZoneStats, ZoneStats, ZoneStats] = [
    { count: 0, percentage: 0 },
    { count: 0, percentage: 0 },
    { count: 0, percentage: 0 },
  ];

  for (const d of distances) {
    const z = classifyZone(d, circle1DiameterCm, circle2DiameterCm);
    zones[z - 1].count++;
  }

  const total = impacts.length;
  zones[0].percentage = (zones[0].count / total) * 100;
  zones[1].percentage = (zones[1].count / total) * 100;
  zones[2].percentage = (zones[2].count / total) * 100;

  const score = calculateScore(zones, total);
  const distStats = calculateDistanceStats(distances);
  const dispersion = calculateDispersionCenter(impacts, center, pixelsPerCm);
  const density: DensityStats = {
    pct50cm: zones[0].percentage,
    pct100cm: zones[0].percentage + zones[1].percentage,
    groupingCV: distStats.cv,
  };

  const ellipse = calculateCovarianceEllipse(impacts, pixelsPerCm);

  return {
    score,
    scoreLabel: getScoreLabel(score),
    zones,
    distances: distStats,
    dispersion,
    density,
    ellipse,
  };
}
