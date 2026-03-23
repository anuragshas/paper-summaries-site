import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadManifest, loadManifestPage, loadSearchIndex } from '../data/loader';
import type { SummaryManifest, SummaryManifestItem, SummarySearchItem } from '../types';

function formatPublishedDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [manifest, setManifest] = useState<SummaryManifest | null>(null);
  const [pagePapers, setPagePapers] = useState<SummaryManifestItem[]>([]);
  const [searchPapers, setSearchPapers] = useState<SummarySearchItem[] | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const rawPage = Number(searchParams.get('page') || '1');
  const currentPage = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

  useEffect(() => {
    loadManifest()
      .then((loadedManifest) => {
        setManifest(loadedManifest);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!query.trim() || searchPapers) return;
    loadSearchIndex()
      .then((loadedIndex) => {
        setSearchPapers(loadedIndex.papers);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, [query, searchPapers]);

  useEffect(() => {
    if (!manifest || query.trim()) return;
    const safePage = Math.min(currentPage, Math.max(manifest.totalPages, 1));
    if (safePage !== currentPage) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(safePage));
        return next;
      }, { replace: true });
      return;
    }
    loadManifestPage(safePage)
      .then((page) => {
        setPagePapers(page.papers);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, [manifest, currentPage, query, setSearchParams]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return pagePapers;
    }
    return (searchPapers ?? []).filter((paper) => {
      const haystack = [paper.title, ...(paper.tags || [])]
        .join(' ')
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [pagePapers, query, searchPapers]);

  const pageSize = manifest?.pageSize ?? 10;
  const isSearching = query.trim().length > 0;
  const totalCount = manifest?.count ?? 0;
  const totalPages = isSearching ? Math.max(1, Math.ceil(filtered.length / pageSize)) : Math.max(manifest?.totalPages ?? 1, 1);
  const averageBreakthroughScore = manifest?.averageBreakthroughScore;
  const scoredPaperCount = manifest?.scoredPaperCount ?? 0;

  const visiblePapers = useMemo(() => {
    if (!isSearching) return filtered;
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [currentPage, filtered, isSearching, pageSize]);

  useEffect(() => {
    if (!manifest) return;
    const safePage = Math.min(currentPage, totalPages);
    if (safePage === currentPage) return;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(safePage));
      return next;
    }, { replace: true });
  }, [currentPage, manifest, setSearchParams, totalPages]);

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(safePage));
      return next;
    });
  };

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
  }, [currentPage, totalPages]);

  return (
    <main className="shell">
      <section className="hero hero-catppuccin">
        <div className="hero-grid">
          <div>
            <p className="eyebrow">anuragshas arxiv</p>
            <h1>Research summaries, published daily</h1>
          </div>
          <div className="hero-stats-grid">
            <div className="hero-stat-card">
              <div className="hero-stat-label">Currently published</div>
              <div className="hero-stat-value">{totalCount}</div>
              <div className="hero-stat-subtitle">summaries</div>
            </div>
            <div className="hero-stat-card hero-stat-card-score">
              <div className="hero-stat-label">Average breakthrough</div>
              <div className="hero-stat-value hero-stat-value-score">
                {averageBreakthroughScore !== undefined && averageBreakthroughScore !== null ? averageBreakthroughScore.toFixed(1) : '--'}
              </div>
              <div className="hero-stat-subtitle">across {scoredPaperCount} scored papers</div>
            </div>
          </div>
        </div>
        <div className="search-wrap">
          <input
            className="search"
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('page', '1');
                return next;
              }, { replace: true });
            }}
            placeholder="Search by paper title or tag"
          />
        </div>
      </section>

      {error ? <div className="card error-card">{error}</div> : null}

      <section className="results-header">
        <h2>{isSearching ? 'Search results' : 'Available papers'}</h2>
        <p>
          {isSearching ? `${filtered.length} matching entries` : `Page ${currentPage} of ${totalPages}`}
        </p>
      </section>

      <section className="card-list">
        {visiblePapers.map((paper) => (
          <Link key={paper.paperId} className="card paper-card" to={`/papers/${paper.paperId}`}>
            <>
            <div className="paper-card-header">
              <p className="eyebrow paper-id">{paper.paperId}</p>
              {formatPublishedDate(paper.publishedDate) ? <p className="paper-date">{formatPublishedDate(paper.publishedDate)}</p> : null}
            </div>
            <h3 className="paper-card-title">{paper.title}</h3>
            <p className="paper-card-authors">{paper.authors}</p>
            <div className="tag-row">
              {paper.tags?.slice(0, 4).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            </>
          </Link>
        ))}
      </section>

      <nav className="pagination" aria-label="Pagination">
        <button className="pagination-button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
          Prev
        </button>
        <div className="pagination-pages">
          {pageNumbers.map((page) => (
            <button
              key={page}
              className={`pagination-button ${page === currentPage ? 'is-active' : ''}`}
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
        <button className="pagination-button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </button>
      </nav>
    </main>
  );
}
