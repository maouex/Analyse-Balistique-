interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: number;
}

export function SAGLogo({ size = 40, showText = false, textSize = 18 }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent2)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <linearGradient id="logo-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent3)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
          <filter id="logo-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer scope ring */}
        <circle cx="50" cy="50" r="44" stroke="url(#logo-ring)" strokeWidth="3" opacity="0.4" />

        {/* Inner scope ring */}
        <circle cx="50" cy="50" r="30" stroke="url(#logo-ring)" strokeWidth="2.5" opacity="0.7" />

        {/* Crosshair lines */}
        <line x1="50" y1="8" x2="50" y2="28" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="72" x2="50" y2="92" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="8" y1="50" x2="28" y2="50" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="72" y1="50" x2="92" y2="50" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />

        {/* Impact dots (gerbe pattern) */}
        <circle cx="50" cy="50" r="3" fill="url(#logo-grad)" filter="url(#logo-glow)" />
        <circle cx="42" cy="44" r="2" fill="var(--accent2)" opacity="0.9" />
        <circle cx="56" cy="43" r="2.2" fill="var(--accent2)" opacity="0.85" />
        <circle cx="47" cy="57" r="1.8" fill="var(--accent2)" opacity="0.8" />
        <circle cx="58" cy="54" r="2" fill="var(--accent2)" opacity="0.75" />
        <circle cx="39" cy="52" r="1.5" fill="var(--accent2)" opacity="0.7" />
        <circle cx="53" cy="38" r="1.6" fill="var(--accent2)" opacity="0.65" />
        <circle cx="61" cy="47" r="1.4" fill="var(--accent2)" opacity="0.6" />

        {/* Corner ticks (scope reticle feel) */}
        <line x1="15" y1="15" x2="22" y2="22" stroke="var(--accent2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="85" y1="15" x2="78" y2="22" stroke="var(--accent2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="15" y1="85" x2="22" y2="78" stroke="var(--accent2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="85" y1="85" x2="78" y2="78" stroke="var(--accent2)" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{
            fontSize: textSize,
            fontWeight: 900,
            letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, var(--text), var(--accent2))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            S.A.G.
          </span>
          <span style={{
            fontSize: textSize * 0.45,
            fontWeight: 600,
            color: 'var(--muted)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginTop: 2,
          }}>
            Système d'Analyse de Gerbe
          </span>
        </div>
      )}
    </div>
  );
}

export function SAGIcon({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <defs>
        <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff41" />
          <stop offset="100%" stopColor="#00cc33" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="30" stroke="url(#icon-grad)" strokeWidth="3" />
      <line x1="50" y1="12" x2="50" y2="30" stroke="url(#icon-grad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="70" x2="50" y2="88" stroke="url(#icon-grad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="12" y1="50" x2="30" y2="50" stroke="url(#icon-grad)" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="50" x2="88" y2="50" stroke="url(#icon-grad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="50" r="4" fill="url(#icon-grad)" />
    </svg>
  );
}
