import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Check,
  AlertCircle,
  CheckSquare,
  Square,
  Bookmark,
  Layers,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { ResearchPaper } from '../data/samplePapers';
import { LiteratureReviewResult } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface LiteratureReviewViewProps {
  papers: ResearchPaper[];
  onSaveReview?: (review: LiteratureReviewResult) => void;
}

export const LiteratureReviewView: React.FC<LiteratureReviewViewProps> = ({
  papers,
  onSaveReview,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(papers.map((p) => p.id));
  const [topicFocus, setTopicFocus] = useState('');
  const [reviewStyle, setReviewStyle] = useState<'thematic' | 'methodological' | 'chronological'>('thematic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<LiteratureReviewResult | null>(null);
  const [copied, setCopied] = useState(false);

  const toggleSelectPaper = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGenerateReview = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one paper to synthesize a literature review.');
      return;
    }

    setLoading(true);
    setError(null);

    const papersToInclude = papers.filter((p) => selectedIds.includes(p.id));

    try {
      const res = await fetch('/api/literature-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: papersToInclude.map((p) => ({
            id: p.id,
            title: p.title,
            filename: p.filename,
            text: p.content,
          })),
          topicFocus: topicFocus.trim() || undefined,
          reviewStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to synthesize literature review.');
      }

      setReview(data.review);
      if (onSaveReview) {
        onSaveReview(data.review);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during literature review generation.');
    } finally {
      setLoading(false);
    }
  };

  const copyMarkdown = () => {
    if (!review) return;
    let md = `# ${review.reviewTitle}\n\n`;
    md += `## Abstract & Scope\n${review.abstractAndScope}\n\n`;

    md += `## Primary Thematic Syntheses\n`;
    review.primaryThemes?.forEach((t, i) => {
      md += `### ${i + 1}. ${t.themeName}\n${t.summary}\n\n**Grounded Evidence:** ${t.groundedSynthesis}\n*(Contributing papers: ${t.contributingPapers?.join(', ')})*\n\n`;
    });

    md += `## Methodological Evolution\n${review.methodologicalEvolution?.summary}\n\n`;
    md += `**Dominant Paradigms:** ${review.methodologicalEvolution?.dominantParadigms?.join(', ')}\n\n`;

    md += `## Conflicting Results & Academic Debates\n`;
    review.conflictingResultsAndDebates?.forEach((c) => {
      md += `### Debate: ${c.controversy}\n- **Perspective 1:** ${c.supportingEvidenceA}\n- **Perspective 2:** ${c.supportingEvidenceB}\n- **Scholarly Implication:** ${c.scholarlyImplication}\n\n`;
    });

    md += `## Critical Research Gaps\n`;
    review.criticalResearchGaps?.forEach((g) => {
      md += `### ${g.gapName}\n${g.description}\n- **Significance:** ${g.significance}\n- **Proposed Direction:** ${g.potentialMethodologicalSolution}\n\n`;
    });

    md += `## Future Research Agenda & Hypotheses\n`;
    review.futureResearchAgenda?.forEach((f, i) => {
      md += `### Hypothesis ${i + 1}: ${f.hypothesisOrQuestion}\n- **Methodology:** ${f.proposedApproach}\n- **Expected Impact:** ${f.expectedImpact}\n\n`;
    });

    md += `## Grounded Corpus References\n`;
    review.groundedReferences?.forEach((r) => {
      md += `- **${r.paperTitle}:** ${r.keyContributionToReview}\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdownFile = () => {
    if (!review) return;
    const element = document.createElement('a');
    let md = `# ${review.reviewTitle}\n\n${review.abstractAndScope}\n\n`;
    review.primaryThemes?.forEach((t) => {
      md += `## ${t.themeName}\n${t.groundedSynthesis}\n\n`;
    });
    const file = new Blob([md], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `literature_review_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          <span>Literature Review Generator</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Synthesize uploaded research papers into thematic clusters, analyze methodological evolution,
          expose conflicting results, and construct an actionable research agenda.
        </p>
      </div>

      {/* Configuration & Input */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            1. Select Papers to Synthesize ({selectedIds.length} of {papers.length} selected)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {papers.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelectPaper(p.id)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                  }`}
                >
                  <div className="text-indigo-600 dark:text-indigo-400 shrink-0">
                    {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {p.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              2. Optional Topic Focus or Sub-theme
            </label>
            <input
              type="text"
              value={topicFocus}
              onChange={(e) => setTopicFocus(e.target.value)}
              placeholder="e.g. Architectural trade-offs between depth vs self-attention"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              3. Synthesis Taxonomy Style
            </label>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setReviewStyle('thematic')}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  reviewStyle === 'thematic'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Thematic
              </button>
              <button
                type="button"
                onClick={() => setReviewStyle('methodological')}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  reviewStyle === 'methodological'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Method
              </button>
              <button
                type="button"
                onClick={() => setReviewStyle('chronological')}
                className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                  reviewStyle === 'chronological'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Timeline
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateReview}
            disabled={loading || selectedIds.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                <span>Generating Systematic Review...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Synthesize Literature Review</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <div className="font-semibold">Generation Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Synthesizing Corpus Literature Review
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Extracting cross-document themes, mapping methodological trajectories, identifying conflicting empirical results, and formulating future hypotheses...
          </p>
        </div>
      )}

      {/* Review Output */}
      {review && !loading && (
        <div className="space-y-6">
          {/* Header & Actions */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                  Synthesized Meta-Review
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {review.reviewTitle}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyMarkdown}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Review'}</span>
                </button>
                <button
                  onClick={downloadMarkdownFile}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Abstract & Systematic Scope:
              </span>
              {review.abstractAndScope}
            </div>
          </div>

          {/* Primary Thematic Syntheses */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Primary Thematic Syntheses
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Synthesis of cross-cutting research themes with grounded citation anchors
            </p>

            <div className="space-y-4">
              {review.primaryThemes?.map((theme, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Theme {idx + 1}: {theme.themeName}
                    </h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">
                    {theme.summary}
                  </p>
                  <div className="p-3 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 leading-relaxed">
                    <span className="font-semibold block text-slate-700 dark:text-slate-300 mb-1">
                      Evidence Synthesis:
                    </span>
                    {theme.groundedSynthesis}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Contributing Papers:{' '}
                    </span>
                    {theme.contributingPapers?.join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methodological Evolution */}
          {review.methodologicalEvolution && (
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Methodological Evolution & Architectural Shifts
              </h3>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {review.methodologicalEvolution.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                    Dominant Paradigms:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {review.methodologicalEvolution.dominantParadigms?.map((p, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[11px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                    Experimental & Benchmark Standards:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400">
                    {review.methodologicalEvolution.experimentalStandards}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Conflicting Results & Scientific Debates */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
              Conflicting Results & Scientific Debates
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Divergent findings, trade-offs, and points of contention across the literature
            </p>

            <div className="space-y-3 text-xs">
              {review.conflictingResultsAndDebates?.map((debate, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80"
                >
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                    Debate: {debate.controversy}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-[11px]">
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Position A:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">{debate.supportingEvidenceA}</p>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Position B:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400">{debate.supportingEvidenceB}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Scholarly Implication:{' '}
                    </span>
                    {debate.scholarlyImplication}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Unexplored Gaps & Research Agenda */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Critical Unexplored Research Gaps
              </h3>
              <div className="space-y-3 text-xs">
                {review.criticalResearchGaps?.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="font-bold text-slate-900 dark:text-white mb-1">
                      {gap.gapName}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1.5">
                      {gap.description}
                    </p>
                    <div className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Proposed Direction:{' '}
                      </span>
                      {gap.potentialMethodologicalSolution}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Actionable Future Research Agenda & Hypotheses
              </h3>
              <div className="space-y-3 text-xs">
                {review.futureResearchAgenda?.map((agenda, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                      Hypothesis {i + 1}: {agenda.hypothesisOrQuestion}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Approach: </span>
                      {agenda.proposedApproach}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Impact: </span>
                      {agenda.expectedImpact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grounded Corpus References */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Grounded Bibliography & Corpus Citations
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {review.groundedReferences?.map((ref, i) => (
                <div key={i} className="py-2.5 first:pt-0 last:pb-0">
                  <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
                    {ref.paperTitle}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {ref.keyContributionToReview}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
