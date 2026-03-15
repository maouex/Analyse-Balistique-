import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Edit3, GitCompare, CheckSquare, Square, Play, Database } from 'lucide-react';
import { useMunitionsStore } from '../stores/munitionsStore';
import { useAnalysisStore } from '../stores/analysisStore';
import { MunitionForm } from '../components/munitions/MunitionForm';
import { ComparisonView } from '../components/munitions/ComparisonView';
import type { Munition } from '../types';

export function LibraryPage() {
  const store = useMunitionsStore();
  const loadProject = useAnalysisStore((s) => s.loadProject);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    store.load();
  }, []);

  const filtered = store.filtered();

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
  };

  const handleResume = async (m: Munition) => {
    if (!m.savedAnalysis) return;
    await loadProject(m.savedAnalysis);
    navigate('/analyse');
  };

  if (store.showComparison) {
    return <ComparisonView onBack={() => store.setShowComparison(false)} />;
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      gap: 18,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--blue-glow)',
            border: '1px solid rgba(96,165,250,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Database size={18} color="var(--blue)" />
          </div>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.3px' }}>Bibliothèque</h2>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {store.munitions.length} munition{store.munitions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {store.selectedIds.size >= 2 && (
            <button className="btn btn-sm btn-primary" onClick={() => store.setShowComparison(true)}>
              <GitCompare size={13} /> Comparer ({store.selectedIds.size})
            </button>
          )}
          {store.selectedIds.size > 0 && (
            <button className="btn btn-sm" onClick={() => store.clearSelection()}>
              Désélectionner
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 440 }}>
        <Search size={14} color="var(--muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
        <input
          className="input"
          placeholder="Rechercher par nom, fabricant, calibre..."
          value={store.searchQuery}
          onChange={(e) => store.setSearchQuery(e.target.value)}
          style={{ paddingLeft: 36 }}
        />
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: 'var(--muted)',
          fontSize: 14,
          background: 'var(--surface2)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border)',
        }}>
          {store.munitions.length === 0
            ? 'Aucune munition enregistrée. Lancez une analyse pour en ajouter.'
            : 'Aucun résultat trouvé.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 14,
        }}>
          {filtered.map((m) => (
            <MunitionCard
              key={m.id}
              munition={m}
              selected={store.selectedIds.has(m.id)}
              onToggle={() => store.toggleSelect(m.id)}
              onEdit={() => handleEdit(m.id)}
              onDelete={() => {
                if (confirm(`Supprimer "${m.nom}" ?`)) store.removeMunition(m.id);
              }}
              onResume={() => handleResume(m)}
            />
          ))}
        </div>
      )}

      {showForm && <MunitionForm onClose={handleCloseForm} editId={editId} />}
    </div>
  );
}

function MunitionCard({ munition: m, selected, onToggle, onEdit, onDelete, onResume }: {
  munition: Munition;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResume: () => void;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: 18,
        borderColor: selected ? 'var(--accent)' : undefined,
        boxShadow: selected ? '0 0 20px var(--accent-glow)' : undefined,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.2px' }}>{m.nom || 'Sans nom'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
            {m.fabricant} — {m.calibre}
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            transition: 'transform var(--transition-fast)',
          }}
        >
          {selected
            ? <CheckSquare size={20} color="var(--accent2)" />
            : <Square size={20} color="var(--muted)" />
          }
        </button>
      </div>

      {/* Stats */}
      {m.snap && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 12,
        }}>
          <MiniStat
            label="Score"
            value={String(m.snap.score)}
            color={m.snap.score >= 60 ? 'var(--green)' : 'var(--amber)'}
            glow={m.snap.score >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)'}
          />
          <MiniStat label="Impacts" value={String(m.snap.nbImpacts)} />
          <MiniStat label="R90" value={`${m.snap.r90.toFixed(1)}`} unit="cm" />
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--muted)', marginBottom: 12, flexWrap: 'wrap' }}>
        {m.distance && <Tag>{m.distance}</Tag>}
        {m.choke && <Tag>{m.choke}</Tag>}
        {m.tailleTestee && <Tag>N{'\u00B0'}{m.tailleTestee}</Tag>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button
          className={`btn btn-sm ${m.savedAnalysis ? 'btn-primary' : ''}`}
          onClick={onResume}
          disabled={!m.savedAnalysis}
          style={{
            width: '100%',
            justifyContent: 'center',
            opacity: m.savedAnalysis ? 1 : 0.35,
            cursor: m.savedAnalysis ? 'pointer' : 'not-allowed',
          }}
          title={m.savedAnalysis ? 'Reprendre cette analyse' : 'Aucune analyse sauvegardée'}
        >
          <Play size={12} /> {m.savedAnalysis ? "Reprendre l'analyse" : "Pas d'analyse liée"}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" onClick={onEdit} style={{ flex: 1, justifyContent: 'center' }}>
            <Edit3 size={12} /> Modifier
          </button>
          <button className="btn btn-sm btn-danger" onClick={onDelete}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, color, glow }: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  glow?: string;
}) {
  return (
    <div className="stat-card" style={{ textAlign: 'center', background: glow || undefined }}>
      <div style={{
        fontSize: 16,
        fontWeight: 800,
        color: color || 'var(--text)',
        letterSpacing: '-0.3px',
      }}>
        {value}
        {unit && <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginLeft: 1 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginTop: 1 }}>{label}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '3px 9px',
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 500,
    }}>
      {children}
    </span>
  );
}
