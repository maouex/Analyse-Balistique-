import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';

interface AppLayoutProps {
  onLogout?: () => void;
}

export function AppLayout({ onLogout }: AppLayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Scanlines overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9998,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          var(--accent-glow) 2px,
          var(--accent-glow) 4px
        )`,
        opacity: 0.15,
      }} />

      {/* Tactical grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `
          linear-gradient(var(--border-glow) 1px, transparent 1px),
          linear-gradient(90deg, var(--border-glow) 1px, transparent 1px)
        `,
        opacity: 0.3,
        backgroundSize: '60px 60px',
      }} />

      <Header onLogout={onLogout} />
      <div style={{ flex: 1, overflow: isHome ? 'auto' : 'hidden', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
