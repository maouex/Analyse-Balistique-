import { useEffect, useRef, useCallback } from 'react';
import './TvStatic.css';

interface TvStaticProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
}

/**
 * Full-screen TV static / channel-switch effect.
 * Draws random noise on a canvas + a scanline sweep + squeeze animation.
 */
export function TvStatic({ active, onComplete, duration = 600 }: TvStaticProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const drawStatic = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas to screen
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    // Generate noise pixels
    for (let i = 0; i < data.length; i += 4) {
      // Mostly dark with occasional bright flickers — green tinted
      const bright = Math.random();
      const intensity = bright > 0.92
        ? 120 + Math.random() * 135  // bright flicker
        : Math.random() * 40;        // dark noise

      data[i]     = intensity * 0.3;                    // R (dim)
      data[i + 1] = intensity * (0.6 + Math.random() * 0.4); // G (green tint)
      data[i + 2] = intensity * 0.2;                    // B (dim)
      data[i + 3] = 200 + Math.random() * 55;           // A
    }

    // Add horizontal interference lines
    const lineCount = 3 + Math.floor(Math.random() * 5);
    for (let l = 0; l < lineCount; l++) {
      const y = Math.floor(Math.random() * h);
      const lineWidth = 1 + Math.floor(Math.random() * 3);
      for (let dy = 0; dy < lineWidth && y + dy < h; dy++) {
        for (let x = 0; x < w; x++) {
          const idx = ((y + dy) * w + x) * 4;
          data[idx]     = 0;
          data[idx + 1] = 80 + Math.random() * 80;
          data[idx + 2] = 0;
          data[idx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
    rafRef.current = requestAnimationFrame(drawStatic);
  }, []);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    // Start drawing static noise
    rafRef.current = requestAnimationFrame(drawStatic);

    // Fire onComplete after the animation ends
    const timer = setTimeout(() => {
      onComplete?.();
    }, duration * 0.5); // Navigate at midpoint (screen is fully obscured)

    const cleanup = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
    }, duration);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
      clearTimeout(cleanup);
    };
  }, [active, onComplete, duration, drawStatic]);

  if (!active) return null;

  return (
    <div className={`tv-static-overlay ${active ? 'active' : ''}`}>
      <div className="tv-static-squeeze">
        <canvas ref={canvasRef} className="tv-static-canvas" />
      </div>
      <div className="tv-static-scanline" />
    </div>
  );
}
