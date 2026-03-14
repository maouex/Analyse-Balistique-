import { useEffect, useState } from 'react';
import { Search, Trash2, Edit3, GitCompare, CheckSquare, Square } from 'lucide-react';
import { useMunitionsStore } from '../stores/munitionsStore';
import { MunitionForm } from '../components/munitions/MunitionForm';
import { ComparisonView } from '../components/munitions/ComparisonView';
import type { Munition } from '../types';

export function LibraryPage() {
  const store = useMunitionsStore();
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

  if (store.showComparison) {
    return <ComparisonView onBack={() => store.setShowComparison(false)} />;
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      gap: 16,
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Bibliothèque de munitions</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {store.selectedIds.size >= 2 && (
            <button className="btn btn-sm btn-primary" onClick={() => store.setShowComparison(true)}>
              <GitCompare size={13} /> Comparer ({store.selectedIds.size})
            </button>
          )}
          <button className="btn btn-sm" onClick={() => store.clearSelection()}>
            Désélectionner
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400 }}>
        <Search size={14} color="var(--muted)" style={{ position: 'absolute', left: 12, top: 10 }} />
        <input
          className="input"
          placeholder="Rechercher par nom, fabricant, calibre..."
          value={store.searchQuery}
          onChange={(e) => store.setSearchQuery(e.target.value)}
          style={{ paddingLeft: 32 }}
        />
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          color: 'var(--muted)',
          fontSize: 14,
        }}>
          {store.munitions.length === 0
            ? 'Aucune munition enregistrée. Lancez une analyse pour en ajouter.'
            : 'Aucun résultat trouvé.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320, 1fr))',
          gap: 12,
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
            />
          ))}
        </div>
      )}

      {showForm && <MunitionForm onClose={handleCloseForm} editId={editId} />}
    </div>
  );
}

function MunitionCard({ munition: m, selected, onToggle, onEdit, onDelete }: {
  munition: Munition;
  selected: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: 16,
      transition: 'border-color 0.15s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{m.nom || 'Sans nom'}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{m.fabricant} — {m.calibre}</div>
        </div>
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          {selected
            ? <CheckSquare size={18} color="var(--accent2)" />
            : <Square size={18} color="var(--muted)" />
          }
        </button>
      </div>

      {/* Stats */}
      {m.snap && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 10,
          padding: 10,
          background: 'var(--bg)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <MiniStat label="Score" value={String(m.snap.score)} color={m.snap.score >= 60 ? 'var(--green)' : 'var(--amber)'} />
          <MiniStat label="Impacts" value={String(m.snap.nbImpacts)} />
          <MiniStat label="R90" value={`${m.snap.r90.toFixed(1)}cm`} />
        </div>
      )}

      {/* Info */}
      <div style={{ display: 'flex', gap: 6, fontSize: 11, color: 'var(--muted)', marginBottom: 10, flexWrap: 'wrap' }}>
        {m.distance && <Tag>{m.distance}</Tag>}
        {m.choke && <Tag>{m.choke}</Tag>}
        {m.tailleTestee && <Tag>N°{m.tailleTestee}</Tag>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-sm" onClick={onEdit} style={{ flex: 1 }}>
          <Edit3 size={12} /> Modifier
        </button>
        <button className="btn btn-sm btn-danger" onClick={onDelete}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '2px 7px',
      background: 'var(--surface2)',
      borderRadius: 4,
      fontSize: 11,
    }}>
      {children}
    </span>
  );
}
