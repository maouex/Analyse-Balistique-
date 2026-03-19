import { useNavigate } from 'react-router-dom';
import { Crosshair, BookOpen, Target, Database, Box, ChevronDown, Zap, BarChart3, Eye, ArrowRight, Layers, Cpu } from 'lucide-react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { useRef, useEffect, useMemo } from 'react';

/* ─── Animated counter ──────────────────────────────────── */
function AnimatedCounter({ target, suffix = '', duration = 2 }: { target: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 20 });

  useEffect(() => {
    if (inView) {
      animate(motionVal, target, { duration });
    }
  }, [inView, target, duration, motionVal]);

  useEffect(() => {
    const unsub = springVal.on('change', (v) => {
      if (ref.current) ref.current.textContent = Math.round(v) + suffix;
    });
    return unsub;
  }, [springVal, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

/* ─── Floating particles background ─────────────────────── */
function ParticlesCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; a: number; pulse: number }[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 1,
        a: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.01;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 160, 48, ${alpha})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(200, 134, 10, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ─── Animated crosshair SVG ────────────────────────────── */
function AnimatedCrosshair() {
  return (
    <motion.svg
      width="200"
      height="200"
      viewBox="0 0 200 200"
      initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Outer ring */}
      <motion.circle
        cx="100" cy="100" r="80"
        fill="none" stroke="rgba(240,160,48,0.15)" strokeWidth="1"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      {/* Middle ring */}
      <motion.circle
        cx="100" cy="100" r="55"
        fill="none" stroke="rgba(240,160,48,0.25)" strokeWidth="1.5"
        strokeDasharray="4 6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, delay: 0.3 }}
      />
      {/* Inner ring */}
      <motion.circle
        cx="100" cy="100" r="30"
        fill="none" stroke="rgba(240,160,48,0.5)" strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.6 }}
      />
      {/* Center dot */}
      <motion.circle
        cx="100" cy="100" r="4"
        fill="#f0a030"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: 'spring', stiffness: 300 }}
      />
      {/* Crosshair lines */}
      {[
        { x1: 100, y1: 10, x2: 100, y2: 65 },
        { x1: 100, y1: 135, x2: 100, y2: 190 },
        { x1: 10, y1: 100, x2: 65, y2: 100 },
        { x1: 135, y1: 100, x2: 190, y2: 100 },
      ].map((line, i) => (
        <motion.line
          key={i}
          {...line}
          stroke="rgba(240,160,48,0.4)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
        />
      ))}
      {/* Tick marks */}
      {Array.from({ length: 36 }).map((_, i) => {
        const angle = (i * 10 * Math.PI) / 180;
        const r1 = 76;
        const r2 = i % 3 === 0 ? 84 : 80;
        return (
          <motion.line
            key={`tick-${i}`}
            x1={100 + r1 * Math.cos(angle)}
            y1={100 + r1 * Math.sin(angle)}
            x2={100 + r2 * Math.cos(angle)}
            y2={100 + r2 * Math.sin(angle)}
            stroke={`rgba(240,160,48,${i % 3 === 0 ? 0.4 : 0.15})`}
            strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + i * 0.02 }}
          />
        );
      })}
    </motion.svg>
  );
}

/* ─── Scroll indicator ──────────────────────────────────── */
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.5 }}
      style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <motion.span style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Découvrir
      </motion.span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      >
        <ChevronDown size={20} color="var(--accent2)" />
      </motion.div>
    </motion.div>
  );
}

/* ─── Feature card ──────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  description,
  gradient,
  delay,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  delay: number;
  onClick: () => void;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      style={{
        width: 320,
        padding: 32,
        background: gradient,
        border: '1px solid var(--border)',
        borderRadius: 20,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(240,160,48,0.05)',
          filter: 'blur(30px)',
        }}
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
      />
      <div style={{ marginBottom: 20, position: 'relative', zIndex: 1 }}>{icon}</div>
      <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, position: 'relative', zIndex: 1 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, position: 'relative', zIndex: 1 }}>{description}</p>
      <motion.div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--accent2)',
          position: 'relative',
          zIndex: 1,
        }}
        whileHover={{ x: 4 }}
      >
        Ouvrir <ArrowRight size={14} />
      </motion.div>
    </motion.div>
  );
}

/* ─── Animated workflow step ────────────────────────────── */
function WorkflowStep({ step, title, desc, delay }: { step: number; title: string; desc: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 20,
        padding: '20px 0',
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={inView ? { scale: 1 } : {}}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: 18,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        {step}
      </motion.div>
      <div>
        <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{title}</h4>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
      </div>
    </motion.div>
  );
}

