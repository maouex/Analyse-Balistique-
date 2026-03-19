import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, fadeOut, slideInFromBottom, slideInFromLeft, scaleIn } from "../animations";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = fadeOut(frame, 140, 20);

  const problems = [
    { icon: "?", text: "Comment évaluer objectivement la qualité de vos cartouches ?", delay: 20 },
    { icon: "📊", text: "Comment comparer scientifiquement vos munitions ?", delay: 45 },
    { icon: "📁", text: "Comment garder un historique structuré de vos tests ?", delay: 70 },
  ];

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `linear-gradient(135deg, ${colors.bg} 0%, #1a0a2e 100%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Section title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fadeIn(frame, 0, 15),
          transform: `translateY(${slideInFromBottom(frame, 0, 20)}px)`,
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
            marginBottom: 20,
          }}
        >
          Le problème
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fadeIn(frame, 5, 15),
          transform: `translateY(${slideInFromBottom(frame, 5, 20)}px)`,
        }}
      >
        <h2
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: colors.text,
            fontFamily: "system-ui, sans-serif",
            margin: 0,
          }}
        >
          Chasseurs & tireurs sportifs
        </h2>
      </div>

      {/* Problem cards */}
      <div
        style={{
          display: "flex",
          gap: 40,
          position: "absolute",
          top: 320,
          left: 120,
          right: 120,
          justifyContent: "center",
        }}
      >
        {problems.map((problem, i) => {
          const cardOpacity = fadeIn(frame, problem.delay, 15);
          const cardY = slideInFromBottom(frame, problem.delay, 20);
          const cardScale = scaleIn(frame, fps, problem.delay);

          return (
            <div
              key={i}
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px) scale(${cardScale})`,
                flex: 1,
                maxWidth: 480,
              }}
            >
              <div
                style={{
                  background: `linear-gradient(145deg, ${colors.bgGradient2}, ${colors.canvas})`,
                  borderRadius: 20,
                  padding: 40,
                  border: `1px solid ${colors.secondary}30`,
                  minHeight: 250,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 25,
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: `${colors.secondary}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 36,
                  }}
                >
                  {problem.icon}
                </div>
                <p
                  style={{
                    fontSize: 24,
                    color: colors.textMuted,
                    fontFamily: "system-ui, sans-serif",
                    textAlign: "center",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {problem.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Arrow pointing to solution */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fadeIn(frame, 100, 20),
        }}
      >
        <p
          style={{
            fontSize: 28,
            fontWeight: 600,
            fontFamily: "system-ui, sans-serif",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          La solution existe.
        </p>
      </div>
    </AbsoluteFill>
  );
};
