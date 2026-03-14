import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { LibraryPage } from './pages/LibraryPage';
import { View3DPage } from './pages/View3DPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyse" element={<AnalysisPage />} />
          <Route path="/bibliotheque" element={<LibraryPage />} />
          <Route path="/3d" element={<View3DPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
