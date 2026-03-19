import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { BallisticParams } from '../../lib/ballistics-sim';
import { pelletMassFromDiameter, quickBallisticSummary } from '../../lib/ballistics-sim';

interface EnhancedBallisticsPanelProps {
  onApply: (params: BallisticParams) => void;
  onClear: () => void;
  activeParams: BallisticParams | null;
  distanceM: number;
}

const PRESETS: { label: string; params: Partial<BallisticParams> }[] = [
  {
    label: 'Plomb n°6 (2.8mm)',
    params: { pelletDiameterMm: 2.8, pelletMassGrams: 0, dragCoefficient: 0.47 },
  },
  {
    label: 'Plomb n°4 (3.3mm)',
    params: { pelletDiameterMm: 3.3, pelletMassGrams: 0, dragCoefficient: 0.47 },
  },
  {
    label: 'Plomb n°2 (3.8mm)',
    params: { pelletDiameterMm: 3.8, pelletMassGrams: 0, dragCoefficient: 0.47 },
  },
  {
    label: 'Chevrotine 00 (8.4mm)',
    params: { pelletDiameterMm: 8.4, pelletMassGrams: 0, dragCoefficient: 0.47 },
  },
];

export function EnhancedBallisticsPanel({
  onApply,
  onClear,
  activeParams,
  distanceM,
}: EnhancedBallisticsPanelProps) {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [muzzleVelocity, setMuzzleVelocity] = useState(activeParams?.muzzleVelocity ?? 400);
  const [dragCoefficient, setDragCoefficient] = useState(activeParams?.dragCoefficient ?? 0.47);
  const [pelletDiameterMm, setPelletDiameter] = useState(activeParams?.pelletDiameterMm ?? 3.0);
  const [pelletMassGrams, setPelletMass] = useState(activeParams?.pelletMassGrams ?? 0);
  const [barrelDiameterMm, setBarrelDiameter] = useState(activeParams?.barrelDiameterMm ?? 18.5);

  const autoMass = useMemo(() => pelletMassFromDiameter(pelletDiameterMm) * 1000, [pelletDiameterMm]);
  const effectiveMass = pelletMassGrams > 0 ? pelletMassGrams : autoMass;

  const params: BallisticParams = useMemo(() => ({
    muzzleVelocity,
    dragCoefficient,
    pelletDiameterMm,
    pelletMassGrams,
    barrelDiameterMm,
  }), [muzzleVelocity, dragCoefficient, pelletDiameterMm, pelletMassGrams, barrelDiameterMm]);

  const summary = useMemo(() => {
    try {
      return quickBallisticSummary(params, distanceM);
    } catch {
      return null;
    }
  }, [params, distanceM]);

  const handleApply = useCallback(() => {
    onApply(params);
    setOpen(false);
  }, [params, onApply]);

  const handlePreset = useCallback((preset: typeof PRESETS[number]) => {
    if (preset.params.pelletDiameterMm != null) setPelletDiameter(preset.params.pelletDiameterMm);
    if (preset.params.pelletMassGrams != null) setPelletMass(preset.params.pelletMassGrams);
    if (preset.params.dragCoefficient != null) setDragCoefficient(preset.params.dragCoefficient);
  }, []);

  return (
    <>
      {/* Toggle button */}
      <button
        className={`btn btn-sm ${activeParams ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        style={{
          gap: 5,
          background: activeParams
            ? 'linear-gradient(135deg, var(--purple), var(--blue))'
            : undefined,
          color: activeParams ? '#fff' : undefined,
          border: activeParams ? 'none' : undefined,
        }}
        title="Paramètres balistiques avancés"
      >
        <Zap size={12} />
        {activeParams ? 'Balistique avancée ✓' : 'Améliorer la modélisation'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: 50,
              right: 16,
              zIndex: 100,
              width: 380,
              maxHeight: 'calc(100vh - 200px)',
              overflowY: 'auto',
              background: 'var(--surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              padding: 0,
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              background: 'linear-gradient(135deg, rgba(192,132,252,0.08), rgba(96,165,250,0.08))',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'var(--purple-glow)',
                  border: '1px solid rgba(192,132,252,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Zap size={14} color="var(--purple)" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Modélisation avancée</span>
              </div>
              <button
                className="btn btn-sm"
                onClick={() => setOpen(false)}
                style={{ padding: '4px 6px' }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Presets */}
            <div style={{
              padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Presets
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    className="btn btn-sm"
                    onClick={() => handlePreset(p)}
                    style={{ fontSize: 10, padding: '3px 8px' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input fields */}
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <FieldGroup
                label="Vitesse de sortie"
                unit="m/s"
                value={muzzleVelocity}
                onChange={setMuzzleVelocity}
                min={100}
                max={600}
                step={5}
                hint="Vitesse du plomb à la sortie du canon"
              />

              <FieldGroup
                label="Coefficient aérodynamique (Cd)"
                unit=""
                value={dragCoefficient}
                onChange={setDragCoefficient}
                min={0.1}
                max={1.0}
                step={0.01}
                hint="~0.47 pour une sphère lisse (plomb standard)"
              />

              <FieldGroup
                label="Diamètre du plomb"
                unit="mm"
                value={pelletDiameterMm}
                onChange={setPelletDiameter}
                min={1.0}
                max={12.0}
                step={0.1}
                hint="Diamètre d'une bille"
              />

              <FieldGroup
                label="Masse du plomb"
                unit="g"
                value={pelletMassGrams}
                onChange={setPelletMass}
                min={0}
                max={10}
                step={0.01}
                hint={`0 = auto (${autoMass.toFixed(3)}g calculé depuis ∅${pelletDiameterMm}mm)`}
              />

              <FieldGroup
                label="Diamètre sortie canon / choke"
                unit="mm"
                value={barrelDiameterMm}
                onChange={setBarrelDiameter}
                min={10}
                max={25}
                step={0.1}
                hint="18.5mm = cylindrique (12ga), 17.5mm = full choke"
              />
            </div>

            {/* Summary preview */}
            {summary && (
              <div style={{
                margin: '0 16px',
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
              }}>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{
                    all: 'unset', cursor: 'pointer', width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Aperçu à {distanceM}m
                  </span>
                  {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                  marginTop: 8,
                }}>
                  <StatMini label="V impact" value={`${summary.impactVelocity.toFixed(0)} m/s`} color="var(--blue)" />
                  <StatMini label="Rétention" value={`${summary.velocityRetention.toFixed(0)}%`}
                    color={summary.velocityRetention > 60 ? 'var(--green)' : summary.velocityRetention > 40 ? 'var(--amber)' : 'var(--red)'}
                  />
                  <StatMini label="Énergie" value={`${summary.impactEnergy.toFixed(2)} J`} color="var(--accent2)" />
                  <StatMini label="Pénétration" value={`${summary.penetrationCm.toFixed(1)} cm`} color="var(--purple)" />
                </div>

                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                        marginTop: 8, paddingTop: 8,
                        borderTop: '1px solid var(--border)',
                      }}>
                        <StatMini label="Masse bille" value={`${effectiveMass.toFixed(3)} g`} color="var(--text-secondary)" />
                        <StatMini label="Temps de vol" value={`${(summary.flightTime * 1000).toFixed(0)} ms`} color="var(--text-secondary)" />
                        <StatMini label="É. initiale" value={`${summary.muzzleEnergy.toFixed(2)} J`} color="var(--text-secondary)" />
                        <StatMini label="Chute gravité" value={`${summary.gravityDropCm.toFixed(1)} cm`} color="var(--text-secondary)" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action buttons */}
            <div style={{
              padding: '12px 16px 16px',
              display: 'flex', gap: 8,
            }}>
              <button
                className="btn btn-primary"
                onClick={handleApply}
                style={{ flex: 1, gap: 6, fontWeight: 700 }}
              >
                <Zap size={13} /> Appliquer
              </button>
              {activeParams && (
                <button
                  className="btn btn-sm"
                  onClick={() => { onClear(); setOpen(false); }}
                  style={{ color: 'var(--red)' }}
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Info note */}
            <div style={{
              padding: '10px 16px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <Info size={12} color="var(--muted)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.5 }}>
                Simulation basée sur la traînée aérodynamique (F = ½·Cd·ρ·A·v²),
                la gravité et la pénétration en gel balistique 10%. Les trajectoires
                et pénétrations seront recalculées avec ces paramètres.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────

function FieldGroup({
  label, unit, value, onChange, min, max, step, hint,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  hint?: string;
}) {
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 4,
      }}>
        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </label>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
          {value}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      {hint && (
        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}
