export interface SummaryManifestItem {
  paperId: string;
  title: string;
  authors: string;
  publishedDate?: string | null;
  tags: string[];
  sourceUrl?: string;
  summaryPath: string;
  metaPath: string;
  pagePath: string;
}

export interface SummaryManifest {
  generatedAt: string;
  basePath: string;
  count: number;
  papers: SummaryManifestItem[];
}

export interface PaperSummaryData {
  title?: string;
  authors?: string;
  institutions?: string;
  venue?: string;
  year?: string;
  url?: string;
  thesis?: string;
  subTopics?: string[];
  evaluationHighlights?: string[];
  technicalDetails?: {
    limitations?: string[];
  };
  experiments?: {
    mainTakeaways?: string[];
  };
  coreProblem?: {
    statement?: string;
    whyItMatters?: string[];
    concreteExample?: string;
  };
  keyNovelty?: {
    main?: string;
    explanation?: string[];
  };
  [key: string]: unknown;
}
