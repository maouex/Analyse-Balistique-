import { Component, useState, useMemo, Fragment, lazy, Suspense } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { getScoreColor } from '../../lib/ballistics';
import type { Munition } from '../../types';

// Lazy-load heavy sub-components to isolate errors
const RadarChart = lazy(() => import('./RadarChart').then((m) => ({ default: m.RadarChart })));
const ImpactOverlay = lazy(() => import('./ImpactOverlay').then((m) => ({ default: m.ImpactOverlay })));

type Tab = 'table' | 'radar' | 'overlay';
type SortKey = 'score' | 'nbImpacts' | 'pct50' | 'pct100' | 'r90' | 'dispMoy' | 'prix';
type SortDir = 'asc' | 'desc';

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
            <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>Erreur</div>
            <pre style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {String(this.state.error.message)}
              {'\n\n'}
              {String(this.state.error.stack || '')}
            </pre>
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

// ─── Safe renderer ───────────────────────────────────────────

function safe(val: unknown): string {
  if (val === null || val === undefined || val === '') return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  return JSON.stringify(val);
}

// ─── Sort Config ─────────────────────────────────────────────

const SORT_OPTS: { key: SortKey; label: string; getValue: (m: Munition) => number; defDir: SortDir }[] = [
  { key: 'score', label: 'Score', getValue: (m) => Number(m.snap?.score) || -1, defDir: 'desc' },
  { key: 'nbImpacts', label: 'Impacts', getValue: (m) => Number(m.snap?.nbImpacts) || -1, defDir: 'desc' },
  { key: 'pct50', label: '%50cm', getValue: (m) => parseFloat(String(m.snap?.pct50cm ?? '-1')), defDir: 'desc' },
  { key: 'pct100', label: '%100cm', getValue: (m) => parseFloat(String(m.snap?.pct100cm ?? '-1')), defDir: 'desc' },
  { key: 'r90', label: 'R90', getValue: (m) => Number(m.snap?.r90) || 999, defDir: 'asc' },
  { key: 'dispMoy', label: 'Disp.', getValue: (m) => Number(m.snap?.dispMoy) || 999, defDir: 'asc' },
  { key: 'prix', label: 'Prix', getValue: (m) => Number(m.prix) || 999, defDir: 'asc' },
];

// ─── Row definitions ─────────────────────────────────────────

interface RowDef {
  label: string;
  get: (m: Munition) => string;
  better?: 'high' | 'low';
}

interface SectionDef {
  id: string;
  title: string;
  rows: RowDef[];
}

function buildSections(): SectionDef[] {
  return [
    {
      id: 'identification', title: 'Identification',
      rows: [
        { label: 'Nom', get: (m) => safe(m.nom) },
        { label: 'Fabricant', get: (m) => safe(m.fabricant) },
        { label: 'Calibre', get: (m) => safe(m.calibre) },
        { label: 'Prix', get: (m) => m.prix ? String(m.prix) + '\u20AC' : '—' },
      ],
    },
    {
      id: 'cartouche', title: 'Cartouche',
      rows: [
        { label: 'Taille test\u00E9e', get: (m) => safe(m.tailleTestee) },
        { label: 'Bourre', get: (m) => safe(m.bourre) },
        { label: 'Douille', get: (m) => safe(m.douille) },
        { label: 'Poudre', get: (m) => safe(m.poudre) },
      ],
    },
    {
      id: 'gerbe', title: 'Gerbe',
      rows: [
        { label: 'Score', get: (m) => m.snap ? String(Number(m.snap.score) || 0) : '—', better: 'high' },
        { label: 'Impacts', get: (m) => m.snap ? String(Number(m.snap.nbImpacts) || 0) : '—', better: 'high' },
        { label: 'Dans 50cm', get: (m) => m.snap && m.snap.pct50cm != null ? String(m.snap.pct50cm) + '%' : '—', better: 'high' },
        { label: 'Dans 100cm', get: (m) => m.snap && m.snap.pct100cm != null ? String(m.snap.pct100cm) + '%' : '—', better: 'high' },
        { label: 'R90', get: (m) => m.snap && m.snap.r90 != null ? Number(m.snap.r90).toFixed(1) + 'cm' : '—', better: 'low' },
        { label: 'Disp. moy.', get: (m) => m.snap && m.snap.dispMoy != null ? Number(m.snap.dispMoy).toFixed(1) + 'cm' : '—', better: 'low' },
      ],
    },
    {
      id: 'terrain', title: 'Terrain',
      rows: [
        { label: 'Distance', get: (m) => safe(m.distance) },
        { label: 'Choke', get: (m) => safe(m.choke) },
        { label: 'Fusil', get: (m) => safe(m.fusil) },
        { label: 'V. officielle', get: (m) => m.vitesseOfficielle ? String(m.vitesseOfficielle) + ' m/s' : '—' },
        { label: 'V. mesur\u00E9e', get: (m) => m.vitesseMesuree ? String(m.vitesseMesuree) + ' m/s' : '—' },
        { label: 'P\u00E9n\u00E9tration', get: (m) => m.penetration ? String(m.penetration) + ' cm' : '—' },
      ],
    },
  ];
}

// ─── Main Inner Component ────────────────────────────────────

