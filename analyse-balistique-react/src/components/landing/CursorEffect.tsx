import { useEffect, useRef } from 'react';

export function CursorEffect() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${pos.current.x - 24}px, ${pos.current.y - 24}px)`;
      }
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${target.current.x - 4}px, ${target.current.y - 4}px)`;
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <>
      <div
        ref={outerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1px solid rgba(0, 255, 65, 0.4)',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'width 0.2s, height 0.2s',
          mixBlendMode: 'screen',
        }}
      />
      <div
        ref={innerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 255, 65, 0.8)',
          pointerEvents: 'none',
          zIndex: 9999,
          boxShadow: '0 0 12px rgba(0, 255, 65, 0.6)',
        }}
      />
    </>
  );
}
