import { create } from 'zustand';
import { flushSync } from 'react-dom';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  animatedToggle: (buttonEl: HTMLButtonElement | null) => void;
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
    animatedToggle: (buttonEl: HTMLButtonElement | null) => {
      const doToggle = () => {
        const next = get().mode === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        set({ mode: next });
      };

      if (!buttonEl || typeof document.startViewTransition !== 'function') {
        doToggle();
        return;
      }

      const { top, left, width, height } = buttonEl.getBoundingClientRect();
      const x = left + width / 2;
      const y = top + height / 2;
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const maxRadius = Math.hypot(
        Math.max(x, viewportWidth - x),
        Math.max(y, viewportHeight - y),
      );

      const transition = document.startViewTransition(() => {
        flushSync(doToggle);
      });

      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    },
  };
});
