import { useNavigate } from 'react-router-dom';
import { Crosshair, BookOpen, Target, Database } from 'lucide-react';
import { motion } from 'framer-motion';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      padding: 24,
      background: 'radial-gradient(ellipse at center, rgba(200,134,10,0.06) 0%, transparent 70%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <Target size={40} color="var(--accent2)" strokeWidth={1.5} />
        </div>
        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: '-0.5px',
          marginBottom: 8,
          background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Analyse Balistique
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 400 }}>
          Journal de chasse — Analysez vos gerbes de tir, mesurez la dispersion et comparez vos munitions.
        </p>
      </motion.div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => navigate('/analyse')}
          style={{
            width: 260,
            padding: 28,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
          whileHover={{ scale: 1.03, borderColor: 'var(--accent)' }}
        >
          <Crosshair size={32} color="var(--accent2)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Analyse Balistique</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Chargez une photo de cible et analysez la dispersion de votre gerbe de plombs.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/bibliotheque')}
          style={{
            width: 260,
            padding: 28,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
          whileHover={{ scale: 1.03, borderColor: 'var(--accent)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
            <Database size={28} color="var(--blue)" />
            <BookOpen size={28} color="var(--blue)" />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Bibliothèque</h2>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
            Consultez et comparez vos fiches munitions enregistrées.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
