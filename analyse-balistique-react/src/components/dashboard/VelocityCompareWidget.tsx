import { useEffect } from 'react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { HBarChart } from './SvgCharts';

export function VelocityCompareWidget() {
  const store = useMunitionsStore();
  const load = store.load;

  useEffect(() => { load(); }, [load]);

  const munitions = store.munitions.filter((m) => m.vitesseMesuree > 0 || m.penetration > 0);

  if (munitions.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
        Aucune donnée de vitesse
      </div>
    );
  }

  const velocityItems = munitions
    .filter((m) => m.vitesseMesuree > 0)
    .sort((a, b) => b.vitesseMesuree - a.vitesseMesuree)
    .slice(0, 4)
    .map((m) => ({
      label: m.nom || 'Sans nom',
      value: Math.round(m.vitesseMesuree),
      color: m.vitesseMesuree >= m.vitesseOfficielle ? 'var(--green)' : 'var(--amber)',
      subLabel: m.calibre,
    }));

  const penItems = munitions
    .filter((m) => m.penetration > 0)
    .sort((a, b) => b.penetration - a.penetration)
    .slice(0, 4)
    .map((m) => ({
      label: m.nom || 'Sans nom',
      value: m.penetration,
      color: 'var(--blue)',
      subLabel: m.calibre,
    }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%', justifyContent: 'center' }}>
      {velocityItems.length > 0 && (
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
            Vitesse (m/s)
          </div>
          <HBarChart items={velocityItems} />
        </div>
      )}
      {penItems.length > 0 && (
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>
            Pénétration (mm)
          </div>
          <HBarChart items={penItems} />
        </div>
      )}
    </div>
  );
}
