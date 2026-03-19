import { interpolate, spring, Easing } from "remotion";

export const fadeIn = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const fadeOut = (frame: number, start: number, duration = 15) =>
  interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const slideInFromBottom = (
  frame: number,
  start: number,
  duration = 20
) =>
  interpolate(frame, [start, start + duration], [80, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const slideInFromLeft = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [-200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const slideInFromRight = (
  frame: number,
  start: number,
  duration = 20
) =>
  interpolate(frame, [start, start + duration], [200, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const scaleIn = (frame: number, fps: number, start: number) =>
  spring({ frame: frame - start, fps, config: { damping: 12, stiffness: 100 } });

export const pulseScale = (frame: number, speed = 0.05) =>
  1 + Math.sin(frame * speed) * 0.03;

export const countUp = (
  frame: number,
  start: number,
  target: number,
  duration = 30
) =>
  Math.round(
    interpolate(frame, [start, start + duration], [0, target], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    })
  );

export const drawLine = (frame: number, start: number, duration = 20) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });

export const typeWriter = (text: string, frame: number, start: number, charsPerFrame = 0.8) => {
  const elapsed = Math.max(0, frame - start);
  const chars = Math.floor(elapsed * charsPerFrame);
  return text.slice(0, chars);
};