function ComparisonViewInner({ onBack }: ComparisonViewProps) {
  // Use stable selectors — NEVER call functions inside Zustand selectors
  const allMunitions = useMunitionsStore((s) => s.munitions);
  const selectedIds = useMunitionsStore((s) => s.selectedIds);
  const selected = useMemo(
    () => allMunitions.filter((m) => selectedIds.has(m.id)),
    [allMunitions, selectedIds]
  );
  const [tab, setTab] = useState<Tab>('table');
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  if (selected.length < 2) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-sm" onClick={onBack}>
          <ArrowLeft size={14} />
          {' Retour'}
        </button>
        <p style={{ marginTop: 20, color: 'var(--muted)' }}>
          {"S\u00E9lectionnez au moins 2 munitions."}
        </p>
      </div>
    );
  }

  const munitions = [...selected];
  if (sortKey) {
    const opt = SORT_OPTS.find((o) => o.key === sortKey);
    if (opt) {
      munitions.sort((a, b) => {
        const va = opt.getValue(a);
        const vb = opt.getValue(b);
        return sortDir === 'asc' ? va - vb : vb - va;
      });
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      const opt = SORT_OPTS.find((o) => o.key === key);
      setSortKey(key);
      setSortDir(opt?.defDir ?? 'desc');
    }
  };

  const allSections = buildSections();
  const sections = sectionFilter === 'all'
    ? allSections
    : allSections.filter((s) => s.id === sectionFilter);

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
          <ArrowLeft size={14} />
          {' Retour'}
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          {'Comparaison (' + String(selected.length) + ' munitions)'}
        </h2>
      </div>

      {/* Tabs - plain text, no lucide icons */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
        {[
          { key: 'table' as Tab, label: 'Tableau' },
          { key: 'radar' as Tab, label: 'Radar' },
          { key: 'overlay' as Tab, label: 'Superposition' },
        ].map((t) => (
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
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TABLE TAB ─── */}
      {tab === 'table' && (
        <Fragment>
          {/* Filter + Sort bar */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {['all', 'identification', 'cartouche', 'gerbe', 'terrain'].map((f) => (
              <button
                key={f}
                className="btn btn-sm"
                onClick={() => setSectionFilter(f)}
                style={{
                  fontSize: 10, padding: '3px 8px',
                  background: sectionFilter === f ? 'var(--accent-glow)' : undefined,
                  color: sectionFilter === f ? 'var(--accent2)' : 'var(--muted)',
                  borderColor: sectionFilter === f ? 'var(--accent)' : undefined,
                }}
              >
                {f === 'all' ? 'Tout' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}

            <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 8 }}>{'Tri:'}</span>
            {SORT_OPTS.map((opt) => (
              <button
                key={opt.key}
                className="btn btn-sm"
                onClick={() => handleSort(opt.key)}
                style={{
                  fontSize: 10, padding: '3px 7px',
                  background: sortKey === opt.key ? 'var(--accent-glow)' : undefined,
                  color: sortKey === opt.key ? 'var(--accent2)' : 'var(--muted)',
                  borderColor: sortKey === opt.key ? 'var(--accent)' : undefined,
                }}
              >
                {opt.label + (sortKey === opt.key ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : '')}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>
                  <th style={thStyle}>{"Crit\u00E8re"}</th>
                  {munitions.map((m) => (
                    <th key={m.id} style={{ ...thStyle, minWidth: 140 }}>
                      <div style={{ fontWeight: 700 }}>{safe(m.nom)}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>{safe(m.calibre)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <Fragment key={section.id}>
                    <tr>
                      <td
                        colSpan={munitions.length + 1}
                        style={{
                          padding: '12px 10px 6px', fontSize: 10, fontWeight: 700,
                          color: 'var(--accent2)', textTransform: 'uppercase',
                          letterSpacing: '0.8px', borderBottom: '1px solid var(--border)',
                        }}
                      >
                        {section.title}
                      </td>
                    </tr>
                    {section.rows.map((row) => {
                      const vals = munitions.map((m) => row.get(m));
                      const nums = vals.map((v) => parseFloat(v)).filter((v) => !isNaN(v));

                      let bestIdx = -1;
                      if (nums.length >= 2 && row.better) {
                        const best = row.better === 'high' ? Math.max(...nums) : Math.min(...nums);
                        bestIdx = nums.indexOf(best);
                      }

                      return (
                        <tr key={row.label}>
                          <td style={{ ...tdStyle, color: 'var(--muted)', fontWeight: 500 }}>{row.label}</td>
                          {vals.map((val, i) => (
                            <td
                              key={i}
                              style={{
                                ...tdStyle,
                                fontWeight: i === bestIdx ? 700 : 400,
                                color: i === bestIdx ? 'var(--green)' : 'var(--text)',
                              }}
                            >
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

          {/* Score bars */}
          {munitions.some((m) => m.snap && m.snap.score != null) && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: 'var(--muted)',
                textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10,
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
                        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                        paddingTop: 6, fontWeight: 700, fontSize: 13, color: '#fff',
                      }}>
                        {String(score)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                        {safe(m.nom)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Fragment>
      )}

      {/* ─── RADAR TAB ─── */}
      {tab === 'radar' && (
        <Suspense fallback={<div style={{ color: 'var(--muted)', padding: 20 }}>{"Chargement..."}</div>}>
          <RadarChart munitions={selected} />
        </Suspense>
      )}

      {/* ─── OVERLAY TAB ─── */}
      {tab === 'overlay' && (
        <Suspense fallback={<div style={{ color: 'var(--muted)', padding: 20 }}>{"Chargement..."}</div>}>
          <ImpactOverlay munitions={selected} />
        </Suspense>
      )}
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
