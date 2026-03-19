import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, fadeOut, slideInFromBottom, slideInFromLeft, slideInFromRight, scaleIn } from "../animations";

const modes = [
  {
    title: "Cône de dispersion",
    desc: "Visualisez le cône de tir du canon à la cible avec ellipse de covariance",
    color: colors.primary,
    icon: "🔷",
  },
  {
    title: "Heatmap 3D",
    desc: "Densité d'impacts représentée par des barres 3D avec noyau Gaussien",
    color: colors.accent,
    icon: "🔥",
  },
  {
    title: "Trajectoires balistiques",
    desc: "Animation des trajectoires individuelles des projectiles en 3D",
    color: colors.secondary,
    icon: "🚀",
  },
  {
    title: "Profil de pénétration",
    desc: "Vue en coupe de la profondeur de pénétration selon la distance",
    color: colors.success,
    icon: "🎯",
  },
];

export const Visu3DScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = fadeOut(frame, 220, 20);

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `radial-gradient(ellipse at 70% 30%, #1a0d2e 0%, ${colors.bg} 70%)`,
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
            background: `${colors.secondary}20`,
            border: `1px solid ${colors.secondary}40`,
            fontSize: 16,
            color: colors.secondary,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            opacity: fadeIn(frame, 0, 15),
          }}
        >
          Visualisation 3D
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
          4 modes de visualisation{" "}
          <span style={{ color: colors.secondary }}>Three.js</span>
        </h2>
      </div>

      {/* 3D viewport mockup - center */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 200,
          width: 800,
          height: 650,
          opacity: fadeIn(frame, 15, 20),
          transform: `scale(${scaleIn(frame, fps, 15)})`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(145deg, #0a0a1a, #0d1225)`,
            borderRadius: 20,
            border: `1px solid ${colors.secondary}30`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 3D grid floor */}
          <svg
            width="800"
            height="650"
            viewBox="0 0 800 650"
            style={{ position: "absolute", inset: 0 }}
          >
            {/* Perspective grid */}
            {Array.from({ length: 15 }, (_, i) => {
              const y = 350 + i * 20;
              const spreadFactor = (i + 1) / 15;
              const x1 = 400 - 380 * spreadFactor;
              const x2 = 400 + 380 * spreadFactor;
              const opacity = fadeIn(frame, 20 + i * 2, 10) * 0.15;
              return (
                <line key={`h${i}`} x1={x1} y1={y} x2={x2} y2={y} stroke={colors.secondary} strokeWidth="1" opacity={opacity} />
              );
            })}
            {Array.from({ length: 20 }, (_, i) => {
              const baseX = 40 * i;
              const opacity = fadeIn(frame, 25 + i, 10) * 0.1;
              return (
                <line key={`v${i}`} x1={400} y1={350} x2={baseX} y2={650} stroke={colors.secondary} strokeWidth="1" opacity={opacity} />
              );
            })}

            {/* Animated cone */}
            <polygon
              points={`400,150 ${250 + Math.sin(frame * 0.02) * 20},550 ${550 + Math.cos(frame * 0.02) * 20},550`}
              fill={`${colors.primary}10`}
              stroke={colors.primary}
              strokeWidth="2"
              opacity={fadeIn(frame, 40, 30) * 0.6}
            />

            {/* Ellipse at base */}
            <ellipse
              cx="400"
              cy="550"
              rx={140 + Math.sin(frame * 0.03) * 10}
              ry={40}
              fill="none"
              stroke={colors.primary}
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity={fadeIn(frame, 60, 20) * 0.7}
            />

            {/* Animated impact dots */}
            {[
              { x: 370, y: 530 }, { x: 420, y: 540 }, { x: 390, y: 560 },
              { x: 440, y: 520 }, { x: 360, y: 550 }, { x: 410, y: 570 },
              { x: 430, y: 555 }, { x: 380, y: 515 },
            ].map((pt, i) => (
              <circle
                key={i}
                cx={pt.x + Math.sin(frame * 0.05 + i) * 3}
                cy={pt.y + Math.cos(frame * 0.05 + i) * 2}
                r="5"
                fill={colors.primary}
                opacity={fadeIn(frame, 70 + i * 5, 10)}
              />
            ))}

            {/* Gun point */}
            <circle cx="400" cy="150" r="6" fill={colors.accent} opacity={fadeIn(frame, 35, 15)} />
          </svg>

          {/* Mode label */}
          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              padding: "8px 16px",
              borderRadius: 8,
              background: `${colors.primary}20`,
              border: `1px solid ${colors.primary}40`,
              fontSize: 14,
              color: colors.primary,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              opacity: fadeIn(frame, 30, 15),
            }}
          >
            Cône de dispersion
          </div>

          {/* Controls hint */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              display: "flex",
              gap: 8,
              opacity: fadeIn(frame, 50, 15),
            }}
          >
            {["Rotation", "Zoom", "Screenshot"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  background: `${colors.text}10`,
                  fontSize: 12,
                  color: colors.textMuted,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode cards - right side */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 200,
          width: 420,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {modes.map((mode, i) => {
          const delay = 60 + i * 30;
          return (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame, delay, 15),
                transform: `translateX(${slideInFromRight(frame, delay, 20)}px)`,
                background: `linear-gradient(135deg, ${mode.color}10, ${colors.bgGradient2})`,
                borderRadius: 14,
                padding: 22,
                border: `1px solid ${mode.color}30`,
                display: "flex",
                alignItems: "center",
                gap: 18,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 12,
                  background: `${mode.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {mode.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: mode.color,
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                  }}
                >
                  {mode.title}
                </p>
                <p
                  style={{
                    fontSize: 14,
                    color: colors.textMuted,
                    fontFamily: "system-ui, sans-serif",
                    margin: "4px 0 0 0",
                    lineHeight: 1.4,
                  }}
                >
                  {mode.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
