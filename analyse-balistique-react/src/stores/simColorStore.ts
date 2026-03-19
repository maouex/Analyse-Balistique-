import { create } from 'zustand';

const STORAGE_KEY = 'balistique_sim_colors';

export interface SimColors {
  sky: string;
  ground: string;
  gridMajor: string;
  gridMinor: string;
  pelletBase: string;
  pelletEmit: string;
  pelletTrail: string;
}

interface SimColorState {
  colors: SimColors;
  setColor: <K extends keyof SimColors>(key: K, value: string) => void;
  reset: () => void;
}

const DEFAULTS: SimColors = {
  sky:         '#5a6478',
  ground:      '#4a5468',
  gridMajor:   '#3d4558',
  gridMinor:   '#4e586c',
  pelletBase:  '#e8ecf4',
  pelletEmit:  '#ff9944',
  pelletTrail: '#667080',
};

function load(): SimColors {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULTS };
}

function save(c: SimColors) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
}

export const useSimColorStore = create<SimColorState>((set, get) => ({
  colors: load(),
  setColor: (key, value) => {
    const next = { ...get().colors, [key]: value };
    save(next);
    set({ colors: next });
  },
  reset: () => {
    const d = { ...DEFAULTS };
    save(d);
    set({ colors: d });
  },
}));
