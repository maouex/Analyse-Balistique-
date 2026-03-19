import React from "react";
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from "remotion";
import { colors, fullScreen } from "../styles";
import { fadeIn, fadeOut, slideInFromBottom, slideInFromRight, scaleIn, countUp, drawLine } from "../animations";

export const AnalysisScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exitOpacity = fadeOut(frame, 260, 20);

  // Simulated impact points
  const impacts = [
    { x: 420, y: 340, zone: 1 }, { x: 440, y: 310, zone: 1 },
    { x: 405, y: 365, zone: 1 }, { x: 460, y: 330, zone: 1 },
    { x: 380, y: 390, zone: 1 }, { x: 450, y: 290, zone: 1 },
    { x: 490, y: 360, zone: 2 }, { x: 350, y: 310, zone: 2 },
    { x: 510, y: 400, zone: 2 }, { x: 340, y: 420, zone: 2 },
    { x: 530, y: 280, zone: 2 }, { x: 310, y: 350, zone: 2 },
    { x: 560, y: 450, zone: 3 }, { x: 280, y: 260, zone: 3 },
    { x: 570, y: 250, zone: 3 },
  ];

  const zoneColors: Record<number, string> = {
    1: colors.zone1,
    2: colors.zone2,
    3: colors.zone3,
  };

  return (
    <AbsoluteFill
      style={{
        ...fullScreen,
        background: `linear-gradient(160deg, ${colors.bg} 0%, #0d1a2e 100%)`,
        opacity: exitOpacity,
      }}
    >
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: fadeIn(frame, 0, 15),
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
          }}
        >
          Analyse en temps réel
        </div>
      </div>

      {/* Canvas area - Left side */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 120,
          width: 700,
          height: 700,
          opacity: fadeIn(frame, 10, 20),
          transform: `scale(${scaleIn(frame, fps, 10)})`,
        }}
      >
        {/* Canvas background */}
        <div
          style={{
            width: "100%",
            height: "100%",
            background: colors.canvas,
            borderRadius: 16,
            border: `1px solid ${colors.primary}30`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Target background pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `repeating-conic-gradient(${colors.canvas} 0% 25%, #1a2744 0% 50%) 50% / 80px 80px`,
              opacity: 0.3,
            }}
          />

          {/* Concentric circles */}
          {[250, 170, 90].map((r, i) => {
            const circleOpacity = fadeIn(frame, 25 + i * 8, 15) * 0.5;
            const circleColor = i === 0 ? colors.zone3 : i === 1 ? colors.zone2 : colors.zone1;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 350 - r,
                  top: 350 - r,
                  width: r * 2,
                  height: r * 2,
                  borderRadius: "50%",
                  border: `2px solid ${circleColor}`,
                  opacity: circleOpacity,
                }}
              />
            );
          })}

          {/* Center crosshair */}
          <div
            style={{
              position: "absolute",
              left: 340,
              top: 330,
              width: 20,
              height: 20,
              opacity: fadeIn(frame, 20, 15),
            }}
          >
            <div style={{ position: "absolute", left: 9, top: 0, width: 2, height: 20, background: colors.primary }} />
            <div style={{ position: "absolute", left: 0, top: 9, width: 20, height: 2, background: colors.primary }} />
          </div>

          {/* Impact points */}
          {impacts.map((impact, i) => {
            const delay = 50 + i * 5;
            const impactOpacity = fadeIn(frame, delay, 8);
            const impactScale = scaleIn(frame, fps, delay);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: impact.x - 8,
                  top: impact.y - 8,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: zoneColors[impact.zone],
                  opacity: impactOpacity,
                  transform: `scale(${impactScale})`,
                  boxShadow: `0 0 10px ${zoneColors[impact.zone]}60`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: colors.bg,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {i + 1}
              </div>
            );
          })}

          {/* Covariance ellipse */}
          <div
            style={{
              position: "absolute",
              left: 280,
              top: 240,
              width: 200,
              height: 260,
              borderRadius: "50%",
              border: `2px dashed ${colors.primary}`,
              opacity: fadeIn(frame, 130, 20) * 0.6,
              transform: `rotate(-15deg)`,
            }}
          />

          {/* Scale reference */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: 20,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: fadeIn(frame, 40, 15),
            }}
          >
            <div style={{ width: 80, height: 3, background: colors.accent }} />
            <span style={{ color: colors.accent, fontSize: 14, fontFamily: "system-ui, sans-serif" }}>10 cm</span>
          </div>
        </div>
      </div>

      {/* Stats panel - Right side */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 120,
          width: 480,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Score gauge */}
        <div
          style={{
            opacity: fadeIn(frame, 100, 20),
            transform: `translateX(${slideInFromRight(frame, 100, 20)}px)`,
            background: `linear-gradient(145deg, ${colors.bgGradient2}, ${colors.canvas})`,
            borderRadius: 16,
            padding: 30,
            border: `1px solid ${colors.primary}20`,
            display: "flex",
            alignItems: "center",
            gap: 30,
          }}
        >
          {/* Circular score */}
          <div style={{ position: "relative", width: 120, height: 120 }}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke={`${colors.textMuted}20`} strokeWidth="8" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={colors.success}
                strokeWidth="8"
                strokeDasharray={`${drawLine(frame, 110, 40) * 326 * 0.78} 326`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: 36, fontWeight: 800, color: colors.text, fontFamily: "system-ui, sans-serif" }}>
                {countUp(frame, 110, 78, 40)}
              </span>
              <span style={{ fontSize: 12, color: colors.success, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
                EXCELLENT
              </span>
            </div>
          </div>

          <div>
            <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: 0 }}>
              Score de groupement
            </p>
            <p style={{ fontSize: 28, fontWeight: 700, color: colors.text, fontFamily: "system-ui, sans-serif", margin: "4px 0" }}>
              {countUp(frame, 110, 15, 30)} impacts
            </p>
          </div>
        </div>

        {/* Zone distribution */}
        <div
          style={{
            opacity: fadeIn(frame, 120, 20),
            transform: `translateX(${slideInFromRight(frame, 120, 20)}px)`,
            background: `linear-gradient(145deg, ${colors.bgGradient2}, ${colors.canvas})`,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${colors.primary}20`,
          }}
        >
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: "0 0 16px 0", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
            Distribution par zone
          </p>
          {[
            { label: "Zone 1 (≤50cm)", pct: 40, color: colors.zone1, count: 6 },
            { label: "Zone 2 (50-100cm)", pct: 40, color: colors.zone2, count: 6 },
            { label: "Zone 3 (>100cm)", pct: 20, color: colors.zone3, count: 3 },
          ].map((zone, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 15, color: zone.color, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
                  {zone.label}
                </span>
                <span style={{ fontSize: 15, color: colors.text, fontFamily: "system-ui, sans-serif", fontWeight: 700 }}>
                  {countUp(frame, 125 + i * 10, zone.pct, 20)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: `${zone.color}20` }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: zone.color,
                    width: `${drawLine(frame, 125 + i * 10, 25) * zone.pct}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Distance stats */}
        <div
          style={{
            opacity: fadeIn(frame, 150, 20),
            transform: `translateX(${slideInFromRight(frame, 150, 20)}px)`,
            background: `linear-gradient(145deg, ${colors.bgGradient2}, ${colors.canvas})`,
            borderRadius: 16,
            padding: 24,
            border: `1px solid ${colors.primary}20`,
          }}
        >
          <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: "0 0 16px 0", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>
            Statistiques de distance
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "Moyenne", value: "42.3 cm", color: colors.primary },
              { label: "Écart-type", value: "18.7 cm", color: colors.secondary },
              { label: "R90", value: "67.2 cm", color: colors.accent },
              { label: "CV", value: "44.2%", color: colors.danger },
            ].map((stat, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
                <p style={{ fontSize: 12, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: "0 0 4px 0" }}>
                  {stat.label}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: "system-ui, sans-serif", margin: 0 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Ellipse info */}
        <div
          style={{
            opacity: fadeIn(frame, 170, 20),
            transform: `translateX(${slideInFromRight(frame, 170, 20)}px)`,
            background: `linear-gradient(145deg, ${colors.bgGradient2}, ${colors.canvas})`,
            borderRadius: 16,
            padding: 20,
            border: `1px solid ${colors.primary}30`,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 30 }}>📐</div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: colors.primary, fontFamily: "system-ui, sans-serif", margin: 0 }}>
              Ellipse de covariance (PCA)
            </p>
            <p style={{ fontSize: 14, color: colors.textMuted, fontFamily: "system-ui, sans-serif", margin: "4px 0 0 0" }}>
              Analyse en composantes principales de la dispersion
            </p>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
