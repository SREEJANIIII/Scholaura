import React, { useState } from 'react';
import {
  Compass,
  Search,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Layers,
  Database,
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Clock,
  BookOpen,
} from 'lucide-react';
import { TopicExplorationResult } from '../types';

interface TopicExplorerViewProps {
  initialTopic?: string;
}

export const TopicExplorerView: React.FC<TopicExplorerViewProps> = ({ initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TopicExplorationResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const samplePrompts = [
    'Parameter-efficient fine-tuning for domain-specific medical LLMs',
    'Mitigating quadratic memory complexity in long-context Transformer models',
    'Self-supervised representation learning for sparse multimodal biological data',
    'Federated learning with differential privacy for sensitive health records',
    'Vision-language models for robotic manipulation in unstructured environments',
  ];

  const handleExplore = async (overrideTopic?: string) => {
    const targetTopic = overrideTopic || topic;
    if (!targetTopic.trim()) {
      setError('Please enter a research topic or question to explore.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/explore-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: targetTopic }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate research exploration plan.');
      }

      setResult(data.result);
      if (overrideTopic) {
        setTopic(overrideTopic);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while exploring this topic.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>Research Topic Explorer</span>
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Formulate rigorous research questions, academic search queries, subtopic taxonomies,
          and a phased exploration roadmap.
        </p>
      </div>

      {/* Input Form */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleExplore();
          }}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="topic-input"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
            >
              Enter Research Topic, Hypothesis, or Question
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Parameter-efficient fine-tuning for clinical biomedical LLMs"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !topic.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Exploration Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Benchmark Prompts */}
          <div>
            <span className="text-xs text-slate-400 mr-2">Or try a sample academic prompt:</span>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {samplePrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setTopic(p);
                    handleExplore(p);
                  }}
                  className="text-xs text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 px-2.5 py-1 rounded transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <div className="font-semibold">Exploration Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading && !result && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 animate-pulse">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
          <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
        </div>
      )}

      {/* Exploration Results */}
      {result && (
        <div className="space-y-6">
          {/* Executive Scope */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Topic Scope & Academic Significance
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {result.topicSummary}
            </p>
          </div>

          {/* Core Research Questions */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Formulated Research Questions (RQ)
                </h2>
                <p className="text-xs text-slate-500">
                  Targeted academic hypotheses formulated for thesis, paper, or experimental investigation
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {result.primaryResearchQuestions?.map((rq, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80"
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                        RQ {idx + 1}.
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {rq.question}
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 shrink-0">
                      [{rq.difficultyLevel}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 pl-8">
                    {rq.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords & Academic Boolean Search Queries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Academic Boolean Queries
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Optimized search strings with Boolean operators for literature databases
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Google Scholar Query:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            result.keywordsAndSearchQueries?.booleanQueryGoogleScholar || '',
                            'scholar'
                          )
                        }
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'scholar' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'scholar' ? 'Copied' : 'Copy Query'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 select-all">
                      {result.keywordsAndSearchQueries?.booleanQueryGoogleScholar}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>arXiv / ACM / IEEE Xplore:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            result.keywordsAndSearchQueries?.booleanQueryArxivAcmIeee || '',
                            'arxiv'
                          )
                        }
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'arxiv' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKey === 'arxiv' ? 'Copied' : 'Copy Query'}</span>
                      </button>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 select-all">
                      {result.keywordsAndSearchQueries?.booleanQueryArxivAcmIeee}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-xs text-slate-500 mb-1.5 font-medium">Keywords & Controlled Vocabulary:</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywordsAndSearchQueries?.primaryKeywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtopics & Critical Dimensions */}
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                Subtopics & Open Challenges
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Dimensional breakdown across theoretical and empirical frontiers
              </p>

              <div className="space-y-3 overflow-y-auto max-h-[320px] pr-1">
                {result.subtopics?.map((st, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                        {st.title}
                      </h3>
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        {st.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      {st.description}
                    </p>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Open Problem: </span>
                      {st.openProblems}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Structured 4-Phase Research Exploration Plan */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
              Structured Research Exploration Roadmap
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Methodological milestones and estimated timeline for systematic inquiry
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {result.explorationPlan?.map((plan, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {plan.phase}
                      </span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Clock className="w-3 h-3" />
                        {plan.estimatedTimeWeeks}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                      {plan.title}
                    </h3>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 mb-3">
                      {plan.objectives?.map((obj, oIdx) => (
                        <li key={oIdx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Milestone: </span>
                    {plan.recommendedMilestone}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prominent Venues & Benchmark Datasets */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Standard Benchmark Datasets & Publication Venues
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Key Evaluation Benchmarks & Datasets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.prominentDatabasesAndVenues?.benchmarkDatasets?.map((ds, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                    >
                      {ds}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Leading Journals & Conferences (Target Venues):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.prominentDatabasesAndVenues?.suggestedVenues?.map((vn, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                    >
                      {vn}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
