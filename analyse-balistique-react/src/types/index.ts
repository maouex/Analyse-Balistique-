// ─── Core Types ─────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Impact extends Point {
  id: string;
  index: number;
}

export type ToolMode = 'center' | 'impact' | 'move' | 'scale' | 'eraser';

export interface ScaleCalibration {
  pt1: Point | null;
  pt2: Point | null;
  referenceCm: number;
  pixelsPerCm: number | null;
}

export interface CircleConfig {
  visible: boolean;
  radiusPx: number;
  diameterCm: number;
  color: string;
}

export interface ImpactStyle {
  radius: number;
  color: string;
  showNumbers: boolean;
  showEllipse: boolean;
  ellipseColor: string;
}

export interface ViewState {
  zoom: number;
  panX: number;
  panY: number;
}

// ─── Statistics ─────────────────────────────────────────────

export interface ZoneStats {
  count: number;
  percentage: number;
}

export interface DistanceStats {
  mean: number;
  min: number;
  max: number;
  stdDev: number;
  cv: number;
}

export interface DispersionCenter {
  cx: number;
  cy: number;
  r90: number;
}

export interface DensityStats {
  pct50cm: number;
  pct100cm: number;
  groupingCV: number;
}

export interface CovarianceEllipse {
  centerX: number;
  centerY: number;
  semiMajor: number;
  semiMinor: number;
  angle: number;
}

export interface AnalysisStats {
  score: number;
  scoreLabel: string;
  zones: [ZoneStats, ZoneStats, ZoneStats];
  distances: DistanceStats;
  dispersion: DispersionCenter;
  density: DensityStats;
  ellipse: CovarianceEllipse | null;
}

// ─── Munitions Database ─────────────────────────────────────

export interface AnalysisSnapshot {
  nbImpacts: number;
  impacts50cm: number;
  impacts100cm: number;
  pct50cm: string;
  pct100cm: string;
  dispMoy: number;
  r90: number;
  score: number;
}

// Serializable analysis project (everything needed to restore)
export interface SavedAnalysis {
  imageId: string; // reference to image in IndexedDB
  center: Point | null;
  impacts: Impact[];
  scale: ScaleCalibration;
  circle1: CircleConfig;
  circle2: CircleConfig;
}

export interface Munition {
  id: string;
  nom: string;
  fabricant: string;
  distributeur: string;
  calibre: string;
  prix: number;
  taillesDispo: string[];
  tailleTestee: string;
  vitesseOfficielle: number;
  vitesseMesuree: number;
  bourre: string;
  douille: string;
  poudre: string;
  distance: string;
  choke: string;
  fusil: string;
  penetration: number;
  notes: string;
  snap: AnalysisSnapshot | null;
  savedAnalysis: SavedAnalysis | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Export Options ─────────────────────────────────────────

export interface ExportOptions {
  showCircle1: boolean;
  showCircle2: boolean;
  showImpacts: boolean;
  showNumbers: boolean;
  showEllipse: boolean;
  circle1Color: string;
  circle2Color: string;
  impactColor: string;
  ellipseColor: string;
}

// ─── Tutorial ───────────────────────────────────────────────

export interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}
