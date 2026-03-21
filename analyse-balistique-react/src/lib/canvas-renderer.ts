import type { Point, Impact, CircleConfig, ImpactStyle, ViewState, CovarianceEllipse } from '../types';

interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  image: HTMLImageElement | null;
  view: ViewState;
  center: Point | null;
  impacts: Impact[];
  circle1: CircleConfig;
  circle2: CircleConfig;
  impactStyle: ImpactStyle;
  pixelsPerCm: number | null;
  ellipse: CovarianceEllipse | null;
  scalePt1: Point | null;
  scalePt2: Point | null;
  mousePos: Point | null;
  activeMode: string;
}

function imageToCanvas(p: Point, view: ViewState): Point {
  return { x: p.x * view.zoom + view.panX, y: p.y * view.zoom + view.panY };
}

export function render(rc: RenderContext): void {
  const { ctx, canvas, image, view, center, impacts, circle1, circle2, impactStyle } = rc;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--canvas-bg').trim() || '#0a0c14';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!image) {
    drawPlaceholder(ctx, canvas);
    return;
  }

  // Draw image
  ctx.save();
  ctx.translate(view.panX, view.panY);
  ctx.scale(view.zoom, view.zoom);
  ctx.drawImage(image, 0, 0);
  ctx.restore();

  // Draw reference circles
  if (center) {
    const cc = imageToCanvas(center, view);
    if (circle1.visible) drawCircle(ctx, cc, circle1.radiusPx * view.zoom, circle1.color, [8, 6]);
    if (circle2.visible) drawCircle(ctx, cc, circle2.radiusPx * view.zoom, circle2.color, [12, 8]);
  }

  // Draw covariance ellipse
  if (impactStyle.showEllipse && rc.ellipse && rc.pixelsPerCm && center) {
    drawEllipse(ctx, rc.ellipse, rc.pixelsPerCm, center, view, impactStyle.ellipseColor);
  }

  // Draw impacts
  for (const imp of impacts) {
    const p = imageToCanvas(imp, view);
    drawImpact(ctx, p, imp.index, impactStyle);
  }

  // Draw center
  if (center) {
    const cc = imageToCanvas(center, view);
    drawCenter(ctx, cc);
  }

  // Draw scale reference line
  if (rc.scalePt1) {
    const p1 = imageToCanvas(rc.scalePt1, view);
    if (rc.scalePt2) {
      const p2 = imageToCanvas(rc.scalePt2, view);
      drawScaleLine(ctx, p1, p2);
    } else if (rc.mousePos) {
      const p2 = imageToCanvas(rc.mousePos, view);
      drawScaleLine(ctx, p1, p2);
    }
  }

  // Draw eraser cursor or crosshair
  if (rc.mousePos && rc.activeMode === 'eraser') {
    const mp = imageToCanvas(rc.mousePos, view);
    drawEraserCursor(ctx, mp, 20 * view.zoom, impacts, view);
  } else if (rc.mousePos && rc.activeMode !== 'move') {
    const mp = imageToCanvas(rc.mousePos, view);
    drawCrosshair(ctx, mp);
  }
}

function drawPlaceholder(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
  ctx.fillStyle = '#606474';
  ctx.font = '16px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Glissez une image ici ou utilisez le bouton "Charger"', canvas.width / 2, canvas.height / 2 - 10);
  ctx.fillStyle = '#404454';
  ctx.font = '13px Inter, sans-serif';
  ctx.fillText('JPG, PNG, WEBP', canvas.width / 2, canvas.height / 2 + 16);
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  center: Point,
  radius: number,
  color: string,
  dash: number[]
): void {
  ctx.save();
  ctx.setLineDash(dash);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCenter(ctx: CanvasRenderingContext2D, p: Point): void {
  ctx.save();
  // Outer glow
  ctx.shadowColor = '#44aaff';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = '#44aaff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.x - 12, p.y);
  ctx.lineTo(p.x + 12, p.y);
  ctx.moveTo(p.x, p.y - 12);
  ctx.lineTo(p.x, p.y + 12);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#44aaff';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawImpact(
  ctx: CanvasRenderingContext2D,
  p: Point,
  index: number,
  style: ImpactStyle
): void {
  ctx.save();

  // Glow
  ctx.shadowColor = style.color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = style.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, style.radius, 0, Math.PI * 2);
  ctx.fill();

  // White border
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Number
  if (style.showNumbers) {
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(9, style.radius)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(index), p.x, p.y);
  }

  ctx.restore();
}

