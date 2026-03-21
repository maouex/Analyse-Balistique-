import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair, Target, Radar, Shield,
  ChevronDown, ArrowRight, Cpu, BarChart3, Layers, Eye
} from 'lucide-react';
import { ParticleField } from '../components/landing/ParticleField';
import { CursorEffect } from '../components/landing/CursorEffect';
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
   WEAPON BLUEPRINT — SVG shotgun that assembles on scroll
   ═══════════════════════════════════════════════════════════ */
function WeaponBlueprint({ progress }: { progress: MotionValue<number> }) {
  // Part opacities — each part fades in during its phase
  const stockOp = useTransform(progress, [0, 0.05, 0.14], [0.04, 0.6, 1]);
  const receiverOp = useTransform(progress, [0.12, 0.20, 0.30], [0.04, 0.6, 1]);
  const barrelOp = useTransform(progress, [0.28, 0.38, 0.47], [0.04, 0.6, 1]);
  const triggerOp = useTransform(progress, [0.44, 0.54, 0.63], [0.04, 0.6, 1]);
  const forendOp = useTransform(progress, [0.60, 0.70, 0.80], [0.04, 0.6, 1]);
  const detailsOp = useTransform(progress, [0.76, 0.86, 0.94], [0.04, 0.6, 1]);

  // Labels per phase
  const lbl1 = useTransform(progress, [0, 0.03, 0.12, 0.167], [0, 1, 1, 0.15]);
  const lbl2 = useTransform(progress, [0.167, 0.20, 0.29, 0.333], [0, 1, 1, 0.15]);
  const lbl3 = useTransform(progress, [0.333, 0.37, 0.46, 0.5], [0, 1, 1, 0.15]);
  const lbl4 = useTransform(progress, [0.5, 0.53, 0.62, 0.667], [0, 1, 1, 0.15]);
  const lbl5 = useTransform(progress, [0.667, 0.70, 0.79, 0.833], [0, 1, 1, 0.15]);
  const lbl6 = useTransform(progress, [0.833, 0.86, 0.95, 1], [0, 1, 1, 1]);

  // Muzzle flash
  const flashOp = useTransform(progress, [0.91, 0.96, 1.0], [0, 1, 0.5]);
  const flashScale = useTransform(progress, [0.91, 0.96, 1.0], [0.3, 1.3, 0.9]);

  return (
    <div className="weapon-container">
      <svg viewBox="0 0 820 300" className="weapon-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="wp-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="wp-glow-strong">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ── Blueprint grid ── */}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`gh${i}`} x1="0" y1={i * 20} x2="820" y2={i * 20}
            stroke="rgba(0,255,65,0.025)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 42 }, (_, i) => (
          <line key={`gv${i}`} x1={i * 20} y1="0" x2={i * 20} y2="300"
            stroke="rgba(0,255,65,0.025)" strokeWidth="0.5" />
        ))}
        {/* Center lines */}
        <line x1="0" y1="150" x2="820" y2="150"
          stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" strokeDasharray="6 4" />
        <line x1="410" y1="0" x2="410" y2="300"
          stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" strokeDasharray="6 4" />

        {/* ══════ Phase 1 : CROSSE ══════ */}
        <motion.g style={{ opacity: stockOp }} filter="url(#wp-glow)">
          {/* Buttpad */}
          <rect x="52" y="108" width="9" height="96"
            fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1.5" />
          {/* Stock body */}
          <path d={`
            M 61,108 L 225,95 L 237,95 L 237,200
            L 225,200 L 225,212 L 202,230 L 182,234 L 61,204 Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />
          {/* Grip checkering */}
          <line x1="182" y1="198" x2="210" y2="220" stroke="rgba(0,255,65,0.18)" strokeWidth="0.5" />
          <line x1="172" y1="198" x2="200" y2="220" stroke="rgba(0,255,65,0.18)" strokeWidth="0.5" />
          <line x1="162" y1="198" x2="190" y2="220" stroke="rgba(0,255,65,0.18)" strokeWidth="0.5" />
          <line x1="152" y1="196" x2="180" y2="218" stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
        </motion.g>
        <motion.g style={{ opacity: lbl1 }}>
          <text x="145" y="268" className="bp-label" textAnchor="middle">CROSSE</text>
          <line x1="145" y1="258" x2="145" y2="238"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 2 : BOÎTIER / RECEIVER ══════ */}
        <motion.g style={{ opacity: receiverOp }} filter="url(#wp-glow)">
          {/* Main body */}
          <rect x="237" y="86" width="205" height="84"
            fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />
          {/* Top rail (Picatinny) */}
          <rect x="237" y="78" width="205" height="10"
            fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="1" />
          {/* Rail notches */}
          {Array.from({ length: 15 }, (_, i) => (
            <line key={`rail${i}`}
              x1={245 + i * 13} y1="78" x2={245 + i * 13} y2="88"
              stroke="rgba(0,255,65,0.1)" strokeWidth="0.5" />
          ))}
          {/* Ejection port */}
          <rect x="295" y="96" width="58" height="30"
            fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="1" strokeDasharray="3 2" />
          {/* Bolt */}
          <line x1="365" y1="96" x2="365" y2="126"
            stroke="rgba(0,255,65,0.3)" strokeWidth="2" />
          <line x1="360" y1="110" x2="370" y2="110"
            stroke="rgba(0,255,65,0.3)" strokeWidth="1.5" />
        </motion.g>
        <motion.g style={{ opacity: lbl2 }}>
          <text x="340" y="58" className="bp-label" textAnchor="middle">BOÎTIER DE CULASSE</text>
          <line x1="340" y1="64" x2="340" y2="76"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 3 : CANON / BARREL ══════ */}
        <motion.g style={{ opacity: barrelOp }} filter="url(#wp-glow)">
          {/* Main barrel */}
          <rect x="442" y="94" width="345" height="22"
            fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />
          {/* Vent rib */}
          <line x1="442" y1="90" x2="768" y2="90"
            stroke="#00ff41" strokeWidth="1" />
          {/* Muzzle end */}
          <rect x="785" y="88" width="14" height="30"
            fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="1.5" />
          {/* Bore center line */}
          <line x1="444" y1="105" x2="784" y2="105"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" strokeDasharray="10 5" />
        </motion.g>
        <motion.g style={{ opacity: lbl3 }}>
          <text x="610" y="58" className="bp-label" textAnchor="middle">CANON</text>
          <line x1="610" y1="64" x2="610" y2="88"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* Dimension line */}
          <line x1="442" y1="70" x2="787" y2="70"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <line x1="442" y1="66" x2="442" y2="74"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <line x1="787" y1="66" x2="787" y2="74"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <text x="615" y="67" className="bp-dim" textAnchor="middle">76 cm</text>
        </motion.g>

        {/* ══════ Phase 4 : DÉTENTE / TRIGGER ══════ */}
        <motion.g style={{ opacity: triggerOp }} filter="url(#wp-glow)">
          {/* Trigger guard */}
          <path d="M 300,170 L 300,218 Q 305,238 325,238 L 365,238 Q 385,238 385,218 L 385,170"
            fill="none" stroke="#00ff41" strokeWidth="1.5" />
          {/* Trigger */}
          <path d="M 345,178 L 340,220"
            fill="none" stroke="#00ff41" strokeWidth="2.5" strokeLinecap="round" />
          {/* Safety switch */}
          <circle cx="262" cy="88" r="5"
            fill="none" stroke="#00ff41" strokeWidth="1" />
          <circle cx="262" cy="88" r="2"
            fill="#00ff41" />
          {/* Pin */}
          <circle cx="395" cy="130" r="3"
            fill="none" stroke="rgba(0,255,65,0.4)" strokeWidth="1" />
        </motion.g>
        <motion.g style={{ opacity: lbl4 }}>
          <text x="345" y="268" className="bp-label" textAnchor="middle">DÉTENTE</text>
          <line x1="345" y1="258" x2="345" y2="242"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 5 : GARDE-MAIN + MAGASIN ══════ */}
        <motion.g style={{ opacity: forendOp }} filter="url(#wp-glow)">
          {/* Forend / pump handle */}
          <rect x="480" y="84" width="130" height="62"
            fill="rgba(0,255,65,0.04)" stroke="#00ff41" strokeWidth="1.5" />
          {/* Forend ribs */}
          {Array.from({ length: 6 }, (_, i) => (
            <line key={`frib${i}`}
              x1={492 + i * 20} y1="87" x2={492 + i * 20} y2="143"
              stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          ))}
          {/* Magazine tube */}
          <rect x="442" y="122" width="275" height="14"
            fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1" />
          {/* Mag cap */}
          <circle cx="720" cy="129" r="8"
            fill="none" stroke="#00ff41" strokeWidth="1.5" />
          <circle cx="720" cy="129" r="3"
            fill="rgba(0,255,65,0.2)" stroke="rgba(0,255,65,0.4)" strokeWidth="0.5" />
        </motion.g>
        <motion.g style={{ opacity: lbl5 }}>
          <text x="545" y="165" className="bp-label" textAnchor="middle">GARDE-MAIN</text>
          <text x="582" y="148" className="bp-dim" textAnchor="start">MAG. TUBULAIRE</text>
        </motion.g>

        {/* ══════ Phase 6 : DÉTAILS FINAUX ══════ */}
        <motion.g style={{ opacity: detailsOp }} filter="url(#wp-glow)">
          {/* Front sight */}
          <polygon points="768,85 775,90 761,90"
            fill="#00ff41" stroke="#00ff41" strokeWidth="0.5" />
          {/* Rear sight */}
          <path d="M 242,78 L 242,72 L 252,72 L 252,78"
            fill="none" stroke="#00ff41" strokeWidth="1" />
          {/* Sling swivels */}
          <circle cx="476" cy="143" r="3"
            fill="none" stroke="rgba(0,255,65,0.5)" strokeWidth="1" />
          <circle cx="82" cy="202" r="3"
            fill="none" stroke="rgba(0,255,65,0.5)" strokeWidth="1" />
          {/* Shell in chamber */}
          <ellipse cx="325" cy="112" rx="20" ry="10"
            fill="rgba(0,255,65,0.08)" stroke="rgba(0,255,65,0.4)" strokeWidth="1" />
          {/* Shell head */}
          <line x1="305" y1="104" x2="305" y2="120"
            stroke="rgba(0,255,65,0.3)" strokeWidth="1" />
        </motion.g>
        <motion.g style={{ opacity: lbl6 }}>
          <text x="410" y="285" className="bp-label-lg" textAnchor="middle">
            SYSTÈME OPÉRATIONNEL
          </text>
          <line x1="220" y1="280" x2="600" y2="280"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
        </motion.g>

        {/* ══════ MUZZLE FLASH ══════ */}
        <motion.g style={{ opacity: flashOp, scale: flashScale, transformOrigin: '799px 105px' }}>
          <line x1="800" y1="105" x2="850" y2="80" stroke="#00ff41" strokeWidth="2.5" />
          <line x1="800" y1="105" x2="860" y2="98" stroke="#00ff41" strokeWidth="2.5" />
          <line x1="800" y1="105" x2="860" y2="112" stroke="#00ff41" strokeWidth="2.5" />
          <line x1="800" y1="105" x2="850" y2="130" stroke="#00ff41" strokeWidth="2.5" />
          <line x1="800" y1="105" x2="835" y2="140" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" />
          <line x1="800" y1="105" x2="835" y2="70" stroke="rgba(0,255,65,0.5)" strokeWidth="1.5" />
          <circle cx="800" cy="105" r="10" fill="rgba(0,255,65,0.4)" />
          <circle cx="800" cy="105" r="20" fill="none" stroke="rgba(0,255,65,0.2)" strokeWidth="1.5" />
          <circle cx="800" cy="105" r="30" fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="1" />
        </motion.g>
      </svg>
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
