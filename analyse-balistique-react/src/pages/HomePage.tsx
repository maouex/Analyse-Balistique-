import { useNavigate } from 'react-router-dom';
import { Crosshair, BookOpen, Database, ArrowRight, Play, GitCompare, Box } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnalysisStore } from '../stores/analysisStore';
import { useMunitionsStore } from '../stores/munitionsStore';
import { useEffect, useMemo } from 'react';
import { computeFullAnalysis } from '../lib/ballistics';
import { PlombScopeLogo } from '../components/brand/PlombScopeLogo';

export function HomePage() {
  const navigate = useNavigate();
  const store = useAnalysisStore();
  const munStore = useMunitionsStore();

  useEffect(() => { munStore.load(); }, []);

  const hasAnalysis = store.impacts.length > 0;
  const stats = useMemo(() =>
    computeFullAnalysis(store.impacts, store.center, store.circle1.diameterCm, store.circle2.diameterCm, store.scale.pixelsPerCm),
    [store.impacts, store.center, store.circle1.diameterCm, store.circle2.diameterCm, store.scale.pixelsPerCm]
  );
  const munCount = munStore.munitions.length;

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 36,
      padding: 32,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        width: 600,
        height: 600,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%)',
        pointerEvents: 'none',
        opacity: 0.4,
      }} />

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ marginBottom: 12 }}
        >
          <PlombScopeLogo size={64} showText textSize={32} />
        </motion.div>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: 14,
          maxWidth: 400,
          lineHeight: 1.6,
          margin: '0 auto',
        }}>
          Analysez vos gerbes de tir, mesurez la dispersion et comparez vos munitions.
        </p>
      </motion.div>

      {/* Active analysis banner */}
      {hasAnalysis && stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '14px 22px',
            background: 'var(--surface)',
            border: '1px solid var(--border-glow)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow-glow)',
            position: 'relative',
            zIndex: 1,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--accent2)',
            animation: 'pulse 2s ease-in-out infinite',
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>Analyse en cours</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {store.impacts.length} impacts — Score {stats.score}/100
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm btn-primary" onClick={() => navigate('/analyse')} style={{ gap: 5 }}>
              <Play size={11} /> Reprendre
            </button>
            <button className="btn btn-sm" onClick={() => navigate('/3d')} style={{ gap: 5 }}>
              <Box size={11} /> Voir en 3D
            </button>
          </div>
        </motion.div>
      )}

      {/* Main action cards */}
      <div style={{
        display: 'flex',
        gap: 20,
        flexWrap: 'wrap',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Analyse card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={() => navigate('/analyse')}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: 280,
            padding: 28,
            background: 'linear-gradient(135deg, rgba(240,160,48,0.06), rgba(212,148,10,0.02))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px var(--accent-glow)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <Crosshair size={28} color="var(--accent2)" strokeWidth={1.5} style={{ marginBottom: 14 }} />
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>
            {hasAnalysis ? "Reprendre l'analyse" : 'Nouvelle analyse'}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
            {hasAnalysis
              ? `${store.impacts.length} impacts plac\u00E9s — continuez votre travail.`
              : 'Chargez une photo de cible et analysez la dispersion de vos plombs.'}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--accent2)' }}>
            {hasAnalysis ? 'Continuer' : 'Commencer'} <ArrowRight size={12} />
          </div>
        </motion.div>

        {/* Bibliothèque card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          onClick={() => navigate('/bibliotheque')}
          whileHover={{ y: -4, scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: 280,
            padding: 28,
            background: 'linear-gradient(135deg, rgba(96,165,250,0.06), rgba(59,130,246,0.02))',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--blue)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px var(--blue-glow)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
            <Database size={24} color="var(--blue)" strokeWidth={1.5} />
            <BookOpen size={24} color="var(--blue)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Bibliothèque</h2>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>
            {munCount > 0
              ? `${munCount} munition${munCount > 1 ? 's' : ''} enregistr\u00E9e${munCount > 1 ? 's' : ''}. Comparez, modifiez ou reprenez une analyse.`
              : 'Sauvegardez vos analyses pour constituer votre bibliothèque de munitions.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>
              Ouvrir <ArrowRight size={12} />
            </span>
            {munCount >= 2 && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                background: 'var(--surface2)',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}>
                <GitCompare size={10} /> Comparer
              </span>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
