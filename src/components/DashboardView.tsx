import React from 'react';
import {
  Compass,
  FileText,
  GitCompare,
  BookOpen,
  MessageSquare,
  Upload,
  ArrowRight,
  FileCheck2,
  Library,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ResearchPaper } from '../data/samplePapers';
import { ActiveTab, PaperAnalysisResult, LiteratureReviewResult } from '../types';

interface DashboardViewProps {
  papers: ResearchPaper[];
  onNavigate: (tab: ActiveTab, paperId?: string) => void;
  analyses: Record<string, PaperAnalysisResult>;
  recentReviews: LiteratureReviewResult[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  papers,
  onNavigate,
  analyses,
  recentReviews,
}) => {
  const totalPages = papers.reduce((acc, p) => acc + (p.pageCount || 1), 0);
  const totalWords = papers.reduce((acc, p) => acc + (p.wordCount || 0), 0);
  const analyzedCount = Object.keys(analyses).length;

  const quickFeatures = [
    {
      tab: 'explorer' as ActiveTab,
      title: 'Topic Explorer',
      description: 'Formulate hypotheses, research questions, and structured exploration milestones.',
      icon: Compass,
      color: 'text-indigo-600 dark:text-indigo-400',
      actionText: 'Explore Questions',
    },
    {
      tab: 'analyzer' as ActiveTab,
      title: 'Paper Analyzer',
      description: 'Extract abstract, objectives, methodology, quantitative results, and limitations.',
      icon: FileText,
      color: 'text-sky-600 dark:text-sky-400',
      actionText: 'Deep Analyze',
    },
    {
      tab: 'comparison' as ActiveTab,
      title: 'Multi-Paper Matrix',
      description: 'Synthesize cross-paper methodologies, datasets, findings, and research gaps in a matrix.',
      icon: GitCompare,
      color: 'text-emerald-600 dark:text-emerald-400',
      actionText: 'Compare Papers',
    },
    {
      tab: 'literature-review' as ActiveTab,
      title: 'Literature Review',
      description: 'Generate publication-grade synthesized reviews with thematic clusters and grounded citations.',
      icon: BookOpen,
      color: 'text-amber-600 dark:text-amber-400',
      actionText: 'Synthesize Review',
    },
    {
      tab: 'qa' as ActiveTab,
      title: 'Research Q&A',
      description: 'Ask questions strictly grounded in document contents with page citations and zero hallucinations.',
      icon: MessageSquare,
      color: 'text-purple-600 dark:text-purple-400',
      actionText: 'Ask Grounded Q&A',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner with Generated Academic Graphic */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="p-6 sm:p-8 lg:col-span-7 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-2">
              <span>Evidence-Grounded Agent</span>
              <span aria-hidden="true">·</span>
              <span>Gemini 3.8 Flash</span>
              <span aria-hidden="true">·</span>
              <span>Zero Hallucination Policy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
              Scholaura Academic Workspace
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              Research smarter. Discover deeper.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 max-w-xl">
              An intelligent assistant for students, faculty, and scholars. Analyze PDF & TXT
              manuscripts, compare methodologies, uncover unaddressed research gaps, and produce
              rigorous literature reviews with verified page references.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('explorer')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Topic Exploration</span>
              </button>
              <button
                onClick={() => onNavigate('library')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Papers (PDF/TXT)</span>
              </button>
            </div>
          </div>

          <div className="relative lg:col-span-5 min-h-[220px] bg-slate-100 dark:bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
            <img
              src="/src/assets/images/academic_research_banner_1794112580713.jpg"
              alt="Knowledge graph network of interconnected academic citations"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 text-xs text-white/90 font-medium">
              Citation topology & multi-paper semantic matrix
            </div>
          </div>
        </div>
      </div>

      {/* Metric Strip (Tabular Numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Loaded Documents</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {papers.length}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {papers.filter((p) => p.isSample).length} landmark + {papers.filter((p) => !p.isSample).length} custom
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Indexed Pages</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalPages}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            With page marker indices
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Analyzed Papers</div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
            {analyzedCount}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Structured extractions ready
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Corpus Word Count</div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {totalWords.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Academic tokens indexed
          </div>
        </div>
      </div>

      {/* Feature Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Core Research Capabilities
          </h2>
          <span className="text-xs text-slate-500">5 specialized academic agents</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {quickFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.tab}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors group"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                    <Icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {f.description}
                  </p>
                </div>

                <button
                  onClick={() => onNavigate(f.tab)}
                  className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors"
                >
                  <span>{f.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Corpus Overview */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Active Paper Corpus
            </h2>
            <p className="text-xs text-slate-500">
              Documents currently available for analysis, comparison, and grounded Q&A
            </p>
          </div>
          <button
            onClick={() => onNavigate('library')}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Manage all ({papers.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {papers.map((paper) => {
            const hasAnalysis = !!analyses[paper.id];
            return (
              <div
                key={paper.id}
                className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {paper.title}
                    </h3>
                    {paper.isSample && (
                      <span className="text-[11px] font-mono text-slate-400">
                        [Benchmark]
                      </span>
                    )}
                    {hasAnalysis && (
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                        ✓ Analyzed
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{paper.authors.slice(0, 3).join(', ')}{paper.authors.length > 3 ? ' et al.' : ''}</span>
                    <span aria-hidden="true">·</span>
                    <span>{paper.year}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{paper.pageCount} pages</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{paper.wordCount.toLocaleString()} words</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('analyzer', paper.id)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                  >
                    {hasAnalysis ? 'View Analysis' : 'Analyze'}
                  </button>
                  <button
                    onClick={() => onNavigate('qa', paper.id)}
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-md transition-colors"
                  >
                    Ask Q&A
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
