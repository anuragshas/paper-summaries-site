import type { PaperSummaryData } from '../types';

function renderList(items?: string[]) {
  if (!items || items.length === 0) {
    return <li>Not specified</li>;
  }
  return items.map((item) => <li key={item}>{item}</li>);
}

export function PaperSummary({ summary }: { summary: PaperSummaryData }) {
  return (
    <div className="paper-layout">
      <section className="card hero-card">
        <p className="eyebrow">Paper summary</p>
        <h1>{summary.title || 'Untitled paper'}</h1>
        <p className="meta-line">{summary.authors || 'Unknown authors'}</p>
        <p className="meta-line">
          {[summary.venue, summary.year].filter(Boolean).join(' - ') || 'Venue not specified'}
        </p>
        {summary.url ? (
          <p>
            <a href={summary.url} target="_blank" rel="noreferrer">
              Open source paper
            </a>
          </p>
        ) : null}
      </section>

      <section className="card">
        <h2>Thesis</h2>
        <p>{summary.thesis || 'Not specified'}</p>
      </section>

      <section className="card-grid">
        <article className="card">
          <h2>Core Problem</h2>
          <p>{summary.coreProblem?.statement || 'Not specified'}</p>
          <ul>{renderList(summary.coreProblem?.whyItMatters)}</ul>
        </article>
        <article className="card">
          <h2>Key Novelty</h2>
          <p>{summary.keyNovelty?.main || 'Not specified'}</p>
          <ul>{renderList(summary.keyNovelty?.explanation)}</ul>
        </article>
      </section>

      <section className="card-grid">
        <article className="card">
          <h2>Results</h2>
          <ul>{renderList(summary.experiments?.mainTakeaways)}</ul>
        </article>
        <article className="card">
          <h2>Evaluation Highlights</h2>
          <ul>{renderList(summary.evaluationHighlights)}</ul>
        </article>
      </section>

      <section className="card-grid">
        <article className="card">
          <h2>Limitations</h2>
          <ul>{renderList(summary.technicalDetails?.limitations)}</ul>
        </article>
      </section>

      <section className="card">
        <h2>Raw JSON</h2>
        <pre>{JSON.stringify(summary, null, 2)}</pre>
      </section>
    </div>
  );
}
