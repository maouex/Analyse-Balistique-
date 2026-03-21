import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Crosshair, Target, Radar, Activity, Zap, Shield,
  ChevronDown, ArrowRight, Cpu, BarChart3, Layers,
  Wind, Gauge, Eye, Box, FlaskConical
} from 'lucide-react';
import { ParticleField } from '../components/landing/ParticleField';
import { CursorEffect } from '../components/landing/CursorEffect';
import './LandingPage.css';

/* ─── Animated counter ───────────────────────────────────── */
function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>;
}

/* ─── Section reveal wrapper ─────────────────────────────── */
function RevealSection({ children, className = '', delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.section
      ref={ref}
      className={`landing-section ${className}`}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.section>
  );
}

/* ─── Scanline overlay ───────────────────────────────────── */
function Scanlines() {
  return <div className="scanlines" />;
}

/* ─── Reticle animation ──────────────────────────────────── */
function Reticle() {
  return (
    <motion.div
      className="reticle"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <svg viewBox="0 0 200 200" width="300" height="300">
        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(0,255,65,0.15)" strokeWidth="1" />
        <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(0,255,65,0.1)" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(0,255,65,0.2)" strokeWidth="1" />
        <line x1="100" y1="0" x2="100" y2="40" stroke="rgba(0,255,65,0.3)" strokeWidth="1" />
        <line x1="100" y1="160" x2="100" y2="200" stroke="rgba(0,255,65,0.3)" strokeWidth="1" />
        <line x1="0" y1="100" x2="40" y2="100" stroke="rgba(0,255,65,0.3)" strokeWidth="1" />
        <line x1="160" y1="100" x2="200" y2="100" stroke="rgba(0,255,65,0.3)" strokeWidth="1" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <line
            key={angle}
            x1={100 + 85 * Math.cos((angle * Math.PI) / 180)}
            y1={100 + 85 * Math.sin((angle * Math.PI) / 180)}
            x2={100 + 95 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 95 * Math.sin((angle * Math.PI) / 180)}
            stroke="rgba(0,255,65,0.25)"
            strokeWidth="1"
          />
        ))}
      </svg>
    </motion.div>
  );
}

/* ─── Grid background ────────────────────────────────────── */
function TacticalGrid() {
  return <div className="tactical-grid" />;
}

