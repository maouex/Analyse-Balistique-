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
      padding: '12px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Top decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.2))',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#00ff41',
          fontFamily: 'var(--font-mono)',
          textShadow: '0 0 8px rgba(0,255,65,0.2)',
        }}>
          Analyse
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          background: impacts.length > 0 ? 'rgba(0,255,65,0.08)' : 'var(--surface2)',
          color: impacts.length > 0 ? '#00ff41' : 'var(--muted)',
          padding: '3px 8px',
          border: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          transition: 'all var(--transition-smooth)',
        }}>
          {impacts.length} IMPACT{impacts.length !== 1 ? 'S' : ''}
        </span>
      </div>

      {!stats ? (
        <div style={{
          fontSize: 11,
          color: 'var(--muted)',
          textAlign: 'center',
          padding: 24,
          background: 'var(--surface2)',
          border: '1px dashed var(--border)',
          lineHeight: 1.6,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.3px',
        }}>
          Placez le centre et ajoutez des impacts pour voir les statistiques.
        </div>
      ) : (
        <>
          {/* Score */}
          <ScoreGauge score={stats.score} label={stats.scoreLabel} />

          {/* Zones */}
          <StatSection title="Distribution par zone" icon={<Target size={9} />}>
            <ZoneRow zone={1} label="50 cm" color="#00ff41" glow="rgba(0,255,65,0.08)" stats={stats.zones[0]} />
            <ZoneRow zone={2} label="50-100 cm" color="#ffaa00" glow="rgba(255,170,0,0.08)" stats={stats.zones[1]} />
            <ZoneRow zone={3} label="> 100 cm" color="#ff4444" glow="rgba(255,68,68,0.08)" stats={stats.zones[2]} />
          </StatSection>

          {/* Distances */}
          <StatSection title="Distances" icon={<Ruler size={9} />}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 4,
            }}>
              <MiniCard label="MOY" value={`${stats.distances.mean.toFixed(1)}`} unit="cm" />
              <MiniCard label="σ" value={`${stats.distances.stdDev.toFixed(1)}`} unit="cm" />
              <MiniCard label="MIN" value={`${stats.distances.min.toFixed(1)}`} unit="cm" />
              <MiniCard label="MAX" value={`${stats.distances.max.toFixed(1)}`} unit="cm" />
            </div>
            <StatRow label="CV" value={`${stats.distances.cv.toFixed(1)}%`} />
          </StatSection>

          {/* Dispersion */}
          <StatSection title="Dispersion" icon={<Activity size={9} />}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 4,
            }}>
              <MiniCard label="ΔH" value={`${stats.dispersion.cx.toFixed(1)}`} unit="cm" />
              <MiniCard label="ΔV" value={`${stats.dispersion.cy.toFixed(1)}`} unit="cm" />
              <MiniCard label="R90" value={`${stats.dispersion.r90.toFixed(1)}`} unit="cm" accent />
            </div>
          </StatSection>

          {/* Density */}
          <StatSection title="Densité" icon={<Layers size={9} />}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 4,
            }}>
              <MiniCard label="∅50" value={`${stats.density.pct50cm.toFixed(0)}`} unit="%" />
              <MiniCard label="∅100" value={`${stats.density.pct100cm.toFixed(0)}`} unit="%" />
              <MiniCard label="GRP" value={`${stats.density.groupingCV.toFixed(1)}`} unit="%" />
            </div>
          </StatSection>

          {/* Impact list */}
          <StatSection title={`Liste (${impacts.length})`} icon={<span style={{ fontSize: 9, fontFamily: 'var(--font-mono)' }}>#</span>}>
            <div style={{ maxHeight: 180, overflowY: 'auto' }}>
              {impacts.map((imp) => {
                const distCm = center && scale.pixelsPerCm
                  ? pxToCm(distancePx(imp, center), scale.pixelsPerCm)
                  : 0;
                const zone = classifyZone(distCm, circle1.diameterCm, circle2.diameterCm);
                const zoneColor = zone === 1 ? '#00ff41' : zone === 2 ? '#ffaa00' : '#ff4444';
                return (
                  <div key={imp.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '3px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 10,
                    fontFamily: 'var(--font-mono)',
                  }}>
                    <span style={{
                      color: 'var(--muted)',
                      fontSize: 9,
                      fontWeight: 600,
                      minWidth: 24,
                    }}>
                      #{imp.index}
                    </span>
                    <span style={{ fontWeight: 600 }}>{distCm.toFixed(1)} cm</span>
                    <span style={{
                      width: 6,
                      height: 6,
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 'auto', paddingTop: 8 }}>
        {stats && (
          <button
            className="btn btn-sm"
            onClick={() => navigate('/3d')}
            style={{
              width: '100%',
              background: 'rgba(170,102,255,0.08)',
              borderColor: 'rgba(170,102,255,0.25)',
              justifyContent: 'center',
              gap: 8,
              color: '#aa66ff',
            }}
          >
            <Box size={12} /> Modélisation 3D
          </button>
        )}
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn-sm" onClick={onSaveMunition} style={{ flex: 1, justifyContent: 'center' }}>
            <Save size={11} /> Sauvegarder
          </button>
          <button className="btn btn-sm btn-primary" onClick={onExport} style={{ flex: 1, justifyContent: 'center' }}>
            <Download size={11} /> PNG
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
    <div className="stat-card" style={{ textAlign: 'center', padding: '6px 4px' }}>
      <div style={{
        fontSize: 13,
        fontWeight: 800,
        color: accent ? '#00ff41' : 'var(--text)',
        fontFamily: 'var(--font-mono)',
        textShadow: accent ? '0 0 8px rgba(0,255,65,0.3)' : undefined,
      }}>
        {value}
        <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--muted)', marginLeft: 1 }}>{unit}</span>
      </div>
      <div style={{
        fontSize: 8,
        color: 'var(--muted)',
        fontWeight: 700,
        marginTop: 2,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        fontFamily: 'var(--font-mono)',
      }}>
        {label}
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '3px 0',
      fontSize: 11,
      fontFamily: 'var(--font-mono)',
    }}>
      <span style={{ color: 'var(--muted)', letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{value}</span>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            width: 6,
            height: 6,
            background: color,
            boxShadow: `0 0 6px ${color}`,
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Z{zone} ({label})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{stats.count}</span>
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            color,
            background: glow,
            padding: '1px 6px',
            border: `1px solid ${color}33`,
            fontFamily: 'var(--font-mono)',
          }}>
            {stats.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <div style={{
        height: 2,
        background: 'rgba(0,255,65,0.05)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${stats.percentage}%`,
          background: color,
          transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 8px ${glow}`,
        }} />
      </div>
    </div>
  );
}
