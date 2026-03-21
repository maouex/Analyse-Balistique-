import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair, Target, Radar, Shield,
  ChevronDown, ArrowRight, Cpu, BarChart3, Layers, Eye
} from 'lucide-react';
import { ParticleField } from '../components/landing/ParticleField';
import { CursorEffect } from '../components/landing/CursorEffect';
import weaponSvgUrl from '../assets/weapon/Gemini_Generated_Image_sc2ixtsc2ixtsc2i (1).svg';
import './LandingPage.css';

/* ═══════════════════════════════════════════════════════════
   SECTION DATA
   ═══════════════════════════════════════════════════════════ */
const SECTIONS = [
  {
    tag: 'ANALYSE',
    icon: Eye,
    title: 'Analyse Visuelle',
    desc: "Import et analyse d'images de cibles. Détection automatique des impacts avec calibration d'échelle précise.",
    details: ['Détection automatique des impacts', 'Calibration en mm/px', 'Export haute résolution'],
    side: 'left' as const,
    phase: '01',
  },
  {
    tag: 'PHYSIQUE',
    icon: Cpu,
    title: 'Moteur Balistique',
    desc: "Simulation physique intégrant gravité, traînée aérodynamique et conditions atmosphériques réalistes.",
    details: ['F_d = ½·ρ·v²·C_d·A', 'Trajectoire parabolique corrigée', "Énergie cinétique à l'impact"],
    side: 'right' as const,
    phase: '02',
  },
  {
    tag: 'VISUALISATION',
    icon: Layers,
    title: '8 Modes 3D',
    desc: "Huit modes de visualisation Three.js pour une analyse exhaustive de la dispersion.",
    details: ['Trajectoires & Cône', 'Heatmaps impact & énergie', 'Simulation réaliste temps réel'],
    side: 'left' as const,
    phase: '03',
  },
  {
    tag: 'PERFORMANCES',
    icon: BarChart3,
    title: 'Précision Absolue',
    desc: "Calculs balistiques en temps réel optimisés via Web Workers dédiés.",
    details: ['60 fps rendu 3D', '10 000+ projectiles/sec', '< 1ms temps de calcul'],
    side: 'right' as const,
    phase: '04',
  },
  {
    tag: 'ARSENAL',
    icon: Shield,
    title: 'Arsenal Complet',
    desc: "Bibliothèque de munitions, comparaison multicritères et rapports professionnels.",
    details: ['Bibliothèque de munitions', 'Comparaison multicritères', 'Export PDF & PNG'],
    side: 'left' as const,
    phase: '05',
  },
  {
    tag: 'DÉPLOIEMENT',
    icon: Target,
    title: 'Prêt au Tir',
    desc: "Système complet d'analyse balistique. Simulation, visualisation 3D et rapports unifiés.",
    details: [],
    side: 'center' as const,
    phase: '06',
  },
];

/* ═══════════════════════════════════════════════════════════
   SCROLL PANEL — text content driven by scroll progress
   ═══════════════════════════════════════════════════════════ */
