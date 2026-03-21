import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
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
          rgba(0, 255, 65, 0.015) 2px,
          rgba(0, 255, 65, 0.015) 4px
        )`,
      }} />

      {/* Tactical grid */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 255, 65, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 65, 0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      <Header />
      <div style={{ flex: 1, overflow: isHome ? 'auto' : 'hidden', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}
