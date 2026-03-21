import { useRef, useEffect, useState, useCallback } from 'react';
import type { Munition, Impact } from '../../types';

const COLORS = [
  { main: '#44aaff', light: 'rgba(68,170,255,0.5)', glow: 'rgba(68,170,255,0.15)' },
  { main: '#00ff41', light: 'rgba(0,255,65,0.5)', glow: 'rgba(0,255,65,0.15)' },
  { main: '#ffaa00', light: 'rgba(255,170,0,0.5)', glow: 'rgba(255,170,0,0.15)' },
  { main: '#ff4444', light: 'rgba(255,68,68,0.5)', glow: 'rgba(255,68,68,0.15)' },
];

const SHAPES: Array<(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => void> = [
  // Circle
  (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); },
  // Diamond
  (ctx, x, y, r) => { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); },
  // Triangle
  (ctx, x, y, r) => { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r * 0.87, y + r * 0.5); ctx.lineTo(x - r * 0.87, y + r * 0.5); ctx.closePath(); },
  // Square
  (ctx, x, y, r) => { ctx.beginPath(); ctx.rect(x - r * 0.7, y - r * 0.7, r * 1.4, r * 1.4); },
];

interface ImpactOverlayProps {
  munitions: Munition[];
}

export function ImpactOverlay({ munitions }: ImpactOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set(munitions.map((m) => m.id)));
  const [canvasSize, setCanvasSize] = useState(420);

  const withAnalysis = munitions.filter((m) => m.savedAnalysis && m.savedAnalysis.impacts.length > 0);

  // Resize to container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const s = Math.min(w, 600);
      setCanvasSize(Math.max(280, s));
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = canvasSize;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    // Background
    const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#10121a';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    const cxc = size / 2;
    const cyc = size / 2;

    // Compute all points in cm relative to center
    const allPointsCm: { x: number; y: number }[][] = [];
    let maxDist = 0;

    for (const m of withAnalysis) {
      if (!activeIds.has(m.id)) {
        allPointsCm.push([]);
        continue;
      }
      const sa = m.savedAnalysis!;
      const center = sa.center;
      const pxPerCm = sa.scale.pixelsPerCm;
      if (!center || !pxPerCm) {
        allPointsCm.push([]);
        continue;
      }

      const pts = sa.impacts.map((imp: Impact) => ({
        x: (imp.x - center.x) / pxPerCm,
        y: (imp.y - center.y) / pxPerCm,
      }));

      for (const p of pts) {
        const d = Math.sqrt(p.x * p.x + p.y * p.y);
        if (d > maxDist) maxDist = d;
      }
      allPointsCm.push(pts);
    }

    if (maxDist === 0) maxDist = 50;
    const margin = 48;
    const drawR = (size - margin * 2) / 2;
    const scale = drawR / (maxDist * 1.25);

    // Reference circles
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2b2f3d';
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#606474';

    const gridRadii = [25, 50, 75, 100].filter((r) => r <= maxDist * 1.4);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    for (const r of gridRadii) {
      ctx.beginPath();
      ctx.arc(cxc, cyc, r * scale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = mutedColor;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(r + 'cm', cxc + r * scale + 4, cyc - 3);
    }
    ctx.setLineDash([]);

    // Crosshair
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 0.8;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(cxc - drawR, cyc);
    ctx.lineTo(cxc + drawR, cyc);
    ctx.moveTo(cxc, cyc - drawR);
    ctx.lineTo(cxc, cyc + drawR);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cxc, cyc, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw impacts per munition (different shape per munition)
    withAnalysis.forEach((m, mi) => {
      if (!activeIds.has(m.id)) return;
      const pts = allPointsCm[mi];
      if (!pts || pts.length === 0) return;

      const c = COLORS[mi % COLORS.length];
      const drawShape = SHAPES[mi % SHAPES.length];

      // Each impact
      for (const p of pts) {
        const sx = cxc + p.x * scale;
        const sy = cyc + p.y * scale;

        drawShape(ctx, sx, sy, 5);
        ctx.fillStyle = c.light;
        ctx.fill();
        ctx.strokeStyle = c.main;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Mean cross
      const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const meanY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const smx = cxc + meanX * scale;
      const smy = cyc + meanY * scale;

      ctx.strokeStyle = c.main;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(smx - 8, smy);
      ctx.lineTo(smx + 8, smy);
      ctx.moveTo(smx, smy - 8);
      ctx.lineTo(smx, smy + 8);
      ctx.stroke();

      // Mean label
      ctx.fillStyle = c.main;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText((m.nom || '?').slice(0, 10), smx + 10, smy + 4);
    });
  }, [withAnalysis, activeIds, canvasSize]);

  useEffect(() => { draw(); }, [draw]);

  const toggleMunition = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (withAnalysis.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        {"Aucune munition avec analyse sauvegard\u00E9e."}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}
      />

      {/* Toggle legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {withAnalysis.map((m, mi) => {
          const active = activeIds.has(m.id);
          const c = COLORS[mi % COLORS.length];
          return (
            <button
              key={m.id}
              className="btn btn-sm"
              onClick={() => toggleMunition(m.id)}
              style={{
                opacity: active ? 1 : 0.35,
                borderColor: active ? c.main : 'var(--border)',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <svg width={12} height={12} viewBox="0 0 12 12">
                {mi % 4 === 0 && <circle cx={6} cy={6} r={5} fill={active ? c.main : 'none'} stroke={c.main} strokeWidth={1.5} />}
                {mi % 4 === 1 && <polygon points="6,1 11,6 6,11 1,6" fill={active ? c.main : 'none'} stroke={c.main} strokeWidth={1.5} />}
                {mi % 4 === 2 && <polygon points="6,1 11,10 1,10" fill={active ? c.main : 'none'} stroke={c.main} strokeWidth={1.5} />}
                {mi % 4 === 3 && <rect x={1.5} y={1.5} width={9} height={9} fill={active ? c.main : 'none'} stroke={c.main} strokeWidth={1.5} />}
              </svg>
              <span style={{ fontSize: 11 }}>{m.nom || 'Sans nom'}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                {'(' + String(m.savedAnalysis!.impacts.length) + ')'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
