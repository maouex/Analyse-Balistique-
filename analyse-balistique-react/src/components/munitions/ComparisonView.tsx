import { ArrowLeft } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { getScoreColor } from '../../lib/ballistics';
import type { Munition } from '../../types';

interface ComparisonViewProps {
  onBack: () => void;
}

export function ComparisonView({ onBack }: ComparisonViewProps) {
  const selected = useMunitionsStore((s) => s.selectedMunitions());

  if (selected.length < 2) {
    return (
      <div style={{ padding: 24 }}>
        <button className="btn btn-sm" onClick={onBack}><ArrowLeft size={14} /> Retour</button>
        <p style={{ marginTop: 20, color: 'var(--muted)' }}>Sélectionnez au moins 2 munitions.</p>
      </div>
    );
  }

  const sections: { title: string; rows: { label: string; getValue: (m: Munition) => string | number; unit?: string; higherIsBetter?: boolean }[] }[] = [
    {
      title: 'Identification',
      rows: [
        { label: 'Nom', getValue: (m) => m.nom || '—' },
        { label: 'Fabricant', getValue: (m) => m.fabricant || '—' },
        { label: 'Calibre', getValue: (m) => m.calibre },
        { label: 'Prix', getValue: (m) => m.prix ? `${m.prix}€` : '—' },
      ],
    },
    {
      title: 'Cartouche',
      rows: [
        { label: 'Taille testée', getValue: (m) => m.tailleTestee || '—' },
        { label: 'Bourre', getValue: (m) => m.bourre || '—' },
        { label: 'Douille', getValue: (m) => m.douille || '—' },
        { label: 'Poudre', getValue: (m) => m.poudre || '—' },
      ],
    },
    {
      title: 'Gerbe',
      rows: [
        { label: 'Score', getValue: (m) => m.snap?.score ?? '—', higherIsBetter: true },
        { label: 'Impacts', getValue: (m) => m.snap?.nbImpacts ?? '—', higherIsBetter: true },
        { label: 'Dans ∅50cm', getValue: (m) => m.snap ? `${m.snap.pct50cm}%` : '—', higherIsBetter: true },
        { label: 'Dans ∅100cm', getValue: (m) => m.snap ? `${m.snap.pct100cm}%` : '—', higherIsBetter: true },
        { label: 'R90', getValue: (m) => m.snap ? `${m.snap.r90.toFixed(1)}cm` : '—', higherIsBetter: false },
        { label: 'Disp. moyenne', getValue: (m) => m.snap ? `${m.snap.dispMoy.toFixed(1)}cm` : '—', higherIsBetter: false },
      ],
    },
    {
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

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 24,
      gap: 16,
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn btn-sm" onClick={onBack}>
          <ArrowLeft size={14} /> Retour
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Comparaison ({selected.length} munitions)</h2>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 12,
        }}>
          <thead>
            <tr>
              <th style={thStyle}>Critère</th>
              {selected.map((m) => (
                <th key={m.id} style={{ ...thStyle, minWidth: 140 }}>
                  <div style={{ fontWeight: 700 }}>{m.nom || 'Sans nom'}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400 }}>{m.calibre}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sections.map((section) => (
              <>
                <tr key={section.title}>
                  <td colSpan={selected.length + 1} style={{
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
                  const values = selected.map((m) => row.getValue(m));
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Score visual comparison */}
      {selected.some((m) => m.snap?.score) && (
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
            {selected.map((m) => {
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
      )}
    </div>
  );
}

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
