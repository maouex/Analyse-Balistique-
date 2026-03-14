import { Crosshair, Home, Sun, Moon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { mode, toggle } = useThemeStore();

  return (
    <header style={{
      height: 56,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      flexShrink: 0,
      zIndex: 100,
    }}>
      <Crosshair size={22} color="var(--accent2)" />
      <h1 style={{
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--text)',
        letterSpacing: '-0.3px',
        flex: 1,
      }}>
        Analyse Balistique
      </h1>

      {!isHome && (
        <button className="btn btn-sm" onClick={() => navigate('/')}>
          <Home size={14} />
          Accueil
        </button>
      )}

      <button
        className="btn btn-sm"
        onClick={toggle}
        title={mode === 'dark' ? 'Thème clair' : 'Thème sombre'}
        style={{ padding: '6px 8px' }}
      >
        {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      <span style={{
        fontSize: 10,
        fontWeight: 600,
        color: 'var(--accent)',
        background: 'var(--accent-glow)',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        letterSpacing: '0.5px',
      }}>
        v3.0 REACT
      </span>
    </header>
  );
}
