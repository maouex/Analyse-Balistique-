import { Sun, Moon, Scan, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { PlombScopeIcon } from '../brand/PlombScopeLogo';

const NAV_ITEMS = [
  { path: '/analyse', label: 'Analyse', icon: Scan },
  { path: '/bibliotheque', label: 'Bibliothèque', icon: BookOpen },
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggle } = useThemeStore();
  const hasAnalysis = useAnalysisStore((s) => s.impacts.length > 0);
  const impactCount = useAnalysisStore((s) => s.impacts.length);

  return (
    <header style={{
      height: 52,
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 6,
      flexShrink: 0,
      zIndex: 100,
      position: 'relative',
    }}>
      {/* Subtle bottom glow */}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: '10%',
        right: '10%',
        height: 1,
        background: 'linear-gradient(90deg, transparent, var(--accent-glow), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          marginRight: 8,
          flexShrink: 0,
        }}
      >
        <PlombScopeIcon size={28} />
        <span style={{
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: '-0.4px',
          background: 'linear-gradient(135deg, var(--text), var(--accent2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          PlombScope
        </span>
      </div>

      {/* Navigation tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: 1,
        justifyContent: 'center',
      }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--accent2)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}

              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 16,
                  height: 2,
                  borderRadius: 1,
                  background: 'var(--accent2)',
                }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {hasAnalysis && location.pathname !== '/analyse' && location.pathname !== '/3d' && (
          <button
            onClick={() => navigate('/analyse')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 10px',
              borderRadius: 6,
              border: '1px solid var(--border-glow)',
              background: 'var(--accent-glow)',
              cursor: 'pointer',
              color: 'var(--accent2)',
              fontSize: 11,
              fontWeight: 700,
              transition: 'all var(--transition-fast)',
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--accent2)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            {impactCount} impacts
          </button>
        )}

        <button
          onClick={toggle}
          title={mode === 'dark' ? 'Thème clair' : 'Thème sombre'}
          style={{
            width: 32,
            height: 32,
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
          {mode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>
    </header>
  );
}
