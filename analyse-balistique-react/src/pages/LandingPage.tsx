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

        {/* ══════ Phase 1 : CROSSE (Browning Auto-5) ══════ */}
        <motion.g style={{ opacity: stockOp }} filter="url(#wp-glow)">
          {/* Buttpad — slightly concave rubber pad */}
          <path d="M 60,106 Q 52,156 60,206 L 55,206 Q 47,156 55,106 Z"
            fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1.2" />
          {/* Buttpad grooves */}
          {[120, 135, 150, 165, 180, 195].map(yy => (
            <line key={`bp${yy}`} x1="53" y1={yy} x2="59" y2={yy}
              stroke="rgba(0,255,65,0.2)" strokeWidth="0.4" />
          ))}

          {/* Stock body — Auto-5 semi-pistol grip profile */}
          <path d={`
            M 240,84
            C 225,85 210,87 190,90
            L 105,99
            Q 80,102 65,107
            L 60,106
            Q 52,156 60,206
            L 68,208
            Q 85,213 120,218
            L 178,225
            C 198,229 212,234 222,237
            Q 232,239 236,230
            C 239,222 240,210 240,170
            Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Comb line — subtle interior detail */}
          <path d="M 195,90 Q 150,94 105,99"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.5" />

          {/* Wrist grain lines */}
          <path d="M 230,95 Q 228,130 232,165"
            fill="none" stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" />
          <path d="M 222,93 Q 220,130 224,168"
            fill="none" stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" />

          {/* Checkering — diamond cross-hatch on grip area */}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`ckf${i}`}
              x1={186 + i * 5} y1="210"
              x2={192 + i * 5} y2="233"
              stroke="rgba(0,255,65,0.10)" strokeWidth="0.4" />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`ckb${i}`}
              x1={196 + i * 5} y1="210"
              x2={190 + i * 5} y2="233"
              stroke="rgba(0,255,65,0.10)" strokeWidth="0.4" />
          ))}

          {/* Stock through-bolt */}
          <circle cx="130" cy="155" r="3"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.8" />
          <circle cx="130" cy="155" r="1"
            fill="rgba(0,255,65,0.2)" />

          {/* Sling swivel stud — rear */}
          <circle cx="80" cy="210" r="2"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.8" />
        </motion.g>
        <motion.g style={{ opacity: lbl1 }}>
          <text x="145" y="262" className="bp-label" textAnchor="middle">CROSSE</text>
          <line x1="145" y1="252" x2="145" y2="240"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 2 : BOÎTIER DE CULASSE — HUMPBACK ══════ */}
        <motion.g style={{ opacity: receiverOp }} filter="url(#wp-glow)">
          {/* Receiver body — signature humpback profile */}
          <path d={`
            M 240,84
            L 240,170
            L 340,170
            L 340,165
            Q 380,165 420,155
            C 435,150 442,140 445,125
            L 445,92
            Q 443,90 440,89
            L 420,87
            C 400,85 380,82 360,78
            C 340,74 310,68 285,66
            Q 265,65 250,68
            C 245,70 242,75 240,84
            Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Hump interior arch — recoil spring housing detail */}
          <path d="M 252,76 C 270,70 310,68 340,74 Q 370,78 400,84"
            fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="0.5" />

          {/* Top surface rib / sight channel */}
          <path d="M 252,72 C 280,67 320,66 360,72"
            fill="none" stroke="rgba(0,255,65,0.12)" strokeWidth="0.6" />

          {/* Ejection port — oval cutout (Auto-5 style) */}
          <path d={`
            M 300,82 Q 310,78 330,78 Q 350,78 358,82
            L 358,112
            Q 350,116 330,116 Q 310,116 300,112 Z
          `} fill="rgba(0,255,65,0.02)" stroke="rgba(0,255,65,0.35)" strokeWidth="1"
            strokeDasharray="3 2" />

          {/* Bolt face visible through port */}
          <line x1="305" y1="97" x2="355" y2="97"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.8" />

          {/* Charging handle */}
          <path d="M 352,83 L 362,80 L 365,83 L 355,86 Z"
            fill="rgba(0,255,65,0.08)" stroke="#00ff41" strokeWidth="0.8" />

          {/* Loading port — underside opening */}
          <rect x="310" y="166" width="65" height="6" rx="2"
            fill="none" stroke="rgba(0,255,65,0.25)" strokeWidth="0.8" strokeDasharray="3 2" />

          {/* Barrel ring — front of receiver where barrel inserts */}
          <path d={`
            M 440,89 L 448,89 L 448,122 L 440,122
          `} fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="1.2" />
          {/* Barrel ring inner circle */}
          <circle cx="444" cy="105" r="14"
            fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.6" />

          {/* Receiver pins */}
          <circle cx="270" cy="130" r="2"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.7" />
          <circle cx="400" cy="120" r="2"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.7" />

          {/* Tang screw */}
          <circle cx="244" cy="90" r="1.5"
            fill="rgba(0,255,65,0.15)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5" />
        </motion.g>
        <motion.g style={{ opacity: lbl2 }}>
          <text x="310" y="52" className="bp-label" textAnchor="middle">BOÎTIER DE CULASSE</text>
          <line x1="310" y1="56" x2="310" y2="65"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 3 : CANON ══════ */}
        <motion.g style={{ opacity: barrelOp }} filter="url(#wp-glow)">
          {/* Barrel body — slight taper from breech to muzzle */}
          <path d={`
            M 448,92 L 790,94
            Q 794,94 796,96
            L 796,114
            Q 794,116 790,116
            L 448,118
            Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Chamber area — slightly thicker at breech */}
          <path d="M 448,90 Q 455,89 470,90 L 470,92 L 448,92 Z"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" />
          <path d="M 448,118 L 470,118 L 470,120 Q 455,121 448,120 Z"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" />

          {/* Ventilated rib — two parallel rails */}
          <line x1="455" y1="89" x2="790" y2="91"
            stroke="#00ff41" strokeWidth="0.8" />
          <line x1="455" y1="86" x2="790" y2="88"
            stroke="#00ff41" strokeWidth="0.8" />

          {/* Rib ventilation holes */}
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={`vent${i}`}
              cx={470 + i * 18} cy={87.5 + i * 0.11}
              r="1.2"
              fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.15)" strokeWidth="0.4" />
          ))}

          {/* Rib posts — connect rib to barrel top */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`post${i}`}
              x1={475 + i * 40} y1={89 + i * 0.25}
              x2={475 + i * 40} y2={92 + i * 0.25}
              stroke="rgba(0,255,65,0.2)" strokeWidth="0.6" />
          ))}

          {/* Front bead sight */}
          <circle cx="788" cy="88" r="2.5"
            fill="rgba(0,255,65,0.3)" stroke="#00ff41" strokeWidth="0.8" />
          {/* Bead stanchion */}
          <line x1="788" y1="90" x2="788" y2="93"
            stroke="#00ff41" strokeWidth="0.8" />

          {/* Muzzle / choke area */}
          <path d={`
            M 790,94 Q 795,93 798,94
            L 798,116
            Q 795,117 790,116
          `} fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="1" />
          {/* Choke internal rings */}
          <line x1="793" y1="97" x2="793" y2="113" stroke="rgba(0,255,65,0.1)" strokeWidth="0.4" />
          <line x1="795" y1="98" x2="795" y2="112" stroke="rgba(0,255,65,0.08)" strokeWidth="0.4" />

          {/* Bore center line */}
          <line x1="450" y1="105" x2="790" y2="105"
            stroke="rgba(0,255,65,0.10)" strokeWidth="0.5" strokeDasharray="10 5" />
        </motion.g>
        <motion.g style={{ opacity: lbl3 }}>
          <text x="620" y="56" className="bp-label" textAnchor="middle">CANON</text>
          <line x1="620" y1="60" x2="620" y2="84"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* Dimension line */}
          <line x1="448" y1="72" x2="796" y2="72"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <line x1="448" y1="68" x2="448" y2="76"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <line x1="796" y1="68" x2="796" y2="76"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <text x="622" y="69" className="bp-dim" textAnchor="middle">71 cm</text>
        </motion.g>

        {/* ══════ Phase 4 : DÉTENTE ══════ */}
        <motion.g style={{ opacity: triggerOp }} filter="url(#wp-glow)">
          {/* Trigger group housing — drops below receiver */}
          <path d={`
            M 298,170 L 298,178
            Q 298,182 302,182
            L 382,182
            Q 386,182 386,178
            L 386,170
          `} fill="rgba(0,255,65,0.02)" stroke="#00ff41" strokeWidth="1" />

          {/* Trigger guard — rounded Auto-5 profile */}
          <path d={`
            M 298,182
            L 298,218
            Q 298,240 316,244
            L 345,244
            Q 375,244 386,228
            L 386,182
          `} fill="none" stroke="#00ff41" strokeWidth="1.5" />

          {/* Trigger guard inner edge */}
          <path d={`
            M 302,182
            L 302,216
            Q 302,236 318,240
            L 343,240
            Q 371,240 382,226
            L 382,182
          `} fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="0.5" />

          {/* Trigger blade — curved with shoe */}
          <path d={`
            M 344,186
            C 342,192 340,200 339,210
            Q 338,218 336,222
            L 340,224
            Q 344,224 346,222
            C 346,216 345,206 345,196
            Z
          `} fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1.2" />

          {/* Cross-bolt safety — behind trigger guard */}
          <rect x="300" y="174" width="14" height="5" rx="2.5"
            fill="rgba(0,255,65,0.1)" stroke="#00ff41" strokeWidth="0.8" />
          {/* Safety indicator dot */}
          <circle cx="307" cy="176.5" r="1"
            fill="#00ff41" />

          {/* Trigger pin */}
          <circle cx="340" cy="186" r="2"
            fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="0.7" />
          {/* Hammer pin */}
          <circle cx="365" cy="176" r="2"
            fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="0.7" />

          {/* Carrier/shell lifter — visible at loading port */}
          <path d="M 315,166 L 370,166 L 368,170 L 317,170 Z"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" />

          {/* Barrel release lever — in front of trigger guard (Auto-5 specific) */}
          <path d="M 388,175 Q 395,172 400,175 L 398,180 Q 392,182 388,180 Z"
            fill="rgba(0,255,65,0.05)" stroke="rgba(0,255,65,0.35)" strokeWidth="0.7" />
        </motion.g>
        <motion.g style={{ opacity: lbl4 }}>
          <text x="342" y="268" className="bp-label" textAnchor="middle">DÉTENTE</text>
          <line x1="342" y1="258" x2="342" y2="248"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 5 : GARDE-MAIN FIXE + MAGASIN ══════ */}
        <motion.g style={{ opacity: forendOp }} filter="url(#wp-glow)">
          {/* Forearm — fixed (semi-auto, not pump), ergonomic rounded profile */}
          <path d={`
            M 455,88
            Q 465,84 490,82
            L 600,82
            Q 615,83 620,88
            L 620,122
            Q 615,128 600,130
            L 490,130
            Q 465,128 455,122
            Z
          `} fill="rgba(0,255,65,0.04)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Forearm longitudinal grooves — characteristic wood lines */}
          {Array.from({ length: 6 }, (_, i) => (
            <path key={`fg${i}`}
              d={`M ${465 + i * 2},${90 + i * 6} Q ${540},${88 + i * 6.5} ${615 - i * 2},${90 + i * 6}`}
              fill="none"
              stroke="rgba(0,255,65,0.08)" strokeWidth="0.4" />
          ))}

          {/* Forearm checkering */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`fcf${i}`}
              x1={500 + i * 10} y1="95"
              x2={505 + i * 10} y2="118"
              stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`fcb${i}`}
              x1={505 + i * 10} y1="95"
              x2={500 + i * 10} y2="118"
              stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
          ))}

          {/* Magazine tube — cylindrical, extends beyond forearm */}
          <path d={`
            M 448,122 L 710,122
            Q 715,122 715,126
            L 715,132
            Q 715,136 710,136
            L 448,136
            Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1" />

          {/* Magazine tube spring (internal, dashed) */}
          <line x1="455" y1="129" x2="705" y2="129"
            stroke="rgba(0,255,65,0.06)" strokeWidth="0.4" strokeDasharray="4 3" />

          {/* Magazine cap — threaded end cap */}
          <path d={`
            M 715,120 Q 724,120 726,125
            L 726,133
            Q 724,138 715,138
          `} fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1.2" />
          {/* Cap knurling */}
          {[123, 126, 129, 132, 135].map(yy => (
            <line key={`knrl${yy}`} x1="717" y1={yy} x2="724" y2={yy}
              stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" />
          ))}

          {/* Barrel clamp — connects magazine tube to barrel */}
          <rect x="695" y="116" width="6" height="8" rx="1"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.7" />
          <rect x="695" y="132" width="6" height="6" rx="1"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.7" />

          {/* Friction ring — key Auto-5 recoil mechanism element */}
          <rect x="452" y="120" width="8" height="18" rx="1"
            fill="rgba(0,255,65,0.05)" stroke="rgba(0,255,65,0.25)" strokeWidth="0.6" />
          <text x="456" y="148" className="bp-dim" textAnchor="middle"
            style={{ fontSize: '5px' }}>FR</text>
        </motion.g>
        <motion.g style={{ opacity: lbl5 }}>
          <text x="540" y="152" className="bp-label" textAnchor="middle">GARDE-MAIN</text>
          <text x="600" y="145" className="bp-dim" textAnchor="start">MAG. TUBULAIRE</text>
        </motion.g>

        {/* ══════ Phase 6 : DÉTAILS FINAUX ══════ */}
        <motion.g style={{ opacity: detailsOp }} filter="url(#wp-glow)">
          {/* Front bead sight — improved with glow halo */}
          <circle cx="788" cy="86" r="4"
            fill="none" stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <circle cx="788" cy="86" r="2"
            fill="rgba(0,255,65,0.4)" stroke="#00ff41" strokeWidth="0.6" />

          {/* Rear sight — V-notch on receiver (Auto-5 style) */}
          <path d="M 258,68 L 262,74 L 266,68"
            fill="none" stroke="#00ff41" strokeWidth="1" />
          <rect x="255" y="65" width="14" height="3" rx="1"
            fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="0.6" />

          {/* Sling swivel — front (on mag cap) */}
          <path d="M 720,140 Q 720,148 716,148 Q 712,148 712,140"
            fill="none" stroke="rgba(0,255,65,0.4)" strokeWidth="0.8" />
          <circle cx="716" cy="148" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5" />

          {/* Sling swivel — rear (on stock) */}
          <path d="M 80,212 Q 80,220 76,220 Q 72,220 72,212"
            fill="none" stroke="rgba(0,255,65,0.4)" strokeWidth="0.8" />
          <circle cx="76" cy="220" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5" />

          {/* Shell in chamber — 12 gauge shotshell profile */}
          {/* Hull */}
          <rect x="310" y="98" width="42" height="16" rx="2"
            fill="rgba(0,255,65,0.06)" stroke="rgba(0,255,65,0.35)" strokeWidth="0.8" />
          {/* Brass head */}
          <rect x="305" y="97" width="8" height="18" rx="1"
            fill="rgba(0,255,65,0.1)" stroke="rgba(0,255,65,0.45)" strokeWidth="0.8" />
          {/* Primer */}
          <circle cx="309" cy="106" r="2"
            fill="rgba(0,255,65,0.08)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.5" />
          {/* Star crimp lines */}
          <line x1="350" y1="100" x2="352" y2="106"
            stroke="rgba(0,255,65,0.2)" strokeWidth="0.4" />
          <line x1="350" y1="112" x2="352" y2="106"
            stroke="rgba(0,255,65,0.2)" strokeWidth="0.4" />
          <line x1="349" y1="106" x2="352" y2="106"
            stroke="rgba(0,255,65,0.2)" strokeWidth="0.4" />

          {/* Manufacturer markings area — decorative blueprint detail */}
          <rect x="510" y="97" width="60" height="8" rx="1"
            fill="none" stroke="rgba(0,255,65,0.08)" strokeWidth="0.3" strokeDasharray="2 1" />
          <line x1="514" y1="101" x2="564" y2="101"
            stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
          <line x1="514" y1="103" x2="550" y2="103"
            stroke="rgba(0,255,65,0.04)" strokeWidth="0.3" />

          {/* Friction ring detail — Auto-5 recoil system indicator */}
          <circle cx="456" cy="129" r="5"
            fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" strokeDasharray="2 1" />

          {/* Action bar lock button — left side of receiver */}
          <rect x="385" y="160" width="10" height="6" rx="2"
            fill="rgba(0,255,65,0.05)" stroke="rgba(0,255,65,0.25)" strokeWidth="0.6" />
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
