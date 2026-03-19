import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, slideInFromBottom, scaleIn, pulseScale } from "../animations";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated rings
  const rings = Array.from({ length: 4 }, (_, i) => ({
    size: 200 + i * 120,
    delay: i * 10,
    speed: 0.3 + i * 0.1,
  }));

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `radial-gradient(ellipse at 50% 50%, #1a0d2e 0%, ${colors.bg} 70%)`,
      }}
    >
      {/* Animated rings */}
      {rings.map((ring, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: ring.size,
            height: ring.size,
            borderRadius: "50%",
            border: `1px solid ${i % 2 === 0 ? colors.primary : colors.secondary}`,
            opacity: fadeIn(frame, ring.delay, 20) * 0.1,
            transform: `rotate(${frame * ring.speed}deg) scale(${pulseScale(frame, 0.02 + i * 0.01)})`,
          }}
        />
      ))}

      {/* Particles */}
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 250 + Math.sin(frame * 0.03 + i) * 50;
        const x = 960 + Math.cos(angle + frame * 0.01) * radius;
        const y = 540 + Math.sin(angle + frame * 0.01) * radius;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: i % 2 === 0 ? colors.primary : colors.secondary,
              opacity: fadeIn(frame, 10 + i, 10) * 0.5,
            }}
          />
        );
      })}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Target icon */}
        <div
          style={{
            opacity: fadeIn(frame, 10, 20),
            transform: `scale(${scaleIn(frame, fps, 10) * pulseScale(frame, 0.04)})`,
            marginBottom: 30,
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.3" />
            <circle cx="50" cy="50" r="15" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.5" />
            <circle cx="50" cy="50" r="5" fill={colors.primary} />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: fadeIn(frame, 20, 20),
            transform: `translateY(${slideInFromBottom(frame, 20, 25)}px)`,
          }}
        >
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              fontFamily: "system-ui, sans-serif",
              color: colors.text,
              margin: 0,
              textAlign: "center",
              letterSpacing: "-1px",
            }}
          >
            Analyse{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Balistique
            </span>
          </h1>
        </div>

        {/* Tagline */}
        <div
          style={{
            opacity: fadeIn(frame, 40, 20),
            transform: `translateY(${slideInFromBottom(frame, 40, 20)}px)`,
            marginTop: 16,
          }}
        >
          <p
            style={{
              fontSize: 28,
              color: colors.textMuted,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              margin: 0,
              textAlign: "center",
            }}
          >
            La science au service de votre passion
          </p>
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 40,
            opacity: fadeIn(frame, 60, 20),
          }}
        >
          {[
            "Analyse d'impacts",
            "Visualisation 3D",
            "Bibliothèque",
            "Comparaison",
          ].map((label, i) => (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame, 65 + i * 8, 12),
                transform: `scale(${scaleIn(frame, fps, 65 + i * 8)})`,
                padding: "10px 24px",
                borderRadius: 25,
                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15)`,
                border: `1px solid ${colors.primary}30`,
                fontSize: 16,
                color: colors.primary,
                fontFamily: "system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: fadeIn(frame, 100, 25),
            transform: `translateY(${slideInFromBottom(frame, 100, 20)}px) scale(${pulseScale(frame, 0.03)})`,
            marginTop: 50,
          }}
        >
          <div
            style={{
              padding: "16px 48px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              fontSize: 22,
              fontWeight: 700,
              color: colors.bg,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "1px",
              boxShadow: `0 0 40px ${colors.primary}40`,
            }}
          >
            Essayez maintenant — 100% gratuit
          </div>
        </div>

        {/* Version */}
        <div
          style={{
            opacity: fadeIn(frame, 120, 20),
            marginTop: 24,
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: colors.textMuted,
              fontFamily: "system-ui, sans-serif",
              margin: 0,
              letterSpacing: "2px",
            }}
          >
            v3.0 · React · TypeScript · Three.js
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
