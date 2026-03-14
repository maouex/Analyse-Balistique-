import { useRef, useState } from 'react';
import {
  Upload, RotateCcw, Crosshair, Circle, Move, Undo2, Ruler,
  ZoomIn, Maximize2, Eye, EyeOff, Hash, X, Wand2, Loader2,
  Eraser, Trash2, ChevronDown, ChevronRight, Palette,
} from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';
import { detectImpacts } from '../../lib/autoDetect';

export function Toolbar() {
  const store = useAnalysisStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [detecting, setDetecting] = useState(false);
  const [sensitivity, setSensitivity] = useState(50);
  const [lastDetectCount, setLastDetectCount] = useState<number | null>(null);
  const [showAppearance, setShowAppearance] = useState(false);

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

  const hasImage = store.imageLoaded;
  const hasScale = !!store.scale.pixelsPerCm;
  const hasImpacts = store.impacts.length > 0;

  return (
    <div className="sidebar-left" style={{
      width: 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      overflowY: 'auto',
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flexShrink: 0,
    }}>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />

      {/* ─── IMAGE ─── */}
      {!hasImage ? (
        <button
          className="btn btn-primary"
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%',
            padding: '14px 12px',
            fontSize: 13,
            gap: 8,
          }}
        >
          <Upload size={16} /> Charger une image
        </button>
      ) : (
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>
            <Upload size={12} /> Charger
          </button>
          <button className="btn btn-sm btn-danger" onClick={store.resetAnalysis}>
            <RotateCcw size={12} />
          </button>
        </div>
      )}

      {/* ─── OUTILS ─── */}
      {hasImage && (
        <>
          <Section title="Outils">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3 }}>
              <ToolBtn icon={<Ruler size={12} />} label="Échelle" active={store.activeMode === 'scale'} onClick={() => store.setMode('scale')} />
              <ToolBtn icon={<Crosshair size={12} />} label="Centre" active={store.activeMode === 'center'} onClick={() => store.setMode('center')} />
              <ToolBtn icon={<Circle size={12} />} label="Impacts" active={store.activeMode === 'impact'} onClick={() => store.setMode('impact')} />
              <ToolBtn icon={<Eraser size={12} />} label="Gomme" active={store.activeMode === 'eraser'} onClick={() => store.setMode('eraser')} />
              <ToolBtn icon={<Move size={12} />} label="Déplacer" active={store.activeMode === 'move'} onClick={() => store.setMode('move')} />
              <ToolBtn icon={<Undo2 size={12} />} label="Annuler" active={false} onClick={store.undoImpact} />
            </div>
            {hasImpacts && (
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  if (confirm(`Supprimer les ${store.impacts.length} impacts ?`)) {
                    store.clearImpacts();
                  }
                }}
                style={{ width: '100%', marginTop: 4, fontSize: 11 }}
              >
                <Trash2 size={11} /> Effacer les {store.impacts.length} impacts
              </button>
            )}
          </Section>

          {/* ─── ÉTALONNAGE ─── */}
          <Section title="Étalonnage">
            {hasScale ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--green)' }}>
                  ✓ {store.scale.referenceCm}cm — {store.scale.pixelsPerCm!.toFixed(1)} px/cm
                </span>
                <button
                  className="btn btn-sm"
                  onClick={store.clearScale}
                  style={{ padding: '2px 6px', fontSize: 10 }}
                >
                  <X size={10} /> Reset
                </button>
              </div>
            ) : (
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>
                Sélectionnez "Échelle" puis tracez 2 points
              </div>
            )}
          </Section>

          {/* ─── DÉTECTION IA ─── */}
          <Section title="Détection auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="range"
                min={10}
                max={90}
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 28, textAlign: 'right' }}>
                {sensitivity}%
              </span>
            </div>
            <button
              className="btn btn-sm btn-primary"
              disabled={detecting || !store.image}
              onClick={() => {
                if (!store.image) return;
                setDetecting(true);
                setLastDetectCount(null);
                requestAnimationFrame(() => {
                  const detected = detectImpacts(store.image!, {
                    sensitivity,
                    minArea: 3,
                    maxArea: 8000,
                    roiCenter: store.center,
                    roiRadius: store.center && store.scale.pixelsPerCm
                      ? (store.circle2.diameterCm / 2 + 20) * store.scale.pixelsPerCm
                      : null,
                  });
                  if (detected.length > 0) store.addImpacts(detected);
                  setLastDetectCount(detected.length);
                  setDetecting(false);
                });
              }}
              style={{ width: '100%', marginTop: 4 }}
            >
              {detecting ? (
                <><Loader2 size={12} className="spin" /> Analyse...</>
              ) : (
                <><Wand2 size={12} /> Détecter les impacts</>
              )}
            </button>
            {lastDetectCount !== null && (
              <div style={{
                fontSize: 10,
                marginTop: 3,
                color: lastDetectCount > 0 ? 'var(--green)' : 'var(--amber)',
              }}>
                {lastDetectCount > 0
                  ? `${lastDetectCount} impact${lastDetectCount > 1 ? 's' : ''} détecté${lastDetectCount > 1 ? 's' : ''}`
                  : 'Aucun détecté — augmentez la sensibilité'}
              </div>
            )}
          </Section>

          {/* ─── NAVIGATION ─── */}
          <Section title="Navigation">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ZoomIn size={12} color="var(--muted)" />
              <input
                type="range"
                min={5}
                max={500}
                value={Math.round(store.view.zoom * 100)}
                onChange={(e) => store.setView({ zoom: Number(e.target.value) / 100 })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 32, textAlign: 'right' }}>
                {Math.round(store.view.zoom * 100)}%
              </span>
            </div>
            <button
              className="btn btn-sm"
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (canvas) store.fitToScreen(canvas.width, canvas.height);
              }}
              style={{ width: '100%', marginTop: 3, fontSize: 11 }}
            >
              <Maximize2 size={11} /> Ajuster à l'écran
            </button>
          </Section>

          {/* ─── APPARENCE (collapsible) ─── */}
          <CollapsibleSection
            title="Apparence"
            icon={<Palette size={11} />}
            open={showAppearance}
            onToggle={() => setShowAppearance(!showAppearance)}
          >
            {/* Circles */}
            <SubLabel>Cercles de référence</SubLabel>
            <CircleRow
              label={`∅${store.circle1.diameterCm}cm`}
              visible={store.circle1.visible}
              color={store.circle1.color}
              diameter={store.circle1.diameterCm}
              min={10}
              max={200}
              onToggle={() => store.updateCircle1({ visible: !store.circle1.visible })}
              onColor={(c) => store.updateCircle1({ color: c })}
              onDiameter={(d) => store.updateCircle1({ diameterCm: d })}
            />
            <CircleRow
              label={`∅${store.circle2.diameterCm}cm`}
              visible={store.circle2.visible}
              color={store.circle2.color}
              diameter={store.circle2.diameterCm}
              min={20}
              max={400}
              onToggle={() => store.updateCircle2({ visible: !store.circle2.visible })}
              onColor={(c) => store.updateCircle2({ color: c })}
              onDiameter={(d) => store.updateCircle2({ diameterCm: d })}
            />

            {/* Impact style */}
            <SubLabel style={{ marginTop: 8 }}>Style impacts</SubLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="color"
                value={store.impactStyle.color}
                onChange={(e) => store.updateImpactStyle({ color: e.target.value })}
                style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}
              />
              <input
                type="range"
                min={3}
                max={20}
                value={store.impactStyle.radius}
                onChange={(e) => store.updateImpactStyle({ radius: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 22 }}>{store.impactStyle.radius}px</span>
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
              <button
                className={`btn btn-sm ${store.impactStyle.showNumbers ? 'active' : ''}`}
                onClick={() => store.updateImpactStyle({ showNumbers: !store.impactStyle.showNumbers })}
                style={{ flex: 1, fontSize: 10, padding: '3px 4px' }}
              >
                <Hash size={10} /> N°
              </button>
              <button
                className={`btn btn-sm ${store.impactStyle.showEllipse ? 'active' : ''}`}
                onClick={() => store.updateImpactStyle({ showEllipse: !store.impactStyle.showEllipse })}
                style={{ flex: 1, fontSize: 10, padding: '3px 4px' }}
              >
                Ellipse
              </button>
              {store.impactStyle.showEllipse && (
                <input
                  type="color"
                  value={store.impactStyle.ellipseColor}
                  onChange={(e) => store.updateImpactStyle({ ellipseColor: e.target.value })}
                  style={{ width: 22, height: 22, border: 'none', background: 'none', cursor: 'pointer' }}
                />
              )}
            </div>
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function CollapsibleSection({ title, icon, open, onToggle, children }: {
  title: string;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        }}
      >
        {open ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        {icon}
        {title}
      </button>
      {open && (
        <div style={{
          paddingTop: 4,
          paddingLeft: 2,
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SubLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      fontSize: 10,
      color: 'var(--muted)',
      marginBottom: 4,
      ...style,
    }}>
      {children}
    </div>
  );
}

function CircleRow({ label, visible, color, diameter, min, max, onToggle, onColor, onDiameter }: {
  label: string;
  visible: boolean;
  color: string;
  diameter: number;
  min: number;
  max: number;
  onToggle: () => void;
  onColor: (c: string) => void;
  onDiameter: (d: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
      <button
        className="btn btn-sm"
        onClick={onToggle}
        style={{ padding: '2px 4px', flexShrink: 0 }}
      >
        {visible ? <Eye size={10} /> : <EyeOff size={10} />}
      </button>
      <input
        type="color"
        value={color}
        onChange={(e) => onColor(e.target.value)}
        style={{ width: 20, height: 20, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={diameter}
        onChange={(e) => onDiameter(Number(e.target.value))}
        style={{ flex: 1 }}
      />
      <span style={{ fontSize: 10, color: 'var(--muted)', minWidth: 36, textAlign: 'right' }}>{label}</span>
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
      style={{
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 2px',
        fontSize: 9,
        lineHeight: 1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}
