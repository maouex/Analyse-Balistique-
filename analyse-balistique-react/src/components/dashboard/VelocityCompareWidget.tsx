import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { HBarChart } from './SvgCharts';

export function VelocityCompareWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const munitions = store.munitions.filter((m) => m.vitesseMesuree > 0 || m.vitesseOfficielle > 0);

  if (munitions.length === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px 0', color: 'var(--muted)', fontSize: 11, fontFamily: 'var(--font-mono)',
      }}>
        Aucune donnée de vitesse
      </div>
    );
  }

  // Velocity comparison
  const velocityItems = munitions
    .filter((m) => m.vitesseMesuree > 0)
    .sort((a, b) => b.vitesseMesuree - a.vitesseMesuree)
    .slice(0, 6)
    .map((m) => ({
      label: m.nom || 'Sans nom',
      value: Math.round(m.vitesseMesuree),
      color: m.vitesseMesuree >= m.vitesseOfficielle ? 'var(--green)' : 'var(--amber)',
      subLabel: m.vitesseOfficielle > 0 ? `off: ${m.vitesseOfficielle}` : undefined,
    }));

  // Penetration comparison
  const penItems = munitions
    .filter((m) => m.penetration > 0)
    .sort((a, b) => b.penetration - a.penetration)
    .slice(0, 6)
    .map((m) => ({
      label: m.nom || 'Sans nom',
      value: m.penetration,
      color: 'var(--blue)',
      subLabel: `${m.calibre}`,
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {velocityItems.length > 0 && (
        <div>
          <div style={{
            fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6,
          }}>
            Vitesse mesurée (m/s)
          </div>
          <HBarChart items={velocityItems} />
        </div>
      )}

      {penItems.length > 0 && (
        <div>
          <div style={{
            fontSize: 8, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6,
          }}>
            Pénétration (mm)
          </div>
          <HBarChart items={penItems} />
        </div>
      )}
    </div>
  );
}
