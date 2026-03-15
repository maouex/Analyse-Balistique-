import { Crosshair, Home, Sun, Moon, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';

const NAV_LABELS: Record<string, string> = {
  '/analyse': 'Analyse',
  '/bibliotheque': 'Bibliothèque',
  '/3d': 'Modélisation 3D',
};

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { mode, toggle } = useThemeStore();
  const pageLabel = NAV_LABELS[location.pathname];

  return (
    <header style={{
      height: 52,
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 10,
      flexShrink: 0,
      zIndex: 100,
      position: 'relative',
    }}>
      {/* Subtle bottom glow line */}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)',
      }} />

      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
          transition: 'opacity var(--transition-fast)',
        }}
      >
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 12px var(--accent-glow)',
        }}>
          <Crosshair size={17} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '-0.4px',
          color: 'var(--text)',
        }}>
          Balistique
        </span>
      </div>

      {/* Breadcrumb */}
      {!isHome && pageLabel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginLeft: 4,
        }}>
          <ChevronRight size={13} color="var(--muted)" />
          <span style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}>
            {pageLabel}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Navigation */}
      {!isHome && (
        <button
          className="btn btn-sm"
          onClick={() => navigate('/')}
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            gap: 5,
          }}
        >
          <Home size={13} />
          <span style={{ fontSize: 12 }}>Accueil</span>
        </button>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggle}
        title={mode === 'dark' ? 'Thème clair' : 'Thème sombre'}
        style={{
          width: 34,
          height: 34,
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          background: 'var(--surface2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
          transition: 'all var(--transition-fast)',
        }}
      >
        {mode === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Version badge */}
      <span style={{
        fontSize: 9,
        fontWeight: 700,
        color: 'var(--accent2)',
        background: 'var(--accent-glow)',
        padding: '4px 10px',
        borderRadius: 20,
        letterSpacing: '0.8px',
        border: '1px solid var(--border-glow)',
      }}>
        v3.0
      </span>
    </header>
  );
}
