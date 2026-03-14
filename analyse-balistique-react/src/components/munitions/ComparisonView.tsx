import { useState } from 'react';
import { ArrowLeft, Table2, Radar, Layers, ArrowUpDown } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { getScoreColor } from '../../lib/ballistics';
import { RadarChart } from './RadarChart';
import { ImpactOverlay } from './ImpactOverlay';
import type { Munition } from '../../types';

type Tab = 'table' | 'radar' | 'overlay';
type SortKey = null | 'score' | 'nbImpacts' | 'pct50' | 'pct100' | 'r90' | 'dispMoy' | 'prix';
type SortDir = 'asc' | 'desc';
type FilterSection = 'all' | 'identification' | 'cartouche' | 'gerbe' | 'terrain';

interface ComparisonViewProps {
  onBack: () => void;
}

const SORT_OPTIONS: { key: SortKey; label: string; getValue: (m: Munition) => number; defaultDir: SortDir }[] = [
  { key: 'score', label: 'Score', getValue: (m) => m.snap?.score ?? -1, defaultDir: 'desc' },
  { key: 'nbImpacts', label: 'Impacts', getValue: (m) => m.snap?.nbImpacts ?? -1, defaultDir: 'desc' },
  { key: 'pct50', label: '%∅50cm', getValue: (m) => parseFloat(m.snap?.pct50cm ?? '-1'), defaultDir: 'desc' },
  { key: 'pct100', label: '%∅100cm', getValue: (m) => parseFloat(m.snap?.pct100cm ?? '-1'), defaultDir: 'desc' },
  { key: 'r90', label: 'R90', getValue: (m) => m.snap?.r90 ?? 999, defaultDir: 'asc' },
  { key: 'dispMoy', label: 'Disp. moy.', getValue: (m) => m.snap?.dispMoy ?? 999, defaultDir: 'asc' },
  { key: 'prix', label: 'Prix', getValue: (m) => m.prix || 999, defaultDir: 'asc' },
];

const FILTER_SECTIONS: { key: FilterSection; label: string }[] = [
  { key: 'all', label: 'Tout' },
  { key: 'identification', label: 'Identification' },
  { key: 'cartouche', label: 'Cartouche' },
  { key: 'gerbe', label: 'Gerbe' },
  { key: 'terrain', label: 'Terrain' },
];

