import { useNavigate } from 'react-router-dom';
import { Crosshair, BookOpen, Target, Database, Box, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const cards = [
  {
    title: 'Analyse Balistique',
    desc: 'Chargez une photo de cible et analysez la dispersion de votre gerbe de plombs.',
    icon: Crosshair,
    path: '/analyse',
    color: 'var(--accent2)',
    glow: 'var(--accent-glow)',
    gradient: 'linear-gradient(135deg, rgba(240,160,48,0.08), rgba(212,148,10,0.03))',
    borderHover: 'var(--accent)',
  },
  {
    title: 'Bibliothèque',
    desc: 'Consultez et comparez vos fiches munitions enregistrées.',
    icons: [Database, BookOpen],
    path: '/bibliotheque',
    color: 'var(--blue)',
    glow: 'var(--blue-glow)',
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.08), rgba(59,130,246,0.03))',
    borderHover: 'var(--blue)',
  },
  {
    title: 'Modélisation 3D',
    desc: 'Cône, heatmap, trajectoires et pénétration balistique.',
    icon: Box,
    path: '/3d',
    color: 'var(--purple)',
    glow: 'var(--purple-glow)',
    gradient: 'linear-gradient(135deg, rgba(192,132,252,0.1), rgba(168,85,247,0.03))',
    borderHover: 'var(--purple)',
    badge: 'NEW',
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 48,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        width: 600,
        height: 600,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none',
        opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent 5%, var(--border) 50%, transparent 95%)',
        pointerEvents: 'none',
      }} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            marginBottom: 20,
            boxShadow: '0 8px 40px var(--accent-glow-strong)',
          }}
        >
          <Target size={32} color="#fff" strokeWidth={1.8} />
        </motion.div>

        <h1 style={{
          fontSize: 40,
          fontWeight: 900,
          letterSpacing: '-1px',
          lineHeight: 1.1,
          marginBottom: 12,
          background: 'linear-gradient(135deg, var(--text), var(--accent2))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Analyse Balistique
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 15,
          maxWidth: 420,
          lineHeight: 1.6,
          margin: '0 auto',
        }}>
          Journal de chasse — Analysez vos gerbes de tir, mesurez la dispersion et comparez vos munitions.
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 16,
            padding: '6px 14px',
            borderRadius: 20,
            background: 'var(--accent-glow)',
            border: '1px solid var(--border-glow)',
            color: 'var(--accent2)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.3px',
          }}
        >
          <Sparkles size={12} />
          Détection automatique des impacts par IA
        </motion.div>
      </motion.div>

      {/* Cards */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {cards.map((card, i) => (
          <motion.div
            key={card.path}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={() => navigate(card.path)}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: 260,
              padding: 28,
              background: card.gradient,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = card.borderHover;
              (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 48px ${card.glow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Badge */}
            {card.badge && (
              <span style={{
                position: 'absolute',
                top: 12,
                right: 12,
                fontSize: 9,
                fontWeight: 800,
                color: card.color,
                background: card.glow,
                padding: '3px 8px',
                borderRadius: 10,
                letterSpacing: '0.5px',
              }}>
                {card.badge}
              </span>
            )}

            {/* Icon */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 18,
            }}>
              {card.icons
                ? card.icons.map((Icon, j) => (
                    <Icon key={j} size={28} color={card.color} strokeWidth={1.5} />
                  ))
                : card.icon && <card.icon size={32} color={card.color} strokeWidth={1.5} />
              }
            </div>

            <h2 style={{
              fontSize: 16,
              fontWeight: 800,
              marginBottom: 8,
              letterSpacing: '-0.2px',
            }}>
              {card.title}
            </h2>

            <p style={{
              fontSize: 12,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: 14,
            }}>
              {card.desc}
            </p>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: card.color,
            }}>
              Ouvrir <ArrowRight size={13} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
