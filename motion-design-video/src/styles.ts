import { CSSProperties } from "react";

export const colors = {
  bg: "#0a0a0f",
  bgGradient1: "#0d1117",
  bgGradient2: "#161b22",
  primary: "#00d4ff",
  secondary: "#7c3aed",
  accent: "#f59e0b",
  danger: "#ef4444",
  success: "#22c55e",
  text: "#ffffff",
  textMuted: "#94a3b8",
  zone1: "#22c55e",
  zone2: "#f59e0b",
  zone3: "#ef4444",
  canvas: "#1e293b",
};

export const fullScreen: CSSProperties = {
  width: 1920,
  height: 1080,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  position: "relative",
};

export const centered: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
};