/* ─── Main Landing Page ──────────────────────────────────── */
export function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const headerOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  const goToApp = () => navigate('/analyse');

  return (
    <div className="landing-root" ref={containerRef}>
      <ParticleField />
      <CursorEffect />
      <Scanlines />
      <TacticalGrid />

      {/* ─── Floating nav ─── */}
      <motion.nav className="landing-nav" style={{ opacity: headerOpacity }}>
        <div className="nav-brand">
          <Crosshair size={20} />
          <span>PLOMBSCOPE</span>
        </div>
        <button className="nav-cta" onClick={goToApp}>
          Accéder au simulateur <ArrowRight size={16} />
        </button>
      </motion.nav>

      {/* ═══ SECTION 1 : HERO ═══ */}
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
            <span>SYSTÈME D&apos;ANALYSE BALISTIQUE v2.0</span>
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
              document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              En savoir plus
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

      {/* ═══ SECTION 2 : MISSION ═══ */}
      <RevealSection className="mission-section" delay={0}>
        <div id="mission" className="section-anchor" />
        <div className="section-header">
          <div className="section-tag">
            <Activity size={14} />
            <span>BRIEFING</span>
          </div>
          <h2 className="section-title">Mission & Objectifs</h2>
          <div className="section-line" />
        </div>
        <div className="mission-grid">
          <motion.div className="mission-card" whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,65,0.4)' }}>
            <div className="mission-icon"><Eye size={32} /></div>
            <h3>Analyse Visuelle</h3>
            <p>Import et analyse d&apos;images de cibles. Détection automatique des impacts avec calibration d&apos;échelle précise.</p>
          </motion.div>
          <motion.div className="mission-card" whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,65,0.4)' }}>
            <div className="mission-icon"><FlaskConical size={32} /></div>
            <h3>Simulation Physique</h3>
            <p>Moteur balistique intégrant gravité, traînée aérodynamique, vent et conditions atmosphériques réalistes.</p>
          </motion.div>
          <motion.div className="mission-card" whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,65,0.4)' }}>
            <div className="mission-icon"><Box size={32} /></div>
            <h3>Visualisation 3D</h3>
            <p>Rendu Three.js temps réel avec 8 modes de visualisation : trajectoires, dispersion, pénétration, heatmaps.</p>
          </motion.div>
        </div>
      </RevealSection>

      {/* ═══ SECTION 3 : PHYSIQUE ═══ */}
      <RevealSection className="physics-section">
        <div className="section-header">
          <div className="section-tag">
            <Cpu size={14} />
            <span>MODÈLES PHYSIQUES</span>
          </div>
          <h2 className="section-title">Moteur Balistique</h2>
          <div className="section-line" />
        </div>
        <div className="physics-content">
          <div className="physics-equations">
            <div className="equation-block">
              <div className="eq-label">Traînée aérodynamique</div>
              <div className="eq-formula">F<sub>d</sub> = ½ · ρ · v² · C<sub>d</sub> · A</div>
              <div className="eq-desc">Coefficient de traînée dynamique selon la vitesse et la géométrie du projectile</div>
            </div>
            <div className="equation-block">
              <div className="eq-label">Trajectoire balistique</div>
              <div className="eq-formula">y(x) = x·tan(θ) − (g·x²) / (2·v₀²·cos²(θ))</div>
              <div className="eq-desc">Équation parabolique corrigée avec résistance de l&apos;air</div>
            </div>
            <div className="equation-block">
              <div className="eq-label">Énergie cinétique</div>
              <div className="eq-formula">E<sub>k</sub> = ½ · m · v²</div>
              <div className="eq-desc">Énergie d&apos;impact calculée à chaque point de la trajectoire</div>
            </div>
            <div className="equation-block">
              <div className="eq-label">Dispersion angulaire</div>
              <div className="eq-formula">σ = arctan(R<sub>50</sub> / d)</div>
              <div className="eq-desc">Écart-type angulaire basé sur le rayon contenant 50% des impacts</div>
            </div>
          </div>
          <div className="physics-visual">
            <div className="trajectory-canvas">
              <svg viewBox="0 0 400 300" className="trajectory-svg">
                <defs>
                  <linearGradient id="trajGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#00ff41" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00ff41" stopOpacity="0.1" />
                  </linearGradient>
                </defs>
                {/* Grid */}
                {[0, 50, 100, 150, 200, 250, 300].map(y => (
                  <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="rgba(0,255,65,0.05)" strokeWidth="0.5" />
                ))}
                {[0, 50, 100, 150, 200, 250, 300, 350, 400].map(x => (
                  <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="rgba(0,255,65,0.05)" strokeWidth="0.5" />
                ))}
                {/* Trajectory path */}
                <motion.path
                  d="M 20,280 Q 100,40 200,120 Q 300,200 380,280"
                  fill="none"
                  stroke="url(#trajGrad)"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                />
                {/* Impact point */}
                <motion.circle
                  cx="380" cy="280" r="4"
                  fill="#00ff41"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.8, duration: 0.3 }}
                  viewport={{ once: true }}
                />
                <motion.circle
                  cx="380" cy="280" r="12"
                  fill="none"
                  stroke="rgba(0,255,65,0.3)"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2, duration: 0.5 }}
                  viewport={{ once: true }}
                />
              </svg>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* ═══ SECTION 4 : MODES 3D ═══ */}
      <RevealSection className="modes-section">
        <div className="section-header">
          <div className="section-tag">
            <Layers size={14} />
            <span>VISUALISATION</span>
          </div>
          <h2 className="section-title">8 Modes d&apos;Analyse</h2>
          <div className="section-line" />
        </div>
        <div className="modes-grid">
          {[
            { icon: <Target size={24} />, name: 'Trajectoires', desc: 'Visualisation 3D des trajectoires de chaque projectile' },
            { icon: <Radar size={24} />, name: 'Cône de dispersion', desc: 'Représentation volumétrique de la zone de dispersion' },
            { icon: <Shield size={24} />, name: 'Pénétration', desc: 'Simulation de pénétration dans différents matériaux' },
            { icon: <Activity size={24} />, name: 'Simulation réaliste', desc: 'Animation temporelle du vol des projectiles' },
            { icon: <BarChart3 size={24} />, name: 'Heatmap impacts', desc: 'Carte de densité des points d\'impact' },
            { icon: <Zap size={24} />, name: 'Heatmap énergie', desc: 'Distribution de l\'énergie cinétique à l\'impact' },
            { icon: <Gauge size={24} />, name: 'Multi-distance', desc: 'Comparaison des patterns à différentes distances' },
            { icon: <Wind size={24} />, name: 'Nuage de dispersion', desc: 'Nuage de points 3D de la distribution statistique' },
          ].map((mode, i) => (
            <motion.div
              key={mode.name}
              className="mode-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -4, borderColor: 'rgba(0,255,65,0.5)' }}
            >
              <div className="mode-icon">{mode.icon}</div>
              <h4>{mode.name}</h4>
              <p>{mode.desc}</p>
              <div className="mode-index">{String(i + 1).padStart(2, '0')}</div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ═══ SECTION 5 : STATS ═══ */}
      <RevealSection className="stats-section">
        <div className="section-header">
          <div className="section-tag">
            <BarChart3 size={14} />
            <span>PERFORMANCES</span>
          </div>
          <h2 className="section-title">Chiffres Clés</h2>
          <div className="section-line" />
        </div>
        <div className="stats-grid">
          <div className="stat-block">
            <div className="stat-value"><AnimatedCounter end={60} />fps</div>
            <div className="stat-label">Rendu 3D temps réel</div>
            <div className="stat-bar"><motion.div className="stat-bar-fill" whileInView={{ width: '95%' }} initial={{ width: 0 }} transition={{ duration: 1.5, delay: 0.2 }} viewport={{ once: true }} /></div>
          </div>
          <div className="stat-block">
            <div className="stat-value"><AnimatedCounter end={10000} />+</div>
            <div className="stat-label">Projectiles simulés / seconde</div>
            <div className="stat-bar"><motion.div className="stat-bar-fill" whileInView={{ width: '88%' }} initial={{ width: 0 }} transition={{ duration: 1.5, delay: 0.3 }} viewport={{ once: true }} /></div>
          </div>
          <div className="stat-block">
            <div className="stat-value"><AnimatedCounter end={8} /></div>
            <div className="stat-label">Modes de visualisation 3D</div>
            <div className="stat-bar"><motion.div className="stat-bar-fill" whileInView={{ width: '100%' }} initial={{ width: 0 }} transition={{ duration: 1.5, delay: 0.4 }} viewport={{ once: true }} /></div>
          </div>
          <div className="stat-block">
            <div className="stat-value">&lt;<AnimatedCounter end={1} />ms</div>
            <div className="stat-label">Temps de calcul balistique</div>
            <div className="stat-bar"><motion.div className="stat-bar-fill" whileInView={{ width: '98%' }} initial={{ width: 0 }} transition={{ duration: 1.5, delay: 0.5 }} viewport={{ once: true }} /></div>
          </div>
        </div>
      </RevealSection>

      {/* ═══ SECTION 6 : ARSENAL ═══ */}
      <RevealSection className="arsenal-section">
        <div className="section-header">
          <div className="section-tag">
            <Shield size={14} />
            <span>ARSENAL</span>
          </div>
          <h2 className="section-title">Fonctionnalités</h2>
          <div className="section-line" />
        </div>
        <div className="arsenal-grid">
          {[
            { icon: <Target size={20} />, title: 'Détection d\'impacts', desc: 'Algorithme de détection automatique et positionnement manuel' },
            { icon: <Gauge size={20} />, title: 'Calibration d\'échelle', desc: 'Calibration précise en mm/px pour des mesures exactes' },
            { icon: <BarChart3 size={20} />, title: 'Statistiques complètes', desc: 'Écart-type, R50, CEP, score de groupement et plus' },
            { icon: <Layers size={20} />, title: 'Bibliothèque de munitions', desc: 'Base de données avec comparaison multicritères' },
            { icon: <Cpu size={20} />, title: 'Web Worker', desc: 'Calculs lourds déportés pour une UI fluide' },
            { icon: <Eye size={20} />, title: 'Export professionnel', desc: 'Rapports PDF, PNG et données JSON' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="arsenal-card"
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ borderColor: 'rgba(0,255,65,0.4)' }}
            >
              <div className="arsenal-icon">{feature.icon}</div>
              <div className="arsenal-text">
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </RevealSection>

      {/* ═══ SECTION 7 : CTA FINAL ═══ */}
      <RevealSection className="cta-section">
        <div className="cta-content">
          <motion.div
            className="cta-reticle"
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <Crosshair size={120} strokeWidth={0.5} />
          </motion.div>
          <h2 className="cta-title">Prêt pour le déploiement ?</h2>
          <p className="cta-subtitle">
            Accédez au simulateur balistique complet. Analyse d&apos;image, simulation physique et visualisation 3D en une seule plateforme.
          </p>
          <motion.button
            className="btn-tactical primary large"
            onClick={goToApp}
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,255,65,0.3)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Target size={22} />
            Lancer PlombScope
            <ArrowRight size={18} />
          </motion.button>
          <div className="cta-tech-stack">
            <span>React 19</span>
            <span>Three.js</span>
            <span>TypeScript</span>
            <span>Web Workers</span>
            <span>Framer Motion</span>
          </div>
        </div>
      </RevealSection>

      {/* ─── Footer ─── */}
      <footer className="landing-footer">
        <div className="footer-line" />
        <div className="footer-content">
          <span className="footer-brand">
            <Crosshair size={14} /> PLOMBSCOPE
          </span>
          <span className="footer-copy">
            Système d&apos;analyse balistique — {new Date().getFullYear()}
          </span>
        </div>
      </footer>
    </div>
  );
}
