import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, fadeOut, slideInFromBottom, slideInFromLeft, slideInFromRight, scaleIn } from "../animations";

const munitions = [
  { name: "Tunet Becassier", caliber: "12/70", score: 85, impacts: 18, color: colors.success },
  { name: "Rottweil Magnum", caliber: "12/76", score: 72, impacts: 22, color: colors.primary },
  { name: "Winchester Super-X", caliber: "12/70", score: 68, impacts: 15, color: colors.accent },
  { name: "FOB Sweet Copper", caliber: "20/70", score: 91, impacts: 20, color: colors.secondary },
];

export const LibraryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = fadeOut(frame, 260, 20);

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `radial-gradient(ellipse at 50% 60%, #0d1a2e 0%, ${colors.bg} 70%)`,
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
            background: `${colors.accent}20`,
            border: `1px solid ${colors.accent}40`,
            fontSize: 16,
            color: colors.accent,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 600,
            letterSpacing: "3px",
            textTransform: "uppercase",
            opacity: fadeIn(frame, 0, 15),
          }}
        >
          Bibliothèque
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
          Votre arsenal, <span style={{ color: colors.accent }}>organisé</span>
        </h2>
      </div>

      {/* Munition cards grid */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: 80,
          right: 80,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}
      >
        {munitions.map((mun, i) => {
          const delay = 20 + i * 25;
          return (
            <div
              key={i}
              style={{
                opacity: fadeIn(frame, delay, 15),
                transform: `scale(${scaleIn(frame, fps, delay)})`,
                background: `linear-gradient(145deg, ${colors.bgGradient2}, ${colors.canvas})`,
                borderRadius: 16,
                padding: 30,
                border: `1px solid ${mun.color}30`,
                display: "flex",
                alignItems: "center",
                gap: 24,
              }}
            >
              {/* Score circle */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: `${mun.color}15`,
                  border: `3px solid ${mun.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: mun.color,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {mun.score}
                </span>
              </div>

              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: colors.text,
                    fontFamily: "system-ui, sans-serif",
                    margin: 0,
                  }}
                >
                  {mun.name}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    color: colors.textMuted,
                    fontFamily: "system-ui, sans-serif",
                    margin: "6px 0 0 0",
                  }}
                >
                  {mun.caliber} · {mun.impacts} impacts
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {["Voir", "Comparer"].map((action, j) => (
                  <div
                    key={j}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      background: j === 0 ? `${mun.color}20` : "transparent",
                      border: `1px solid ${mun.color}40`,
                      fontSize: 13,
                      color: mun.color,
                      fontFamily: "system-ui, sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {action}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison section */}
      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 80,
          right: 80,
          opacity: fadeIn(frame, 140, 20),
          transform: `translateY(${slideInFromBottom(frame, 140, 20)}px)`,
        }}
      >
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.secondary}10, ${colors.primary}10)`,
            borderRadius: 16,
            padding: 30,
            border: `1px solid ${colors.secondary}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 36 }}>📊</div>
            <div>
              <p style={{ fontSize: 22, fontWeight: 700, color: colors.text, fontFamily: "system-ui, sans-serif", margin: 0 }}>
                Comparaison multi-munitions
              </p>
              <p style={{ fontSize: 16, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: "4px 0 0 0" }}>
                Radar chart 6 axes · Superposition d'impacts · Tri par critères
              </p>
            </div>
          </div>

          {/* Radar chart mini preview */}
          <div style={{ opacity: fadeIn(frame, 170, 25) }}>
            <svg width="160" height="140" viewBox="0 0 160 140">
              {/* Radar background */}
              {[55, 40, 25].map((r, i) => (
                <polygon
                  key={i}
                  points={Array.from({ length: 6 }, (_, j) => {
                    const angle = (Math.PI * 2 * j) / 6 - Math.PI / 2;
                    return `${80 + Math.cos(angle) * r},${70 + Math.sin(angle) * r}`;
                  }).join(" ")}
                  fill="none"
                  stroke={colors.textMuted}
                  strokeWidth="1"
                  opacity="0.2"
                />
              ))}
              {/* Data polygon 1 */}
              <polygon
                points={[45, 40, 50, 35, 30, 42].map((v, j) => {
                  const angle = (Math.PI * 2 * j) / 6 - Math.PI / 2;
                  return `${80 + Math.cos(angle) * v},${70 + Math.sin(angle) * v}`;
                }).join(" ")}
                fill={`${colors.primary}30`}
                stroke={colors.primary}
                strokeWidth="2"
              />
              {/* Data polygon 2 */}
              <polygon
                points={[35, 50, 38, 45, 48, 30].map((v, j) => {
                  const angle = (Math.PI * 2 * j) / 6 - Math.PI / 2;
                  return `${80 + Math.cos(angle) * v},${70 + Math.sin(angle) * v}`;
                }).join(" ")}
                fill={`${colors.accent}30`}
                stroke={colors.accent}
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