export function ComparisonView({ onBack }: ComparisonViewProps) {
  const selected = useMunitionsStore((s) => s.selectedMunitions());
  const [tab, setTab] = useState<Tab>('table');
  const [sortKey, setSortKey] = useState<SortKey>(null);
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
  if (sortKey) {
    const opt = SORT_OPTIONS.find((o) => o.key === sortKey);
    if (opt) {
      sorted.sort((a, b) => {
        const va = opt.getValue(a);
        const vb = opt.getValue(b);
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      const opt = SORT_OPTIONS.find((o) => o.key === key);
      setSortKey(key);
      setSortDir(opt?.defaultDir ?? 'desc');
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'table', label: 'Tableau', icon: <Table2 size={13} /> },
    { key: 'radar', label: 'Radar', icon: <Radar size={13} /> },
    { key: 'overlay', label: 'Superposition', icon: <Layers size={13} /> },
  ];

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
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Comparaison ({selected.length} munitions)</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            className="btn btn-sm"
            onClick={() => setTab(t.key)}
            style={{
              borderRadius: '6px 6px 0 0',
              borderBottom: tab === t.key ? '2px solid var(--accent2)' : '2px solid transparent',
              background: tab === t.key ? 'var(--surface2)' : 'transparent',
              color: tab === t.key ? 'var(--accent2)' : 'var(--muted)',
              fontWeight: tab === t.key ? 700 : 500,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'table' && (
        <TableTab
          munitions={sorted}
          sortKey={sortKey}
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

// ─── Table Tab ───────────────────────────────────────────────

interface TableTabProps {
  munitions: Munition[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  filterSection: FilterSection;
  onFilterSection: (f: FilterSection) => void;
}

function TableTab({ munitions, sortKey, sortDir, onSort, filterSection, onFilterSection }: TableTabProps) {
  const sections: { key: FilterSection; title: string; rows: RowDef[] }[] = [
    {
      key: 'identification',
      title: 'Identification',
      rows: [
        { label: 'Nom', getValue: (m) => m.nom || '—' },
        { label: 'Fabricant', getValue: (m) => m.fabricant || '—' },
        { label: 'Calibre', getValue: (m) => m.calibre },
        { label: 'Prix', getValue: (m) => m.prix ? `${m.prix}€` : '—', sortable: 'prix' },
      ],
    },
    {
      key: 'cartouche',
      title: 'Cartouche',
      rows: [
        { label: 'Taille testée', getValue: (m) => m.tailleTestee || '—' },
        { label: 'Bourre', getValue: (m) => m.bourre || '—' },
        { label: 'Douille', getValue: (m) => m.douille || '—' },
        { label: 'Poudre', getValue: (m) => m.poudre || '—' },
      ],
    },
    {
      key: 'gerbe',
      title: 'Gerbe',
      rows: [
        { label: 'Score', getValue: (m) => m.snap?.score ?? '—', higherIsBetter: true, sortable: 'score' },
        { label: 'Impacts', getValue: (m) => m.snap?.nbImpacts ?? '—', higherIsBetter: true, sortable: 'nbImpacts' },
        { label: 'Dans ∅50cm', getValue: (m) => m.snap ? `${m.snap.pct50cm}%` : '—', higherIsBetter: true, sortable: 'pct50' },
        { label: 'Dans ∅100cm', getValue: (m) => m.snap ? `${m.snap.pct100cm}%` : '—', higherIsBetter: true, sortable: 'pct100' },
        { label: 'R90', getValue: (m) => m.snap ? `${m.snap.r90.toFixed(1)}cm` : '—', higherIsBetter: false, sortable: 'r90' },
        { label: 'Disp. moyenne', getValue: (m) => m.snap ? `${m.snap.dispMoy.toFixed(1)}cm` : '—', higherIsBetter: false, sortable: 'dispMoy' },
      ],
    },
    {
      key: 'terrain',
      title: 'Terrain',
      rows: [
        { label: 'Distance', getValue: (m) => m.distance || '—' },
        { label: 'Choke', getValue: (m) => m.choke || '—' },
        { label: 'Fusil', getValue: (m) => m.fusil || '—' },
        { label: 'V. officielle', getValue: (m) => m.vitesseOfficielle ? `${m.vitesseOfficielle} m/s` : '—' },
        { label: 'V. mesurée', getValue: (m) => m.vitesseMesuree ? `${m.vitesseMesuree} m/s` : '—' },
        { label: 'Pénétration', getValue: (m) => m.penetration ? `${m.penetration} cm` : '—' },
      ],
    },
  ];

  const visibleSections = filterSection === 'all'
    ? sections
    : sections.filter((s) => s.key === filterSection);

  return (
    <>
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
          <span style={{ fontSize: 10, color: 'var(--muted)', marginRight: 2 }}>Tri :</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className="btn btn-sm"
              onClick={() => onSort(opt.key)}
              style={{
                fontSize: 10,
                padding: '3px 7px',
                background: sortKey === opt.key ? 'var(--accent-glow)' : undefined,
                color: sortKey === opt.key ? 'var(--accent2)' : 'var(--muted)',
                borderColor: sortKey === opt.key ? 'var(--accent)' : undefined,
              }}
            >
              {opt.label}
              {sortKey === opt.key && (
                <span style={{ marginLeft: 2 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr>
              <th style={thStyle}>Critère</th>
              {munitions.map((m) => (
                <th key={m.id} style={{ ...thStyle, minWidth: 140 }}>
                  <div style={{ fontWeight: 700 }}>{m.nom || 'Sans nom'}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>{m.calibre}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleSections.map((section) => (
              <SectionRows key={section.key} section={section} munitions={munitions} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Score visual comparison */}
      {munitions.some((m) => m.snap?.score) && (
        <ScoreBarChart munitions={munitions} />
      )}
    </>
  );
}

// ─── Types ───────────────────────────────────────────────────

interface RowDef {
  label: string;
  getValue: (m: Munition) => string | number;
  higherIsBetter?: boolean;
  sortable?: SortKey;
}

// ─── Section Rows ────────────────────────────────────────────

function SectionRows({ section, munitions }: {
  section: { title: string; rows: RowDef[] };
  munitions: Munition[];
}) {
  return (
    <>
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
          .map((v) => typeof v === 'number' ? v : parseFloat(String(v)))
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
    </>
  );
}

// ─── Score Bar Chart ─────────────────────────────────────────

function ScoreBarChart({ munitions }: { munitions: Munition[] }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: 10,
      }}>
        Comparaison des scores
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        {munitions.map((m) => {
          const score = m.snap?.score ?? 0;
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
                {m.nom || 'Sans nom'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
