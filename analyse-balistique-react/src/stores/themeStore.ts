import { create } from 'zustand';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
}

const STORAGE_KEY = 'balistique_theme';

function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* ignore */ }
  return 'dark';
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem(STORAGE_KEY, mode);
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const initial = getInitialTheme();
  applyTheme(initial);

  return {
    mode: initial,
    toggle: () => {
      const next = get().mode === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      set({ mode: next });
    },
  };
});
