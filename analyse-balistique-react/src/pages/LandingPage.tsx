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


        {/* ══════ Phase 1 : CROSSE + PLAQUE DE COUCHE ══════ */}
        <motion.g style={{ opacity: stockOp }} filter="url(#wp-glow)">
          {/* Plaque de couche — thin angled rubber pad, slightly concave */}
          <path d={`
            M 62,98
            L 52,96
            Q 45,158 50,220
            L 60,222
            Q 61,158 62,98
            Z
          `} fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1.2" />
          {/* Buttpad grooves */}
          {[115, 132, 150, 168, 185, 202].map(yy => (
            <line key={`bpg${yy}`} x1={51 + (yy - 115) * 0.02} y1={yy} x2="60" y2={yy}
              stroke="rgba(0,255,65,0.2)" strokeWidth="0.4" />
          ))}

          {/* Corps de crosse — profil semi-pistol grip fidèle à la référence */}
          <path d={`
            M 270,82
            C 255,83 235,86 210,89
            C 175,93 135,96 100,99
            Q 80,100 62,98
            Q 61,158 60,222
            C 80,226 120,232 155,234
            C 180,234 200,230 215,222
            C 228,214 238,200 245,186
            C 252,170 260,155 268,145
            L 270,140
            Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Grain de bois — courbes naturelles du noyer */}
          <path d="M 85,115 Q 155,112 225,105"
            fill="none" stroke="rgba(0,255,65,0.04)" strokeWidth="0.5" />
          <path d="M 80,135 Q 150,132 220,124"
            fill="none" stroke="rgba(0,255,65,0.035)" strokeWidth="0.5" />
          <path d="M 78,158 Q 148,155 218,145"
            fill="none" stroke="rgba(0,255,65,0.03)" strokeWidth="0.5" />
          <path d="M 78,180 Q 140,178 200,168"
            fill="none" stroke="rgba(0,255,65,0.025)" strokeWidth="0.5" />

          {/* Checkering — motif diamant sur la poignée */}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`ckf${i}`}
              x1={195 + i * 5} y1="200"
              x2={205 + i * 5} y2="228"
              stroke="rgba(0,255,65,0.09)" strokeWidth="0.4" />
          ))}
          {Array.from({ length: 12 }, (_, i) => (
            <line key={`ckb${i}`}
              x1={205 + i * 5} y1="200"
              x2={195 + i * 5} y2="228"
              stroke="rgba(0,255,65,0.09)" strokeWidth="0.4" />
          ))}

          {/* Vis de crosse traversante */}
          <circle cx="145" cy="162" r="3.5"
            fill="none" stroke="rgba(0,255,65,0.25)" strokeWidth="0.8" />
          <circle cx="145" cy="162" r="1.2"
            fill="rgba(0,255,65,0.15)" />

          {/* Grenadière arrière (sling stud) */}
          <circle cx="85" cy="215" r="2"
            fill="none" stroke="rgba(0,255,65,0.25)" strokeWidth="0.7" />
        </motion.g>
        <motion.g style={{ opacity: lbl1 }}>
          <text x="100" y="262" className="bp-label" textAnchor="middle">CROSSE</text>
          <line x1="100" y1="254" x2="100" y2="240"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="55" y="260" className="bp-dim" textAnchor="middle">PLAQUE</text>
        </motion.g>

        {/* ══════ Phase 2 : BLOC DE CULASSE + CHIEN ══════ */}
        <motion.g style={{ opacity: receiverOp }} filter="url(#wp-glow)">
          {/* Bloc de culasse — compact break-action receiver */}
          <path d={`
            M 270,82
            L 270,140
            Q 270,148 278,150
            L 310,150
            Q 318,148 318,140
            L 318,95
            Q 316,88 310,86
            L 278,83
            Q 274,82 270,82
            Z
          `} fill="rgba(0,255,65,0.04)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Chien (external hammer) — visible on top */}
          <path d={`
            M 280,82
            L 278,72
            Q 278,65 284,62
            L 290,62
            Q 296,65 296,72
            L 294,82
          `} fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1.2" />
          {/* Hammer spur texture */}
          <line x1="282" y1="66" x2="292" y2="66"
            stroke="rgba(0,255,65,0.2)" strokeWidth="0.4" />
          <line x1="281" y1="69" x2="293" y2="69"
            stroke="rgba(0,255,65,0.15)" strokeWidth="0.4" />

          {/* Hinge pin — front of receiver (break-action pivot) */}
          <circle cx="314" cy="115" r="4"
            fill="none" stroke="#00ff41" strokeWidth="1" />
          <circle cx="314" cy="115" r="1.5"
            fill="rgba(0,255,65,0.2)" />

          {/* Top lever / ouverture — on receiver top */}
          <path d="M 296,83 L 296,80 Q 302,78 308,80 L 308,83"
            fill="rgba(0,255,65,0.05)" stroke="rgba(0,255,65,0.4)" strokeWidth="0.7" />

          {/* Receiver engraving lines — decorative */}
          <path d="M 275,100 Q 292,96 312,100"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.4" />
          <path d="M 275,130 Q 292,126 312,130"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.4" />

          {/* Receiver pin — trigger attachment */}
          <circle cx="290" cy="142" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.3)" strokeWidth="0.6" />

          {/* Tang (extension into stock) */}
          <path d="M 270,82 L 270,86 L 262,87 L 262,83 Z"
            fill="rgba(0,255,65,0.03)" stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" />
        </motion.g>
        <motion.g style={{ opacity: lbl2 }}>
          <text x="294" y="52" className="bp-label" textAnchor="middle">BLOC DE CULASSE</text>
          <line x1="294" y1="55" x2="294" y2="61"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="287" y="48" className="bp-dim" textAnchor="middle">CHIEN</text>
        </motion.g>

        {/* ══════ Phase 3 : CANON + BANDE VENTILÉE ══════ */}
        <motion.g style={{ opacity: barrelOp }} filter="url(#wp-glow)">
          {/* Corps du canon — slight taper breech to muzzle */}
          <path d={`
            M 318,96
            L 790,97
            Q 795,97 797,100
            L 797,112
            Q 795,115 790,115
            L 318,116
            Z
          `} fill="rgba(0,255,65,0.03)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Chamber — slightly thicker at breech */}
          <path d="M 318,94 Q 330,93 345,94 L 345,96 L 318,96 Z"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />
          <path d="M 318,116 L 345,116 L 345,118 Q 330,119 318,118 Z"
            fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.15)" strokeWidth="0.5" />

          {/* Bande ventilée — two parallel rails with rib posts */}
          <line x1="325" y1="93" x2="790" y2="94"
            stroke="#00ff41" strokeWidth="0.7" />
          <line x1="325" y1="90" x2="790" y2="91"
            stroke="#00ff41" strokeWidth="0.7" />

          {/* Ventilation holes between rib rails */}
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={`vent${i}`}
              cx={340 + i * 20} cy={91.5 + i * 0.045}
              r="1"
              fill="rgba(0,255,65,0.04)" stroke="rgba(0,255,65,0.12)" strokeWidth="0.3" />
          ))}

          {/* Rib support posts */}
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`post${i}`}
              x1={350 + i * 45} y1={93 + i * 0.1}
              x2={350 + i * 45} y2={96 + i * 0.1}
              stroke="rgba(0,255,65,0.18)" strokeWidth="0.5" />
          ))}

          {/* Guidon (front bead) */}
          <circle cx="789" cy="90" r="2.5"
            fill="rgba(0,255,65,0.35)" stroke="#00ff41" strokeWidth="0.8" />
          <line x1="789" y1="92" x2="789" y2="96"
            stroke="#00ff41" strokeWidth="0.8" />

          {/* Bouche (muzzle) */}
          <path d={`
            M 790,97 Q 796,96 798,98
            L 798,114
            Q 796,116 790,115
          `} fill="rgba(0,255,65,0.05)" stroke="#00ff41" strokeWidth="1" />

          {/* Bore center line */}
          <line x1="320" y1="106" x2="792" y2="106"
            stroke="rgba(0,255,65,0.08)" strokeWidth="0.5" strokeDasharray="10 5" />
        </motion.g>
        <motion.g style={{ opacity: lbl3 }}>
          <text x="560" y="56" className="bp-label" textAnchor="middle">CANON</text>
          <line x1="560" y1="60" x2="560" y2="88"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="560" y="84" className="bp-dim" textAnchor="middle">BANDE VENTILÉE</text>
          {/* Dimension line */}
          <line x1="318" y1="74" x2="797" y2="74"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <line x1="318" y1="70" x2="318" y2="78"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <line x1="797" y1="70" x2="797" y2="78"
            stroke="rgba(0,255,65,0.12)" strokeWidth="0.5" />
          <text x="558" y="71" className="bp-dim" textAnchor="middle">76 cm</text>
          {/* Bouche label */}
          <text x="797" y="128" className="bp-dim" textAnchor="middle">BOUCHE</text>
        </motion.g>

        {/* ══════ Phase 4 : DÉTENTE + PONTET ══════ */}
        <motion.g style={{ opacity: triggerOp }} filter="url(#wp-glow)">
          {/* Pontet (trigger guard) — rounded oval profile */}
          <path d={`
            M 278,150
            L 278,172
            Q 278,198 296,202
            L 306,202
            Q 318,198 318,172
            L 318,150
          `} fill="none" stroke="#00ff41" strokeWidth="1.5" />

          {/* Pontet inner edge */}
          <path d={`
            M 282,150
            L 282,170
            Q 282,194 298,198
            L 304,198
            Q 314,194 314,170
            L 314,150
          `} fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.4" />

          {/* Détente (trigger blade) — curved, with shoe at bottom */}
          <path d={`
            M 300,156
            C 298,164 296,174 295,182
            Q 294,188 293,190
            L 296,192
            Q 300,192 302,190
            C 302,184 301,172 301,162
            Z
          `} fill="rgba(0,255,65,0.06)" stroke="#00ff41" strokeWidth="1" />

          {/* Trigger pin */}
          <circle cx="300" cy="155" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="0.6" />

          {/* Sûreté — safety button on tang */}
          <rect x="268" y="84" width="6" height="4" rx="1.5"
            fill="rgba(0,255,65,0.12)" stroke="#00ff41" strokeWidth="0.7" />
        </motion.g>
        <motion.g style={{ opacity: lbl4 }}>
          <text x="298" y="222" className="bp-label" textAnchor="middle">PONTET</text>
          <line x1="298" y1="216" x2="298" y2="206"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="298" y="232" className="bp-dim" textAnchor="middle">DÉTENTE</text>
        </motion.g>

        {/* ══════ Phase 5 : FÛT (Garde-main) ══════ */}
        <motion.g style={{ opacity: forendOp }} filter="url(#wp-glow)">
          {/* Fût — wood forearm, tapered ergonomic shape below barrel */}
          <path d={`
            M 328,118
            Q 340,120 365,124
            C 390,128 410,130 430,130
            Q 442,128 448,124
            L 448,134
            Q 442,142 430,144
            C 410,146 390,146 365,144
            Q 340,142 328,138
            Z
          `} fill="rgba(0,255,65,0.04)" stroke="#00ff41" strokeWidth="1.5" />

          {/* Wood grain — longitudinal lines following the fût shape */}
          <path d="M 335,124 Q 388,126 440,126"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.4" />
          <path d="M 332,130 Q 388,132 445,130"
            fill="none" stroke="rgba(0,255,65,0.05)" strokeWidth="0.4" />
          <path d="M 333,136 Q 388,138 443,136"
            fill="none" stroke="rgba(0,255,65,0.04)" strokeWidth="0.4" />

          {/* Fût checkering — subtle finger grip texture */}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`ftc1${i}`}
              x1={358 + i * 8} y1="124"
              x2={362 + i * 8} y2="142"
              stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`ftc2${i}`}
              x1={362 + i * 8} y1="124"
              x2={358 + i * 8} y2="142"
              stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
          ))}

          {/* Forearm latch — front attachment to barrel */}
          <path d="M 448,122 L 455,120 L 455,132 L 448,134"
            fill="rgba(0,255,65,0.03)" stroke="rgba(0,255,65,0.25)" strokeWidth="0.6" />

          {/* Forearm screw */}
          <circle cx="340" cy="131" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" />
        </motion.g>
        <motion.g style={{ opacity: lbl5 }}>
          <text x="390" y="162" className="bp-label" textAnchor="middle">FÛT</text>
          <line x1="390" y1="156" x2="390" y2="148"
            stroke="rgba(0,255,65,0.35)" strokeWidth="0.5" strokeDasharray="2 2" />
        </motion.g>

        {/* ══════ Phase 6 : DÉTAILS FINAUX ══════ */}
        <motion.g style={{ opacity: detailsOp }} filter="url(#wp-glow)">
          {/* Guidon — front bead glow halo */}
          <circle cx="789" cy="89" r="5"
            fill="none" stroke="rgba(0,255,65,0.1)" strokeWidth="0.5" />
          <circle cx="789" cy="89" r="2.5"
            fill="rgba(0,255,65,0.4)" stroke="#00ff41" strokeWidth="0.6" />

          {/* Sling swivel — front (on fût/barrel) */}
          <path d="M 448,136 Q 448,144 444,144 Q 440,144 440,136"
            fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="0.7" />
          <circle cx="444" cy="144" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.25)" strokeWidth="0.5" />

          {/* Sling swivel — rear (on crosse) */}
          <path d="M 85,218 Q 85,226 81,226 Q 77,226 77,218"
            fill="none" stroke="rgba(0,255,65,0.35)" strokeWidth="0.7" />
          <circle cx="81" cy="226" r="1.5"
            fill="none" stroke="rgba(0,255,65,0.25)" strokeWidth="0.5" />

          {/* Cartouche calibre 12 — dans la chambre */}
          <rect x="322" y="100" width="20" height="12" rx="1.5"
            fill="rgba(0,255,65,0.06)" stroke="rgba(0,255,65,0.3)" strokeWidth="0.7" />
          {/* Culot laiton */}
          <rect x="318" y="99" width="6" height="14" rx="1"
            fill="rgba(0,255,65,0.1)" stroke="rgba(0,255,65,0.4)" strokeWidth="0.7" />
          {/* Amorce */}
          <circle cx="321" cy="106" r="1.5"
            fill="rgba(0,255,65,0.06)" stroke="rgba(0,255,65,0.25)" strokeWidth="0.4" />
          {/* Sertissage étoile */}
          <line x1="341" y1="103" x2="342" y2="106"
            stroke="rgba(0,255,65,0.18)" strokeWidth="0.4" />
          <line x1="341" y1="109" x2="342" y2="106"
            stroke="rgba(0,255,65,0.18)" strokeWidth="0.4" />

          {/* Marquages gravés sur le bloc de culasse */}
          <rect x="275" y="105" width="30" height="7" rx="1"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" strokeDasharray="1.5 1" />
          <line x1="278" y1="108" x2="300" y2="108"
            stroke="rgba(0,255,65,0.04)" strokeWidth="0.3" />
          <line x1="278" y1="110" x2="295" y2="110"
            stroke="rgba(0,255,65,0.03)" strokeWidth="0.3" />

          {/* Barrel proof marks */}
          <circle cx="360" cy="110" r="3"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
          <circle cx="372" cy="110" r="3"
            fill="none" stroke="rgba(0,255,65,0.06)" strokeWidth="0.3" />
        </motion.g>
        <motion.g style={{ opacity: lbl6 }}>
          <text x="450" y="285" className="bp-label-lg" textAnchor="middle">
            SYSTÈME OPÉRATIONNEL
          </text>
          <line x1="280" y1="280" x2="620" y2="280"
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
