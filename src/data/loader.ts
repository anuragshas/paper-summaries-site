import type { PaperSummaryData, SummaryManifest } from '../types';

const baseUrl = import.meta.env.BASE_URL;

export interface LoadedSummary {
  summary: PaperSummaryData;
  pdfImages: string[];
}

export async function loadManifest(): Promise<SummaryManifest> {
  const response = await fetch(`${baseUrl}data/index.json`);
  if (!response.ok) {
    throw new Error('Failed to load summary index.');
  }
  return response.json() as Promise<SummaryManifest>;
}

export async function loadSummary(paperId: string): Promise<LoadedSummary> {
  const summaryUrl = `${baseUrl}data/papers/${encodeURIComponent(paperId)}/summary.json`;
  const imagesUrl = `${baseUrl}data/papers/${encodeURIComponent(paperId)}/pdf-images.json`;
  const summaryResponse = await fetch(summaryUrl);
  if (!summaryResponse.ok) {
    throw new Error('Failed to load paper summary.');
  }
  const pdfImagesResponse = await fetch(imagesUrl);
  const pdfImages = pdfImagesResponse.ok ? ((await pdfImagesResponse.json()) as string[]) : [];
  return {
    summary: (await summaryResponse.json()) as PaperSummaryData,
    pdfImages,
  };
}
