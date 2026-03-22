import { useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, Crosshair, User } from 'lucide-react';
import DecryptedText from '../landing/DecryptedText';
import { useUserStore } from '../../stores/userStore';

const AccessBadge = lazy(() => import('./AccessBadge'));

interface LoginScreenProps {
  onAuth: () => void;
  redirectTo?: string;
}

export function LoginScreen({ onAuth, redirectTo = '/dashboard' }: LoginScreenProps) {
  const navigate = useNavigate();
  const login = useUserStore((s) => s.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  const handleAuthComplete = useCallback(() => {
    onAuth();
    navigate(redirectTo);
  }, [onAuth, navigate, redirectTo]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const result = login(username, password);
    if (result.success) {
      setShowBadge(true);
    } else {
      setError(result.error || 'Erreur de connexion');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(''), 4000);
    }
  }, [username, password, login]);

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#010a01',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        background: `repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 255, 65, 0.015) 2px,
          rgba(0, 255, 65, 0.015) 4px
        )`,
      }} />

      {/* Grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 255, 65, 0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 255, 65, 0.025) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: 600,
        height: 600,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse, rgba(0,255,65,0.06) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          position: 'relative',
          zIndex: 3,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <Crosshair size={48} color="#00ff41" strokeWidth={1} style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,65,0.3))' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: '4px',
              color: '#00ff41',
              textShadow: '0 0 20px rgba(0,255,65,0.3)',
            }}>
              S.A.G.
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 600,
              color: 'rgba(0,255,65,0.35)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginTop: 4,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            }}>
              Système d'Analyse de Gerbe
            </div>
          </div>
        </motion.div>

        {/* Login card */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            padding: 24,
            background: 'rgba(4, 18, 8, 0.9)',
            border: '1px solid rgba(0,255,65,0.15)',
            width: 320,
            position: 'relative',
          }}
        >
          {/* Top decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.3), transparent)',
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 2,
          }}>
            <Lock size={12} color="#00ff41" />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(0,255,65,0.6)',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              <DecryptedText
                text="Accès sécurisé"
                speed={180}
                maxIterations={15}
                characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*"
                animateOn="view"
                revealDirection="start"
                sequential
                delay={800}
              />
            </span>
          </div>

          {/* Username */}
          <div style={{ position: 'relative' }}>
            <User size={13} color="rgba(0,255,65,0.3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input"
              type="text"
              placeholder="Identifiant"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              autoFocus
              autoComplete="username"
              style={{
                paddingLeft: 32,
                borderColor: error ? '#ff4444' : undefined,
                boxShadow: error ? '0 0 12px rgba(255,68,68,0.15)' : undefined,
              }}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock size={13} color="rgba(0,255,65,0.3)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="current-password"
              style={{
                paddingLeft: 32,
                paddingRight: 40,
                borderColor: error ? '#ff4444' : undefined,
                boxShadow: error ? '0 0 12px rgba(255,68,68,0.15)' : undefined,
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 28,
                height: 28,
                border: (username.length > 0 && password.length > 0)
                  ? '1px solid rgba(0,255,65,0.4)'
                  : '1px solid rgba(0,255,65,0.1)',
                background: (username.length > 0 && password.length > 0)
                  ? 'rgba(0,255,65,0.15)'
                  : 'transparent',
                cursor: (username.length > 0 && password.length > 0) ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowRight size={12} color={(username.length > 0 && password.length > 0) ? '#00ff41' : 'rgba(0,255,65,0.2)'} />
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10,
                fontWeight: 600,
                color: '#ff4444',
                padding: '5px 8px',
                background: 'rgba(255,68,68,0.08)',
                border: '1px solid rgba(255,68,68,0.2)',
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.5px',
              }}
            >
              <AlertCircle size={11} />
              {error.toUpperCase()}
            </motion.div>
          )}

          {/* Default credentials hint */}
          <div style={{
            fontSize: 9,
            color: 'rgba(0,255,65,0.2)',
            fontFamily: "'JetBrains Mono', monospace",
            textAlign: 'center',
            borderTop: '1px solid rgba(0,255,65,0.08)',
            paddingTop: 10,
          }}>
            Par défaut: admin / taradeau
          </div>
        </motion.form>

        {/* Footer */}
        <span style={{
          fontSize: 9,
          color: 'rgba(0,255,65,0.2)',
          letterSpacing: '2px',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
        }}>
          S.A.G. — Système d&apos;Analyse de Gerbe v2.0
        </span>
      </motion.div>

      {showBadge && (
        <Suspense fallback={null}>
          <AccessBadge onComplete={handleAuthComplete} />
        </Suspense>
      )}
    </div>
  );
}
