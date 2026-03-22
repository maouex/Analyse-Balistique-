import { useRef, useState } from 'react';
import { Sun, Moon, Scan, BookOpen, Crosshair, LogOut, LayoutGrid, Volume2, VolumeX, Users } from 'lucide-react';
import { isSoundEnabled, toggleSound } from '../../lib/sounds';
import { useLocation } from 'react-router-dom';
import { useThemeStore } from '../../stores/themeStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { useUserStore, canManageUsers } from '../../stores/userStore';
import { useTransitionNavigate } from '../transitions/TransitionContext';

interface HeaderProps {
  onLogout?: () => void;
}

export function Header({ onLogout }: HeaderProps) {
  const navigate = useTransitionNavigate();
  const location = useLocation();
  const { mode, animatedToggle } = useThemeStore();
  const hasAnalysis = useAnalysisStore((s) => s.impacts.length > 0);
  const impactCount = useAnalysisStore((s) => s.impacts.length);
  const currentUser = useUserStore((s) => s.currentUser);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  const isAdmin = currentUser && canManageUsers(currentUser.role);

  const NAV_ITEMS = [
    { path: '/dashboard', label: 'DASHBOARD', icon: LayoutGrid },
    { path: '/analyse', label: 'ANALYSE', icon: Scan },
    { path: '/bibliotheque', label: 'BIBLIOTHÈQUE', icon: BookOpen },
    ...(isAdmin ? [{ path: '/utilisateurs', label: 'UTILISATEURS', icon: Users }] : []),
  ];

  return (
    <header style={{
      height: 48,
      background: 'var(--surface-glass)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
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
        background: 'linear-gradient(90deg, transparent, var(--border-glow), transparent)',
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
        <Crosshair size={18} color="var(--accent2)" strokeWidth={1.5} />
        <span style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: '2px',
          color: 'var(--accent2)',
          textShadow: '0 0 10px var(--accent-glow)',
          fontFamily: "'Inter', monospace",
        }}>
          S.A.G.
        </span>
      </div>

      {/* Separator */}
      <div style={{
        width: 1,
        height: 20,
        background: 'var(--border)',
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
                border: isActive ? '1px solid var(--border-light)' : '1px solid transparent',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '1.5px',
                color: isActive ? 'var(--accent2)' : 'var(--muted)',
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
              border: '1px solid var(--border-light)',
              background: 'var(--accent-glow)',
              cursor: 'pointer',
              color: 'var(--accent2)',
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
              background: 'var(--accent2)',
              boxShadow: '0 0 8px var(--accent-glow-strong)',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            {impactCount} IMPACTS
          </button>
        )}

        {/* Current user badge */}
        {currentUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 8px',
              border: `1px solid ${currentUser.avatar}30`,
              background: `${currentUser.avatar}08`,
              cursor: isAdmin ? 'pointer' : 'default',
            }}
            onClick={() => isAdmin && navigate('/utilisateurs')}
            title={`${currentUser.displayName} (${currentUser.role})`}
          >
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: `${currentUser.avatar}20`,
              border: `1.5px solid ${currentUser.avatar}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 800,
              color: currentUser.avatar,
              fontFamily: 'var(--font-mono)',
            }}>
              {currentUser.displayName.slice(0, 2).toUpperCase()}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              maxWidth: 80,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {currentUser.displayName}
            </span>
          </div>
        )}

        {/* System status */}
        <span style={{
          fontSize: 9,
          fontFamily: "'Courier New', monospace",
          color: 'var(--muted)',
          letterSpacing: '1px',
        }}>
          SYS:OK
        </span>

        <SoundToggle />

        <button
          ref={themeButtonRef}
          onClick={() => animatedToggle(themeButtonRef.current)}
          title={mode === 'dark' ? 'Thème clair' : 'Thème sombre'}
          style={{
            width: 28,
            height: 28,
            border: '1px solid var(--border)',
            background: 'var(--accent-glow)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s',
          }}
        >
          {mode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Déconnexion"
            style={{
              width: 28,
              height: 28,
              border: '1px solid var(--red-glow)',
              background: 'rgba(255,68,68,0.05)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--red)',
              opacity: 0.5,
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={12} />
          </button>
        )}
      </div>
    </header>
  );
}

function SoundToggle() {
  const [on, setOn] = useState(isSoundEnabled);
  return (
    <button
      onClick={() => setOn(toggleSound())}
      title={on ? 'Couper le son' : 'Activer le son'}
      style={{
        width: 28,
        height: 28,
        border: '1px solid var(--border)',
        background: on ? 'var(--accent-glow)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: on ? 'var(--accent2)' : 'var(--muted)',
        transition: 'all 0.2s',
      }}
    >
      {on ? <Volume2 size={12} /> : <VolumeX size={12} />}
    </button>
  );
}
