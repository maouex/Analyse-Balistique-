import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter hook — numbers count up from 0 to target like a military HUD.
 * Uses easeOutExpo for a satisfying deceleration effect.
 */
export function useAnimatedNumber(
  target: number,
  duration = 1200,
  decimals = 0,
): string {
  const [display, setDisplay] = useState('0');
  const rafRef = useRef(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    const diff = target - start;
    if (diff === 0) { setDisplay(target.toFixed(decimals)); return; }

    const startTime = performance.now();
    prevTarget.current = target;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + diff * eased;
      setDisplay(current.toFixed(decimals));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals]);

  return display;
}

/**
 * Simple component to render an animated number inline.
 */
export function AnimNum({ value, duration = 1200, decimals = 0, suffix = '' }: {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const display = useAnimatedNumber(value, duration, decimals);
  return <>{display}{suffix}</>;
}
