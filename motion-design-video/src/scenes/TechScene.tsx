import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, fadeOut, slideInFromBottom, slideInFromLeft, slideInFromRight, scaleIn } from "../animations";

const techStack = [
  { name: "React 19", desc: "Interface composants", color: "#61dafb", icon: "⚛️" },
  { name: "TypeScript", desc: "Typage strict", color: "#3178c6", icon: "📘" },
  { name: "Three.js", desc: "Rendu 3D WebGL", color: "#049ef4", icon: "🔮" },
  { name: "Zustand", desc: "État global léger", color: "#f59e0b", icon: "🐻" },
  { name: "Framer Motion", desc: "Animations fluides", color: "#e055ff", icon: "✨" },
  { name: "Vite", desc: "Build ultra-rapide", color: "#bd34fe", icon: "⚡" },
];

const features = [
  { icon: "💾", text: "100% hors ligne — localStorage + IndexedDB" },
  { icon: "🌙", text: "Thème sombre / clair" },
  { icon: "📱", text: "Design responsive" },
  { icon: "📸", text: "Export PNG haute qualité" },
];

export const TechScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = fadeOut(frame, 200, 20);

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `radial-gradient(ellipse at 20% 80%, #0d2818 0%, ${colors.bg} 60%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 50,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "8px 24px",
            borderRadius: 20,
            background: `${colors.success}20`,
            border: `1px solid ${colors.success}40`,
            fontSize: 16,
            color: colors.success,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            opacity: fadeIn(frame, 0, 15),
          }}
        >
          Sous le capot
        </div>
        <h2
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: colors.text,
            fontFamily: "system-ui, sans-serif",
            margin: "15px 0 0 0",
            opacity: fadeIn(frame, 5, 15),
            transform: `translateY(${slideInFromBottom(frame, 5, 20)}px)`,
          }}
        >
          Technologies <span style={{ color: colors.success }}>modernes</span>
        </h2>
      </div>

      {/* Tech stack grid */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          width: 900,
        }}
      >
        {techStack.map((tech, i) => {
          const delay = 15 + i * 15;
          return (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame, delay, 15),
                transform: `scale(${scaleIn(frame, fps, delay)})`,
                background: `linear-gradient(145deg, ${tech.color}10, ${colors.bgGradient2})`,
                borderRadius: 14,
                padding: 24,
                border: `1px solid ${tech.color}30`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: `${tech.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                  flexShrink: 0,
                }}
              >
                {tech.icon}
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 700, color: tech.color, fontFamily: "system-ui, sans-serif", margin: 0 }}>
                  {tech.name}
                </p>
                <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: "2px 0 0 0" }}>
                  {tech.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Features list - right side */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 200,
          width: 440,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: colors.text,
            fontFamily: "system-ui, sans-serif",
            margin: "0 0 8px 0",
            opacity: fadeIn(frame, 100, 15),
          }}
        >
          Points forts
        </p>
        {features.map((feature, i) => {
          const delay = 110 + i * 20;
          return (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame, delay, 15),
                transform: `translateX(${slideInFromRight(frame, delay, 20)}px)`,
                background: `${colors.bgGradient2}`,
                borderRadius: 12,
                padding: "18px 22px",
                border: `1px solid ${colors.text}10`,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span style={{ fontSize: 28 }}>{feature.icon}</span>
              <p style={{ fontSize: 18, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: 0 }}>
                {feature.text}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
