import type { PaperSummaryData, SummaryManifest } from '../types';

const baseUrl = import.meta.env.BASE_URL;

export async function loadManifest(): Promise<SummaryManifest> {
  const response = await fetch(`${baseUrl}data/index.json`);
  if (!response.ok) {
    throw new Error('Failed to load summary index.');
  }
  return response.json() as Promise<SummaryManifest>;
}

export async function loadSummary(paperId: string): Promise<PaperSummaryData> {
  const response = await fetch(
    `${baseUrl}data/papers/${encodeURIComponent(paperId)}/summary.json`,
  );
  if (!response.ok) {
    throw new Error('Failed to load paper summary.');
  }
  return response.json() as Promise<PaperSummaryData>;
}
