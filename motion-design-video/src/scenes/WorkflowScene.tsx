import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, fadeOut, slideInFromBottom, slideInFromLeft, scaleIn } from "../animations";

const steps = [
  {
    num: 1,
    title: "Charger l'image",
    desc: "Importez la photo de votre cible (JPG, PNG, WEBP)",
    icon: "📷",
    color: colors.primary,
  },
  {
    num: 2,
    title: "Calibrer l'échelle",
    desc: "Établissez la correspondance pixel → centimètre",
    icon: "📏",
    color: "#06b6d4",
  },
  {
    num: 3,
    title: "Marquer le centre",
    desc: "Indiquez le point de visée sur la cible",
    icon: "🎯",
    color: colors.secondary,
  },
  {
    num: 4,
    title: "Ajouter les impacts",
    desc: "Manuel ou détection automatique par IA",
    icon: "💥",
    color: colors.accent,
  },
  {
    num: 5,
    title: "Résultats",
    desc: "Score, statistiques et visualisations instantanées",
    icon: "📊",
    color: colors.success,
  },
];

export const WorkflowScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = fadeOut(frame, 230, 20);

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `radial-gradient(ellipse at 30% 50%, ${colors.bgGradient2} 0%, ${colors.bg} 70%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 60,
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
            background: `${colors.primary}20`,
            border: `1px solid ${colors.primary}40`,
            fontSize: 16,
            color: colors.primary,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            opacity: fadeIn(frame, 0, 15),
          }}
        >
          Workflow guidé
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
          5 étapes simples
        </h2>
      </div>

      {/* Steps timeline */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 100,
          right: 100,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        {steps.map((step, i) => {
          const delay = 20 + i * 35;
          const stepOpacity = fadeIn(frame, delay, 15);
          const stepY = slideInFromBottom(frame, delay, 20);
          const stepScale = scaleIn(frame, fps, delay);

          // Progress line
          const lineProgress = fadeIn(frame, delay + 15, 20);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
              }}
            >
              {/* Connecting line */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 45,
                    left: "55%",
                    right: "-45%",
                    height: 3,
                    background: `linear-gradient(90deg, ${step.color}, ${steps[i + 1].color})`,
                    opacity: lineProgress * 0.4,
                    transformOrigin: "left",
                    transform: `scaleX(${lineProgress})`,
                  }}
                />
              )}

              {/* Step circle */}
              <div
                style={{
                  opacity: stepOpacity,
                  transform: `translateY(${stepY}px) scale(${stepScale})`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: "50%",
                    background: `${step.color}15`,
                    border: `3px solid ${step.color}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 40,
                    position: "relative",
                    boxShadow: `0 0 30px ${step.color}30`,
                  }}
                >
                  {step.icon}
                  {/* Step number */}
                  <div
                    style={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: step.color,
                      color: colors.bg,
                      fontSize: 16,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "system-ui, sans-serif",
                    }}
                  >
                    {step.num}
                  </div>
                </div>

                <h3
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.text,
                    fontFamily: "system-ui, sans-serif",
                    margin: "20px 0 8px 0",
                    textAlign: "center",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    fontSize: 16,
                    color: colors.textMuted,
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                    textAlign: "center",
                    maxWidth: 200,
                    lineHeight: 1.4,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom highlight - auto detection */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: fadeIn(frame, 190, 20),
          transform: `translateY(${slideInFromBottom(frame, 190, 20)}px)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "20px 40px",
            borderRadius: 16,
            background: `linear-gradient(135deg, ${colors.accent}15, ${colors.accent}05)`,
            border: `1px solid ${colors.accent}40`,
          }}
        >
          <div style={{ fontSize: 36 }}>🤖</div>
          <div>
            <p
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: colors.accent,
                fontFamily: "system-ui, sans-serif",
                margin: 0,
              }}
            >
              Détection automatique par IA
            </p>
            <p
              style={{
                fontSize: 16,
                color: colors.textMuted,
                fontFamily: "system-ui, sans-serif",
                margin: "4px 0 0 0",
              }}
            >
              Algorithme Gaussien + double seuil adaptatif — sensibilité ajustable
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
