import { useMemo } from 'react';
import { Download, Save, Box } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalysisStore } from '../../stores/analysisStore';
import { computeFullAnalysis, distancePx, pxToCm, classifyZone } from '../../lib/ballistics';
import { ScoreGauge } from './ScoreGauge';
import type { AnalysisStats } from '../../types';

interface StatsPanelProps {
  onExport: () => void;
  onSaveMunition: () => void;
}

export function StatsPanel({ onExport, onSaveMunition }: StatsPanelProps) {
  const navigate = useNavigate();
  const { impacts, center, circle1, circle2, scale } = useAnalysisStore();

  const stats: AnalysisStats | null = useMemo(() =>
    computeFullAnalysis(impacts, center, circle1.diameterCm, circle2.diameterCm, scale.pixelsPerCm),
    [impacts, center, circle1.diameterCm, circle2.diameterCm, scale.pixelsPerCm]
  );

  return (
    <div className="sidebar-right" style={{
      width: 280,
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      overflowY: 'auto',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Analyse</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          background: 'var(--accent-glow)',
          color: 'var(--accent2)',
          padding: '2px 8px',
          borderRadius: 'var(--radius-sm)',
        }}>
          {impacts.length} impact{impacts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!stats ? (
        <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', padding: 20 }}>
          Placez le centre et ajoutez des impacts pour voir les statistiques.
        </div>
      ) : (
        <>
          {/* Score */}
          <ScoreGauge score={stats.score} label={stats.scoreLabel} />

          {/* Zones */}
          <StatSection title="Distribution par zone">
            <ZoneRow zone={1} label="≤ 50 cm" color="var(--green)" stats={stats.zones[0]} />
            <ZoneRow zone={2} label="50-100 cm" color="var(--amber)" stats={stats.zones[1]} />
            <ZoneRow zone={3} label="> 100 cm" color="var(--red)" stats={stats.zones[2]} />
          </StatSection>

          {/* Distances */}
          <StatSection title="Distances">
            <StatRow label="Moyenne" value={`${stats.distances.mean.toFixed(1)} cm`} />
            <StatRow label="Min" value={`${stats.distances.min.toFixed(1)} cm`} />
            <StatRow label="Max" value={`${stats.distances.max.toFixed(1)} cm`} />
            <StatRow label="Écart-type" value={`${stats.distances.stdDev.toFixed(1)} cm`} />
            <StatRow label="CV" value={`${stats.distances.cv.toFixed(1)}%`} />
          </StatSection>

          {/* Dispersion */}
          <StatSection title="Centre de dispersion">
            <StatRow label="Δ Horizontal" value={`${stats.dispersion.cx.toFixed(1)} cm`} />
            <StatRow label="Δ Vertical" value={`${stats.dispersion.cy.toFixed(1)} cm`} />
            <StatRow label="R90" value={`${stats.dispersion.r90.toFixed(1)} cm`} highlight />
          </StatSection>

          {/* Density */}
          <StatSection title="Densité">
            <StatRow label="Dans ∅50 cm" value={`${stats.density.pct50cm.toFixed(0)}%`} />
            <StatRow label="Dans ∅100 cm" value={`${stats.density.pct100cm.toFixed(0)}%`} />
            <StatRow label="Groupement (CV)" value={`${stats.density.groupingCV.toFixed(1)}%`} />
          </StatSection>

          {/* Impact list */}
          <StatSection title="Liste des impacts">
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {impacts.map((imp) => {
                const distCm = center && scale.pixelsPerCm
                  ? pxToCm(distancePx(imp, center), scale.pixelsPerCm)
                  : 0;
                const zone = classifyZone(distCm, circle1.diameterCm, circle2.diameterCm);
                const zoneColor = zone === 1 ? 'var(--green)' : zone === 2 ? 'var(--amber)' : 'var(--red)';
                return (
                  <div key={imp.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 11,
                  }}>
                    <span style={{ color: 'var(--muted)' }}>#{imp.index}</span>
                    <span>{distCm.toFixed(1)} cm</span>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: zoneColor,
                      display: 'inline-block',
                    }} />
                  </div>
                );
              })}
            </div>
          </StatSection>
        </>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
        {stats && (
          <button
            className="btn btn-sm"
            onClick={() => navigate('/3d')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(75, 0, 130, 0.3), rgba(200, 134, 10, 0.2))',
              borderColor: 'var(--accent)',
            }}
          >
            <Box size={13} /> Modélisation 3D
          </button>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" onClick={onSaveMunition} style={{ flex: 1 }}>
            <Save size={13} /> Sauvegarder
          </button>
          <button className="btn btn-sm btn-primary" onClick={onExport} style={{ flex: 1 }}>
            <Download size={13} /> Exporter PNG
          </button>
        </div>
      </div>
    </div>
  );
}

function StatSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        color: 'var(--muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: 6,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '2px 0',
      fontSize: 12,
    }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{
        fontWeight: 600,
        color: highlight ? 'var(--accent2)' : 'var(--text)',
      }}>{value}</span>
    </div>
  );
}

function ZoneRow({ zone, label, color, stats }: {
  zone: number;
  label: string;
  color: string;
  stats: { count: number; percentage: number };
}) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Zone {zone} ({label})</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600 }}>{stats.count}</span>
      </div>
      <div style={{
        height: 4,
        borderRadius: 2,
        background: 'var(--border)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${stats.percentage}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