function drawEllipse(
  ctx: CanvasRenderingContext2D,
  ellipse: CovarianceEllipse,
  _pixelsPerCm: number,
  _center: Point,
  view: ViewState,
  color: string
): void {
  // ellipse.centerX/Y are in image pixel coordinates
  // ellipse.semiMajor/Minor are in pixels
  const screenCenter = imageToCanvas({ x: ellipse.centerX, y: ellipse.centerY }, view);
  const a = ellipse.semiMajor * view.zoom;
  const b = ellipse.semiMinor * view.zoom;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;

  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(screenCenter.x, screenCenter.y, a, b, ellipse.angle, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 0.08;
  ctx.fill();
  ctx.restore();
}

function drawScaleLine(ctx: CanvasRenderingContext2D, p1: Point, p2: Point): void {
  ctx.save();
  ctx.strokeStyle = '#00ff41';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  // Endpoints
  ctx.setLineDash([]);
  ctx.fillStyle = '#00ff41';
  for (const p of [p1, p2]) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawEraserCursor(
  ctx: CanvasRenderingContext2D,
  p: Point,
  radiusScreen: number,
  impacts: Impact[],
  view: ViewState,
): void {
  ctx.save();

  // Eraser circle
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radiusScreen, 0, Math.PI * 2);
  ctx.stroke();

  // Fill with red tint
  ctx.fillStyle = 'rgba(224, 82, 82, 0.1)';
  ctx.setLineDash([]);
  ctx.fill();

  // Highlight impacts inside the eraser radius
  for (const imp of impacts) {
    const ip = imageToCanvas(imp, view);
    const dx = ip.x - p.x;
    const dy = ip.y - p.y;
    if (dx * dx + dy * dy <= radiusScreen * radiusScreen) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(ip.x, ip.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      // X mark
      ctx.beginPath();
      ctx.moveTo(ip.x - 5, ip.y - 5);
      ctx.lineTo(ip.x + 5, ip.y + 5);
      ctx.moveTo(ip.x + 5, ip.y - 5);
      ctx.lineTo(ip.x - 5, ip.y + 5);
      ctx.stroke();
    }
  }

  ctx.restore();
}

function drawCrosshair(ctx: CanvasRenderingContext2D, p: Point): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(p.x - 20, p.y);
  ctx.lineTo(p.x + 20, p.y);
  ctx.moveTo(p.x, p.y - 20);
  ctx.lineTo(p.x, p.y + 20);
  ctx.stroke();
  ctx.restore();
}

// ─── Export Rendering ───────────────────────────────────────

export interface ExportRenderOptions {
  center: Point;
  impacts: Impact[];
  circle1: CircleConfig;
  circle2: CircleConfig;
  impactStyle: ImpactStyle;
  pixelsPerCm: number | null;
  ellipse: CovarianceEllipse | null;
  showCircle1: boolean;
  showCircle2: boolean;
  showImpacts: boolean;
  showNumbers: boolean;
  showEllipse: boolean;
  circle1Color: string;
  circle2Color: string;
  impactColor: string;
  ellipseColor: string;
}

export function renderExport(options: ExportRenderOptions): HTMLCanvasElement {
  const { center, impacts } = options;
  const margin = 30;
  const r2 = Math.max(options.circle1.radiusPx, options.circle2.radiusPx);
  const size = r2 * 2 + margin * 2;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Transparent background — no image, no fill
  ctx.clearRect(0, 0, size, size);

  // Offset so center of target = center of canvas
  const offsetX = size / 2 - center.x;
  const offsetY = size / 2 - center.y;

  const cc = { x: size / 2, y: size / 2 };

  if (options.showCircle1) {
    drawCircle(ctx, cc, options.circle1.radiusPx, options.circle1Color, [8, 6]);
  }
  if (options.showCircle2) {
    drawCircle(ctx, cc, options.circle2.radiusPx, options.circle2Color, [12, 8]);
  }

  if (options.showEllipse && options.ellipse && options.pixelsPerCm) {
    const view: ViewState = { zoom: 1, panX: offsetX, panY: offsetY };
    drawEllipse(ctx, options.ellipse, options.pixelsPerCm, center, view, options.ellipseColor);
  }

  if (options.showImpacts) {
    const style: ImpactStyle = {
      ...options.impactStyle,
      color: options.impactColor,
      showNumbers: options.showNumbers,
    };
    for (const imp of impacts) {
      const p = { x: imp.x + offsetX, y: imp.y + offsetY };
      drawImpact(ctx, p, imp.index, style);
    }
  }

  // Draw center
  drawCenter(ctx, cc);

  return canvas;
}
