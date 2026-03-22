import { useState } from 'react';
import { X, FileImage, FileText } from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';
import { renderExport } from '../../lib/canvas-renderer';
import { computeFullAnalysis } from '../../lib/ballistics';
import { generatePdfReport } from '../../lib/pdf-export';
import type { ExportOptions } from '../../types';

interface ExportModalProps {
  onClose: () => void;
}

export function ExportModal({ onClose }: ExportModalProps) {
  const store = useAnalysisStore();

  const [options, setOptions] = useState<ExportOptions>({
    showCircle1: true,
    showCircle2: true,
    showImpacts: true,
    showNumbers: true,
    showEllipse: true,
    circle1Color: store.circle1.color,
    circle2Color: store.circle2.color,
    impactColor: store.impactStyle.color,
    ellipseColor: store.impactStyle.ellipseColor,
  });

  const handleExport = () => {
    if (!store.image || !store.center) return;

    const stats = computeFullAnalysis(
      store.impacts, store.center,
      store.circle1.diameterCm, store.circle2.diameterCm,
      store.scale.pixelsPerCm
    );

    const canvas = renderExport({
      center: store.center,
      impacts: store.impacts,
      circle1: store.circle1,
      circle2: store.circle2,
      impactStyle: store.impactStyle,
      pixelsPerCm: store.scale.pixelsPerCm,
      ellipse: stats?.ellipse ?? null,
      ...options,
    });

    const link = document.createElement('a');
    link.download = 'analyse-balistique.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    onClose();
  };

  const handlePdfExport = () => {
    if (!store.image || !store.center || !store.scale.pixelsPerCm) return;

    const stats = computeFullAnalysis(
      store.impacts, store.center,
      store.circle1.diameterCm, store.circle2.diameterCm,
      store.scale.pixelsPerCm
    );
    if (!stats) return;

    generatePdfReport({
      stats,
      impacts: store.impacts,
      center: store.center,
      circle1: store.circle1,
      circle2: store.circle2,
      impactStyle: store.impactStyle,
      pixelsPerCm: store.scale.pixelsPerCm,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Options d'export</h2>
          <button className="btn btn-sm" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ToggleRow
            label="Cercle 50 cm"
            checked={options.showCircle1}
            onChange={(v) => setOptions({ ...options, showCircle1: v })}
            color={options.circle1Color}
            onColorChange={(c) => setOptions({ ...options, circle1Color: c })}
          />
          <ToggleRow
            label="Cercle 100 cm"
            checked={options.showCircle2}
            onChange={(v) => setOptions({ ...options, showCircle2: v })}
            color={options.circle2Color}
            onColorChange={(c) => setOptions({ ...options, circle2Color: c })}
          />
          <ToggleRow
            label="Impacts"
            checked={options.showImpacts}
            onChange={(v) => setOptions({ ...options, showImpacts: v })}
            color={options.impactColor}
            onColorChange={(c) => setOptions({ ...options, impactColor: c })}
          />
          <ToggleRow
            label="Numéros"
            checked={options.showNumbers}
            onChange={(v) => setOptions({ ...options, showNumbers: v })}
          />
          <ToggleRow
            label="Ellipse de dispersion"
            checked={options.showEllipse}
            onChange={(v) => setOptions({ ...options, showEllipse: v })}
            color={options.ellipseColor}
            onColorChange={(c) => setOptions({ ...options, ellipseColor: c })}
          />
        </div>
        <div className="modal-footer" style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileImage size={14} /> PNG
          </button>
          <button className="btn btn-primary" onClick={handlePdfExport} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--blue-glow)', borderColor: 'rgba(68,170,255,0.3)', color: 'var(--blue)' }}>
            <FileText size={14} /> Rapport PDF
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange, color, onColorChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  color?: string;
  onColorChange?: (c: string) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer' }}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span style={{ fontSize: 13 }}>{label}</span>
      </label>
      {color && onColorChange && (
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
        />
      )}
    </div>
  );
}
