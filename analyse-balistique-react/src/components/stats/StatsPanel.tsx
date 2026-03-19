import { useMemo } from 'react';
import { Download, Save, Box, Target, Ruler, Activity, Layers } from 'lucide-react';
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
      padding: '14px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-0.2px' }}>Analyse</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          background: impacts.length > 0 ? 'var(--accent-glow)' : 'var(--surface2)',
          color: impacts.length > 0 ? 'var(--accent2)' : 'var(--muted)',
          padding: '3px 10px',
          borderRadius: 20,
          border: '1px solid var(--border)',
          transition: 'all var(--transition-smooth)',
        }}>
          {impacts.length} impact{impacts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {!stats ? (
        <div style={{
          fontSize: 12,
          color: 'var(--muted)',
          textAlign: 'center',
          padding: 28,
          background: 'var(--surface2)',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--border)',
          lineHeight: 1.6,
        }}>
          Placez le centre et ajoutez des impacts pour voir les statistiques.
        </div>
      ) : (
        <>
          {/* Score */}
          <ScoreGauge score={stats.score} label={stats.scoreLabel} />

          {/* Zones */}
          <StatSection title="Distribution par zone" icon={<Target size={10} />}>
            <ZoneRow zone={1} label="50 cm" color="var(--green)" glow="var(--green-glow)" stats={stats.zones[0]} />
            <ZoneRow zone={2} label="50-100 cm" color="var(--amber)" glow="var(--amber-glow)" stats={stats.zones[1]} />
            <ZoneRow zone={3} label="> 100 cm" color="var(--red)" glow="var(--red-glow)" stats={stats.zones[2]} />
          </StatSection>

          {/* Distances */}
          <StatSection title="Distances" icon={<Ruler size={10} />}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
            }}>
              <MiniCard label="Moyenne" value={`${stats.distances.mean.toFixed(1)}`} unit="cm" />
              <MiniCard label="Écart-type" value={`${stats.distances.stdDev.toFixed(1)}`} unit="cm" />
              <MiniCard label="Min" value={`${stats.distances.min.toFixed(1)}`} unit="cm" />
              <MiniCard label="Max" value={`${stats.distances.max.toFixed(1)}`} unit="cm" />
            </div>
            <StatRow label="CV" value={`${stats.distances.cv.toFixed(1)}%`} />
          </StatSection>

          {/* Dispersion */}
          <StatSection title="Dispersion" icon={<Activity size={10} />}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
            }}>
              <MiniCard label="Δ Horiz." value={`${stats.dispersion.cx.toFixed(1)}`} unit="cm" />
              <MiniCard label="Δ Vert." value={`${stats.dispersion.cy.toFixed(1)}`} unit="cm" />
              <MiniCard label="R90" value={`${stats.dispersion.r90.toFixed(1)}`} unit="cm" accent />
            </div>
          </StatSection>

          {/* Density */}
          <StatSection title="Densité" icon={<Layers size={10} />}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 6,
            }}>
              <MiniCard label="∅50cm" value={`${stats.density.pct50cm.toFixed(0)}`} unit="%" />
              <MiniCard label="∅100cm" value={`${stats.density.pct100cm.toFixed(0)}`} unit="%" />
              <MiniCard label="Grp CV" value={`${stats.density.groupingCV.toFixed(1)}`} unit="%" />
            </div>
          </StatSection>

          {/* Impact list */}
          <StatSection title={`Liste (${impacts.length})`} icon={<span style={{ fontSize: 10 }}>#</span>}>
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
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
                    padding: '4px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 11,
                  }}>
                    <span style={{
                      color: 'var(--muted)',
                      fontSize: 10,
                      fontWeight: 600,
                      minWidth: 24,
                    }}>
                      #{imp.index}
                    </span>
                    <span style={{ fontWeight: 600 }}>{distCm.toFixed(1)} cm</span>
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: zoneColor,
                      boxShadow: `0 0 6px ${zoneColor}`,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto', paddingTop: 8 }}>
        {stats && (
          <button
            className="btn btn-sm"
            onClick={() => navigate('/3d')}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, var(--purple-glow), var(--accent-glow))',
              borderColor: 'var(--border-light)',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Box size={13} /> Modélisation 3D
          </button>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-sm" onClick={onSaveMunition} style={{ flex: 1, justifyContent: 'center' }}>
            <Save size={12} /> Sauvegarder
          </button>
          <button className="btn btn-sm btn-primary" onClick={onExport} style={{ flex: 1, justifyContent: 'center' }}>
            <Download size={12} /> PNG
          </button>
        </div>
      </div>
    </div>
  );
}

function StatSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="section-label">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function MiniCard({ label, value, unit, accent }: { label: string; value: string; unit: string; accent?: boolean }) {
  return (
    <div className="stat-card" style={{ textAlign: 'center', padding: '8px 4px' }}>
      <div style={{
        fontSize: 14,
        fontWeight: 800,
        color: accent ? 'var(--accent2)' : 'var(--text)',
        letterSpacing: '-0.3px',
      }}>
        {value}
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', marginLeft: 1 }}>{unit}</span>
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '4px 0',
      fontSize: 12,
    }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function ZoneRow({ zone, label, color, glow, stats }: {
  zone: number;
  label: string;
  color: string;
  glow: string;
  stats: { count: number; percentage: number };
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Zone {zone} ({label})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 800 }}>{stats.count}</span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color,
            background: glow,
            padding: '1px 6px',
            borderRadius: 8,
          }}>
            {stats.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div style={{
        height: 4,
        borderRadius: 4,
        background: 'var(--surface3)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${stats.percentage}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 4,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 8px ${glow}`,
        }} />
      </div>
    </div>
  );
}
