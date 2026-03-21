import { create } from 'zustand';
import type { Point, Impact, ToolMode, ScaleCalibration, CircleConfig, ImpactStyle, ViewState, SavedAnalysis } from '../types';
import { distancePx } from '../lib/ballistics';
import { saveImage, loadImage } from '../lib/imageDB';

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
  scalePromptOpen: boolean;

  // Actions
  setImage: (img: HTMLImageElement) => void;
  resetAnalysis: () => void;
  setMode: (mode: ToolMode) => void;
  setCenter: (point: Point) => void;
  addImpact: (point: Point) => void;
  addImpacts: (points: Point[]) => void;
  removeImpact: (id: string) => void;
  removeImpactsInRadius: (center: Point, radiusPx: number) => void;
  clearImpacts: () => void;
  undoImpact: () => void;
  setScalePoint: (point: Point) => void;
  confirmScale: (cm: number) => void;
  cancelScale: () => void;
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
  exportProject: () => Promise<SavedAnalysis | null>;
  loadProject: (project: SavedAnalysis) => Promise<void>;
}

const defaultCircle1: CircleConfig = {
  visible: true,
  radiusPx: 150,
  diameterCm: 50,
  color: '#00ff41',
};

const defaultCircle2: CircleConfig = {
  visible: true,
  radiusPx: 300,
  diameterCm: 100,
  color: '#ffaa00',
};

const defaultImpactStyle: ImpactStyle = {
  radius: 6,
  color: '#ff4444',
  showNumbers: true,
  showEllipse: true,
  ellipseColor: '#44aaff',
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
  scalePromptOpen: false,

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
      scalePromptOpen: false,
    }),

  setMode: (mode) => set({ activeMode: mode }),

  setCenter: (point) => set({ center: point }),

  addImpact: (point) =>
    set((s) => ({
      impacts: [...s.impacts, { ...point, id: crypto.randomUUID(), index: s.impacts.length + 1 }],
    })),

  addImpacts: (points) =>
    set((s) => ({
      impacts: [
        ...s.impacts,
        ...points.map((p, i) => ({
          ...p,
          id: crypto.randomUUID(),
          index: s.impacts.length + i + 1,
        })),
      ],
    })),

  removeImpact: (id) =>
    set((s) => ({
      impacts: s.impacts
        .filter((imp) => imp.id !== id)
        .map((imp, i) => ({ ...imp, index: i + 1 })),
    })),

  removeImpactsInRadius: (center, radiusPx) =>
    set((s) => ({
      impacts: s.impacts
        .filter((imp) => {
          const dx = imp.x - center.x;
          const dy = imp.y - center.y;
          return dx * dx + dy * dy > radiusPx * radiusPx;
        })
        .map((imp, i) => ({ ...imp, index: i + 1 })),
    })),

  clearImpacts: () => set({ impacts: [] }),

  undoImpact: () =>
    set((s) => ({ impacts: s.impacts.slice(0, -1) })),

  setScalePoint: (point) => {
    const state = get();
    if (!state.scalePt1) {
      set({ scalePt1: point });
    } else if (!state.scalePt2) {
      // Store 2nd point and open the prompt for real-world distance
      set({ scalePt2: point, scalePromptOpen: true });
    }
  },

  confirmScale: (cm) => {
    const state = get();
    if (!state.scalePt1 || !state.scalePt2) return;
    const px = distancePx(state.scalePt1, state.scalePt2);
    const pixelsPerCm = px / cm;
    const newScale: ScaleCalibration = {
      ...state.scale,
      referenceCm: cm,
      pt1: state.scalePt1,
      pt2: state.scalePt2,
      pixelsPerCm,
    };
    const circles = recalcCirclesFromScale(newScale, state.circle1, state.circle2);
    set({
      scale: newScale,
      ...circles,
      scalePromptOpen: false,
      activeMode: 'center',
    });
  },

  cancelScale: () => {
    set({ scalePt1: null, scalePt2: null, scalePromptOpen: false });
  },

  clearScale: () =>
    set({
      scalePt1: null,
      scalePt2: null,
      scalePromptOpen: false,
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

  exportProject: async () => {
    const state = get();
    if (!state.image) return null;

    // Generate unique ID for this image
    const imageId = Date.now().toString(36) + Math.random().toString(16).slice(2, 8);

    // Convert image to dataURL and store in IndexedDB (no size limit)
    const canvas = document.createElement('canvas');
    canvas.width = state.image.width;
    canvas.height = state.image.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(state.image, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    await saveImage(imageId, dataUrl);

    return {
      imageId,
      center: state.center,
      impacts: state.impacts,
      scale: state.scale,
      circle1: state.circle1,
      circle2: state.circle2,
    };
  },

  loadProject: async (project) => {
    // Load image from IndexedDB
    const dataUrl = await loadImage(project.imageId);
    if (!dataUrl) return;

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
      img.src = dataUrl;
    });
  },
}));
