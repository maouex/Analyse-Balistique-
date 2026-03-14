import { useRef } from 'react';
import {
  Upload, RotateCcw, Crosshair, Circle, Move, Undo2, Ruler,
  ZoomIn, Maximize2, Eye, EyeOff, Hash, X,
} from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';

export function Toolbar() {
  const store = useAnalysisStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => store.setImage(img);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="sidebar-left" style={{
      width: 228,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      flexShrink: 0,
    }}>
      {/* Image */}
      <Section title="Image">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>
            <Upload size={13} /> Charger
          </button>
          <button className="btn btn-sm btn-danger" onClick={store.resetAnalysis}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </Section>

      {/* Tools */}
      <Section title="Outils">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <ToolBtn icon={<Crosshair size={13} />} label="Centre" active={store.activeMode === 'center'} onClick={() => store.setMode('center')} />
          <ToolBtn icon={<Circle size={13} />} label="Impacts" active={store.activeMode === 'impact'} onClick={() => store.setMode('impact')} />
          <ToolBtn icon={<Move size={13} />} label="Déplacer" active={store.activeMode === 'move'} onClick={() => store.setMode('move')} />
          <ToolBtn icon={<Ruler size={13} />} label="Échelle" active={store.activeMode === 'scale'} onClick={() => store.setMode('scale')} />
        </div>
        <button className="btn btn-sm" onClick={store.undoImpact} style={{ width: '100%', marginTop: 4 }}>
          <Undo2 size={13} /> Annuler dernier impact
        </button>
      </Section>

      {/* Calibration */}
      <Section title="Étalonnage">
        <label className="label">Distance de référence: {store.scale.referenceCm} cm</label>
        <input
          type="range"
          min={5}
          max={200}
          value={store.scale.referenceCm}
          onChange={(e) => store.setScaleReference(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        {store.scale.pixelsPerCm && (
          <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>
            Calibré: {store.scale.pixelsPerCm.toFixed(2)} px/cm
          </div>
        )}
        {store.scalePt1 && (
          <button className="btn btn-sm btn-danger" onClick={store.clearScale} style={{ width: '100%', marginTop: 4 }}>
            <X size={12} /> Effacer calibration
          </button>
        )}
      </Section>

      {/* Circle 1 */}
      <Section title={`Cercle 1 (∅${store.circle1.diameterCm} cm)`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => store.updateCircle1({ visible: !store.circle1.visible })}>
            {store.circle1.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <input
            type="color"
            value={store.circle1.color}
            onChange={(e) => store.updateCircle1({ color: e.target.value })}
            style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <input
            type="range"
            min={10}
            max={200}
            value={store.circle1.diameterCm}
            onChange={(e) => store.updateCircle1({ diameterCm: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
        </div>
      </Section>

      {/* Circle 2 */}
      <Section title={`Cercle 2 (∅${store.circle2.diameterCm} cm)`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => store.updateCircle2({ visible: !store.circle2.visible })}>
            {store.circle2.visible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <input
            type="color"
            value={store.circle2.color}
            onChange={(e) => store.updateCircle2({ color: e.target.value })}
            style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <input
            type="range"
            min={20}
            max={400}
            value={store.circle2.diameterCm}
            onChange={(e) => store.updateCircle2({ diameterCm: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
        </div>
      </Section>

      {/* Impact Style */}
      <Section title="Style des impacts">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <input
            type="color"
            value={store.impactStyle.color}
            onChange={(e) => store.updateImpactStyle({ color: e.target.value })}
            style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <label className="label" style={{ margin: 0, flex: 1 }}>Taille: {store.impactStyle.radius}px</label>
          <input
            type="range"
            min={3}
            max={20}
            value={store.impactStyle.radius}
            onChange={(e) => store.updateImpactStyle({ radius: Number(e.target.value) })}
            style={{ width: 80 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            className={`btn btn-sm ${store.impactStyle.showNumbers ? 'active' : ''}`}
            onClick={() => store.updateImpactStyle({ showNumbers: !store.impactStyle.showNumbers })}
            style={{ flex: 1 }}
          >
            <Hash size={12} /> N°
          </button>
          <button
            className={`btn btn-sm ${store.impactStyle.showEllipse ? 'active' : ''}`}
            onClick={() => store.updateImpactStyle({ showEllipse: !store.impactStyle.showEllipse })}
            style={{ flex: 1 }}
          >
            Ellipse
          </button>
        </div>
        {store.impactStyle.showEllipse && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Couleur ellipse:</span>
            <input
              type="color"
              value={store.impactStyle.ellipseColor}
              onChange={(e) => store.updateImpactStyle({ ellipseColor: e.target.value })}
              style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: 'pointer' }}
            />
          </div>
        )}
      </Section>

      {/* Zoom */}
      <Section title="Zoom">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ZoomIn size={14} color="var(--muted)" />
          <input
            type="range"
            min={5}
            max={500}
            value={Math.round(store.view.zoom * 100)}
            onChange={(e) => store.setView({ zoom: Number(e.target.value) / 100 })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>
            {Math.round(store.view.zoom * 100)}%
          </span>
        </div>
        <button
          className="btn btn-sm"
          onClick={() => {
            const canvas = document.querySelector('canvas');
            if (canvas) store.fitToScreen(canvas.width, canvas.height);
          }}
          style={{ width: '100%', marginTop: 4 }}
        >
          <Maximize2 size={12} /> Ajuster à l'écran
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function ToolBtn({ icon, label, active, onClick }: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`btn btn-sm ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{ justifyContent: 'center' }}
    >
      {icon} {label}
    </button>
  );
}
