import { useState, useEffect, useRef } from 'react';
import { Ruler } from 'lucide-react';
import { useAnalysisStore } from '../../stores/analysisStore';

export function ScalePrompt() {
  const { scalePromptOpen, confirmScale, cancelScale } = useAnalysisStore();
  const [value, setValue] = useState('30');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scalePromptOpen) {
      setValue('30');
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [scalePromptOpen]);

  if (!scalePromptOpen) return null;

  const handleConfirm = () => {
    const cm = parseFloat(value);
    if (!cm || cm <= 0) return;
    confirmScale(cm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') cancelScale();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px 28px',
        width: 320,
        boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ruler size={16} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Étalonnage</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              Quelle est la distance réelle entre les 2 points ?
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
        }}>
          <input
            ref={inputRef}
            type="number"
            min={0.1}
            step={0.1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              color: 'var(--text)',
              fontSize: 16,
              fontWeight: 600,
              textAlign: 'center',
              outline: 'none',
            }}
          />
          <span style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--muted)',
          }}>
            cm
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-sm"
            onClick={cancelScale}
            style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
          >
            Annuler
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={handleConfirm}
            style={{ flex: 1, padding: '8px 12px', fontSize: 12 }}
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
}
