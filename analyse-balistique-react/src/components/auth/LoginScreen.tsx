import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle, Crosshair } from 'lucide-react';

function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).slice(0, 10);
}

const EXPECTED = simpleHash('taradeau');

interface LoginScreenProps {
  onAuth: () => void;
}

export function LoginScreen({ onAuth }: LoginScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (simpleHash(password.toLowerCase().trim()) === EXPECTED) {
      sessionStorage.setItem('plombscope-auth', '1');
      onAuth();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 3000);
    }
  }, [password, onAuth]);

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
              PLOMBSCOPE
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
              Analyse balistique
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
              Accès sécurisé
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              className="input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              autoFocus
              style={{
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
                border: password.length > 0
                  ? '1px solid rgba(0,255,65,0.4)'
                  : '1px solid rgba(0,255,65,0.1)',
                background: password.length > 0
                  ? 'rgba(0,255,65,0.15)'
                  : 'transparent',
                cursor: password.length > 0 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowRight size={12} color={password.length > 0 ? '#00ff41' : 'rgba(0,255,65,0.2)'} />
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
              ERREUR: MOT DE PASSE INCORRECT
            </motion.div>
          )}
        </motion.form>

        {/* Footer */}
        <span style={{
          fontSize: 9,
          color: 'rgba(0,255,65,0.2)',
          letterSpacing: '2px',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
        }}>
          Système d&apos;analyse v2.0
        </span>
      </motion.div>
    </div>
  );
}