function ScrollPanel({ progress, range, side, children }: {
  progress: MotionValue<number>;
  range: [number, number];
  side: 'left' | 'right' | 'center';
  children: React.ReactNode;
}) {
  const span = range[1] - range[0];
  const S = range[0];

  const opacity = useTransform(progress,
    [S, S + span * 0.12, S + span * 0.22, S + span * 0.68, S + span * 0.85, range[1]],
    [0, 0.6, 1, 1, 0.4, 0],
  );

  const xOff = side === 'left' ? -80 : side === 'right' ? 80 : 0;
  const yOff = side === 'center' ? 50 : 0;

  const x = useTransform(progress,
    [S, S + span * 0.22, S + span * 0.68, range[1]],
    [xOff, 0, 0, -xOff * 0.5],
  );
  const y = useTransform(progress,
    [S, S + span * 0.22, S + span * 0.68, range[1]],
    [yOff, 0, 0, -yOff * 0.5],
  );

  return (
    <motion.div className={`scroll-panel panel-${side}`} style={{ opacity, x, y }}>
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   WEAPON BLUEPRINT — Piece-by-piece assembly from real SVG
   Complete weapon (Y≥400 in SVG) clipped into 6 horizontal
   zones, each fading in during its scroll phase.
   ═══════════════════════════════════════════════════════════ */

/* Horizontal clip zones of the complete weapon (% of viewport width) */
const WEAPON_SLICES = [
  { clip: 'inset(0 83% 0 0)',     label: 'CROSSE',              dim: '36 cm' },
  { clip: 'inset(0 62% 0 17%)',   label: 'BOÎTIER DE CULASSE',  dim: null },
  { clip: 'inset(0 45% 0 38%)',   label: 'MÉCANISME DE TIR',    dim: null },
  { clip: 'inset(0 28% 0 55%)',   label: 'GARDE-MAIN',          dim: 'MAG. TUBULAIRE' },
  { clip: 'inset(0 10% 0 72%)',   label: 'CANON',               dim: '76 cm' },
  { clip: 'inset(0 0  0 90%)',    label: 'SYSTÈME OPÉRATIONNEL', dim: null },
];

function WeaponBlueprint({ progress }: { progress: MotionValue<number> }) {
  // Each slice fades in during its phase
  const sliceOps = [
    useTransform(progress, [0, 0.05, 0.14],     [0.04, 0.6, 1]),
    useTransform(progress, [0.12, 0.20, 0.30],   [0.04, 0.6, 1]),
    useTransform(progress, [0.28, 0.38, 0.47],   [0.04, 0.6, 1]),
    useTransform(progress, [0.44, 0.54, 0.63],   [0.04, 0.6, 1]),
    useTransform(progress, [0.60, 0.70, 0.80],   [0.04, 0.6, 1]),
    useTransform(progress, [0.76, 0.86, 0.94],   [0.04, 0.6, 1]),
  ];

  // Phase labels
  const lbl1 = useTransform(progress, [0, 0.03, 0.12, 0.167],       [0, 1, 1, 0.15]);
  const lbl2 = useTransform(progress, [0.167, 0.20, 0.29, 0.333],   [0, 1, 1, 0.15]);
  const lbl3 = useTransform(progress, [0.333, 0.37, 0.46, 0.5],     [0, 1, 1, 0.15]);
  const lbl4 = useTransform(progress, [0.5, 0.53, 0.62, 0.667],     [0, 1, 1, 0.15]);
  const lbl5 = useTransform(progress, [0.667, 0.70, 0.79, 0.833],   [0, 1, 1, 0.15]);
  const lbl6 = useTransform(progress, [0.833, 0.87, 0.95, 1],       [0, 1, 1, 1]);
  const labelOps = [lbl1, lbl2, lbl3, lbl4, lbl5, lbl6];

  // Scan line follows the latest revealed edge
  const scanLeftPct = useTransform(progress,
    [0, 0.14, 0.167, 0.30, 0.333, 0.47, 0.5, 0.63, 0.667, 0.80, 0.833, 0.94],
    [0, 17, 17, 38, 38, 55, 55, 72, 72, 90, 90, 100],
  );
  const scanLeft = useTransform(scanLeftPct, (v: number) => `${v}%`);
  const scanOpacity = useTransform(progress, [0, 0.02, 0.92, 0.95], [0, 0.7, 0.7, 0]);

  // Muzzle flash
  const flashOp = useTransform(progress, [0.91, 0.96, 1.0], [0, 1, 0.5]);
  const flashScale = useTransform(progress, [0.91, 0.96, 1.0], [0.3, 1.3, 0.9]);

  return (
    <div className="weapon-container">
      {/* Viewport — shows only the complete weapon section */}
      <div className="weapon-viewport">
        {/* Ghost: faint full weapon silhouette */}
        <img src={weaponSvgUrl} className="weapon-img weapon-ghost" alt="" draggable={false} />

        {/* 6 clipped slices — each fades in during its phase */}
        {WEAPON_SLICES.map((slice, i) => (
          <motion.div key={i} className="weapon-slice" style={{ clipPath: slice.clip, opacity: sliceOps[i] }}>
            <img src={weaponSvgUrl} className="weapon-img weapon-main" alt="" draggable={false} />
          </motion.div>
        ))}

        {/* Vertical scan line at the latest reveal edge */}
        <motion.div className="weapon-scanline" style={{ left: scanLeft, opacity: scanOpacity }} />
      </div>

      {/* Phase labels */}
      <div className="weapon-label-layer">
        {WEAPON_SLICES.map((slice, i) => (
          <motion.div
            key={i}
            className={`weapon-label ${i === 5 ? 'weapon-label-final' : ''}`}
            style={{ opacity: labelOps[i] }}
          >
            <span className="weapon-label-text">{slice.label}</span>
            {slice.dim && <span className="weapon-label-dim">{slice.dim}</span>}
          </motion.div>
        ))}
      </div>

      {/* Muzzle flash */}
      <motion.div
        className="muzzle-flash"
        style={{ opacity: flashOp, scale: flashScale }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RETICLE ANIMATION (hero)
   ═══════════════════════════════════════════════════════════ */
function Reticle() {
  return (
    <motion.div
      className="reticle"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 200 200" width="280" height="280">
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,255,65,0.12)" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(0,255,65,0.16)" strokeWidth="1" />
        <line x1="100" y1="0" x2="100" y2="40" stroke="rgba(0,255,65,0.25)" strokeWidth="1" />
        <line x1="100" y1="160" x2="100" y2="200" stroke="rgba(0,255,65,0.25)" strokeWidth="1" />
        <line x1="0" y1="100" x2="40" y2="100" stroke="rgba(0,255,65,0.25)" strokeWidth="1" />
        <line x1="160" y1="100" x2="200" y2="100" stroke="rgba(0,255,65,0.25)" strokeWidth="1" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1={100 + 85 * Math.cos((angle * Math.PI) / 180)}
            y1={100 + 85 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 95 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 95 * Math.sin((angle * Math.PI) / 180)}
            stroke="rgba(0,255,65,0.2)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN LANDING PAGE
   ═══════════════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Nav opacity
  const { scrollY } = useScroll({ container: containerRef });
  const navOpacity = useTransform(scrollY, [0, 400], [0, 1]);

  // Weapon assembly scroll progress
  const { scrollYProgress: wp } = useScroll({
    container: containerRef,
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  // Active section index for phase dots
  const [activeSection, setActiveSection] = useState(-1);
  useEffect(() => {
    const unsub = wp.on('change', (v: number) => {
      if (v <= 0) setActiveSection(-1);
      else setActiveSection(Math.min(5, Math.floor(v * 6)));
    });
    return unsub;
  }, [wp]);

  const goToApp = () => navigate('/analyse');

  // Panel ranges (6 panels, each 1/6 of progress)
  const ranges: [number, number][] = [
    [0, 0.167], [0.167, 0.333], [0.333, 0.5],
    [0.5, 0.667], [0.667, 0.833], [0.833, 1.0],
  ];

  return (
    <div className="landing-root" ref={containerRef}>
      <ParticleField />
      <CursorEffect />
      <div className="scanlines" />
      <div className="tactical-grid" />

      {/* ─── Floating nav ─── */}
      <motion.nav className="landing-nav" style={{ opacity: navOpacity }}>
        <div className="nav-brand">
          <Crosshair size={20} />
          <span>S.A.G.</span>
        </div>
        <button className="nav-cta" onClick={goToApp}>
          Accéder au simulateur <ArrowRight size={16} />
        </button>
      </motion.nav>

      {/* ═══ HERO SECTION ═══ */}
      <section className="landing-section hero-section">
        <Reticle />
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="hero-badge">
            <Radar size={14} />
            <span>SYSTÈME D&apos;ANALYSE DE GERBE v2.0</span>
          </div>
          <h1 className="hero-title">
            <span className="hero-title-line">ANALYSE</span>
            <span className="hero-title-line accent">BALISTIQUE</span>
            <span className="hero-title-line sub">AVANCÉE</span>
          </h1>
          <p className="hero-subtitle">
            Plateforme de simulation et d&apos;analyse de dispersion balistique
            en temps réel. Modélisation physique haute fidélité.
          </p>
          <div className="hero-actions">
            <button className="btn-tactical primary" onClick={goToApp}>
              <Target size={18} />
              Lancer le simulateur
            </button>
            <button className="btn-tactical secondary" onClick={() => {
              const track = trackRef.current;
              if (track) track.scrollIntoView({ behavior: 'smooth' });
            }}>
              Découvrir
              <ChevronDown size={16} />
            </button>
          </div>
          <div className="hero-coordinates">
            <span>LAT 48.8566° N</span>
            <span className="sep">|</span>
            <span>LON 2.3522° E</span>
            <span className="sep">|</span>
            <span>ALT 35m</span>
          </div>
        </motion.div>
        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* ═══ WEAPON ASSEMBLY TRACK ═══ */}
      <div className="weapon-track" ref={trackRef}>
        <div className="weapon-sticky">
          {/* Central weapon SVG */}
          <WeaponBlueprint progress={wp} />

          {/* Phase indicator dots */}
          <div className="phase-dots">
            {SECTIONS.map((sec, i) => (
              <div
                key={i}
                className={`phase-dot ${
                  activeSection === i ? 'active' : ''
                } ${activeSection > i ? 'completed' : ''}`}
              >
                <div className="phase-dot-pip" />
                <span className="phase-dot-label">{sec.phase}</span>
              </div>
            ))}
          </div>

          {/* ─── Text panels ─── */}
          {SECTIONS.map((sec, i) => {
            const Icon = sec.icon;
            const isLast = i === SECTIONS.length - 1;

            return (
              <ScrollPanel
                key={i}
                progress={wp}
                range={ranges[i]}
                side={sec.side}
              >
                <div className={`panel-card ${isLast ? 'panel-cta' : ''}`}>
                  <div className="panel-tag">
                    <Icon size={14} />
                    <span>{sec.tag}</span>
                    <span className="panel-phase">{sec.phase}/06</span>
                  </div>
                  <h3 className="panel-title">{sec.title}</h3>
                  <div className="panel-line" />
                  <p className="panel-desc">{sec.desc}</p>
                  {sec.details.length > 0 && (
                    <ul className="panel-details">
                      {sec.details.map((d, j) => (
                        <li key={j}>{d}</li>
                      ))}
                    </ul>
                  )}
                  {isLast && (
                    <div className="panel-cta-actions">
                      <motion.button
                        className="btn-tactical primary large"
                        onClick={goToApp}
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(0,255,65,0.3)' }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Target size={20} />
                        Lancer S.A.G.
                        <ArrowRight size={18} />
                      </motion.button>
                      <div className="panel-tech-stack">
                        <span>React 19</span>
                        <span>Three.js</span>
                        <span>TypeScript</span>
                        <span>Web Workers</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollPanel>
            );
          })}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-line" />
        <div className="footer-content">
          <span className="footer-brand">
            <Crosshair size={14} /> S.A.G.
          </span>
          <span className="footer-copy">
            Système d&apos;Analyse de Gerbe — {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
