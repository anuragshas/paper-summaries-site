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
      <header className="paper-page-header">
        <div className="paper-page-header-inner">
          <div className="back-row paper-page-controls">
            <Link to="/" className="back-link" aria-label="Back to all papers">
              <ArrowLeft size={18} />
            </Link>
            <ThemeToggle />
          </div>
          <div className="paper-page-hero-copy">
            <p className="eyebrow">Paper Summary</p>
            <h1>{summary?.title ?? 'Loading paper summary...'}</h1>
            {summary ? (
              <p className="paper-page-meta">
                {summary.authors}
                {summary.venue || summary.year ? ` • ${summary.venue} (${summary.year})` : ''}
              </p>
            ) : null}
          </div>
        </div>
      </header>
      {error ? <div className="card error-card">{error}</div> : null}
      {!summary && !error ? <div className="card">Loading summary...</div> : null}
      {summary ? <PaperSummary data={summary} pdfImages={pdfImages} /> : null}
    </main>
  );
}
