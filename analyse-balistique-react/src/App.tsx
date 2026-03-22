import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { AnalysisPage } from './pages/AnalysisPage';
import { LibraryPage } from './pages/LibraryPage';
import { View3DPage } from './pages/View3DPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { LandingPage } from './pages/LandingPage';
import { LoginScreen } from './components/auth/LoginScreen';
import { TransitionProvider } from './components/transitions/TransitionContext';
import { CommandPalette } from './components/command-palette/CommandPalette';
import { ToastContainer } from './components/toast/Toast';
import { InstallPrompt } from './components/pwa/InstallPrompt';
import { useUserStore } from './stores/userStore';

function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('sag-auth') === '1');
  const userLogout = useUserStore((s) => s.logout);

  const handleLogout = useCallback(() => {
    userLogout();
    setAuthed(false);
  }, [userLogout]);

  const loginElement = <LoginScreen onAuth={() => setAuthed(true)} redirectTo="/dashboard" />;

  return (
    <HashRouter>
      <TransitionProvider>
        <CommandPalette />
        <ToastContainer />
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {authed ? (
            <Route element={<AppLayout onLogout={handleLogout} />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/analyse" element={<AnalysisPage />} />
              <Route path="/bibliotheque" element={<LibraryPage />} />
              <Route path="/utilisateurs" element={<UsersPage />} />
              <Route path="/3d" element={<View3DPage />} />
            </Route>
          ) : (
            <>
              <Route path="/analyse" element={loginElement} />
              <Route path="/dashboard" element={loginElement} />
              <Route path="/bibliotheque" element={loginElement} />
              <Route path="/utilisateurs" element={loginElement} />
              <Route path="/3d" element={loginElement} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TransitionProvider>
    </HashRouter>
  );
}

export default App;
