import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { loadSummary } from '../data/loader';
import { PaperSummary } from '../components/PaperSummary';
import type { PaperSummaryData } from '../types';

export function PaperPage() {
  const { paperId = '' } = useParams();
  const [summary, setSummary] = useState<PaperSummaryData | null>(null);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSummary(paperId)
      .then((result) => {
        setSummary(result.summary);
        setPdfImages(result.pdfImages);
      })
      .catch((err: Error) => setError(err.message));
  }, [paperId]);

  return (
    <main className="shell">
      <div className="back-row">
        <Link to="/" className="back-link" aria-label="Back to all papers">
          <ArrowLeft size={18} />
        </Link>
        <ThemeToggle />
      </div>
      {error ? <div className="card error-card">{error}</div> : null}
      {!summary && !error ? <div className="card">Loading summary...</div> : null}
      {summary ? <PaperSummary data={summary} pdfImages={pdfImages} /> : null}
    </main>
  );
}
