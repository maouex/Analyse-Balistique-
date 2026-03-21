import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair, Target, Radar, Shield,
  ChevronDown, ArrowRight, Cpu, BarChart3, Layers, Eye
} from 'lucide-react';
import { ParticleField } from '../components/landing/ParticleField';
import { CursorEffect } from '../components/landing/CursorEffect';
import weaponSvgUrl from '../assets/weapon/vectorised-1774111953907.svg';
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
   WEAPON BLUEPRINT — Real SVG with CSS night-vision filter
   Progressive clip-path reveal driven by scroll
   ═══════════════════════════════════════════════════════════ */
function WeaponBlueprint({ progress }: { progress: MotionValue<number> }) {
  // Progressive reveal from left (stock) to right (muzzle)
  const revealPct = useTransform(progress, [0, 0.85], [0, 100]);
  const clipPath = useTransform(revealPct, (v: number) => `inset(0 ${100 - v}% 0 0)`);

  // Scan line follows the reveal edge
  const scanLeft = useTransform(revealPct, (v: number) => `${v}%`);
  const scanOpacity = useTransform(progress, [0, 0.02, 0.83, 0.86], [0, 0.8, 0.8, 0]);

  // Overall glow intensifies
  const mainOpacity = useTransform(progress, [0, 0.5, 1], [0.7, 0.85, 1]);

  // Phase labels
  const lbl1 = useTransform(progress, [0, 0.03, 0.12, 0.167], [0, 1, 1, 0.15]);
  const lbl2 = useTransform(progress, [0.167, 0.20, 0.29, 0.333], [0, 1, 1, 0.15]);
  const lbl3 = useTransform(progress, [0.333, 0.37, 0.46, 0.5], [0, 1, 1, 0.15]);
  const lbl4 = useTransform(progress, [0.5, 0.53, 0.62, 0.667], [0, 1, 1, 0.15]);
  const lbl5 = useTransform(progress, [0.667, 0.70, 0.79, 0.833], [0, 1, 1, 0.15]);
  const lbl6 = useTransform(progress, [0.833, 0.87, 0.95, 1], [0, 1, 1, 1]);

  // Muzzle flash
  const flashOp = useTransform(progress, [0.88, 0.94, 1.0], [0, 1, 0.5]);
  const flashScale = useTransform(progress, [0.88, 0.94, 1.0], [0.3, 1.5, 1]);

  return (
    <div className="weapon-container">
      {/* Ghost: always visible, very faint outline */}
      <img src={weaponSvgUrl} className="weapon-img weapon-ghost" alt="" draggable={false} />

      {/* Main: progressively revealed from left to right */}
      <motion.div className="weapon-reveal" style={{ clipPath }}>
        <motion.img
          src={weaponSvgUrl}
          className="weapon-img weapon-main"
          style={{ opacity: mainOpacity }}
          alt=""
          draggable={false}
        />
      </motion.div>

      {/* Scan line at the reveal edge */}
      <motion.div className="weapon-scanline" style={{ left: scanLeft, opacity: scanOpacity }} />

      {/* Blueprint labels overlay (positioned to match 1140x912 viewBox) */}
      <svg viewBox="0 0 1140 912" className="weapon-labels" preserveAspectRatio="xMidYMid meet">
        {/* Phase 1: CROSSE (Stock area, left side) */}
        <motion.g style={{ opacity: lbl1 }}>
          <text x="180" y="590" className="bp-label" textAnchor="middle">CROSSE</text>
          <line x1="180" y1="578" x2="180" y2="545"
            stroke="rgba(0,255,65,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          {/* Dimension */}
          <line x1="70" y1="360" x2="300" y2="360"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <line x1="70" y1="354" x2="70" y2="366"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <line x1="300" y1="354" x2="300" y2="366"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <text x="185" y="355" className="bp-dim" textAnchor="middle">36 cm</text>
        </motion.g>

        {/* Phase 2: BOÎTIER DE CULASSE (Receiver, center) */}
        <motion.g style={{ opacity: lbl2 }}>
          <text x="430" y="340" className="bp-label" textAnchor="middle">BOÎTIER DE CULASSE</text>
          <line x1="430" y1="348" x2="430" y2="375"
            stroke="rgba(0,255,65,0.4)" strokeWidth="1" strokeDasharray="3 3" />
        </motion.g>

        {/* Phase 3: CANON (Barrel, right side) */}
        <motion.g style={{ opacity: lbl3 }}>
          <text x="750" y="340" className="bp-label" textAnchor="middle">CANON</text>
          <line x1="750" y1="348" x2="750" y2="375"
            stroke="rgba(0,255,65,0.4)" strokeWidth="1" strokeDasharray="3 3" />
          {/* Barrel dimension */}
          <line x1="540" y1="362" x2="1050" y2="362"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <line x1="540" y1="356" x2="540" y2="368"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <line x1="1050" y1="356" x2="1050" y2="368"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <text x="795" y="358" className="bp-dim" textAnchor="middle">76 cm</text>
        </motion.g>

        {/* Phase 4: DÉTENTE (Trigger guard area) */}
        <motion.g style={{ opacity: lbl4 }}>
          <text x="360" y="590" className="bp-label" textAnchor="middle">DÉTENTE</text>
          <line x1="360" y1="578" x2="360" y2="550"
            stroke="rgba(0,255,65,0.4)" strokeWidth="1" strokeDasharray="3 3" />
        </motion.g>

        {/* Phase 5: GARDE-MAIN + MAGASIN */}
        <motion.g style={{ opacity: lbl5 }}>
          <text x="550" y="560" className="bp-label" textAnchor="middle">GARDE-MAIN</text>
          <text x="680" y="530" className="bp-dim" textAnchor="middle">MAG. TUBULAIRE</text>
        </motion.g>

        {/* Phase 6: SYSTÈME COMPLET */}
        <motion.g style={{ opacity: lbl6 }}>
          <text x="570" y="660" className="bp-label-lg" textAnchor="middle">
            SYSTÈME OPÉRATIONNEL
          </text>
          <line x1="300" y1="650" x2="840" y2="650"
            stroke="rgba(0,255,65,0.12)" strokeWidth="1" />
        </motion.g>

        {/* Blueprint center lines */}
        <line x1="0" y1="456" x2="1140" y2="456"
          stroke="rgba(0,255,65,0.03)" strokeWidth="0.5" strokeDasharray="8 6" />
        <line x1="570" y1="300" x2="570" y2="650"
          stroke="rgba(0,255,65,0.03)" strokeWidth="0.5" strokeDasharray="8 6" />
      </svg>

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
