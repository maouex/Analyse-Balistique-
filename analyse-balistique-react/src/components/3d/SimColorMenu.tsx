import { useState } from 'react';
import { Palette, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useSimColorStore } from '../../stores/simColorStore';
import type { SimColors } from '../../stores/simColorStore';

const LABELS: Record<keyof SimColors, string> = {
  sky:         'Fond / ciel',
  ground:      'Sol',
  gridMajor:   'Grille principale',
  gridMinor:   'Grille secondaire',
  pelletBase:  'Plombs — couleur',
  pelletEmit:  'Plombs — lueur',
  pelletTrail: 'Plombs — traînée',
};

const GROUPS: { title: string; keys: (keyof SimColors)[] }[] = [
  { title: 'Environnement', keys: ['sky', 'ground', 'gridMajor', 'gridMinor'] },
  { title: 'Plombs',        keys: ['pelletBase', 'pelletEmit', 'pelletTrail'] },
];

export function SimColorMenu() {
  const [open, setOpen] = useState(false);
  const { colors, setColor, reset } = useSimColorStore();

  return (
    <div style={{
      position: 'absolute', top: 10, right: 10, zIndex: 20,
      userSelect: 'none',
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '6px 10px', fontSize: 11, fontWeight: 600,
          background: 'var(--surface-glass, rgba(18,20,30,0.75))',
          backdropFilter: 'blur(12px)',
          color: 'var(--text)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm, 8px)', cursor: 'pointer',
        }}
      >
        <Palette size={13} />
        Couleurs
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          marginTop: 4, width: 230,
          background: 'var(--surface-glass, rgba(18,20,30,0.85))',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm, 8px)',
          padding: '8px 10px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {GROUPS.map(group => (
            <div key={group.title}>
              <div style={{
                fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--muted)',
                marginBottom: 4,
              }}>
                {group.title}
              </div>
              {group.keys.map(key => (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginBottom: 3,
                }}>
                  <input
                    type="color"
                    value={colors[key]}
                    onChange={e => setColor(key, e.target.value)}
                    style={{
                      width: 22, height: 22, padding: 0,
                      border: '1px solid var(--border-light)',
                      borderRadius: 4, cursor: 'pointer',
                      background: 'none',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {LABELS[key]}
                  </span>
                </div>
              ))}
            </div>
          ))}

          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, padding: '4px 0', fontSize: 10, fontWeight: 600,
              color: 'var(--muted)', background: 'none',
              border: '1px solid var(--border)', borderRadius: 6,
              cursor: 'pointer', marginTop: 2,
            }}
          >
            <RotateCcw size={10} /> Réinitialiser
          </button>
        </div>
      )}
    </div>
  );
}
