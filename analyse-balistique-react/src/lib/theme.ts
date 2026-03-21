export const theme = {
  colors: {
    bg: '#010a01',
    surface: '#041208',
    surface2: '#061a0c',
    surface3: '#0a2210',
    border: 'rgba(0, 255, 65, 0.12)',
    borderLight: 'rgba(0, 255, 65, 0.2)',
    accent: '#00cc33',
    accent2: '#00ff41',
    accentGlow: 'rgba(0, 255, 65, 0.28)',
    green: '#00ff41',
    red: '#ff4444',
    amber: '#ffaa00',
    blue: '#44aaff',
    text: '#c8ffc8',
    textSecondary: 'rgba(0, 255, 65, 0.5)',
    muted: 'rgba(0, 255, 65, 0.3)',
    white: '#ffffff',
  },
  radius: {
    sm: '2px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  },
  shadows: {
    sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
    md: '0 4px 16px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
    glow: '0 0 20px rgba(0, 255, 65, 0.3)',
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
