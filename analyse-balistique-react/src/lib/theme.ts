export const theme = {
  colors: {
    bg: '#10121a',
    surface: '#191c25',
    surface2: '#20232e',
    surface3: '#282b38',
    border: '#2b2f3d',
    borderLight: '#363a4d',
    accent: '#c8860a',
    accent2: '#f0a030',
    accentGlow: 'rgba(200, 134, 10, 0.28)',
    green: '#2ecc71',
    red: '#e05252',
    amber: '#f59f00',
    blue: '#4dabf7',
    text: '#dde0e8',
    textSecondary: '#a0a4b8',
    muted: '#606474',
    white: '#ffffff',
  },
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
    xl: '20px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.2)',
    md: '0 4px 16px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(200, 134, 10, 0.3)',
  },
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  breakpoints: {
    mobile: '680px',
    tablet: '900px',
  },
} as const;

export type Theme = typeof theme;
