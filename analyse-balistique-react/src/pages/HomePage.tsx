import { useNavigate } from 'react-router-dom';
import { Crosshair, BookOpen, Box, ChevronDown, ArrowRight, Target, BarChart3, Layers, Zap } from 'lucide-react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { useRef, useEffect, useState, type MouseEvent as RMouseEvent } from 'react';

/* ═══ CSS injected once ═══ */
const STYLE_ID = 'homepage-fx';
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes hp-aurora {
      0%,100%{background-position:0% 50%}
      50%{background-position:100% 50%}
    }
    @keyframes hp-grain {
      0%{transform:translate(0,0)}
      10%{transform:translate(-5%,-5%)}
      20%{transform:translate(-10%,5%)}
      30%{transform:translate(5%,-10%)}
      40%{transform:translate(-5%,15%)}
      50%{transform:translate(-10%,5%)}
      60%{transform:translate(15%,0)}
      70%{transform:translate(0,10%)}
      80%{transform:translate(-15%,0)}
      90%{transform:translate(10%,5%)}
      100%{transform:translate(5%,0)}
    }
    @keyframes hp-scan {
      0%{top:-2px}
      100%{top:calc(100% - 2px)}
    }
    @keyframes hp-pulse-ring {
      0%{transform:scale(0.8);opacity:0.6}
      100%{transform:scale(2.5);opacity:0}
    }
    @keyframes hp-trace {
      0%{stroke-dashoffset:800}
      100%{stroke-dashoffset:0}
    }
    .hp-scroll-section {
      overflow: hidden;
    }
  `;
  document.head.appendChild(s);
}

/* ═══ Animated counter ═══ */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 50, damping: 18 });

  useEffect(() => {
    if (inView) animate(mv, target, { duration: 2.5 });
  }, [inView, target, mv]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ═══ Tilt card ═══ */
function TiltCard({ children, onClick, gradient }: {
  children: React.ReactNode;
  onClick: () => void;
  gradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });
  const glowX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 20 });
  const glowY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), { stiffness: 200, damping: 20 });

  const handleMove = (e: RMouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };
  const cardInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      initial={{ opacity: 0, y: 80 }}
      animate={cardInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        width: 340,
        padding: 36,
        background: gradient,
        border: '1px solid var(--border)',
        borderRadius: 24,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow that follows cursor */}
      <motion.div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: useTransform(
          [glowX, glowY],
          ([gx, gy]: number[]) => `radial-gradient(circle at ${gx}% ${gy}%, rgba(240,160,48,0.15) 0%, transparent 60%)`
        ),
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}

/* ═══ Target scan animation ═══ */
function TargetScan() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [impacts] = useState(() =>
    Array.from({ length: 18 }, () => ({
      x: 50 + (Math.random() - 0.5) * 60,
      y: 50 + (Math.random() - 0.5) * 60,
      delay: 0.8 + Math.random() * 1.5,
      size: 4 + Math.random() * 5,
    }))
  );

  return (
    <div ref={ref} style={{ position: 'relative', width: 320, height: 320 }}>
      {/* Concentric target rings */}
      {[140, 100, 60, 25].map((r, i) => (
        <motion.div
          key={r}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: r * 2, height: r * 2,
            marginLeft: -r, marginTop: -r,
            borderRadius: '50%',
            border: `${i === 3 ? 2 : 1}px solid rgba(240,160,48,${0.12 + i * 0.08})`,
          }}
        />
      ))}
      {/* Crosshair lines */}
      {inView && <>
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ position: 'absolute', top: '50%', left: 20, right: 20, height: 1, background: 'rgba(240,160,48,0.2)' }}
        />
        <motion.div
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{ position: 'absolute', left: '50%', top: 20, bottom: 20, width: 1, background: 'rgba(240,160,48,0.2)' }}
        />
      </>}
      {/* Scan line */}
      {inView && (
        <div style={{
          position: 'absolute', left: 20, right: 20, height: 2,
          background: 'linear-gradient(90deg, transparent, var(--accent2), transparent)',
          animation: 'hp-scan 2s ease-in-out infinite alternate',
          boxShadow: '0 0 20px rgba(240,160,48,0.5)',
        }} />
      )}
      {/* Impact dots revealed after scan */}
      {impacts.map((imp, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 0.9 } : {}}
          transition={{ delay: imp.delay, type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            position: 'absolute',
            left: `${imp.x}%`, top: `${imp.y}%`,
            width: imp.size, height: imp.size,
            borderRadius: '50%',
            background: 'var(--accent2)',
            boxShadow: '0 0 10px rgba(240,160,48,0.6)',
          }}
        />
      ))}
    </div>
  );
}

/* ═══ Bullet trajectory SVG ═══ */
function BulletTrajectory() {
  return (
    <svg width="100%" height="200" viewBox="0 0 800 200" fill="none" style={{ position: 'absolute', bottom: 60, left: 0, opacity: 0.3 }}>
      <path
        d="M-50 180 Q200 30 400 90 Q600 150 850 20"
        stroke="url(#traj-grad)" strokeWidth="2" strokeDasharray="800"
        style={{ animation: 'hp-trace 3s ease-out forwards' }}
      />
      <defs>
        <linearGradient id="traj-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="40%" stopColor="var(--accent2)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export function HomePage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -150]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const [vh, setVh] = useState(window.innerHeight);
  useEffect(() => {
    injectStyles();
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: vh, overflowY: 'auto', overflowX: 'hidden', background: 'var(--bg)' }}>

      {/* ─── Grain overlay ─── */}
      <div style={{
        position: 'fixed', inset: '-20%', pointerEvents: 'none', zIndex: 9999, opacity: 0.04,
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        backgroundSize: '128px 128px',
        animation: 'hp-grain 0.5s steps(6) infinite',
      }} />

      {/* ══════════ HERO ══════════ */}
      <motion.section style={{
        height: vh, position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', width: '100%', y: heroY, scale: heroScale, opacity: heroOpacity,
      }}>
        {/* Aurora background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(200,134,10,0.08) 0%, transparent 40%, rgba(77,171,247,0.05) 60%, transparent 100%)',
          backgroundSize: '400% 400%',
          animation: 'hp-aurora 12s ease infinite',
        }} />
        {/* Grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(240,160,48,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,160,48,0.04) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 50% 40% at 50% 45%, rgba(200,134,10,0.12) 0%, transparent 100%)',
        }} />

        <BulletTrajectory />

        {/* Pulse rings behind title */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(240,160,48,0.15)',
              animation: `hp-pulse-ring 3s ease-out ${i * 0.8}s infinite`,
            }} />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700, padding: '0 24px' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              color: 'var(--accent2)', background: 'rgba(200,134,10,0.15)',
              padding: '6px 18px', borderRadius: 20,
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 24,
              border: '1px solid rgba(240,160,48,0.2)',
            }}
          >
            Journal de chasse
          </motion.div>

          {/* Title letter-by-letter */}
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, lineHeight: 1.05, marginBottom: 20, letterSpacing: '-2px' }}>
            {'PlombScope'.split('').map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.6 + i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, #fff 20%, var(--accent2) 80%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}
              >
                {ch}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            style={{ fontSize: 'clamp(14px, 2vw, 18px)', color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 44px' }}
          >
            Analysez vos gerbes de tir avec précision chirurgicale.
            Dispersion, comparaison, modélisation 3D — tout en un.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/analyse')}
              style={{
                padding: '16px 36px', fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none', borderRadius: 14, color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: '0 8px 32px rgba(200,134,10,0.35)',
              }}
            >
              <Crosshair size={18} /> Commencer l'analyse
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/bibliotheque')}
              style={{
                padding: '16px 36px', fontSize: 15, fontWeight: 600,
                background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
                border: '1px solid var(--border)', borderRadius: 14,
                color: 'var(--text)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <BookOpen size={18} /> Bibliothèque
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          style={{ position: 'absolute', bottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: 2, textTransform: 'uppercase' }}>Découvrir</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown size={20} color="var(--accent2)" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ══════════ STATS BANNER ══════════ */}
      <section style={{
        padding: '70px 24px', background: 'var(--surface)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 40 }}>
          {[
            { value: 4, suffix: '', label: 'Modes de visualisation 3D' },
            { value: 100, suffix: '%', label: 'Analyse côté client' },
            { value: 360, suffix: '°', label: 'Visualisation interactive' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, type: 'spring', stiffness: 100 }}
              style={{ textAlign: 'center', minWidth: 160 }}
            >
              <div style={{
                fontSize: 56, fontWeight: 900, lineHeight: 1, marginBottom: 8,
                background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ FEATURES CARDS ══════════ */}
      <section className="hp-scroll-section" style={{ padding: '120px 24px', position: 'relative' }}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 70 }}
        >
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, color: 'var(--accent2)',
            background: 'rgba(200,134,10,0.12)', padding: '6px 18px', borderRadius: 20,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16,
          }}>
            Fonctionnalités
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-1px', marginBottom: 14 }}>
            Tout pour analyser vos tirs
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto' }}>
            De la photo au rapport — un outil pensé pour le chasseur exigeant.
          </p>
        </motion.div>

        {/* Cards */}
        <div style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1140, margin: '0 auto' }}>
          <TiltCard
            onClick={() => navigate('/analyse')}
            gradient="linear-gradient(145deg, rgba(200,134,10,0.1), var(--surface))"
          >
            <Crosshair size={40} color="var(--accent2)" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Analyse de dispersion</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              Chargez votre cible, calibrez, marquez chaque impact. Détection auto avec réglage de sensibilité.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent2)' }}>
              Ouvrir <ArrowRight size={14} />
            </div>
          </TiltCard>

          <TiltCard
            onClick={() => navigate('/bibliotheque')}
            gradient="linear-gradient(145deg, rgba(77,171,247,0.1), var(--surface))"
          >
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <BarChart3 size={36} color="var(--blue)" />
              <BookOpen size={36} color="var(--blue)" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Bibliothèque munitions</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              Comparez jusqu'à 4 munitions côte à côte. Radar chart, overlay d'impacts et tri avancé.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--blue)' }}>
              Ouvrir <ArrowRight size={14} />
            </div>
          </TiltCard>

          <TiltCard
            onClick={() => navigate('/3d')}
            gradient="linear-gradient(145deg, rgba(192,132,252,0.1), var(--surface))"
          >
            <Box size={40} color="#c084fc" style={{ marginBottom: 20 }} />
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Modélisation 3D</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              Cône de dispersion, heatmap, trajectoires animées et vue pénétration. 4 modes interactifs.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#c084fc' }}>
              Ouvrir <ArrowRight size={14} />
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ══════════ SHOWCASE — Target scan ══════════ */}
      <section style={{
        padding: '120px 24px', background: 'var(--surface)',
        borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <TargetScan />
          </motion.div>

          <div style={{ flex: 1, minWidth: 300 }}>
            <motion.div
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{
                fontSize: 11, fontWeight: 700, color: 'var(--accent2)',
                background: 'rgba(200,134,10,0.12)', padding: '6px 18px', borderRadius: 20,
                letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 24, display: 'inline-block',
              }}
            >
              Comment ça marche
            </motion.div>
            {[
              { n: 1, title: 'Chargez votre photo', desc: 'Importez la photo de votre cible depuis votre appareil.' },
              { n: 2, title: "Calibrez l'échelle", desc: 'Placez 2 points de référence pour convertir pixels en cm.' },
              { n: 3, title: 'Marquez les impacts', desc: 'Ajoutez manuellement ou utilisez la détection automatique.' },
              { n: 4, title: 'Analysez et exportez', desc: 'Statistiques, visualisation 3D, comparaison et export PDF.' },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 18, padding: '16px 0' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 + 0.15, type: 'spring', stiffness: 200 }}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 17, color: '#fff',
                  }}
                >
                  {step.n}
                </motion.div>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{step.title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TECH STACK ══════════ */}
      <section style={{ padding: '100px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Propulsé par les meilleures technos
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Performance et précision au service de votre passion.</p>
        </motion.div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {[
            { icon: <Layers size={20} />, label: 'React 19', color: '#61dafb' },
            { icon: <Box size={20} />, label: 'Three.js', color: '#c084fc' },
            { icon: <Zap size={20} />, label: 'Framer Motion', color: '#f0a030' },
            { icon: <Target size={20} />, label: 'Canvas API', color: '#2ecc71' },
          ].map((t, i) => (
            <motion.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: t.color }}
              style={{
                padding: '14px 24px', background: 'var(--surface)',
                border: '1px solid var(--border)', borderRadius: 12,
                display: 'flex', alignItems: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, color: 'var(--text)', transition: 'border-color 0.2s',
              }}
            >
              <span style={{ color: t.color }}>{t.icon}</span> {t.label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section style={{ padding: '100px 24px 120px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 50% 70% at 50% 90%, rgba(200,134,10,0.12) 0%, transparent 100%)',
        }} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Target size={52} color="var(--accent2)" style={{ marginBottom: 24 }} />
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14 }}>
            Prêt à analyser ?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 400, margin: '0 auto 36px' }}>
            Importez votre première photo de cible et découvrez la puissance de PlombScope.
          </p>
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/analyse')}
            style={{
              padding: '18px 44px', fontSize: 16, fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none', borderRadius: 16, color: '#fff', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 10,
              boxShadow: '0 12px 40px rgba(200,134,10,0.4)',
            }}
          >
            <Crosshair size={20} /> Lancer une analyse <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: 24, borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
        PlombScope v3.0 — Journal de chasse
      </footer>
    </div>
  );
}
