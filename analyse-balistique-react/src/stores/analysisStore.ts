import { create } from 'zustand';
import type { Point, Impact, ToolMode, ScaleCalibration, CircleConfig, ImpactStyle, ViewState, SavedAnalysis } from '../types';
import { distancePx } from '../lib/ballistics';

interface AnalysisState {
  // Image
  image: HTMLImageElement | null;
  imageLoaded: boolean;

  // Tools
  activeMode: ToolMode;

  // Center & Impacts
  center: Point | null;
  impacts: Impact[];

  // Calibration
  scale: ScaleCalibration;

  // Circles
  circle1: CircleConfig;
  circle2: CircleConfig;

  // Impact Style
  impactStyle: ImpactStyle;

  // View
  view: ViewState;
  mousePos: Point | null;

  // Scale temp points
  scalePt1: Point | null;
  scalePt2: Point | null;

  // Actions
  setImage: (img: HTMLImageElement) => void;
  resetAnalysis: () => void;
  setMode: (mode: ToolMode) => void;
  setCenter: (point: Point) => void;
  addImpact: (point: Point) => void;
  undoImpact: () => void;
  setScalePoint: (point: Point) => void;
  clearScale: () => void;
  setScaleReference: (cm: number) => void;
  updateCircle1: (updates: Partial<CircleConfig>) => void;
  updateCircle2: (updates: Partial<CircleConfig>) => void;
  updateImpactStyle: (updates: Partial<ImpactStyle>) => void;
  setView: (updates: Partial<ViewState>) => void;
  setMousePos: (pos: Point | null) => void;
  fitToScreen: (canvasWidth: number, canvasHeight: number) => void;
  zoomAt: (delta: number, canvasX: number, canvasY: number) => void;

  // Project save/restore
  exportProject: () => SavedAnalysis | null;
  loadProject: (project: SavedAnalysis) => Promise<void>;
}

const defaultCircle1: CircleConfig = {
  visible: true,
  radiusPx: 150,
  diameterCm: 50,
  color: '#2ecc71',
};

const defaultCircle2: CircleConfig = {
  visible: true,
  radiusPx: 300,
  diameterCm: 100,
  color: '#f59f00',
};

const defaultImpactStyle: ImpactStyle = {
  radius: 6,
  color: '#e05252',
  showNumbers: true,
  showEllipse: true,
  ellipseColor: '#4dabf7',
};

const defaultScale: ScaleCalibration = {
  pt1: null,
  pt2: null,
  referenceCm: 30,
  pixelsPerCm: null,
};

