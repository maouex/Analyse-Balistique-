import { useState, useCallback } from 'react';
import { X, Plus } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { useAnalysisStore } from '../../stores/analysisStore';
import { computeFullAnalysis, distancePx, pxToCm } from '../../lib/ballistics';
import type { Munition, AnalysisSnapshot } from '../../types';

interface MunitionFormProps {
  onClose: () => void;
  editId?: string | null;
}

const CALIBRES = ['12/70', '12/76', '16/70', '20/70', '20/76', '28/70', '.410'];
const CHOKES = ['Full', 'Improved Modified', 'Modified', 'Improved Cylinder', 'Cylinder'];
const DISTANCES = ['25m', '35m', '45m'];

type FormData = Omit<Munition, 'id' | 'createdAt' | 'updatedAt'>;

const emptyForm: FormData = {
  nom: '',
  fabricant: '',
  distributeur: '',
  calibre: '12/70',
  prix: 0,
  taillesDispo: [],
  tailleTestee: '',
  vitesseOfficielle: 0,
  vitesseMesuree: 0,
  bourre: '',
  douille: '',
  poudre: '',
  distance: '35m',
  choke: 'Full',
  fusil: '',
  penetration: 0,
  notes: '',
  snap: null,
};

export function MunitionForm({ onClose, editId }: MunitionFormProps) {
  const { addMunition, updateMunition, munitions } = useMunitionsStore();
  const analysisStore = useAnalysisStore();

  const existing = editId ? munitions.find((m) => m.id === editId) : null;

  const [form, setForm] = useState<FormData>(existing ? { ...existing } : { ...emptyForm });
  const [activeTab, setActiveTab] = useState<'cartouche' | 'balistique' | 'notes'>('cartouche');
  const [tagInput, setTagInput] = useState('');

  const getSnapshot = useCallback((): AnalysisSnapshot | null => {
    const { impacts, center, circle1, circle2, scale } = analysisStore;
    const stats = computeFullAnalysis(impacts, center, circle1.diameterCm, circle2.diameterCm, scale.pixelsPerCm);
    if (!stats || !center || !scale.pixelsPerCm) return null;

    const dists = impacts.map((p) => pxToCm(distancePx(p, center), scale.pixelsPerCm!));
    const within50 = dists.filter((d) => d <= circle1.diameterCm / 2).length;
    const within100 = dists.filter((d) => d <= circle2.diameterCm / 2).length;

    return {
      nbImpacts: impacts.length,
      impacts50cm: within50,
      impacts100cm: within100,
      pct50cm: ((within50 / impacts.length) * 100).toFixed(0),
      pct100cm: ((within100 / impacts.length) * 100).toFixed(0),
      dispMoy: stats.distances.mean,
      r90: stats.dispersion.r90,
      score: stats.score,
    };
  }, [analysisStore]);

  const handleSave = () => {
    const snap = form.snap || getSnapshot();
    const data = { ...form, snap };

    if (editId) {
      updateMunition(editId, data);
    } else {
      addMunition(data);
    }
    onClose();
  };

  const addTag = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !form.taillesDispo.includes(trimmed)) {
      setForm({ ...form, taillesDispo: [...form.taillesDispo, trimmed] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, taillesDispo: form.taillesDispo.filter((t) => t !== tag) });
  };

  const set = (key: keyof FormData, value: unknown) => {
    setForm({ ...form, [key]: value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editId ? 'Modifier la munition' : 'Nouvelle fiche munition'}</h2>
          <button className="btn btn-sm" onClick={onClose}><X size={14} /></button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
        }}>
          {(['cartouche', 'balistique', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? 'var(--accent2)' : 'var(--muted)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--accent2)' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {activeTab === 'cartouche' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Nom / Modèle" value={form.nom} onChange={(v) => set('nom', v)} />
              <Field label="Fabricant" value={form.fabricant} onChange={(v) => set('fabricant', v)} />
              <Field label="Distributeur" value={form.distributeur} onChange={(v) => set('distributeur', v)} />
              <SelectField label="Calibre" value={form.calibre} options={CALIBRES} onChange={(v) => set('calibre', v)} />
              <Field label="Prix (€)" value={String(form.prix)} type="number" onChange={(v) => set('prix', Number(v))} />
              <Field label="Bourre" value={form.bourre} onChange={(v) => set('bourre', v)} />
              <Field label="Douille" value={form.douille} onChange={(v) => set('douille', v)} />
              <Field label="Poudre" value={form.poudre} onChange={(v) => set('poudre', v)} />

              {/* Tag input for sizes */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Tailles disponibles</label>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 4,
                  padding: 6,
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  minHeight: 36,
                }}>
                  {form.taillesDispo.map((tag) => (
                    <span key={tag} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 8px',
                      background: 'var(--surface2)',
                      borderRadius: 4,
                      fontSize: 12,
                    }}>
                      {tag}
                      <X size={10} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        addTag(tagInput);
                      } else if (e.key === 'Backspace' && !tagInput && form.taillesDispo.length) {
                        removeTag(form.taillesDispo[form.taillesDispo.length - 1]);
                      }
                    }}
                    onBlur={() => tagInput && addTag(tagInput)}
                    placeholder="Ajouter..."
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text)',
                      outline: 'none',
                      fontSize: 12,
                      flex: 1,
                      minWidth: 60,
                    }}
                  />
                </div>
              </div>

              <Field label="Taille testée" value={form.tailleTestee} onChange={(v) => set('tailleTestee', v)} />
            </div>
          )}

          {activeTab === 'balistique' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Vitesse officielle (m/s)" value={String(form.vitesseOfficielle)} type="number" onChange={(v) => set('vitesseOfficielle', Number(v))} />
              <Field label="Vitesse mesurée à 2.5m (m/s)" value={String(form.vitesseMesuree)} type="number" onChange={(v) => set('vitesseMesuree', Number(v))} />
              <SelectField label="Distance de test" value={form.distance} options={DISTANCES} onChange={(v) => set('distance', v)} />
              <SelectField label="Choke" value={form.choke} options={CHOKES} onChange={(v) => set('choke', v)} />
              <Field label="Fusil" value={form.fusil} onChange={(v) => set('fusil', v)} />
              <Field label="Pénétration gel balistique à 45m (cm)" value={String(form.penetration)} type="number" onChange={(v) => set('penetration', Number(v))} />

              {/* Snapshot preview */}
              {form.snap && (
                <div style={{
                  gridColumn: '1 / -1',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                }}>
                  <div className="label" style={{ marginBottom: 8 }}>Snapshot analyse</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, fontSize: 11 }}>
                    <div><span style={{ color: 'var(--muted)' }}>Impacts:</span> {form.snap.nbImpacts}</div>
                    <div><span style={{ color: 'var(--muted)' }}>Score:</span> {form.snap.score}</div>
                    <div><span style={{ color: 'var(--muted)' }}>R90:</span> {form.snap.r90.toFixed(1)}cm</div>
                    <div><span style={{ color: 'var(--muted)' }}>%50cm:</span> {form.snap.pct50cm}%</div>
                  </div>
                </div>
              )}

              {!form.snap && analysisStore.impacts.length > 0 && (
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    const snap = getSnapshot();
                    if (snap) setForm({ ...form, snap });
                  }}
                  style={{ gridColumn: '1 / -1' }}
                >
                  <Plus size={12} /> Capturer l'analyse en cours
                </button>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <textarea
              className="input"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={10}
              placeholder="Notes, observations, conditions de tir..."
              style={{ resize: 'vertical' }}
            />
          )}
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {editId ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
