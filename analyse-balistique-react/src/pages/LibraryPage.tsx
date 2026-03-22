import { useEffect, useState } from 'react';
import { useTransitionNavigate } from '../components/transitions/TransitionContext';
import {
  Search, Trash2, Edit3, GitCompare, CheckSquare, Square, Play, Database,
  Plus, X, Crosshair, Box, ArrowUpDown, ArrowUp, ArrowDown, LayoutGrid,
  List, Filter, ChevronDown, ChevronRight, RotateCcw,
} from 'lucide-react';
import { useMunitionsStore, SORT_OPTIONS, GROUP_OPTIONS } from '../stores/munitionsStore';
import type { SortField, GroupField, MunitionsState } from '../stores/munitionsStore';
import { useAnalysisStore } from '../stores/analysisStore';
import { MunitionForm } from '../components/munitions/MunitionForm';
import { ComparisonView } from '../components/munitions/ComparisonView';
import type { Munition } from '../types';

export function LibraryPage() {
  const store = useMunitionsStore();
  const loadProject = useAnalysisStore((s) => s.loadProject);
  const navigate = useTransitionNavigate();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  useEffect(() => { store.load(); }, []);

  const grouped = store.grouped();
  const filtered = store.filtered();
  const activeFilters = store.activeFilterCount();

  const handleEdit = (id: string) => { setEditId(id); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditId(null); };

  const handleResume = async (m: Munition) => {
    if (!m.savedAnalysis) return;
    await loadProject(m.savedAnalysis);
    navigate('/analyse');
  };

  const handleView3D = async (m: Munition) => {
    if (!m.savedAnalysis) return;
    await loadProject(m.savedAnalysis);
    navigate('/3d');
  };

  const toggleGroupCollapse = (key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  // Comparison overlay
  if (store.showComparison) {
    return (
      <div style={{ height: '100%', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg)', opacity: 0.5, zIndex: 1 }} />
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2, overflowY: 'auto', background: 'var(--bg)',
          animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <ComparisonView onBack={() => store.setShowComparison(false)} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ─── Header ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: 'rgba(68,170,255,0.08)',
            border: '1px solid rgba(68,170,255,0.2)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Database size={14} color="#44aaff" />
          </div>
          <div>
            <h2 style={{
              fontSize: 13, fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
              color: 'var(--accent2)', fontFamily: 'var(--font-mono)',
              textShadow: '0 0 10px var(--accent-glow)', margin: 0,
            }}>Bibliothèque</h2>
            <span style={{
              fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
            }}>
              {filtered.length}/{store.munitions.length} munition{store.munitions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={() => navigate('/analyse')} style={{ gap: 5 }}>
            <Plus size={12} /> Nouvelle analyse
          </button>
          {store.selectedIds.size >= 2 && (
            <button className="btn btn-sm btn-primary" onClick={() => store.setShowComparison(true)}>
              <GitCompare size={12} /> Comparer ({store.selectedIds.size})
            </button>
          )}
          {store.selectedIds.size > 0 && (
            <button className="btn btn-sm" onClick={() => store.clearSelection()} style={{ gap: 4 }}>
              <X size={11} /> Désélectionner
            </button>
          )}
        </div>
      </div>

      {/* ─── Toolbar: Search + Sort + Group + Filter + View ─── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px',
        borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
          <Search size={13} color="var(--muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input"
            placeholder="Rechercher..."
            value={store.searchQuery}
            onChange={(e) => store.setSearchQuery(e.target.value)}
            style={{ paddingLeft: 30, height: 30, fontSize: 11 }}
          />
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* Sort */}
        <SortDropdown
          current={store.sortField}
          dir={store.sortDir}
          onSelect={(f) => store.setSort(f)}
        />

        {/* Group */}
        <GroupDropdown
          current={store.groupField}
          onSelect={(f) => store.setGroupField(f)}
        />

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        {/* Filter toggle */}
        <button
          onClick={() => store.setShowFilters(!store.showFilters)}
          style={{
            ...toolbarBtnStyle,
            borderColor: activeFilters > 0 ? 'var(--accent2)' : 'var(--border)',
            color: activeFilters > 0 ? 'var(--accent2)' : 'var(--muted)',
            background: activeFilters > 0 ? 'var(--accent-glow)' : 'transparent',
          }}
        >
          <Filter size={12} />
          <span>Filtres</span>
          {activeFilters > 0 && (
            <span style={{
              background: 'var(--accent2)', color: 'var(--bg)', fontSize: 8,
              fontWeight: 800, borderRadius: '50%', width: 14, height: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFilters}
            </span>
          )}
        </button>

        {activeFilters > 0 && (
          <button onClick={() => store.resetFilters()} style={{ ...toolbarBtnStyle, color: 'var(--red)', borderColor: 'rgba(255,68,68,0.2)' }}>
            <RotateCcw size={11} /> <span>Reset</span>
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid var(--border)' }}>
          <button
            onClick={() => store.setViewMode('grid')}
            style={{
              ...viewBtnStyle,
              background: store.viewMode === 'grid' ? 'var(--accent-glow)' : 'transparent',
              color: store.viewMode === 'grid' ? 'var(--accent2)' : 'var(--muted)',
            }}
            title="Grille"
          >
            <LayoutGrid size={13} />
          </button>
          <button
            onClick={() => store.setViewMode('table')}
            style={{
              ...viewBtnStyle,
              background: store.viewMode === 'table' ? 'var(--accent-glow)' : 'transparent',
              color: store.viewMode === 'table' ? 'var(--accent2)' : 'var(--muted)',
              borderLeft: '1px solid var(--border)',
            }}
            title="Tableau"
          >
            <List size={13} />
          </button>
        </div>
      </div>

      {/* ─── Filter panel ─── */}
      {store.showFilters && (
        <FilterPanel />
      )}

      {/* ─── Selection hint ─── */}
      {store.munitions.length >= 2 && store.selectedIds.size < 2 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 18px',
          background: 'rgba(68,170,255,0.04)', borderBottom: '1px solid var(--border)',
          fontSize: 10, color: '#44aaff', fontWeight: 600, fontFamily: 'var(--font-mono)',
          letterSpacing: '0.5px', flexShrink: 0,
        }}>
          <GitCompare size={11} />
          Sélectionnez 2 à 4 munitions pour les comparer
          {store.selectedIds.size === 1 && ' — encore 1 minimum'}
        </div>
      )}

      {/* ─── Content ─── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
        {filtered.length === 0 ? (
          <EmptyState hasData={store.munitions.length > 0} onNavigate={() => navigate('/analyse')} />
        ) : store.viewMode === 'table' ? (
          <TableView
            groups={grouped}
            store={store}
            onEdit={handleEdit}
            onResume={handleResume}
            onView3D={handleView3D}
            collapsedGroups={collapsedGroups}
            onToggleGroup={toggleGroupCollapse}
          />
        ) : (
          <GridView
            groups={grouped}
            store={store}
            onEdit={handleEdit}
            onResume={handleResume}
            onView3D={handleView3D}
            collapsedGroups={collapsedGroups}
            onToggleGroup={toggleGroupCollapse}
          />
        )}
      </div>

      {showForm && <MunitionForm onClose={handleCloseForm} editId={editId} />}
    </div>
  );
}

// ─── Sort dropdown ──────────────────────────────────────────

function SortDropdown({ current, dir, onSelect }: { current: SortField; dir: 'asc' | 'desc'; onSelect: (f: SortField) => void }) {
  const [open, setOpen] = useState(false);
  const currentLabel = SORT_OPTIONS.find((o) => o.field === current)?.label ?? 'Tri';

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={toolbarBtnStyle}>
        <ArrowUpDown size={12} />
        <span>{currentLabel}</span>
        {dir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={dropdownStyle}>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.field}
                onClick={() => { onSelect(opt.field); setOpen(false); }}
                style={{
                  ...dropdownItemStyle,
                  color: current === opt.field ? 'var(--accent2)' : 'var(--text)',
                  background: current === opt.field ? 'var(--accent-glow)' : 'transparent',
                }}
              >
                {opt.label}
                {current === opt.field && (dir === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Group dropdown ─────────────────────────────────────────

function GroupDropdown({ current, onSelect }: { current: GroupField; onSelect: (f: GroupField) => void }) {
  const [open, setOpen] = useState(false);
  const currentLabel = GROUP_OPTIONS.find((o) => o.field === current)?.label ?? 'Grouper';

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={toolbarBtnStyle}>
        <LayoutGrid size={12} />
        <span>Grouper: {currentLabel}</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={dropdownStyle}>
            {GROUP_OPTIONS.map((opt) => (
              <button
                key={opt.field}
                onClick={() => { onSelect(opt.field); setOpen(false); }}
                style={{
                  ...dropdownItemStyle,
                  color: current === opt.field ? 'var(--accent2)' : 'var(--text)',
                  background: current === opt.field ? 'var(--accent-glow)' : 'transparent',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Filter Panel ───────────────────────────────────────────

function FilterPanel() {
  const store = useMunitionsStore();
  const { filters } = store;

  const fabricants = store.uniqueValues('fabricant');
  const calibres = store.uniqueValues('calibre');
  const distances = store.uniqueValues('distance');
  const chokes = store.uniqueValues('choke');

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)',
      flexShrink: 0, overflowX: 'auto', flexWrap: 'wrap',
    }}>
      {/* Fabricant chips */}
      {fabricants.length > 0 && (
        <FilterSection label="Fabricant">
          {fabricants.map((v) => (
            <FilterChip
              key={v}
              label={v}
              active={filters.fabricant.includes(v)}
              onClick={() => store.toggleFilterValue('fabricant', v)}
            />
          ))}
        </FilterSection>
      )}

      {/* Calibre chips */}
      {calibres.length > 0 && (
        <FilterSection label="Calibre">
          {calibres.map((v) => (
            <FilterChip
              key={v}
              label={v}
              active={filters.calibre.includes(v)}
              onClick={() => store.toggleFilterValue('calibre', v)}
            />
          ))}
        </FilterSection>
      )}

      {/* Distance chips */}
      {distances.length > 0 && (
        <FilterSection label="Distance">
          {distances.map((v) => (
            <FilterChip
              key={v}
              label={v}
              active={filters.distance.includes(v)}
              onClick={() => store.toggleFilterValue('distance', v)}
            />
          ))}
        </FilterSection>
      )}

      {/* Choke chips */}
      {chokes.length > 0 && (
        <FilterSection label="Choke">
          {chokes.map((v) => (
            <FilterChip
              key={v}
              label={v}
              active={filters.choke.includes(v)}
              onClick={() => store.toggleFilterValue('choke', v)}
            />
          ))}
        </FilterSection>
      )}

      {/* Analysis presence */}
      <FilterSection label="Analyse">
        {(['all', 'yes', 'no'] as const).map((v) => (
          <FilterChip
            key={v}
            label={v === 'all' ? 'Toutes' : v === 'yes' ? 'Avec' : 'Sans'}
            active={filters.hasAnalysis === v}
            onClick={() => store.setFilters({ hasAnalysis: v })}
          />
        ))}
      </FilterSection>

      {/* Score range */}
      <FilterSection label="Score min.">
        <input
          type="number"
          className="input"
          value={filters.scoreMin ?? ''}
          onChange={(e) => store.setFilters({ scoreMin: e.target.value ? Number(e.target.value) : null })}
          placeholder="0"
          min={0}
          max={100}
          style={{ width: 60, height: 24, fontSize: 10, padding: '0 6px', textAlign: 'center' }}
        />
      </FilterSection>
    </div>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{
        fontSize: 8, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
        color: 'var(--muted)', fontFamily: 'var(--font-mono)',
      }}>{label}</span>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '2px 8px',
        fontSize: 9,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.3px',
        border: active ? '1px solid var(--accent2)' : '1px solid var(--border)',
        background: active ? 'var(--accent-glow)' : 'transparent',
        color: active ? 'var(--accent2)' : 'var(--muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ─── Group header ───────────────────────────────────────────

function GroupHeader({ label, count, collapsed, onToggle }: {
  label: string; count: number; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '6px 0', marginBottom: 8, marginTop: 4, background: 'none', border: 'none',
        cursor: 'pointer', borderBottom: '1px solid var(--border)',
      }}
    >
      {collapsed ? <ChevronRight size={14} color="var(--accent2)" /> : <ChevronDown size={14} color="var(--accent2)" />}
      <span style={{
        fontSize: 12, fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase',
        color: 'var(--accent2)', fontFamily: 'var(--font-mono)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 9, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
        padding: '1px 6px', border: '1px solid var(--border)', background: 'var(--surface)',
      }}>
        {count}
      </span>
    </button>
  );
}

// ─── Grid View ──────────────────────────────────────────────

interface ViewProps {
  groups: { key: string; munitions: Munition[] }[];
  store: MunitionsState;
  onEdit: (id: string) => void;
  onResume: (m: Munition) => void;
  onView3D: (m: Munition) => void;
  collapsedGroups: Set<string>;
  onToggleGroup: (key: string) => void;
}

function GridView({ groups, store, onEdit, onResume, onView3D, collapsedGroups, onToggleGroup }: ViewProps) {
  const hasGroups = groups.length > 1 || groups[0]?.key !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {groups.map((group) => (
        <div key={group.key || '__all'}>
          {hasGroups && (
            <GroupHeader
              label={group.key}
              count={group.munitions.length}
              collapsed={collapsedGroups.has(group.key)}
              onToggle={() => onToggleGroup(group.key)}
            />
          )}
          {!collapsedGroups.has(group.key) && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: 10,
              marginBottom: hasGroups ? 16 : 0,
            }}>
              {group.munitions.map((m) => (
                <MunitionCard
                  key={m.id}
                  munition={m}
                  selected={store.selectedIds.has(m.id)}
                  onToggle={() => store.toggleSelect(m.id)}
                  onEdit={() => onEdit(m.id)}
                  onDelete={() => { if (confirm(`Supprimer "${m.nom}" ?`)) store.removeMunition(m.id); }}
                  onResume={() => onResume(m)}
                  onView3D={() => onView3D(m)}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Table View ─────────────────────────────────────────────

function TableView({ groups, store, onEdit, onResume, onView3D, collapsedGroups, onToggleGroup }: ViewProps) {
  const hasGroups = groups.length > 1 || groups[0]?.key !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {groups.map((group) => (
        <div key={group.key || '__all'}>
          {hasGroups && (
            <GroupHeader
              label={group.key}
              count={group.munitions.length}
              collapsed={collapsedGroups.has(group.key)}
              onToggle={() => onToggleGroup(group.key)}
            />
          )}
          {!collapsedGroups.has(group.key) && (
            <div style={{
              border: '1px solid var(--border)',
              marginBottom: hasGroups ? 16 : 0,
              overflow: 'hidden',
            }}>
              {/* Table header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 100px 70px 70px 70px 60px 80px',
                gap: 0,
                padding: '6px 10px',
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                fontFamily: 'var(--font-mono)',
              }}>
                <span />
                <span>Nom</span>
                <span>Fabricant</span>
                <span style={{ textAlign: 'center' }}>Calibre</span>
                <span style={{ textAlign: 'center' }}>Score</span>
                <span style={{ textAlign: 'center' }}>R90</span>
                <span style={{ textAlign: 'center' }}>Prix</span>
                <span style={{ textAlign: 'center' }}>Actions</span>
              </div>

              {/* Rows */}
              {group.munitions.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 100px 70px 70px 70px 60px 80px',
                    gap: 0,
                    padding: '7px 10px',
                    alignItems: 'center',
                    borderBottom: i < group.munitions.length - 1 ? '1px solid var(--border)' : 'none',
                    background: store.selectedIds.has(m.id) ? 'var(--accent-glow)' : 'transparent',
                    transition: 'background 0.15s',
                    fontSize: 11,
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => store.toggleSelect(m.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {store.selectedIds.has(m.id)
                      ? <CheckSquare size={14} color="var(--accent2)" />
                      : <Square size={14} color="var(--muted)" />
                    }
                  </button>

                  {/* Name */}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.nom || 'Sans nom'}
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 1 }}>
                      {m.distance && <MiniTag>{m.distance}</MiniTag>}
                      {m.choke && <MiniTag>{m.choke}</MiniTag>}
                    </div>
                  </div>

                  {/* Fabricant */}
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.fabricant}
                  </span>

                  {/* Calibre */}
                  <span style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {m.calibre}
                  </span>

                  {/* Score */}
                  <span style={{
                    textAlign: 'center', fontWeight: 800, fontFamily: 'var(--font-mono)',
                    color: m.snap ? (m.snap.score >= 60 ? 'var(--green)' : 'var(--amber)') : 'var(--muted)',
                  }}>
                    {m.snap ? m.snap.score : '—'}
                  </span>

                  {/* R90 */}
                  <span style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {m.snap ? `${m.snap.r90.toFixed(1)}` : '—'}
                  </span>

                  {/* Prix */}
                  <span style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {m.prix ? `${m.prix}€` : '—'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                    {m.savedAnalysis && (
                      <>
                        <MiniAction icon={<Play size={10} />} title="Reprendre" onClick={() => onResume(m)} color="var(--accent2)" />
                        <MiniAction icon={<Box size={10} />} title="3D" onClick={() => onView3D(m)} color="var(--purple)" />
                      </>
                    )}
                    <MiniAction icon={<Edit3 size={10} />} title="Modifier" onClick={() => onEdit(m.id)} />
                    <MiniAction
                      icon={<Trash2 size={10} />}
                      title="Supprimer"
                      onClick={() => { if (confirm(`Supprimer "${m.nom}" ?`)) store.removeMunition(m.id); }}
                      color="var(--red)"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MiniAction({ icon, title, onClick, color }: {
  icon: React.ReactNode; title: string; onClick: () => void; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 22, height: 22, border: '1px solid var(--border)', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color || 'var(--muted)', transition: 'all 0.15s',
      }}
    >
      {icon}
    </button>
  );
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '0 4px', fontSize: 7, fontWeight: 600, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.3px', border: '1px solid var(--border)', color: 'var(--muted)',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

// ─── Empty State ────────────────────────────────────────────

function EmptyState({ hasData, onNavigate }: { hasData: boolean; onNavigate: () => void }) {
  return (
    <div style={{
      textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 12,
      background: 'var(--surface2)', border: '1px dashed var(--border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      fontFamily: 'var(--font-mono)',
    }}>
      {!hasData ? (
        <>
          <Database size={32} color="var(--border-light)" />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Bibliothèque vide</div>
            <div style={{ fontSize: 12 }}>Lancez une analyse et sauvegardez-la pour la retrouver ici.</div>
          </div>
          <button className="btn btn-sm btn-primary" onClick={onNavigate} style={{ gap: 5 }}>
            <Crosshair size={12} /> Lancer une analyse
          </button>
        </>
      ) : (
        <>
          <Search size={28} color="var(--border-light)" />
          <div style={{ fontWeight: 700 }}>Aucun résultat</div>
          <div style={{ fontSize: 11 }}>Essayez de modifier vos filtres ou votre recherche.</div>
        </>
      )}
    </div>
  );
}

// ─── Card Component ─────────────────────────────────────────

function MunitionCard({ munition: m, selected, onToggle, onEdit, onDelete, onResume, onView3D }: {
  munition: Munition; selected: boolean; onToggle: () => void;
  onEdit: () => void; onDelete: () => void; onResume: () => void; onView3D: () => void;
}) {
  return (
    <div
      className="glass-card"
      style={{
        padding: 16, borderColor: selected ? 'var(--accent)' : undefined,
        boxShadow: selected ? '0 0 20px var(--accent-glow)' : undefined,
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{m.nom || 'Sans nom'}</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.3px' }}>
            {m.fabricant} — {m.calibre}
          </div>
        </div>
        <button
          onClick={onToggle}
          title="Sélectionner pour comparer"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, transition: 'transform var(--transition-fast)' }}
        >
          {selected ? <CheckSquare size={18} color="var(--accent2)" /> : <Square size={18} color="var(--muted)" />}
        </button>
      </div>

      {/* Stats */}
      {m.snap && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
          <MiniStat
            label="Score" value={String(m.snap.score)}
            color={m.snap.score >= 60 ? 'var(--green)' : 'var(--amber)'}
            glow={m.snap.score >= 60 ? 'var(--green-glow)' : 'var(--amber-glow)'}
          />
          <MiniStat label="Impacts" value={String(m.snap.nbImpacts)} />
          <MiniStat label="R90" value={`${m.snap.r90.toFixed(1)}`} unit="cm" />
        </div>
      )}

      {/* Tags */}
      <div style={{ display: 'flex', gap: 5, fontSize: 11, color: 'var(--muted)', marginBottom: 10, flexWrap: 'wrap' }}>
        {m.distance && <Tag>{m.distance}</Tag>}
        {m.choke && <Tag>{m.choke}</Tag>}
        {m.tailleTestee && <Tag>N°{m.tailleTestee}</Tag>}
        {m.prix > 0 && <Tag>{m.prix}€</Tag>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {m.savedAnalysis ? (
          <div style={{ display: 'flex', gap: 5 }}>
            <button className="btn btn-sm btn-primary" onClick={onResume} style={{ flex: 1, justifyContent: 'center' }}>
              <Play size={11} /> Reprendre
            </button>
            <button
              className="btn btn-sm" onClick={onView3D}
              style={{ justifyContent: 'center', background: 'var(--purple-glow)', borderColor: 'rgba(192,132,252,0.2)', color: 'var(--purple)', gap: 5 }}
              title="Voir en modélisation 3D"
            >
              <Box size={11} /> 3D
            </button>
          </div>
        ) : (
          <button className="btn btn-sm" disabled style={{ width: '100%', justifyContent: 'center', opacity: 0.35, cursor: 'not-allowed' }}>
            <Play size={11} /> Pas d'analyse liée
          </button>
        )}
        <div style={{ display: 'flex', gap: 5 }}>
          <button className="btn btn-sm" onClick={onEdit} style={{ flex: 1, justifyContent: 'center' }}>
            <Edit3 size={11} /> Modifier
          </button>
          <button className="btn btn-sm btn-danger" onClick={onDelete}>
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, color, glow }: {
  label: string; value: string; unit?: string; color?: string; glow?: string;
}) {
  return (
    <div className="stat-card" style={{ textAlign: 'center', background: glow || undefined }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: color || 'var(--text)', letterSpacing: '-0.3px' }}>
        {value}
        {unit && <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginLeft: 1 }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 1 }}>{label}</div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      padding: '2px 7px', background: 'var(--surface2)', border: '1px solid var(--border)',
      fontSize: 8, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.5px',
      textTransform: 'uppercase',
    }}>
      {children}
    </span>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const toolbarBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
  border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
  fontSize: 10, fontWeight: 700, color: 'var(--muted)', fontFamily: 'var(--font-mono)',
  letterSpacing: '0.3px', transition: 'all 0.15s', whiteSpace: 'nowrap',
};

const viewBtnStyle: React.CSSProperties = {
  width: 30, height: 28, border: 'none', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute', top: '100%', left: 0, marginTop: 4, zIndex: 100,
  background: 'var(--bg)', border: '1px solid var(--border)', minWidth: 140,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  width: '100%', padding: '6px 12px', border: 'none', cursor: 'pointer',
  fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', transition: 'all 0.1s',
};
