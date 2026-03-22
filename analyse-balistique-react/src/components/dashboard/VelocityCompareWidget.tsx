import { useEffect } from 'react';
import { Gauge } from 'lucide-react';
import { useMunitionsStore } from '../../stores/munitionsStore';
import { HBarChart } from './SvgCharts';
import type { WidgetSize } from '../../stores/dashboardStore';

export function VelocityCompareWidget({ size = 'M' }: { size?: WidgetSize }) {
  const store = useMunitionsStore();
  const load = store.load;
  useEffect(() => { load(); }, [load]);

  const munitions = store.munitions.filter((m) => m.vitesseMesuree > 0 || m.penetration > 0);
  if (munitions.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>Aucune donnée</div>;
  }

  if (size === 'S') {
    const top = munitions.filter((m) => m.vitesseMesuree > 0).sort((a, b) => b.vitesseMesuree - a.vitesseMesuree)[0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <Gauge size={18} color="var(--amber)" />
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--amber)', fontFamily: 'var(--font-mono)' }}>{top ? Math.round(top.vitesseMesuree) : '—'}</div>
        <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>m/s max</div>
      </div>
    );
  }

  const velCount = size === 'L' ? 5 : 3;
  const penCount = size === 'L' ? 5 : 3;

  const velocityItems = munitions.filter((m) => m.vitesseMesuree > 0).sort((a, b) => b.vitesseMesuree - a.vitesseMesuree).slice(0, velCount)
    .map((m) => ({ label: m.nom || 'Sans nom', value: Math.round(m.vitesseMesuree), color: m.vitesseMesuree >= m.vitesseOfficielle ? 'var(--green)' : 'var(--amber)', subLabel: m.calibre }));

  const penItems = munitions.filter((m) => m.penetration > 0).sort((a, b) => b.penetration - a.penetration).slice(0, penCount)
    .map((m) => ({ label: m.nom || 'Sans nom', value: m.penetration, color: 'var(--blue)', subLabel: m.calibre }));

  return (
    <div style={{ display: 'flex', flexDirection: size === 'L' ? 'row' : 'column', gap: 12, justifyContent: 'center' }}>
      {velocityItems.length > 0 && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>Vitesse (m/s)</div>
          <HBarChart items={velocityItems} />
        </div>
      )}
      {penItems.length > 0 && (
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>Pénétration (mm)</div>
          <HBarChart items={penItems} />
        </div>
      )}
    </div>
  );
}
