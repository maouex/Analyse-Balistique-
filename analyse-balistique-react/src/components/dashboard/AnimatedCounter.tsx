import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  style?: React.CSSProperties;
}

export function AnimatedCounter({
  value,
  duration = 1200,
  decimals = 0,
  suffix = '',
  style,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current) {
      // Skip animation on subsequent updates — just set directly
      setDisplay(value);
      return;
    }

    // IntersectionObserver: animate when visible
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();

    function animate() {
      const start = performance.now();
      const from = 0;
      const to = value;

      function tick(now: number) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(from + (to - from) * eased);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals)
    : Math.round(display).toString();

  return (
    <span ref={ref} className="counter-animated" style={style}>
      {formatted}{suffix}
    </span>
  );
}
