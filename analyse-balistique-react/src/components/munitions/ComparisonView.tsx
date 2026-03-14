import { Component, useState, Fragment } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ArrowLeft, Table2, Layers, ArrowUpDown, Activity } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { getScoreColor } from '../../lib/ballistics';
import { RadarChart } from './RadarChart';
import { ImpactOverlay } from './ImpactOverlay';
import type { Munition } from '../../types';

type Tab = 'table' | 'radar' | 'overlay';
type SortKey = 'score' | 'nbImpacts' | 'pct50' | 'pct100' | 'r90' | 'dispMoy' | 'prix';
type SortDir = 'asc' | 'desc';
type FilterSection = 'all' | 'identification' | 'cartouche' | 'gerbe' | 'terrain';

interface ComparisonViewProps {
  onBack: () => void;
}

// ─── Error Boundary ──────────────────────────────────────────

class ComparisonErrorBoundary extends Component<
  { children: ReactNode; onBack: () => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ComparisonView error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24 }}>
          <button className="btn btn-sm" onClick={this.props.onBack}>
            <ArrowLeft size={14} /> Retour
          </button>
          <div style={{ marginTop: 20, padding: 16, background: 'rgba(224,82,82,0.1)', borderRadius: 8, border: '1px solid var(--red)' }}>
            <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>Erreur d&apos;affichage</div>
            <pre style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{this.state.error.message}{'\n'}{this.state.error.stack}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ComparisonView({ onBack }: ComparisonViewProps) {
  return (
    <ComparisonErrorBoundary onBack={onBack}>
      <ComparisonViewInner onBack={onBack} />
    </ComparisonErrorBoundary>
  );
}

// ─── Sort Config ─────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string; getValue: (m: Munition) => number; defaultDir: SortDir }[] = [
  { key: 'score', label: 'Score', getValue: (m) => Number(m.snap?.score) || -1, defaultDir: 'desc' },
  { key: 'nbImpacts', label: 'Impacts', getValue: (m) => Number(m.snap?.nbImpacts) || -1, defaultDir: 'desc' },
  { key: 'pct50', label: '%50cm', getValue: (m) => parseFloat(String(m.snap?.pct50cm ?? '-1')), defaultDir: 'desc' },
  { key: 'pct100', label: '%100cm', getValue: (m) => parseFloat(String(m.snap?.pct100cm ?? '-1')), defaultDir: 'desc' },
  { key: 'r90', label: 'R90', getValue: (m) => Number(m.snap?.r90) || 999, defaultDir: 'asc' },
  { key: 'dispMoy', label: 'Disp.', getValue: (m) => Number(m.snap?.dispMoy) || 999, defaultDir: 'asc' },
  { key: 'prix', label: 'Prix', getValue: (m) => Number(m.prix) || 999, defaultDir: 'asc' },
];

const FILTER_SECTIONS: { key: FilterSection; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'identification', label: 'Identification' },
  { key: 'cartouche', label: 'Cartouche' },
  { key: 'gerbe', label: 'Gerbe' },
  { key: 'terrain', label: 'Terrain' },
];

// ─── Safe string renderer ────────────────────────────────────

