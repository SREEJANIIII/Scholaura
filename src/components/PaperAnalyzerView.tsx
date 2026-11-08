import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Layers,
  BarChart3,
  ShieldAlert,
  Lightbulb,
  BookMarked,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { ResearchPaper } from '../data/samplePapers';
import { PaperAnalysisResult } from '../types';

interface PaperAnalyzerViewProps {
  papers: ResearchPaper[];
  selectedPaperId?: string;
  onSelectPaper: (paperId: string) => void;
  analyses: Record<string, PaperAnalysisResult>;
  onSaveAnalysis: (paperId: string, analysis: PaperAnalysisResult) => void;
  onOpenUpload: () => void;
}

export const PaperAnalyzerView: React.FC<PaperAnalyzerViewProps> = ({
  papers,
  selectedPaperId,
  onSelectPaper,
  analyses,
  onSaveAnalysis,
  onOpenUpload,
}) => {
  const activePaper = papers.find((p) => p.id === selectedPaperId) || papers[0];
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentAnalysis = activePaper ? analyses[activePaper.id] : null;

  // Cycle loading steps for pleasant feedback during analysis
  useEffect(() => {
    let timer: any;
    if (loading) {
      setLoadingStep(1);
      timer = setInterval(() => {
        setLoadingStep((s) => (s < 3 ? s + 1 : s));
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const handleRunAnalysis = async (paperToAnalyze?: ResearchPaper) => {
    const target = paperToAnalyze || activePaper;
    if (!target) return;

    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          filename: target.filename,
          text: target.content,
        }),
      });

      clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({
        error: 'Invalid JSON response from server.',
      }));

      if (!res.ok) {
        throw new Error(
          data.error || `Server responded with status ${res.status}: ${res.statusText}`
        );
      }

      if (!data.analysis) {
        throw new Error('Analysis completed but returned an empty dataset.');
      }

      onSaveAnalysis(target.id, data.analysis);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('[PaperAnalyzer] Extraction error:', err);
      if (err.name === 'AbortError') {
        setError('Analysis timed out after 60 seconds. Please try again.');
      } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        setError('Network connection error: Unable to reach /api/analyze-paper. Please verify the server is running and try again.');
      } else {
        setError(err.message || 'An error occurred during paper analysis.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAnalysisAsMarkdown = () => {
    if (!currentAnalysis || !activePaper) return;
    const text = `# Research Analysis: ${currentAnalysis.title || activePaper.title}
**Authors:** ${currentAnalysis.authors?.join(', ') || activePaper.authors.join(', ')} (${currentAnalysis.publicationYearOrDate || activePaper.year})
**Field:** ${currentAnalysis.fieldOfStudy || 'Computer Science / AI'}

## Abstract
${currentAnalysis.abstractSummary}

## Core Objective
- **Problem:** ${currentAnalysis.objective?.coreProblem}
- **Hypothesis:** ${currentAnalysis.objective?.researchHypothesis}
- **Application:** ${currentAnalysis.objective?.targetApplication}

## Methodology
- **Overview:** ${currentAnalysis.methodology?.overview}
- **Techniques:** ${currentAnalysis.methodology?.keyTechniques?.join(', ')}
- **Architecture:** ${currentAnalysis.methodology?.modelArchitectureOrFramework}
- **Datasets:** ${currentAnalysis.methodology?.datasetsUsed?.join(', ')}
- **Metrics:** ${currentAnalysis.methodology?.evaluationMetrics?.join(', ')}

## Quantitative Findings
${currentAnalysis.findings?.quantitativeResults?.map((r) => `- **${r.metric}:** ${r.score} (vs ${r.baselineComparison})`).join('\n')}

## Limitations
${currentAnalysis.limitations?.map((l) => `- [${l.severity}] ${l.category}: ${l.description}`).join('\n')}

## Research Gap & Future Work
${currentAnalysis.researchGapAndFutureWork?.unaddressedGaps?.map((g) => `- ${g}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAnalysisFile = () => {
    if (!currentAnalysis || !activePaper) return;
    const element = document.createElement('a');
    const file = new Blob([
      `# Analysis Report: ${currentAnalysis.title || activePaper.title}\n\n` +
      `Abstract:\n${currentAnalysis.abstractSummary}\n\n` +
      `Objective:\n${currentAnalysis.objective?.coreProblem}\n\n` +
      `Methodology:\n${currentAnalysis.methodology?.overview}\n\n` +
      `Findings:\n${currentAnalysis.findings?.keyTakeaways?.join('\n')}\n\n` +
      `Limitations:\n${currentAnalysis.limitations?.map((l) => `${l.description}`).join('\n')}\n\n` +
      `Research Gaps:\n${currentAnalysis.researchGapAndFutureWork?.unaddressedGaps?.join('\n')}`
    ], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${activePaper.filename.replace(/\.[^/.]+$/, '')}_analysis.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            <span>Research Paper Analyzer</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Extract objectives, methodology, quantitative results, limitations, and future research gaps.
          </p>
        </div>

        {/* Paper Selector Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={activePaper?.id || ''}
            onChange={(e) => onSelectPaper(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 max-w-[240px] truncate"
          >
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.year})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleRunAnalysis()}
            disabled={loading || !activePaper}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{currentAnalysis ? 'Re-Analyze' : 'Analyze Paper'}</span>
          </button>
        </div>
      </div>

      {/* Document Overview Strip */}
      {activePaper && (
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold font-mono text-slate-400">TARGET:</span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activePaper.title}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>{activePaper.authors.join(', ')}</span>
              <span aria-hidden="true">·</span>
              <span>{activePaper.venue || activePaper.year}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activePaper.pageCount} pages</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activePaper.wordCount.toLocaleString()} words</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentAnalysis && (
              <>
                <button
                  onClick={copyAnalysisAsMarkdown}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Report'}</span>
                </button>
                <button
                  onClick={downloadAnalysisFile}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <div className="font-semibold text-sm mb-0.5">Analysis Request Error</div>
              <p className="text-red-600 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
          </div>
          <button
            onClick={() => handleRunAnalysis()}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 dark:bg-red-900/60 hover:bg-red-200 dark:hover:bg-red-800 text-red-800 dark:text-red-200 font-semibold rounded-md transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* Loading state with step feedback */}
      {loading && (
        <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Scholaura Paper Analysis in Progress
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Extracting structured scholarly conclusions anchored in &ldquo;{activePaper?.title}&rdquo;
            </p>
          </div>

          <div className="max-w-md mx-auto grid grid-cols-3 gap-2 pt-2 text-left">
            <div className={`p-2.5 rounded-lg border text-xs ${loadingStep >= 1 ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
              <div className="font-bold">1. Reading Text</div>
              <div className="text-[10px] text-slate-500">Abstract & Problems</div>
            </div>
            <div className={`p-2.5 rounded-lg border text-xs ${loadingStep >= 2 ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
              <div className="font-bold">2. Architecture</div>
              <div className="text-[10px] text-slate-500">Methods & Metrics</div>
            </div>
            <div className={`p-2.5 rounded-lg border text-xs ${loadingStep >= 3 ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-medium' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
              <div className="font-bold">3. Synthesis</div>
              <div className="text-[10px] text-slate-500">Gaps & Validity</div>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Output */}
      {currentAnalysis && !loading && (
        <div className="space-y-6">
          {/* Executive Abstract */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Abstract & Executive Summary
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {currentAnalysis.abstractSummary}
            </p>
          </div>

          {/* Core Objectives & Problem Formulation */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Research Objective & Hypothesis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  1. Core Research Problem:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {currentAnalysis.objective?.coreProblem}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  2. Central Hypothesis:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {currentAnalysis.objective?.researchHypothesis}
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  3. Target Application:
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {currentAnalysis.objective?.targetApplication}
                </p>
              </div>
            </div>
          </div>

          {/* Methodology Breakdown */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Methodology & Technical Architecture
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Methodological Overview:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {currentAnalysis.methodology?.overview}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Model Architecture & Math:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {currentAnalysis.methodology?.modelArchitectureOrFramework}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Hardware, Compute & Training:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 font-mono text-xs">
                    {currentAnalysis.methodology?.experimentalSetupAndHardware}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Key Techniques Used:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAnalysis.methodology?.keyTechniques?.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Evaluation Benchmarks & Datasets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {currentAnalysis.methodology?.datasetsUsed?.map((ds, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {ds}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quantitative Findings & Benchmarks */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Empirical Findings & Quantitative Results
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Direct metrics and comparison with reported baseline systems
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 px-3 font-semibold">Evaluation Metric / Benchmark</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Reported Score</th>
                    <th className="py-2.5 px-3 font-semibold">Comparison Against Baseline / SOTA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {currentAnalysis.findings?.quantitativeResults?.map((res, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                        {res.metric}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold text-right tabular-nums">
                        {res.score}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {res.baselineComparison}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentAnalysis.findings?.keyTakeaways && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block mb-1.5">
                  Core Scientific Takeaways:
                </span>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                  {currentAnalysis.findings.keyTakeaways.map((takeaway, i) => (
                    <li key={i}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Limitations & Threats to Validity */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Identified Limitations & Threats to Validity
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Documented weaknesses, architectural constraints, and sample boundaries
            </p>

            <div className="space-y-2.5">
              {currentAnalysis.limitations?.map((lim, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3"
                >
                  <span className="text-xs font-mono text-amber-600 dark:text-amber-400 shrink-0">
                    [{lim.category} · {lim.severity}]
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    {lim.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Research Gap & Actionable Future Directions */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Research Gap & Recommended Future Research
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Open scholarly opportunities identified by the agent
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                  Unaddressed Research Gaps:
                </span>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-400">
                  {currentAnalysis.researchGapAndFutureWork?.unaddressedGaps?.map((gap, i) => (
                    <li key={i}>{gap}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                  Suggested Future Investigations:
                </span>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-400">
                  {currentAnalysis.researchGapAndFutureWork?.suggestedFutureResearch?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no analysis performed yet */}
      {!currentAnalysis && !loading && activePaper && (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Ready to Analyze &ldquo;{activePaper.title}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Click &ldquo;Analyze Paper&rdquo; to extract objectives, methodology, quantitative benchmarks, limitations, and future research gaps.
          </p>
          <button
            onClick={() => handleRunAnalysis()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Run Deep Analysis</span>
          </button>
        </div>
      )}
    </div>
  );
};
