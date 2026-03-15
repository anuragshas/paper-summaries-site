import { Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PaperPage } from './pages/PaperPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/papers/:paperId" element={<PaperPage />} />
    </Routes>
  );
}
