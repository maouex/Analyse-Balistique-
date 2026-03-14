import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { LibraryPage } from './pages/LibraryPage';

function App() {
  return (
    <BrowserRouter basename="/Analyse-Balistique-">
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/analyse" element={<AnalysisPage />} />
          <Route path="/bibliotheque" element={<LibraryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
