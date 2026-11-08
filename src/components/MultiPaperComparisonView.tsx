import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  Copy,
  Check,
  Download,
  Table,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ResearchPaper } from '../data/samplePapers';
import { PaperComparisonResult } from '../types';

interface MultiPaperComparisonViewProps {
  papers: ResearchPaper[];
}

export const MultiPaperComparisonView: React.FC<MultiPaperComparisonViewProps> = ({ papers }) => {
  // Pre-select first 2-3 papers by default
  const [selectedIds, setSelectedIds] = useState<string[]>(
    papers.slice(0, Math.min(3, papers.length)).map((p) => p.id)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<PaperComparisonResult | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleSelectPaper = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(papers.map((p) => p.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) {
      setError('Please select at least 2 papers to compare.');
      return;
    }

    setLoading(true);
    setError(null);

    const papersToCompare = papers.filter((p) => selectedIds.includes(p.id));

    try {
      const res = await fetch('/api/compare-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: papersToCompare.map((p) => ({
            id: p.id,
            title: p.title,
            filename: p.filename,
            text: p.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate multi-paper comparison.');
      }

      setComparison(data.comparison);
    } catch (err: any) {
      setError(err.message || 'An error occurred during multi-paper comparison.');
    } finally {
      setLoading(false);
    }
  };

  const copyComparisonMarkdown = () => {
    if (!comparison) return;
    let md = `# Multi-Paper Comparative Matrix\n\n${comparison.executiveOverview}\n\n`;

    comparison.comparisonDimensions?.forEach((dim) => {
      md += `## Dimension: ${dim.dimension}\n`;
      dim.paperValues?.forEach((pv) => {
        md += `### ${pv.paperTitle}\n- **Summary:** ${pv.summary}\n- **Evidence:** ${pv.concreteEvidence}\n\n`;
      });
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedPapers = papers.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GitCompare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <span>Multi-Paper Comparative Matrix</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Synthesize side-by-side methodologies, empirical findings, benchmark datasets, and unaddressed research gaps.
        </p>
      </div>

      {/* Paper Selection Checklist */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Papers to Compare ({selectedIds.length} of {papers.length} selected)
            </h2>
            <p className="text-xs text-slate-500">
              Choose 2 or more papers to generate a comparative matrix table
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={selectAll}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Select All
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={clearSelection}
              className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Clear
            </button>
            <button
              onClick={handleRunComparison}
              disabled={loading || selectedIds.length < 2}
              className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Comparison Table</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Paper cards checkbox grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-3">
          {papers.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSelectPaper(p.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors flex items-start gap-2.5 ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-950'
                }`}
              >
                <div className="mt-0.5 text-indigo-600 dark:text-indigo-400">
                  {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {p.authors[0]} et al. ({p.year})
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <div className="font-semibold">Comparison Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Constructing Cross-Paper Comparative Matrix
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Extracting comparative variables, analyzing points of convergence, identifying methodological tradeoffs, and compiling research gaps...
          </p>
        </div>
      )}

      {/* Comparison Output */}
      {comparison && !loading && (
        <div className="space-y-6">
          {/* Executive Overview & Action */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Comparative Synthesis Scope
              </div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {comparison.synthesisTitle || 'Multi-Paper Meta-Analysis'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {comparison.executiveOverview}
              </p>
            </div>
            <button
              onClick={copyComparisonMarkdown}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Matrix' : 'Copy Table'}</span>
            </button>
          </div>

          {/* Comparative Matrix Table */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Comparative Analysis Table
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {selectedPapers.length} papers compared
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                    <th className="py-3 px-4 font-bold text-slate-900 dark:text-white w-48 shrink-0 uppercase tracking-wider text-[11px]">
                      Dimension
                    </th>
                    {selectedPapers.map((paper) => (
                      <th
                        key={paper.id}
                        className="py-3 px-4 font-bold text-slate-900 dark:text-white min-w-[260px] align-top"
                      >
                        <div className="text-xs leading-snug">{paper.title}</div>
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {paper.authors[0]} et al. ({paper.year})
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {comparison.comparisonDimensions?.map((dim, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200 bg-slate-50/40 dark:bg-slate-950/40 align-top">
                        {dim.dimension}
                      </td>
                      {selectedPapers.map((paper) => {
                        const cellData = dim.paperValues?.find(
                          (pv) =>
                            pv.paperId === paper.id ||
                            pv.paperTitle.toLowerCase().includes(paper.title.slice(0, 15).toLowerCase())
                        );

                        return (
                          <td key={paper.id} className="py-3.5 px-4 align-top">
                            {cellData ? (
                              <div className="space-y-1.5">
                                <p className="text-slate-900 dark:text-slate-100 font-medium">
                                  {cellData.summary}
                                </p>
                                {cellData.concreteEvidence && (
                                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 p-1.5 rounded">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      Evidence:{' '}
                                    </span>
                                    {cellData.concreteEvidence}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No specific data</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consensus & Divergence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consensus */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Consensus & Empirical Convergence
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Core principles and findings where all analyzed papers agree
              </p>

              <div className="space-y-3">
                {comparison.consensusAndConvergence?.map((c, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {c.theme}
                      </span>
                      <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                        [{c.agreementLevel}]
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      {c.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Divergent Findings & Debates */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Divergent Findings & Methodological Conflicts
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Conflicting hypotheses, disparate benchmark results, and trade-offs
              </p>

              <div className="space-y-3">
                {comparison.divergentFindingsAndDebates?.map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white mb-1.5">
                      {d.disputePoint}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-1.5">
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded">
                        <span className="font-semibold block text-slate-700 dark:text-slate-300">
                          Side A:
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{d.perspectiveA}</span>
                      </div>
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded">
                        <span className="font-semibold block text-slate-700 dark:text-slate-300">
                          Side B:
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">{d.perspectiveB}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Root Cause: </span>
                      {d.underlyingReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Consolidated Research Gaps */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Consolidated Cross-Corpus Research Gaps
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Unresolved research problems persisting across all selected publications
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
              {comparison.consolidatedResearchGaps?.map((gap, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">
                      {gap.gapTitle}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">
                      {gap.whyItRemainsOpen}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                    Opportunity: {gap.crossPollinationOpportunity}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
