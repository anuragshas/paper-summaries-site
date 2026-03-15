import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { PaperSummaryData } from '../types';
import { CroppedImage } from './CroppedImage';

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: () => Promise<unknown>;
    };
  }
}

export function PaperSummary({ data, pdfImages }: { data: PaperSummaryData; pdfImages: string[] }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    technical: false,
    experiments: false,
    prerequisites: false,
  });
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleImageClick = (src: string, alt: string) => {
    setModalImage({ src, alt });
  };

  const parseFigureNumberFromCaption = (caption?: string): number | null => {
    if (!caption) return null;
    const match = caption.match(/\bfig(?:ure)?\.?\s*(\d+)\b/i);
    if (!match?.[1]) return null;
    const num = Number(match[1]);
    return Number.isFinite(num) ? num : null;
  };

  const resolvePageIndex = (pageIndex?: number): number | null => {
    if (!Number.isInteger(pageIndex)) return null;
    const idx = Number(pageIndex);
    return idx >= 0 && idx < pdfImages.length ? idx : null;
  };

  const hasValidBoundingBox = (
    bbox?: { ymin: number; xmin: number; ymax: number; xmax: number },
  ): boolean => {
    if (!bbox || typeof bbox !== 'object') return false;
    return (
      Number.isFinite(bbox.ymin) &&
      Number.isFinite(bbox.xmin) &&
      Number.isFinite(bbox.ymax) &&
      Number.isFinite(bbox.xmax) &&
      bbox.ymax - bbox.ymin > 0 &&
      bbox.xmax - bbox.xmin > 0
    );
  };

  const renderTextWithLinks = (text?: string): React.ReactNode => {
    if (!text) return null;
    const markdownLinkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
    const plainUrlPattern = /(https?:\/\/[^\s<>()]+|www\.[^\s<>()]+)/g;

    const nodes: React.ReactNode[] = [];
    let cursor = 0;
    let markdownMatch: RegExpExecArray | null;
    let key = 0;

    while ((markdownMatch = markdownLinkPattern.exec(text)) !== null) {
      const fullMatch = markdownMatch[0];
      const label = markdownMatch[1];
      const href = markdownMatch[2];
      const start = markdownMatch.index;
      if (start > cursor) {
        nodes.push(text.slice(cursor, start));
      }
      nodes.push(
        <a key={`md-${key++}`} href={href} target="_blank" rel="noreferrer" className="text-[#1e66f5] hover:underline break-all">
          {label}
        </a>,
      );
      cursor = start + fullMatch.length;
    }

    const remaining = text.slice(cursor);
    let segmentCursor = 0;
    let urlMatch: RegExpExecArray | null;
    while ((urlMatch = plainUrlPattern.exec(remaining)) !== null) {
      const matchText = urlMatch[0];
      const start = urlMatch.index;
      if (start > segmentCursor) {
        nodes.push(remaining.slice(segmentCursor, start));
      }
      const trailingPunctuationMatch = matchText.match(/[.,;:!?]+$/);
      const trailingPunctuation = trailingPunctuationMatch ? trailingPunctuationMatch[0] : '';
      const cleanUrl = trailingPunctuation ? matchText.slice(0, -trailingPunctuation.length) : matchText;
      const href = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
      nodes.push(
        <a key={`url-${key++}`} href={href} target="_blank" rel="noreferrer" className="text-[#1e66f5] hover:underline break-all">
          {cleanUrl}
        </a>,
      );
      if (trailingPunctuation) {
        nodes.push(trailingPunctuation);
      }
      segmentCursor = start + matchText.length;
    }
    if (segmentCursor < remaining.length) {
      nodes.push(remaining.slice(segmentCursor));
    }

    return nodes;
  };

  const architectureCaptionPattern = /\b(architecture|framework|overview|pipeline|diagram)\b/i;
  const keyResultGroups =
    data.experiments?.keyResultGroups?.filter(
      (group) => group && Array.isArray(group.keyResults) && group.keyResults.length > 0,
    ) ?? [];
  const keyResultsRows =
    data.experiments?.keyResults && data.experiments.keyResults.length > 0
      ? data.experiments.keyResults
      : keyResultGroups.flatMap((group) => group.keyResults);

  const renderResultsTable = (
    rows: { benchmark: string; metric: string; baseline: string; thisPaper: string; delta: string; isPositive: boolean }[],
  ) => (
    <table className="w-full min-w-[620px] border-collapse text-xs sm:text-sm">
      <thead>
        <tr>
          <th className="bg-[#e6e9ef] p-2.5 text-left font-semibold text-[#5c5f77] border-b-2 border-[#bcc0cc]">Benchmark</th>
          <th className="bg-[#e6e9ef] p-2.5 text-left font-semibold text-[#5c5f77] border-b-2 border-[#bcc0cc]">Metric</th>
          <th className="bg-[#e6e9ef] p-2.5 text-left font-semibold text-[#5c5f77] border-b-2 border-[#bcc0cc]">Baseline</th>
          <th className="bg-[#e6e9ef] p-2.5 text-left font-semibold text-[#5c5f77] border-b-2 border-[#bcc0cc]">This Paper</th>
          <th className="bg-[#e6e9ef] p-2.5 text-left font-semibold text-[#5c5f77] border-b-2 border-[#bcc0cc]">Delta</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((res, i) => (
          <tr key={i} className="hover:bg-[#e6e9ef]">
            <td className="p-2.5 border-b border-[#bcc0cc] text-[#4c4f69]">{res.benchmark}</td>
            <td className="p-2.5 border-b border-[#bcc0cc] text-[#4c4f69]">{res.metric}</td>
            <td className="p-2.5 border-b border-[#bcc0cc] text-[#4c4f69]">{res.baseline}</td>
            <td className="p-2.5 border-b border-[#bcc0cc] text-[#4c4f69]"><strong>{res.thisPaper}</strong></td>
            <td className={`p-2.5 border-b border-[#bcc0cc] font-semibold ${res.isPositive ? 'text-[#40a02b]' : 'text-[#d20f39]'}`}>
              {res.delta}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const pickArchitectureFigure = () => {
    const direct = data.architectureFigure;
    if (direct && resolvePageIndex(direct.pageIndex) !== null && hasValidBoundingBox(direct.boundingBox)) {
      return direct;
    }

    const candidates = data.experiments?.experimentFigures ?? [];
    const byCaption = candidates.find(
      (fig) =>
        resolvePageIndex(fig.pageIndex) !== null &&
        hasValidBoundingBox(fig.boundingBox) &&
        architectureCaptionPattern.test(fig.caption || ''),
    );
    if (byCaption) return byCaption;

    return null;
  };

  const architectureFigure = pickArchitectureFigure();
  const architecturePageIndex = architectureFigure ? resolvePageIndex(architectureFigure.pageIndex) : null;
  const architectureFigureNumber =
    architectureFigure?.figureNumber ?? parseFigureNumberFromCaption(architectureFigure?.caption) ?? 1;

  const rawBreakthroughScore = Number(data.breakthroughAssessment?.score ?? 0);
  const normalizedBreakthroughScore = Number.isFinite(rawBreakthroughScore)
    ? Math.max(0, Math.min(10, rawBreakthroughScore <= 5 ? rawBreakthroughScore * 2 : rawBreakthroughScore))
    : 0;

  const breakthroughScoreClass =
    normalizedBreakthroughScore < 2.5 ? 'bg-[#d20f39]' :
      normalizedBreakthroughScore < 4.5 ? 'bg-[#fe640b]' :
        normalizedBreakthroughScore < 6.5 ? 'bg-[#df8e1d]' :
          normalizedBreakthroughScore < 8.5 ? 'bg-[#04a5e5]' :
            'bg-[#1e66f5]';

  useEffect(() => {
    const runTypeset = async () => {
      if (window.MathJax?.typesetPromise) {
        try {
          await window.MathJax.typesetPromise();
        } catch (error) {
          console.error('MathJax typeset failed:', error);
        }
      }
    };
    void runTypeset();
  }, [data, openSections, modalImage]);

  return (
    <div className="max-w-[1100px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-5 bg-[#dce0e8] font-sans text-[#4c4f69] leading-relaxed text-[13px] sm:text-[15px] md:text-[16px] break-words overflow-x-hidden">
      <div className="bg-[#eff1f5] rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 shadow-sm">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#4c4f69] m-0 mb-3 leading-tight">
          <a href={data.url} target="_blank" rel="noreferrer" className="text-[#1e66f5] hover:underline break-words">
            {data.title}
          </a>
        </h1>
        <div className="text-[#5c5f77] text-sm sm:text-base mb-2">{data.authors}</div>
        <div className="text-[#6c6f85] text-xs sm:text-sm mb-3">{data.institutions}</div>
        <div className="text-[#5c5f77] text-sm sm:text-base mb-3">{data.venue} ({data.year})</div>
        <div className="flex flex-wrap gap-2 mt-3">
          {data.tags?.map((tag, i) => (
            <span key={i} className={`inline-block text-xs font-medium px-3 py-1 rounded-full select-none ${tag.type === 'primary' ? 'bg-[#8839ef] text-[#eff1f5]' : 'bg-[#e6e9ef] text-[#1e66f5]'}`}>
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-[#eff1f5] rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 shadow-sm">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-[#4c4f69] m-0 mb-4 pb-2 border-b-2 border-[#1e66f5]">📝 Paper Summary</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.subTopics?.map((topic, i) => (
            <span key={i} className="inline-block bg-[#e6e9ef] text-[#8839ef] text-xs px-2.5 py-1 rounded-full">{topic}</span>
          ))}
        </div>
        <div className="mb-5">
          <div className="text-base sm:text-lg font-medium text-[#4c4f69] bg-gradient-to-br from-[#e6e9ef] to-[#bcc0cc] p-3 sm:p-4 rounded-lg border-l-4 border-[#1e66f5]">{data.thesis}</div>
        </div>
        <div className="mb-5">
          <div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Core Problem</div>
          <div className="text-sm sm:text-base text-[#4c4f69] mb-3">{data.coreProblem?.statement}</div>
          <div className="mt-3">
            <em className="text-[#5c5f77]">Why it matters:</em>
            <ul className="mt-2 pl-5 list-disc text-[#5c5f77]">
              {data.coreProblem?.whyItMatters?.map((item, i) => <li key={i} className="mb-1.5">{item}</li>)}
            </ul>
          </div>
          {data.coreProblem?.concreteExample && (
            <div className="mt-3 p-3 bg-[#e6e9ef] border-l-4 border-[#1e66f5] rounded">
              <strong className="text-[#1e66f5] block mb-1">Concrete Example:</strong>
              <span className="text-[#4c4f69]">{data.coreProblem.concreteExample}</span>
            </div>
          )}
        </div>
        <div className="mb-5">
          <div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Key Novelty</div>
          <div className="bg-[#dce0e8] border border-[#7287fd] rounded-lg p-4">
            <div className="font-semibold text-[#8839ef] mb-2">{data.keyNovelty?.main}</div>
            <ul className="mt-2 pl-5 list-disc marker:text-[#7287fd] text-[#4c4f69]">
              {data.keyNovelty?.explanation?.map((item, i) => <li key={i} className="mb-1">{item}</li>)}
            </ul>
          </div>
        </div>
        <div className="mb-5">
          <div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Evaluation Highlights</div>
          <ul className="m-0 pl-5 list-disc text-[#5c5f77]">
            {data.evaluationHighlights?.map((item, i) => <li key={i} className="mb-1.5">{item}</li>)}
          </ul>
        </div>
        <div className="mb-5">
          <div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Breakthrough Assessment</div>
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-sm sm:text-base font-bold text-[#eff1f5] shrink-0 ${breakthroughScoreClass}`}>
              {normalizedBreakthroughScore.toFixed(1)}/10
            </div>
            <div className="flex-1 text-[#5c5f77] text-sm sm:text-base">{data.breakthroughAssessment?.justification}</div>
          </div>
        </div>
      </div>

      <div className="bg-[#eff1f5] rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 shadow-sm">
        <h2 className={`text-base sm:text-lg md:text-xl font-semibold text-[#4c4f69] m-0 cursor-pointer flex justify-between items-center ${openSections.technical ? 'mb-4 pb-2 border-b-2 border-[#1e66f5]' : 'border-b-2 border-[#1e66f5] pb-2'}`} onClick={() => toggleSection('technical')}>
          ⚙️ Technical Details
          {openSections.technical ? <ChevronDown size={18} className="text-[#8c8fa1]" /> : <ChevronRight size={18} className="text-[#8c8fa1]" />}
        </h2>
        {openSections.technical && (
          <div className="pt-4">
            {architectureFigure && architecturePageIndex !== null && (
              <div className="mb-5 text-center">
                <div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide text-left">Architecture</div>
                <div className="bg-[#eff1f5] border border-[#bcc0cc] rounded-lg shadow-sm p-4 inline-block max-w-full">
                  <div className="text-xs text-[#6c6f85] mb-2 text-left">{`Figure ${architectureFigureNumber} • Page ${architecturePageIndex + 1}`}</div>
                  <CroppedImage base64Image={pdfImages[architecturePageIndex]} boundingBox={architectureFigure.boundingBox} alt={`Architecture Figure ${architectureFigureNumber}`} className="max-w-full h-auto rounded cursor-pointer hover:scale-[1.02] transition-transform mobile-figure" onClick={(src) => handleImageClick(src, `Architecture Figure ${architectureFigureNumber}`)} />
                  <div className="mt-3 text-sm text-[#5c5f77] italic leading-relaxed px-4">{architectureFigure.caption}</div>
                </div>
              </div>
            )}
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Problem Definition</div><div className="bg-[#e6e9ef] rounded-lg p-4">{data.technicalDetails?.problemDefinition?.map((item, i) => <div key={i} className="mb-2 last:mb-0 leading-relaxed"><strong>{item.label}:</strong> {item.value}</div>)}</div></div>
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Pipeline Flow</div><div className="bg-[#e6e9ef] p-4 rounded-lg"><ol className="m-0 pl-5 list-decimal text-[#5c5f77]">{data.technicalDetails?.pipelineFlow?.map((item, i) => <li key={i} className="mb-1.5">{item}</li>)}</ol></div><div className="mt-4 pl-4 border-l-4 border-[#bcc0cc]"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-3 uppercase tracking-wide">System Modules</div>{data.technicalDetails?.systemModules?.map((mod, i) => <div key={i} className="bg-[#eff1f5] border border-[#bcc0cc] rounded-lg p-4 mb-3 last:mb-0"><div className="font-semibold text-[#4c4f69] mb-1">{mod.name}</div><div className="text-xs sm:text-sm text-[#6c6f85] mb-2">{mod.role}</div><div className="text-[11px] sm:text-xs text-[#8c8fa1]">{mod.details}</div></div>)}</div></div>
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Modeling</div><div className="bg-[#eff1f5] border border-[#bcc0cc] rounded-lg p-4">{data.technicalDetails?.modeling?.map((item, i) => <div key={i} className="mb-3 last:mb-0"><strong>{item.label}:</strong> {item.value}{item.list && item.list.length > 0 && <ul className="mt-1 pl-5 list-disc text-sm">{item.list.map((li, j) => <li key={j}>{li}</li>)}</ul>}</div>)}</div></div>
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Comparison to Prior Work</div><ul className="m-0 pl-5 list-disc text-[#5c5f77]">{data.technicalDetails?.comparisonToPriorWork?.map((item, i) => <li key={i} className="mb-1.5">{item}</li>)}</ul></div>
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Limitations</div><ul className="m-0 pl-5 list-disc text-[#5c5f77]">{data.technicalDetails?.limitations?.map((item, i) => <li key={i} className="mb-1.5">{item}</li>)}</ul></div>
            <div className="mb-0"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Reproducibility</div><div className="bg-[#eff1f5] border border-[#bcc0cc] rounded-lg p-4 text-sm">{renderTextWithLinks(data.technicalDetails?.reproducibility)}</div></div>
          </div>
        )}
      </div>

      <div className="bg-[#eff1f5] rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 shadow-sm">
        <h2 className={`text-base sm:text-lg md:text-xl font-semibold text-[#4c4f69] m-0 cursor-pointer flex justify-between items-center ${openSections.experiments ? 'mb-4 pb-2 border-b-2 border-[#1e66f5]' : 'border-b-2 border-[#1e66f5] pb-2'}`} onClick={() => toggleSection('experiments')}>
          📊 Experiments & Results
          {openSections.experiments ? <ChevronDown size={18} className="text-[#8c8fa1]" /> : <ChevronRight size={18} className="text-[#8c8fa1]" />}
        </h2>
        {openSections.experiments && (
          <div className="pt-4">
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Evaluation Setup</div><div className="bg-[#e6e9ef] border-l-4 border-[#40a02b] p-3 mb-4 rounded-r-lg">{data.experiments?.evaluationSetup?.setting}</div><div className="mb-2"><strong>Benchmarks:</strong></div><ul className="m-0 pl-5 list-disc mb-3">{data.experiments?.evaluationSetup?.benchmarks?.map((b, i) => <li key={i}>{b}</li>)}</ul><div className="mb-2"><strong>Metrics:</strong></div><ul className="m-0 pl-5 list-disc">{data.experiments?.evaluationSetup?.metrics?.map((m, i) => <li key={i}>{m}</li>)}</ul></div>
            <div className="mb-5 overflow-x-auto results-table-wrap"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Key Results</div>{renderResultsTable(keyResultsRows)}</div>
            {data.experiments?.experimentFigures && data.experiments.experimentFigures.length > 0 && <div className="mb-5 mt-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Experiment Figures</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">{data.experiments.experimentFigures.map((fig, i) => { const resolvedPageIndex = resolvePageIndex(fig.pageIndex); if (resolvedPageIndex === null || !hasValidBoundingBox(fig.boundingBox)) return null; const figureNumber = fig.figureNumber ?? parseFigureNumberFromCaption(fig.caption) ?? i + 1; const figureLabel = `Experiment Figure ${figureNumber}`; return <div key={i} className="text-center"><div className="bg-[#eff1f5] border border-[#bcc0cc] rounded-lg shadow-sm p-4 inline-block max-w-full"><div className="text-xs text-[#6c6f85] mb-2 text-left">{`Figure ${figureNumber} • Page ${resolvedPageIndex + 1}`}</div><CroppedImage base64Image={pdfImages[resolvedPageIndex]} boundingBox={fig.boundingBox} alt={figureLabel} className="max-w-full h-auto rounded cursor-pointer hover:scale-[1.02] transition-transform mobile-figure" onClick={(src) => handleImageClick(src, figureLabel)} /><div className="mt-3 text-sm text-[#5c5f77] italic leading-relaxed px-4 break-words">{fig.caption}</div></div></div>; })}</div></div>}
            <div className="mb-0"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Main Takeaways</div><ul className="m-0 pl-5 list-disc text-[#4c4f69]">{data.experiments?.mainTakeaways?.map((item, i) => <li key={i} className="mb-2">{item}</li>)}</ul></div>
          </div>
        )}
      </div>

      <div className="bg-[#eff1f5] rounded-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-5 shadow-sm">
        <h2 className={`text-base sm:text-lg md:text-xl font-semibold text-[#4c4f69] m-0 cursor-pointer flex justify-between items-center ${openSections.prerequisites ? 'mb-4 pb-2 border-b-2 border-[#1e66f5]' : 'border-b-2 border-[#1e66f5] pb-2'}`} onClick={() => toggleSection('prerequisites')}>
          📚 Prerequisite Knowledge
          {openSections.prerequisites ? <ChevronDown size={18} className="text-[#8c8fa1]" /> : <ChevronRight size={18} className="text-[#8c8fa1]" />}
        </h2>
        {openSections.prerequisites && (
          <div className="pt-4">
            <div className="mb-5"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Prerequisites</div><ul className="m-0 pl-5 list-disc text-[#5c5f77]">{data.prerequisiteKnowledge?.prerequisites?.map((item, i) => <li key={i} className="mb-1.5">{item}</li>)}</ul></div>
            <div className="mb-0"><div className="text-xs sm:text-sm font-semibold text-[#5c5f77] mb-2 uppercase tracking-wide">Key Terms</div><div className="grid gap-3">{data.prerequisiteKnowledge?.keyTerms?.map((item, i) => <div key={i} className="bg-[#e6e9ef] p-3 rounded-lg text-sm sm:text-base leading-relaxed"><strong>{item.term}:</strong> {item.definition}</div>)}</div></div>
          </div>
        )}
      </div>

      <div className="text-center text-[#8c8fa1] text-xs sm:text-sm mt-8 sm:mt-10 p-4 sm:p-5">Generated using Gemini API</div>

      {modalImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#4c4f69]/80 cursor-pointer" onClick={() => setModalImage(null)}>
          <span className="absolute top-3 right-4 sm:top-5 sm:right-8 text-[#eff1f5] text-3xl sm:text-4xl font-bold hover:text-[#4c4f69] transition-colors">&times;</span>
          <img src={modalImage.src} alt={modalImage.alt} className="max-w-[90%] max-h-[90%] object-contain rounded" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 text-[#eff1f5] text-xs sm:text-sm text-center max-w-[85%] sm:max-w-[80%]">{modalImage.alt}</div>
        </div>
      )}
    </div>
  );
}