function safeStr(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

// ─── Main Inner Component ────────────────────────────────────

function ComparisonViewInner({ onBack }: ComparisonViewProps) {
  const selected = useMunitionsStore((s) => s.selectedMunitions());
  const [tab, setTab] = useState<Tab>('table');
  const [activeSortKey, setActiveSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterSection, setFilterSection] = useState<FilterSection>('all');

  if (selected.length < 2) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-sm" onClick={onBack}><ArrowLeft size={14} /> Retour</button>
        <p style={{ marginTop: 20, color: 'var(--muted)' }}>Sélectionnez au moins 2 munitions.</p>
      </div>
    );
  }

  // Sort munitions
  const sorted = [...selected];
  if (activeSortKey) {
    const opt = SORT_OPTIONS.find((o) => o.key === activeSortKey);
    if (opt) {
      sorted.sort((a, b) => {
        const va = opt.getValue(a);
        const vb = opt.getValue(b);
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
  }

  const handleSort = (key: SortKey) => {
    if (activeSortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      const opt = SORT_OPTIONS.find((o) => o.key === key);
      setActiveSortKey(key);
      setSortDir(opt?.defaultDir ?? 'desc');
    }
  };

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Retour
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          {'Comparaison (' + selected.length + ' munitions)'}
        </h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        <TabBtn active={tab === 'table'} onClick={() => setTab('table')} icon={<Table2 size={13} />} label="Tableau" />
        <TabBtn active={tab === 'radar'} onClick={() => setTab('radar')} icon={<Activity size={13} />} label="Radar" />
        <TabBtn active={tab === 'overlay'} onClick={() => setTab('overlay')} icon={<Layers size={13} />} label="Superposition" />
      </div>

      {/* Tab content */}
      {tab === 'table' && (
        <TableView
          munitions={sorted}
          activeSortKey={activeSortKey}
          sortDir={sortDir}
          onSort={handleSort}
          filterSection={filterSection}
          onFilterSection={setFilterSection}
        />
      )}

      {tab === 'radar' && <RadarChart munitions={selected} />}

      {tab === 'overlay' && <ImpactOverlay munitions={selected} />}
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────

function TabBtn({ active, onClick, icon, label }: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <button
      className="btn btn-sm"
      onClick={onClick}
      style={{
        borderRadius: '6px 6px 0 0',
        borderBottom: active ? '2px solid var(--accent2)' : '2px solid transparent',
        background: active ? 'var(--surface2)' : 'transparent',
        color: active ? 'var(--accent2)' : 'var(--muted)',
        fontWeight: active ? 700 : 500,
      }}
    >
      {icon}
      {' '}
      {label}
    </button>
  );
}

// ─── Table View ──────────────────────────────────────────────

interface RowDef {
  label: string;
  getValue: (m: Munition) => string;
  higherIsBetter?: boolean;
}

function getTableSections(): { key: FilterSection; title: string; rows: RowDef[] }[] {
  return [
    {
      key: 'identification',
      title: 'Identification',
      rows: [
        { label: 'Nom', getValue: (m) => safeStr(m.nom) },
        { label: 'Fabricant', getValue: (m) => safeStr(m.fabricant) },
        { label: 'Calibre', getValue: (m) => safeStr(m.calibre) },
        { label: 'Prix', getValue: (m) => m.prix ? m.prix + '\u20AC' : '—' },
      ],
    },
    {
      key: 'cartouche',
      title: 'Cartouche',
      rows: [
        { label: 'Taille testée', getValue: (m) => safeStr(m.tailleTestee) },
        { label: 'Bourre', getValue: (m) => safeStr(m.bourre) },
        { label: 'Douille', getValue: (m) => safeStr(m.douille) },
        { label: 'Poudre', getValue: (m) => safeStr(m.poudre) },
      ],
    },
    {
      key: 'gerbe',
      title: 'Gerbe',
      rows: [
        { label: 'Score', getValue: (m) => m.snap ? String(m.snap.score ?? '—') : '—', higherIsBetter: true },
        { label: 'Impacts', getValue: (m) => m.snap ? String(m.snap.nbImpacts ?? '—') : '—', higherIsBetter: true },
        { label: 'Dans \u221250cm', getValue: (m) => m.snap?.pct50cm != null ? m.snap.pct50cm + '%' : '—', higherIsBetter: true },
        { label: 'Dans \u2212100cm', getValue: (m) => m.snap?.pct100cm != null ? m.snap.pct100cm + '%' : '—', higherIsBetter: true },
        { label: 'R90', getValue: (m) => m.snap?.r90 != null ? Number(m.snap.r90).toFixed(1) + 'cm' : '—', higherIsBetter: false },
        { label: 'Disp. moyenne', getValue: (m) => m.snap?.dispMoy != null ? Number(m.snap.dispMoy).toFixed(1) + 'cm' : '—', higherIsBetter: false },
      ],
    },
    {
      key: 'terrain',
      title: 'Terrain',
      rows: [
        { label: 'Distance', getValue: (m) => safeStr(m.distance) },
        { label: 'Choke', getValue: (m) => safeStr(m.choke) },
        { label: 'Fusil', getValue: (m) => safeStr(m.fusil) },
        { label: 'V. officielle', getValue: (m) => m.vitesseOfficielle ? m.vitesseOfficielle + ' m/s' : '—' },
        { label: 'V. mesurée', getValue: (m) => m.vitesseMesuree ? m.vitesseMesuree + ' m/s' : '—' },
        { label: 'Pénétration', getValue: (m) => m.penetration ? m.penetration + ' cm' : '—' },
      ],
    },
  ];
}

function TableView({ munitions, activeSortKey, sortDir, onSort, filterSection, onFilterSection }: {
  munitions: Munition[];
  activeSortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  filterSection: FilterSection;
  onFilterSection: (f: FilterSection) => void;
}) {
  const allSections = getTableSections();
  const visibleSections = filterSection === 'all'
    ? allSections
    : allSections.filter((s) => s.key === filterSection);

  return (
    <Fragment>
      {/* Controls bar */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Section filter */}
        <div style={{ display: 'flex', gap: 3 }}>
          {FILTER_SECTIONS.map((f) => (
            <button
              key={f.key}
              className="btn btn-sm"
              onClick={() => onFilterSection(f.key)}
              style={{
                fontSize: 10,
                padding: '3px 8px',
                background: filterSection === f.key ? 'var(--accent-glow)' : undefined,
                color: filterSection === f.key ? 'var(--accent2)' : 'var(--muted)',
                borderColor: filterSection === f.key ? 'var(--accent)' : undefined,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        {/* Sort buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ArrowUpDown size={11} color="var(--muted)" />
          <span style={{ fontSize: 10, color: 'var(--muted)', marginRight: 2 }}>{'Tri :'}</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className="btn btn-sm"
              onClick={() => onSort(opt.key)}
              style={{
                fontSize: 10,
                padding: '3px 7px',
                background: activeSortKey === opt.key ? 'var(--accent-glow)' : undefined,
                color: activeSortKey === opt.key ? 'var(--accent2)' : 'var(--muted)',
                borderColor: activeSortKey === opt.key ? 'var(--accent)' : undefined,
              }}
            >
              {opt.label}
              {activeSortKey === opt.key ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle}>{'Critère'}</th>
              {munitions.map((m) => (
                <th key={m.id} style={{ ...thStyle, minWidth: 140 }}>
                  <div style={{ fontWeight: 700 }}>{safeStr(m.nom) || 'Sans nom'}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>{safeStr(m.calibre)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleSections.map((section) => (
              <Fragment key={section.key}>
                <tr>
                  <td colSpan={munitions.length + 1} style={{
                    padding: '12px 10px 6px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: 'var(--accent2)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {section.title}
                  </td>
                </tr>
                {section.rows.map((row) => {
                  const values = munitions.map((m) => row.getValue(m));
                  const numericValues = values
                    .map((v) => parseFloat(v))
                    .filter((v) => !isNaN(v));

                  let bestIdx = -1;
                  if (numericValues.length >= 2 && row.higherIsBetter !== undefined) {
                    const best = row.higherIsBetter
                      ? Math.max(...numericValues)
                      : Math.min(...numericValues);
                    bestIdx = numericValues.indexOf(best);
                  }

                  return (
                    <tr key={row.label}>
                      <td style={{ ...tdStyle, color: 'var(--muted)', fontWeight: 500 }}>{row.label}</td>
                      {values.map((val, i) => (
                        <td key={i} style={{
                          ...tdStyle,
                          fontWeight: i === bestIdx ? 700 : 400,
                          color: i === bestIdx ? 'var(--green)' : 'var(--text)',
                        }}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Score visual comparison */}
      {munitions.some((m) => m.snap && m.snap.score != null) && (
        <div style={{ marginTop: 8 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: 10,
          }}>
            {'Comparaison des scores'}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            {munitions.map((m) => {
              const score = Number(m.snap?.score) || 0;
              return (
                <div key={m.id} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: Math.max(20, score * 1.5),
                    background: getScoreColor(score),
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s ease',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: 6,
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#fff',
                  }}>
                    {score}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'var(--muted)',
                    marginTop: 6,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {safeStr(m.nom) || 'Sans nom'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Fragment>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left',
  borderBottom: '2px solid var(--border)',
  background: 'var(--surface)',
  position: 'sticky',
  top: 0,
};

const tdStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderBottom: '1px solid var(--border)',
};
