import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AnalysisPage } from './pages/AnalysisPage';
import { LibraryPage } from './pages/LibraryPage';
import { View3DPage } from './pages/View3DPage';
import { LandingPage } from './pages/LandingPage';
import { LoginScreen } from './components/auth/LoginScreen';

function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('sag-auth') === '1');

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('sag-auth');
    setAuthed(false);
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {authed ? (
          <Route element={<AppLayout onLogout={handleLogout} />}>
            <Route path="/analyse" element={<AnalysisPage />} />
            <Route path="/bibliotheque" element={<LibraryPage />} />
            <Route path="/3d" element={<View3DPage />} />
          </Route>
        ) : (
          <Route path="/analyse" element={<LoginScreen onAuth={() => setAuthed(true)} />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
