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
function ScrollPanel({ progress, range, side, keepVisible, children }: {
  progress: MotionValue<number>;
  range: [number, number];
  side: 'left' | 'right' | 'center';
  keepVisible?: boolean;
  children: React.ReactNode;
}) {
  const span = range[1] - range[0];
  const S = range[0];

  const opacity = useTransform(progress,
    keepVisible
      ? [S, S + span * 0.12, S + span * 0.22, range[1]]
      : [S, S + span * 0.12, S + span * 0.22, S + span * 0.68, S + span * 0.85, range[1]],
    keepVisible
      ? [0, 0.6, 1, 1]
      : [0, 0.6, 1, 1, 0.4, 0],
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


        {/* ═══ Auto-traced gun silhouette path (from reference image) ═══ */}
        {/* Uses clipPaths to reveal each part during scroll phases */}
        <defs>
          {/* Phase 1: Crosse + Plaque de couche (left portion) */}
          <clipPath id="clip-crosse">
            <rect x="0" y="0" width="270" height="300" />
          </clipPath>
          {/* Phase 2: Bloc de culasse + chien */}
          <clipPath id="clip-culasse">
            <rect x="270" y="0" width="80" height="300" />
          </clipPath>
          {/* Phase 3: Canon + bande ventilée */}
          <clipPath id="clip-canon">
            <rect x="350" y="0" width="500" height="120" />
          </clipPath>
          {/* Phase 4: Détente + pontet */}
          <clipPath id="clip-detente">
            <rect x="270" y="120" width="130" height="180" />
          </clipPath>
          {/* Phase 5: Fût */}
          <clipPath id="clip-fut">
            <rect x="350" y="100" width="220" height="100" />
          </clipPath>
        </defs>

        {/* The complete traced gun path data */}
        {(() => {
          const gunPath = "M 784.3,78.2 C 780.6,80.1 778.9,80.2 762.0,79.7 C 751.9,79.3 740.1,79.1 735.8,79.2 C 731.4,79.2 720.5,79.2 711.7,79.2 C 702.7,79.2 691.8,79.2 687.4,79.2 C 683.1,79.2 672.1,79.2 663.0,79.2 C 654.0,79.2 643.0,79.2 638.6,79.2 C 634.3,79.2 623.2,79.2 614.2,79.2 C 605.2,79.2 594.1,79.2 589.8,79.2 C 585.4,79.2 574.4,79.2 565.3,79.2 C 556.3,79.2 545.3,79.2 540.9,79.2 C 536.6,79.2 525.6,79.2 516.8,79.2 C 507.9,79.2 497.0,79.2 492.6,79.2 C 470.2,79.0 440.0,79.2 417.2,79.5 C 407.6,79.7 388.3,79.9 374.5,80.0 C 349.3,80.2 349.3,80.2 349.3,83.4 C 349.3,86.6 349.3,86.6 340.9,86.6 C 332.9,86.6 332.4,86.5 332.1,84.1 C 331.7,81.9 331.4,81.8 320.1,82.1 C 300.6,82.5 288.4,85.1 276.0,91.3 C 273.3,92.6 268.6,94.3 265.4,95.1 C 262.2,95.8 257.2,97.5 254.2,98.8 C 251.3,100.1 245.7,102.2 242.0,103.3 C 238.2,104.5 231.2,107.2 226.4,109.3 C 216.9,113.5 214.8,113.8 211.5,111.5 C 208.7,109.5 187.2,108.2 185.1,110.0 C 184.3,110.8 179.0,111.2 171.9,111.2 C 165.6,111.3 160.3,111.6 160.3,112.0 C 160.3,112.5 155.4,113.1 149.3,113.5 C 143.4,113.8 134.5,114.7 129.5,115.2 C 124.5,115.9 115.2,116.7 108.8,117.3 C 102.4,117.9 93.8,118.8 89.7,119.6 C 85.6,120.2 78.9,121.2 74.8,121.6 C 70.8,122.1 61.6,123.2 54.6,124.1 C 47.6,125.0 39.1,125.7 35.8,125.8 C 30.8,125.8 29.5,126.3 28.4,128.0 C 27.6,129.1 25.9,130.1 24.6,130.1 C 21.2,130.1 20.0,134.1 20.3,143.8 C 20.6,151.3 20.7,151.8 23.3,152.4 C 26.9,153.2 29.8,160.8 29.0,167.3 C 28.7,169.9 29.0,175.4 29.6,179.7 C 30.2,183.8 30.7,193.9 30.8,202.0 C 30.9,210.0 31.5,217.3 32.1,217.9 C 32.7,218.9 32.3,219.6 30.2,220.3 C 25.7,222.0 26.8,227.1 31.7,227.6 C 35.2,227.9 37.8,227.0 55.1,219.5 C 64.9,215.2 72.8,212.1 77.8,210.3 C 80.5,209.2 83.1,207.9 83.4,207.5 C 83.7,207.0 84.8,206.5 85.9,206.5 C 87.0,206.5 88.1,205.9 88.4,205.1 C 88.7,204.3 90.5,203.4 92.5,203.0 C 96.1,202.5 107.6,198.2 112.7,195.3 C 114.3,194.4 117.4,193.1 119.6,192.2 C 124.8,190.3 143.6,182.5 149.1,180.0 C 151.5,178.9 155.5,177.2 158.1,176.3 C 160.8,175.2 166.6,172.8 171.2,170.8 C 179.6,166.9 182.6,167.0 182.6,171.1 C 182.6,173.2 186.1,174.7 191.3,174.7 C 194.2,174.7 197.3,175.6 200.1,177.3 C 205.3,180.5 212.7,180.8 216.1,178.1 C 217.4,177.1 220.4,172.5 222.8,167.8 C 225.4,163.1 227.8,159.1 228.2,158.8 C 228.8,158.4 229.3,156.7 229.5,155.0 C 229.7,152.9 230.4,151.8 231.9,151.4 C 233.1,151.2 236.5,148.8 239.5,146.0 C 242.3,143.3 246.5,140.2 248.5,139.1 C 250.5,138.1 252.9,136.6 253.8,135.8 C 254.8,135.0 258.6,133.6 262.3,132.9 C 266.0,132.0 270.6,130.8 272.3,130.1 C 274.1,129.3 278.5,128.6 282.4,128.5 C 296.8,127.9 308.9,125.3 311.4,122.3 C 314.1,119.2 320.2,118.0 332.6,118.3 C 337.1,118.4 341.3,118.2 341.8,117.9 C 343.8,116.6 380.8,116.7 382.0,118.0 C 382.6,118.6 383.2,120.5 383.5,122.2 C 383.8,125.3 383.8,125.3 415.6,125.6 C 433.1,125.7 456.8,125.4 468.2,124.8 C 479.5,124.1 498.7,123.4 510.6,123.2 C 535.7,122.6 537.2,122.3 537.2,118.9 C 537.2,117.6 537.7,116.1 538.3,115.8 C 538.9,115.4 539.3,115.7 539.3,116.2 C 539.3,116.8 540.3,117.3 541.3,117.3 C 542.5,117.3 543.8,118.3 544.1,119.5 C 545.7,124.4 558.4,120.4 558.4,115.0 C 558.4,109.8 554.3,110.0 679.6,109.9 C 786.9,109.9 797.1,109.8 797.8,108.2 C 798.1,107.3 798.7,100.9 799.0,94.1 C 800.0,76.6 795.9,72.1 784.3,78.2 Z";
          return (
            <>
              {/* ══════ Phase 1 : CROSSE + PLAQUE DE COUCHE ══════ */}
              <motion.g style={{ opacity: stockOp }} filter="url(#wp-glow)">
                <path d={gunPath} clipPath="url(#clip-crosse)"
                  fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />
              </motion.g>
              <motion.g style={{ opacity: lbl1 }}>
                <text x="120" y="255" className="bp-label" textAnchor="middle">CROSSE</text>
                <line x1="120" y1="248" x2="120" y2="232"
                  stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
                <text x="28" y="255" className="bp-dim" textAnchor="middle">PLAQUE DE COUCHE</text>
              </motion.g>

              {/* ══════ Phase 2 : BLOC DE CULASSE + CHIEN ══════ */}
              <motion.g style={{ opacity: receiverOp }} filter="url(#wp-glow)">
                <path d={gunPath} clipPath="url(#clip-culasse)"
                  fill="rgba(0,255,65,0.04)" stroke="#00ff41" strokeWidth="1.5" />
              </motion.g>
              <motion.g style={{ opacity: lbl2 }}>
                <text x="310" y="60" className="bp-label" textAnchor="middle">BLOC DE CULASSE</text>
                <line x1="310" y1="65" x2="310" y2="78"
                  stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
              </motion.g>

              {/* ══════ Phase 3 : CANON + BANDE VENTILÉE ══════ */}
              <motion.g style={{ opacity: barrelOp }} filter="url(#wp-glow)">
                <path d={gunPath} clipPath="url(#clip-canon)"
                  fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />
              </motion.g>
              <motion.g style={{ opacity: lbl3 }}>
                <text x="580" y="60" className="bp-label" textAnchor="middle">CANON</text>
                <line x1="580" y1="65" x2="580" y2="76"
                  stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
                <text x="620" y="72" className="bp-dim" textAnchor="middle">BANDE VENTILÉE</text>
                {/* Dimension line */}
                <line x1="350" y1="68" x2="798" y2="68"
                  stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
                <line x1="350" y1="64" x2="350" y2="72"
                  stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
                <line x1="798" y1="64" x2="798" y2="72"
                  stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
                <text x="574" y="66" className="bp-dim" textAnchor="middle">76 cm</text>
              </motion.g>

              {/* ══════ Phase 4 : DÉTENTE + PONTET ══════ */}
              <motion.g style={{ opacity: triggerOp }} filter="url(#wp-glow)">
                <path d={gunPath} clipPath="url(#clip-detente)"
                  fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />
              </motion.g>
              <motion.g style={{ opacity: lbl4 }}>
                <text x="320" y="195" className="bp-label" textAnchor="middle">PONTET</text>
                <line x1="320" y1="190" x2="320" y2="182"
                  stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
                <text x="320" y="205" className="bp-dim" textAnchor="middle">DÉTENTE</text>
              </motion.g>

              {/* ══════ Phase 5 : FÛT ══════ */}
              <motion.g style={{ opacity: forendOp }} filter="url(#wp-glow)">
                <path d={gunPath} clipPath="url(#clip-fut)"
                  fill="rgba(0,255,65,0.04)" stroke="#00ff41" strokeWidth="1.5" />
              </motion.g>
              <motion.g style={{ opacity: lbl5 }}>
                <text x="460" y="140" className="bp-label" textAnchor="middle">FÛT</text>
                <line x1="460" y1="135" x2="460" y2="128"
                  stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
              </motion.g>

              {/* ══════ Phase 6 : DÉTAILS FINAUX ══════ */}
              <motion.g style={{ opacity: detailsOp }} filter="url(#wp-glow)">
                {/* Guidon (front bead) glow */}
                <circle cx="789" cy="78" r="5"
                  fill="none" stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
                <circle cx="789" cy="78" r="2"
                  fill="rgba(0,255,65,0.4)" stroke="#00ff41" strokeWidth="0.6" />
                <text x="789" y="66" className="bp-dim" textAnchor="middle">GUIDON</text>

                {/* Bouche label */}
                <text x="800" y="118" className="bp-dim" textAnchor="middle">BOUCHE</text>

                {/* Bore center line */}
                <line x1="350" y1="95" x2="798" y2="95"
                  stroke="rgba(0,255,65,0.06)" strokeWidth="0.5" strokeDasharray="10 5" />

                {/* Proof marks on barrel */}
                <circle cx="420" cy="100" r="3"
                  fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
                <circle cx="432" cy="100" r="3"
                  fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />

                {/* Sling swivel rear */}
                <path d="M 50,220 Q 50,228 46,228 Q 42,228 42,220"
                  fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.7" />

                {/* Receiver engraving detail */}
                <rect x="290" y="94" width="30" height="7" rx="1"
                  fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" strokeDasharray="1.5 1" />
              </motion.g>
              <motion.g style={{ opacity: lbl6 }}>
                <text x="420" y="280" className="bp-label-lg" textAnchor="middle">
                  SYSTÈME OPÉRATIONNEL
                </text>
                <line x1="250" y1="275" x2="590" y2="275"
                  stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
              </motion.g>
            </>
          );
        })()}

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
                keepVisible={isLast}
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
