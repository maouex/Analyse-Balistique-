import { useNavigate } from 'react-router-dom';
import { Crosshair, BookOpen, Box } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 40,
      padding: 40,
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>PlombScope</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
          Analysez vos gerbes de tir, mesurez la dispersion et comparez vos munitions.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/analyse')}
          className="btn btn-primary"
          style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }}
        >
          <Crosshair size={18} />
          Analyse de dispersion
        </button>
        <button
          onClick={() => navigate('/bibliotheque')}
          className="btn"
          style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }}
        >
          <BookOpen size={18} />
          Bibliothèque
        </button>
        <button
          onClick={() => navigate('/3d')}
          className="btn"
          style={{ padding: '14px 28px', fontSize: 15, borderRadius: 12 }}
        >
          <Box size={18} />
          Vue 3D
        </button>
      </div>
    </div>
  );
}
