export type FigureBoundingBox = { ymin: number; xmin: number; ymax: number; xmax: number };

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
  basePath: string;
  count: number;
  papers: SummaryManifestItem[];
}

export interface PaperSummaryData {
  title: string;
  authors: string;
  institutions: string;
  venue: string;
  year: string;
  url: string;
  tags: { name: string; type: 'primary' | 'topic' }[];
  subTopics: string[];
  thesis: string;
  coreProblem: {
    statement: string;
    whyItMatters: string[];
    concreteExample: string;
  };
  keyNovelty: {
    main: string;
    explanation: string[];
  };
  architectureFigure?: {
    figureNumber?: number;
    pageIndex: number;
    boundingBox: FigureBoundingBox;
    caption: string;
  };
  evaluationHighlights: string[];
  breakthroughAssessment: {
    score: number;
    justification: string;
  };
  technicalDetails: {
    problemDefinition: { label: string; value: string }[];
    pipelineFlow: string[];
    systemModules: { name: string; role: string; details: string }[];
    modeling: { label: string; value: string; list?: string[] }[];
    comparisonToPriorWork: string[];
    limitations: string[];
    reproducibility: string;
  };
  experiments: {
    evaluationSetup: {
      setting: string;
      benchmarks: string[];
      metrics: string[];
    };
    keyResults: {
      benchmark: string;
      metric: string;
      baseline: string;
      thisPaper: string;
      delta: string;
      isPositive: boolean;
    }[];
    keyResultGroups?: {
      title: string;
      keyResults: {
        benchmark: string;
        metric: string;
        baseline: string;
        thisPaper: string;
        delta: string;
        isPositive: boolean;
      }[];
    }[];
    experimentFigures?: {
      figureNumber?: number;
      pageIndex: number;
      boundingBox: FigureBoundingBox;
      caption: string;
    }[];
    mainTakeaways: string[];
  };
  prerequisiteKnowledge: {
    prerequisites: string[];
    keyTerms: { term: string; definition: string }[];
  };
}
