import { Sun, Moon, Scan, BookOpen, Crosshair } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAnalysisStore } from '../../stores/analysisStore';

const NAV_ITEMS = [
  { path: '/analyse', label: 'ANALYSE', icon: Scan },
  { path: '/bibliotheque', label: 'BIBLIOTHÈQUE', icon: BookOpen },
];

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggle } = useThemeStore();
  const hasAnalysis = useAnalysisStore((s) => s.impacts.length > 0);
  const impactCount = useAnalysisStore((s) => s.impacts.length);

  return (
    <header style={{
      height: 48,
      background: 'rgba(1, 10, 1, 0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 255, 65, 0.15)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 6,
      flexShrink: 0,
      zIndex: 100,
      position: 'relative',
    }}>
      {/* Bottom glow line */}
      <div style={{
        position: 'absolute',
        bottom: -1,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0, 255, 65, 0.2), transparent)',
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
          marginRight: 12,
          flexShrink: 0,
        }}
      >
        <Crosshair size={18} color="#00ff41" strokeWidth={1.5} />
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '2px',
          color: '#00ff41',
          textShadow: '0 0 10px rgba(0,255,65,0.3)',
          fontFamily: "'Inter', monospace",
        }}>
          PLOMBSCOPE
        </span>
      </div>

      {/* Separator */}
      <div style={{
        width: 1,
        height: 20,
        background: 'rgba(0,255,65,0.15)',
        marginRight: 8,
      }} />

      {/* Navigation tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flex: 1,
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
                padding: '6px 14px',
                border: isActive ? '1px solid rgba(0,255,65,0.3)' : '1px solid transparent',
                background: isActive ? 'rgba(0,255,65,0.08)' : 'transparent',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: isActive ? '#00ff41' : 'rgba(0,255,65,0.4)',
                transition: 'all 0.2s',
                position: 'relative',
                whiteSpace: 'nowrap',
                fontFamily: "'Inter', monospace",
              }}
            >
              <Icon size={13} strokeWidth={isActive ? 2.2 : 1.5} />
              {item.label}
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
              gap: 6,
              padding: '4px 10px',
              border: '1px solid rgba(0,255,65,0.3)',
              background: 'rgba(0,255,65,0.08)',
              cursor: 'pointer',
              color: '#00ff41',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '1px',
              fontFamily: "'Courier New', monospace",
              transition: 'all 0.2s',
            }}
          >
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00ff41',
              boxShadow: '0 0 8px rgba(0,255,65,0.6)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            {impactCount} IMPACTS
          </button>
        )}

        {/* Coordinates display */}
        <span style={{
          fontSize: 9,
          fontFamily: "'Courier New', monospace",
          color: 'rgba(0,255,65,0.25)',
          letterSpacing: '1px',
        }}>
          SYS:OK
        </span>

        <button
          onClick={toggle}
          title={mode === 'dark' ? 'Thème clair' : 'Thème sombre'}
          style={{
            width: 28,
            height: 28,
            border: '1px solid rgba(0,255,65,0.15)',
            background: 'rgba(0,255,65,0.05)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(0,255,65,0.5)',
            transition: 'all 0.2s',
          }}
        >
          {mode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>
    </header>
  );
}
