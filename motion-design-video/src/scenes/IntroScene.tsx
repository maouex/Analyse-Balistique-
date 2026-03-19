import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill, Img } from "remotion";
import { colors, fullScreen } from "../styles";
import {
  fadeIn,
  fadeOut,
  slideInFromBottom,
  scaleIn,
  pulseScale,
} from "../animations";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity = fadeIn(frame, 0, 20);
  const titleScale = scaleIn(frame, fps, 10);
  const titleY = slideInFromBottom(frame, 10, 25);
  const subtitleOpacity = fadeIn(frame, 30, 20);
  const subtitleY = slideInFromBottom(frame, 30, 20);
  const badgeOpacity = fadeIn(frame, 50, 15);
  const badgeScale = scaleIn(frame, fps, 50);
  const exitOpacity = fadeOut(frame, 140, 20);

  // Animated background particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 137.5) % 1920,
    y: (i * 97.3) % 1080,
    size: 2 + (i % 4),
    speed: 0.3 + (i % 5) * 0.15,
    delay: i * 3,
  }));

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `radial-gradient(ellipse at 50% 40%, ${colors.bgGradient2} 0%, ${colors.bg} 70%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Animated particles */}
      {particles.map((p, i) => {
        const pOpacity = fadeIn(frame, p.delay, 10) * 0.4;
        const pY = p.y - frame * p.speed;
        const adjustedY = ((pY % 1080) + 1080) % 1080;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: adjustedY,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent,
              opacity: pOpacity,
            }}
          />
        );
      })}

      {/* Crosshair decoration */}
      <div
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `2px solid ${colors.primary}`,
          opacity: fadeIn(frame, 5, 30) * 0.15,
          transform: `scale(${1 + frame * 0.003})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          borderRadius: "50%",
          border: `1px solid ${colors.secondary}`,
          opacity: fadeIn(frame, 10, 30) * 0.2,
          transform: `rotate(${frame * 0.5}deg)`,
        }}
      />

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
        {/* Icon - Target */}
        <div
          style={{
            opacity: fadeIn(frame, 5, 15),
            transform: `scale(${scaleIn(frame, fps, 5)})`,
            marginBottom: 30,
          }}
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="55" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.5" />
            <circle cx="60" cy="60" r="40" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.3" />
            <circle cx="60" cy="60" r="25" fill="none" stroke={colors.primary} strokeWidth="2" opacity="0.5" />
            <circle cx="60" cy="60" r="8" fill={colors.primary} opacity="0.8" />
            <line x1="60" y1="0" x2="60" y2="120" stroke={colors.primary} strokeWidth="1" opacity="0.3" />
            <line x1="0" y1="60" x2="120" y2="60" stroke={colors.primary} strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            opacity: bgOpacity,
            transform: `translateY(${titleY}px) scale(${titleScale})`,
          }}
        >
          <h1
            style={{
              fontSize: 90,
              fontWeight: 800,
              fontFamily: "system-ui, -apple-system, sans-serif",
              color: colors.text,
              margin: 0,
              letterSpacing: "-2px",
              textAlign: "center",
              lineHeight: 1.1,
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

        {/* Subtitle */}
        <div
          style={{
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            marginTop: 20,
          }}
        >
          <p
            style={{
              fontSize: 32,
              color: colors.textMuted,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 300,
              margin: 0,
              letterSpacing: "4px",
              textTransform: "uppercase",
            }}
          >
            Journal de chasse intelligent
          </p>
        </div>

        {/* Version badge */}
        <div
          style={{
            opacity: badgeOpacity,
            transform: `scale(${badgeScale})`,
            marginTop: 40,
          }}
        >
          <div
            style={{
              padding: "10px 30px",
              borderRadius: 30,
              background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
              border: `1px solid ${colors.primary}40`,
              fontSize: 18,
              color: colors.primary,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 600,
              letterSpacing: "2px",
            }}
          >
            v3.0 REACT
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
