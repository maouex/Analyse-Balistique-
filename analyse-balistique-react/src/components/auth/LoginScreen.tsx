import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { PlombScopeLogo } from '../brand/PlombScopeLogo';

function simpleHash(str: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).slice(0, 10);
}

// Pre-compute at module level so we can verify
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
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background radial glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: 800,
        height: 800,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 60%)',
        pointerEvents: 'none',
        opacity: 0.3,
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(var(--border) 1px, transparent 1px),
          linear-gradient(90deg, var(--border) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        opacity: 0.15,
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
          gap: 32,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <PlombScopeLogo size={72} showText textSize={28} />
        </motion.div>

        {/* Login card */}
        <motion.form
          onSubmit={handleSubmit}
          animate={shaking ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: 28,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-lg)',
            width: 340,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
          }}>
            <Lock size={15} color="var(--accent2)" />
            <span style={{ fontSize: 14, fontWeight: 700 }}>Accès sécurisé</span>
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
                paddingRight: 44,
                borderColor: error ? 'var(--red)' : undefined,
                boxShadow: error ? '0 0 0 3px var(--red-glow)' : undefined,
              }}
            />
            <button
              type="submit"
              style={{
                position: 'absolute',
                right: 4,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                borderRadius: 6,
                border: 'none',
                background: password.length > 0
                  ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                  : 'var(--surface3)',
                cursor: password.length > 0 ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowRight size={14} color={password.length > 0 ? '#fff' : 'var(--muted)'} />
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
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--red)',
                padding: '6px 10px',
                background: 'var(--red-glow)',
                borderRadius: 6,
              }}
            >
              <AlertCircle size={13} />
              Mot de passe incorrect
            </motion.div>
          )}
        </motion.form>

        {/* Footer */}
        <span style={{
          fontSize: 10,
          color: 'var(--muted)',
          letterSpacing: '0.5px',
        }}>
          Journal de chasse — Analyse balistique
        </span>
      </motion.div>
    </div>
  );
}