/* ─── Animated pellet impact burst ──────────────────────── */
function ImpactBurst() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const impacts = useMemo(() =>
    Array.from({ length: 24 }).map(() => ({
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      size: Math.random() * 6 + 3,
      delay: Math.random() * 0.8,
    })), []);

  return (
    <div ref={ref} style={{ position: 'relative', width: 300, height: 300 }}>
      {/* Target circles */}
      {[120, 80, 40].map((r, i) => (
        <motion.div
          key={r}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: i * 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: r * 2,
            height: r * 2,
            marginLeft: -r,
            marginTop: -r,
            borderRadius: '50%',
            border: `1px solid rgba(240,160,48,${0.1 + i * 0.1})`,
          }}
        />
      ))}
      {/* Impact dots */}
      {impacts.map((imp, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 0.8 } : {}}
          transition={{ delay: 0.6 + imp.delay, type: 'spring', stiffness: 300, damping: 15 }}
          style={{
            position: 'absolute',
            left: `calc(50% + ${imp.x}px)`,
            top: `calc(50% + ${imp.y}px)`,
            width: imp.size,
            height: imp.size,
            borderRadius: '50%',
            background: 'var(--accent2)',
            boxShadow: '0 0 8px rgba(240,160,48,0.5)',
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN HOMEPAGE
   ═══════════════════════════════════════════════════════════ */
export function HomePage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Text reveal animation
  const titleWords = 'Analyse Balistique'.split('');

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg)' }}>

      {/* ─── HERO SECTION ────────────────────────────────────── */}
      <motion.section
        ref={heroRef}
        style={{
          height: 'calc(100vh - 56px)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          opacity: heroOpacity,
          scale: heroScale,
        }}
      >
        <ParticlesCanvas />

        {/* Radial glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(200,134,10,0.08) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(240,160,48,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,160,48,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 700 }}>
          {/* Animated crosshair */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <AnimatedCrosshair />
          </div>

          {/* Title with letter-by-letter reveal */}
          <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1, marginBottom: 16, letterSpacing: '-1.5px' }}>
            {titleWords.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 1.3 + i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(135deg, var(--accent2), #fff, var(--accent2))',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.8 }}
            style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 40px' }}
          >
            Journal de chasse — Analysez vos gerbes de tir, mesurez la dispersion et comparez vos munitions en temps réel.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/analyse')}
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 24px rgba(200,134,10,0.3)',
              }}
            >
              <Crosshair size={18} />
              Commencer l'analyse
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/bibliotheque')}
              style={{
                padding: '14px 32px',
                fontSize: 15,
                fontWeight: 600,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                color: 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <BookOpen size={18} />
              Bibliothèque
            </motion.button>
          </motion.div>
        </div>

        <ScrollIndicator />
      </motion.section>

      {/* ─── STATS BANNER ────────────────────────────────────── */}
      <section style={{
        padding: '60px 24px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 32,
        }}>
          {[
            { value: 4, suffix: '', label: 'Modes de visualisation 3D' },
            { value: 100, suffix: '%', label: 'Analyse côté client' },
            { value: 360, suffix: '°', label: 'Visualisation interactive' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15 }}
              style={{ textAlign: 'center', minWidth: 160 }}
            >
              <div style={{
                fontSize: 48,
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--accent2), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 1,
                marginBottom: 8,
              }}>
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500 }}>{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES SECTION ────────────────────────────────── */}
      <section style={{ padding: '100px 24px', position: 'relative' }}>
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <motion.div
            style={{
              display: 'inline-block',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--accent2)',
              background: 'var(--accent-glow)',
              padding: '6px 16px',
              borderRadius: 20,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Fonctionnalités
          </motion.div>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.8px', marginBottom: 12 }}>
            Tout pour analyser vos tirs
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
            De la photo au rapport complet — un outil pensé pour le chasseur exigeant.
          </p>
        </motion.div>

        {/* Feature cards */}
        <div style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 1100,
          margin: '0 auto',
        }}>
          <FeatureCard
            icon={<Crosshair size={36} color="var(--accent2)" />}
            title="Analyse de dispersion"
            description="Chargez une photo de cible, calibrez l'échelle et marquez chaque impact. Détection automatique avec réglage de sensibilité."
            gradient="linear-gradient(135deg, rgba(200,134,10,0.08), var(--surface))"
            delay={0}
            onClick={() => navigate('/analyse')}
          />
          <FeatureCard
            icon={
              <div style={{ display: 'flex', gap: 8 }}>
                <Database size={32} color="var(--blue)" />
                <BookOpen size={32} color="var(--blue)" />
              </div>
            }
            title="Bibliothèque munitions"
            description="Comparez jusqu'à 4 munitions côte à côte avec radar chart, overlay d'impacts et tri avancé."
            gradient="linear-gradient(135deg, rgba(77,171,247,0.08), var(--surface))"
            delay={0.15}
            onClick={() => navigate('/bibliotheque')}
          />
          <FeatureCard
            icon={<Box size={36} color="#c084fc" />}
            title="Modélisation 3D"
            description="Cône de dispersion, heatmap de densité, trajectoires animées et vue pénétration. 4 modes interactifs."
            gradient="linear-gradient(135deg, rgba(192,132,252,0.08), var(--surface))"
            delay={0.3}
            onClick={() => navigate('/3d')}
          />
        </div>
      </section>

      {/* ─── WORKFLOW SECTION ────────────────────────────────── */}
      <section style={{
        padding: '100px 24px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 60, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Left - Impact burst animation */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
          >
            <ImpactBurst />
          </motion.div>

          {/* Right - Workflow steps */}
          <div style={{ flex: 1, minWidth: 300 }}>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--accent2)',
                background: 'var(--accent-glow)',
                padding: '6px 16px',
                borderRadius: 20,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginBottom: 20,
                display: 'inline-block',
              }}
            >
              Comment ça marche
            </motion.div>
            <WorkflowStep step={1} title="Chargez votre photo" desc="Importez la photo de votre cible depuis votre appareil." delay={0} />
            <WorkflowStep step={2} title="Calibrez l'échelle" desc="Placez 2 points de référence pour convertir pixels en centimètres." delay={0.15} />
            <WorkflowStep step={3} title="Marquez les impacts" desc="Ajoutez manuellement ou utilisez la détection automatique." delay={0.3} />
            <WorkflowStep step={4} title="Analysez et sauvegardez" desc="Consultez les statistiques, visualisez en 3D et exportez." delay={0.45} />
          </div>
        </div>
      </section>

      {/* ─── TECH SECTION ────────────────────────────────────── */}
      <section style={{ padding: '80px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 50 }}
        >
          <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Construit avec les meilleures technos
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto' }}>
            Performance et précision au service de votre passion.
          </p>
        </motion.div>

        <div style={{
          display: 'flex',
          gap: 20,
          justifyContent: 'center',
          flexWrap: 'wrap',
          maxWidth: 800,
          margin: '0 auto',
        }}>
          {[
            { icon: <Layers size={20} />, label: 'React 19', color: '#61dafb' },
            { icon: <Box size={20} />, label: 'Three.js', color: '#c084fc' },
            { icon: <Zap size={20} />, label: 'Framer Motion', color: '#f0a030' },
            { icon: <Cpu size={20} />, label: 'Canvas API', color: '#2ecc71' },
            { icon: <Eye size={20} />, label: 'WebGL', color: '#e05252' },
            { icon: <BarChart3 size={20} />, label: 'Zustand', color: '#4dabf7' },
          ].map((tech, i) => (
            <motion.div
              key={tech.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, borderColor: tech.color }}
              style={{
                padding: '14px 24px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text)',
                transition: 'border-color 0.2s',
              }}
            >
              <span style={{ color: tech.color }}>{tech.icon}</span>
              {tech.label}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────── */}
      <section style={{
        padding: '80px 24px 100px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 50% 60% at 50% 80%, rgba(200,134,10,0.1) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ position: 'relative', zIndex: 1 }}
        >
          <Target size={48} color="var(--accent2)" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Prêt à analyser ?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
            Importez votre première photo de cible et découvrez la puissance de l'analyse balistique.
          </p>
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/analyse')}
            style={{
              padding: '16px 40px',
              fontSize: 16,
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              border: 'none',
              borderRadius: 14,
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: '0 8px 32px rgba(200,134,10,0.35)',
            }}
          >
            <Crosshair size={20} />
            Lancer une analyse
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{
        padding: '24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        fontSize: 12,
        color: 'var(--muted)',
      }}>
        Analyse Balistique v3.0 — Journal de chasse
      </footer>
    </div>
  );
}
