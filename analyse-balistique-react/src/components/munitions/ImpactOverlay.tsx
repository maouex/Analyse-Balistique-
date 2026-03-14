import { useRef, useEffect, useState } from 'react';
import type { Munition, Impact } from '../../types';

const COLORS = ['#4dabf7', '#2ecc71', '#f0a030', '#e05252'];

interface ImpactOverlayProps {
  munitions: Munition[];
}

export function ImpactOverlay({ munitions }: ImpactOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeIds, setActiveIds] = useState<Set<string>>(() => new Set(munitions.map((m) => m.id)));

  const withAnalysis = munitions.filter((m) => m.savedAnalysis && m.savedAnalysis.impacts.length > 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;

    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = 'var(--bg)';
    ctx.fillRect(0, 0, size, size);

    // Compute the drawing: normalize all impacts relative to their center, in cm
    // then draw on canvas where 1cm = some scale factor
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
    const margin = 40;
    const drawR = (size - margin * 2) / 2;
    const scale = drawR / (maxDist * 1.2); // add 20% padding

    // Draw reference circles (25cm, 50cm)
    const gridRadii = [25, 50, 75, 100].filter((r) => r <= maxDist * 1.3);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2b2f3d';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (const r of gridRadii) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.stroke();

      // Label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted').trim() || '#606474';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${r}cm`, cx + r * scale + 1, cy - 4);
    }
    ctx.setLineDash([]);

    // Draw crosshair
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#2b2f3d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - drawR, cy);
    ctx.lineTo(cx + drawR, cy);
    ctx.moveTo(cx, cy - drawR);
    ctx.lineTo(cx, cy + drawR);
    ctx.stroke();

    // Draw center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw impacts for each munition
    withAnalysis.forEach((m, mi) => {
      if (!activeIds.has(m.id)) return;
      const pts = allPointsCm[mi];
      if (!pts || pts.length === 0) return;

      const color = COLORS[mi % COLORS.length];

      // Draw mean point
      const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const meanY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const smx = cx + meanX * scale;
      const smy = cy + meanY * scale;

      // Draw mean cross
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(smx - 6, smy);
      ctx.lineTo(smx + 6, smy);
      ctx.moveTo(smx, smy - 6);
      ctx.lineTo(smx, smy + 6);
      ctx.stroke();

      // Draw each impact
      for (const p of pts) {
        const sx = cx + p.x * scale;
        const sy = cy + p.y * scale;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });
  }, [withAnalysis, activeIds]);

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
        Aucune munition avec analyse sauvegardée. Sauvegardez une analyse depuis la page d'analyse pour superposer les gerbes.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <canvas
        ref={canvasRef}
        width={420}
        height={420}
        style={{
          width: 420,
          height: 420,
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
        }}
      />

      {/* Toggle legend */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {withAnalysis.map((m, i) => {
          const active = activeIds.has(m.id);
          return (
            <button
              key={m.id}
              className={`btn btn-sm ${active ? '' : ''}`}
              onClick={() => toggleMunition(m.id)}
              style={{
                opacity: active ? 1 : 0.4,
                borderColor: COLORS[i % COLORS.length],
                gap: 6,
              }}
            >
              <div style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: active ? COLORS[i % COLORS.length] : 'transparent',
                border: `2px solid ${COLORS[i % COLORS.length]}`,
              }} />
              <span style={{ fontSize: 11 }}>{m.nom || 'Sans nom'}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>({m.savedAnalysis!.impacts.length})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
