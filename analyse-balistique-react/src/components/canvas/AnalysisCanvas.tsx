import { useRef, useEffect, useCallback } from 'react';
import { useAnalysisStore } from '../../stores/analysisStore';
import { render } from '../../lib/canvas-renderer';
import { computeFullAnalysis } from '../../lib/ballistics';
import type { Point } from '../../types';

const ERASER_RADIUS_PX = 20; // eraser radius in image pixels

export function AnalysisCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isErasing = useRef(false);
  const isRightDragging = useRef(false);
  const lastMouse = useRef<Point>({ x: 0, y: 0 });

  const store = useAnalysisStore();

  const canvasToImage = useCallback((cx: number, cy: number): Point => {
    const { zoom, panX, panY } = store.view;
    return { x: (cx - panX) / zoom, y: (cy - panY) / zoom };
  }, [store.view]);

  // Resize canvas to fill container
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ro = new ResizeObserver(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Auto-fit image when it changes
  useEffect(() => {
    if (!store.image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    if (canvas.width > 0 && canvas.height > 0) {
      store.fitToScreen(canvas.width, canvas.height);
    }
  }, [store.image]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stats = computeFullAnalysis(
      store.impacts,
      store.center,
      store.circle1.diameterCm,
      store.circle2.diameterCm,
      store.scale.pixelsPerCm
    );

    render({
      ctx,
      canvas,
      image: store.image,
      view: store.view,
      center: store.center,
      impacts: store.impacts,
      circle1: store.circle1,
      circle2: store.circle2,
      impactStyle: store.impactStyle,
      pixelsPerCm: store.scale.pixelsPerCm,
      ellipse: stats?.ellipse ?? null,
      scalePt1: store.scalePt1,
      scalePt2: store.scalePt2,
      mousePos: store.mousePos,
      activeMode: store.activeMode,
    });
  });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Right-click or middle-click → always pan (regardless of active tool)
    if (e.button === 2 || e.button === 1) {
      isRightDragging.current = true;
      lastMouse.current = { x: cx, y: cy };
      return;
    }

    if (store.activeMode === 'move') {
      isDragging.current = true;
      lastMouse.current = { x: cx, y: cy };
      return;
    }

    const imgPos = canvasToImage(cx, cy);

    switch (store.activeMode) {
      case 'center':
        store.setCenter(imgPos);
        break;
      case 'impact':
        store.addImpact(imgPos);
        break;
      case 'scale':
        store.setScalePoint(imgPos);
        break;
      case 'eraser':
        isErasing.current = true;
        store.removeImpactsInRadius(imgPos, ERASER_RADIUS_PX);
        break;
    }
  }, [store, canvasToImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Right-click pan
    if (isRightDragging.current) {
      const dx = cx - lastMouse.current.x;
      const dy = cy - lastMouse.current.y;
      store.setView({
        panX: store.view.panX + dx,
        panY: store.view.panY + dy,
      });
      lastMouse.current = { x: cx, y: cy };
      return;
    }

    if (isDragging.current) {
      const dx = cx - lastMouse.current.x;
      const dy = cy - lastMouse.current.y;
      store.setView({
        panX: store.view.panX + dx,
        panY: store.view.panY + dy,
      });
      lastMouse.current = { x: cx, y: cy };
      return;
    }

    const imgPos = canvasToImage(cx, cy);
    store.setMousePos(imgPos);

    // Drag-erase: continuously remove impacts while dragging in eraser mode
    if (isErasing.current && store.activeMode === 'eraser') {
      store.removeImpactsInRadius(imgPos, ERASER_RADIUS_PX);
    }
  }, [store, canvasToImage]);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    isErasing.current = false;
    isRightDragging.current = false;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    store.zoomAt(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
  }, [store]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    loadImageFile(file);
  }, []);

  const loadImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        store.setImage(img);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Instruction message
  const getMessage = () => {
    if (!store.imageLoaded) return 'Chargez une image pour commencer l\'analyse';
    switch (store.activeMode) {
      case 'center': return 'Cliquez pour placer le centre de la cible';
      case 'impact': return 'Cliquez pour ajouter un impact — Clic droit: déplacer';
      case 'scale': return !store.scalePt1 ? 'Cliquez le 1er point de référence' : 'Cliquez le 2ème point de référence';
      case 'move': return 'Glissez pour déplacer, molette pour zoomer';
      case 'eraser': return 'Cliquez ou glissez sur les impacts à supprimer — Clic droit: déplacer';
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--canvas-bg)',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          width: '100%',
          height: '100%',
          cursor: (isDragging.current || isRightDragging.current)
            ? 'grabbing'
            : store.activeMode === 'move' ? 'grab'
            : store.activeMode === 'eraser' ? 'none' : 'crosshair',
        }}
      />

      {/* Instruction bar */}
      <div style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(25, 28, 37, 0.9)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '6px 16px',
        fontSize: 12,
        color: 'var(--text-secondary)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
      }}>
        {getMessage()}
      </div>

      {/* Zoom indicator */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        background: 'rgba(25, 28, 37, 0.85)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 10px',
        fontSize: 11,
        color: 'var(--muted)',
        fontWeight: 600,
      }}>
        {Math.round(store.view.zoom * 100)}%
      </div>
    </div>
  );
}
