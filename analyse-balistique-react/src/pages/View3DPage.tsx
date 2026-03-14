import { lazy, Suspense } from 'react';

const Scene3D = lazy(() => import('../components/3d/Scene3D').then(m => ({ default: m.Scene3D })));

export function View3DPage() {
  return (
    <Suspense fallback={
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--muted)',
        fontSize: 14,
      }}>
        Chargement de la vue 3D...
      </div>
    }>
      <Scene3D />
    </Suspense>
  );
}
