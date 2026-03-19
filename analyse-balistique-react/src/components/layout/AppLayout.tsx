import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';

export function AppLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Header />
      <div style={{ flex: 1, overflow: isHome ? 'auto' : 'hidden' }}>
        <Outlet />
      </div>
    </div>
  );
}