function recalcCirclesFromScale(
  scale: ScaleCalibration,
  circle1: CircleConfig,
  circle2: CircleConfig
): { circle1: CircleConfig; circle2: CircleConfig } {
  if (!scale.pixelsPerCm) return { circle1, circle2 };
  return {
    circle1: { ...circle1, radiusPx: (circle1.diameterCm / 2) * scale.pixelsPerCm },
    circle2: { ...circle2, radiusPx: (circle2.diameterCm / 2) * scale.pixelsPerCm },
  };
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  image: null,
  imageLoaded: false,
  activeMode: 'move',
  center: null,
  impacts: [],
  scale: { ...defaultScale },
  circle1: { ...defaultCircle1 },
  circle2: { ...defaultCircle2 },
  impactStyle: { ...defaultImpactStyle },
  view: { zoom: 1, panX: 0, panY: 0 },
  mousePos: null,
  scalePt1: null,
  scalePt2: null,

  setImage: (img) =>
    set({
      image: img,
      imageLoaded: true,
      view: { zoom: 1, panX: 0, panY: 0 },
    }),

  resetAnalysis: () =>
    set({
      image: null,
      imageLoaded: false,
      activeMode: 'move',
      center: null,
      impacts: [],
      scale: { ...defaultScale },
      circle1: { ...defaultCircle1 },
      circle2: { ...defaultCircle2 },
      impactStyle: { ...defaultImpactStyle },
      view: { zoom: 1, panX: 0, panY: 0 },
      mousePos: null,
      scalePt1: null,
      scalePt2: null,
    }),

  setMode: (mode) => set({ activeMode: mode }),

  setCenter: (point) => set({ center: point }),

  addImpact: (point) =>
    set((s) => ({
      impacts: [...s.impacts, { ...point, id: crypto.randomUUID(), index: s.impacts.length + 1 }],
    })),

  undoImpact: () =>
    set((s) => ({ impacts: s.impacts.slice(0, -1) })),

  setScalePoint: (point) => {
    const state = get();
    if (!state.scalePt1) {
      set({ scalePt1: point });
    } else if (!state.scalePt2) {
      const px = distancePx(state.scalePt1, point);
      const pixelsPerCm = px / state.scale.referenceCm;
      const newScale: ScaleCalibration = {
        ...state.scale,
        pt1: state.scalePt1,
        pt2: point,
        pixelsPerCm,
      };
      const circles = recalcCirclesFromScale(newScale, state.circle1, state.circle2);
      set({
        scalePt2: point,
        scale: newScale,
        ...circles,
        activeMode: 'impact',
      });
    }
  },

  clearScale: () =>
    set({
      scalePt1: null,
      scalePt2: null,
      scale: { ...defaultScale },
      circle1: { ...defaultCircle1 },
      circle2: { ...defaultCircle2 },
    }),

  setScaleReference: (cm) => {
    const state = get();
    const newScale = { ...state.scale, referenceCm: cm };
    if (newScale.pt1 && newScale.pt2) {
      const px = distancePx(newScale.pt1, newScale.pt2);
      newScale.pixelsPerCm = px / cm;
    }
    const circles = recalcCirclesFromScale(newScale, state.circle1, state.circle2);
    set({ scale: newScale, ...circles });
  },

  updateCircle1: (updates) => set((s) => {
    const c = { ...s.circle1, ...updates };
    if (updates.diameterCm && s.scale.pixelsPerCm) {
      c.radiusPx = (updates.diameterCm / 2) * s.scale.pixelsPerCm;
    }
    return { circle1: c };
  }),

  updateCircle2: (updates) => set((s) => {
    const c = { ...s.circle2, ...updates };
    if (updates.diameterCm && s.scale.pixelsPerCm) {
      c.radiusPx = (updates.diameterCm / 2) * s.scale.pixelsPerCm;
    }
    return { circle2: c };
  }),

  updateImpactStyle: (updates) =>
    set((s) => ({ impactStyle: { ...s.impactStyle, ...updates } })),

  setView: (updates) =>
    set((s) => ({ view: { ...s.view, ...updates } })),

  setMousePos: (pos) => set({ mousePos: pos }),

  fitToScreen: (canvasWidth, canvasHeight) => {
    const img = get().image;
    if (!img) return;
    const scaleX = canvasWidth / img.width;
    const scaleY = canvasHeight / img.height;
    const zoom = Math.min(scaleX, scaleY) * 0.95;
    const panX = (canvasWidth - img.width * zoom) / 2;
    const panY = (canvasHeight - img.height * zoom) / 2;
    set({ view: { zoom, panX, panY } });
  },

  zoomAt: (delta, canvasX, canvasY) => {
    const { view } = get();
    const factor = delta > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.05, Math.min(10, view.zoom * factor));
    const panX = canvasX - (canvasX - view.panX) * (newZoom / view.zoom);
    const panY = canvasY - (canvasY - view.panY) * (newZoom / view.zoom);
    set({ view: { zoom: newZoom, panX, panY } });
  },

  exportProject: () => {
    const state = get();
    if (!state.image) return null;

    // Convert current image to dataURL
    const canvas = document.createElement('canvas');
    canvas.width = state.image.width;
    canvas.height = state.image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(state.image, 0, 0);
    const imageDataUrl = canvas.toDataURL('image/png');

    return {
      imageDataUrl,
      center: state.center,
      impacts: state.impacts,
      scale: state.scale,
      circle1: state.circle1,
      circle2: state.circle2,
    };
  },

  loadProject: async (project) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        set({
          image: img,
          imageLoaded: true,
          center: project.center,
          impacts: project.impacts,
          scale: project.scale,
          circle1: project.circle1,
          circle2: project.circle2,
          scalePt1: project.scale.pt1,
          scalePt2: project.scale.pt2,
          activeMode: 'impact',
          view: { zoom: 1, panX: 0, panY: 0 },
        });
        resolve();
      };
      img.src = project.imageDataUrl;
    });
  },
}));
