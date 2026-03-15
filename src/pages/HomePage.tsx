import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadManifest } from '../data/loader';
import type { SummaryManifestItem } from '../types';

export function HomePage() {
  const [papers, setPapers] = useState<SummaryManifestItem[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManifest()
      .then((manifest) => setPapers(manifest.papers))
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return papers;
    }
    return papers.filter((paper) => {
      const haystack = [paper.title, paper.authors, ...(paper.tags || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [papers, query]);

  return (
    <main className="shell">
      <section className="hero hero-catppuccin">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">GitHub Pages archive</p>
            <h1>Research summaries, published daily</h1>
            <p className="hero-copy">
              The same paper-summarizer output, published as a static Catppuccin-themed site.
            </p>
          </div>
          <div className="hero-stat-card">
            <div className="hero-stat-label">Currently published</div>
            <div className="hero-stat-value">{papers.length}</div>
            <div className="hero-stat-subtitle">summaries synced from saved artifacts</div>
          </div>
        </div>
        <div className="search-wrap">
          <input
            className="search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author, or tag"
          />
        </div>
      </section>

      {error ? <div className="card error-card">{error}</div> : null}

      <section className="results-header">
        <h2>Available papers</h2>
        <p>{filtered.length} entries</p>
      </section>

      <section className="card-list">
        {filtered.map((paper) => (
          <Link key={paper.paperId} className="card paper-card" to={`/papers/${paper.paperId}`}>
            <p className="eyebrow">{paper.paperId}</p>
            <h3>{paper.title}</h3>
            <p>{paper.authors}</p>
            <p className="meta-line">{paper.publishedDate || 'Unknown date'}</p>
            <div className="tag-row">
              {paper.tags?.slice(0, 4).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
