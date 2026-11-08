import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  BookOpen,
  FileText,
  CornerDownLeft,
  ChevronDown,
  Quote,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { ResearchPaper } from '../data/samplePapers';
import { QAMessage } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ResearchQAViewProps {
  papers: ResearchPaper[];
  selectedPaperId?: string;
}

export const ResearchQAView: React.FC<ResearchQAViewProps> = ({
  papers,
  selectedPaperId,
}) => {
  const [activeFilterId, setActiveFilterId] = useState<string>(selectedPaperId || 'all');
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am **Scholaura**, your academic research question-answering agent.
Ask me any technical or empirical question about your uploaded research papers.

**Strict Grounding Guarantee:**
- I answer **only** from the actual contents of the loaded documents.
- I cite the exact **paper name and page reference** (e.g. \`[Attention Is All You Need, p. 4]\`).
- I never fabricate citations, statistical results, or research findings. If evidence is not in the text, I will explicitly notify you.`,
      timestamp: new Date().toISOString(),
      evidenceFound: true,
      confidenceLevel: 'High',
      suggestedFollowUps: [
        'What BLEU scores were achieved on WMT 2014 by Transformer (big)?',
        'How does LoRA reduce trainable parameters and GPU memory in GPT-3 175B?',
        'What degradation problem did ResNet address and why was it not overfitting?',
        'What masking strategy and ratios are used in BERT pre-training?',
      ],
    },
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const activePapersToQuery =
    activeFilterId === 'all'
      ? papers
      : papers.filter((p) => p.id === activeFilterId);

  const handleSend = async (questionToSend?: string) => {
    const q = questionToSend || inputQuestion;
    if (!q.trim()) return;

    if (activePapersToQuery.length === 0) {
      alert('Please select or upload at least one paper before asking questions.');
      return;
    }

    const userMessage: QAMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: q.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/research-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          papers: activePapersToQuery.map((p) => ({
            id: p.id,
            title: p.title,
            filename: p.filename,
            text: p.content,
          })),
          chatHistory: messages.slice(-4).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process question.');
      }

      const agentMessage: QAMessage = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: data.result.answer,
        timestamp: new Date().toISOString(),
        evidenceFound: data.result.evidenceFound,
        confidenceLevel: data.result.confidenceLevel,
        citations: data.result.citations,
        suggestedFollowUps: data.result.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, agentMessage]);
    } catch (err: any) {
      const errorMessage: QAMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Query Error:** ${err.message || 'Unable to query research corpus.'}`,
        timestamp: new Date().toISOString(),
        evidenceFound: false,
        confidenceLevel: 'Insufficient Data in Corpus',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Title & Scope Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Grounded Research Q&A</span>
          </h1>
          <p className="text-xs text-slate-500">
            Strictly document-grounded inquiries with exact page references and quotes
          </p>
        </div>

        {/* Paper Scope Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Corpus Scope:</span>
          <select
            value={activeFilterId}
            onChange={(e) => setActiveFilterId(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium max-w-[240px] truncate"
          >
            <option value="all">All Loaded Papers ({papers.length})</option>
            {papers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.year})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-xl p-4 text-xs sm:text-sm ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs'
              }`}
            >
              {/* Header inside assistant message */}
              {msg.role === 'assistant' && (
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-900 dark:text-white">Scholaura</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {msg.confidenceLevel && (
                      <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                        [{msg.confidenceLevel} Confidence]
                      </span>
                    )}
                    <button
                      onClick={() => copyMessage(msg.content, msg.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      title="Copy Answer"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Message Content */}
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} />
              )}

              {/* Grounded Citation Cards */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Grounded Document References</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {msg.citations.map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {cite.paperTitle}
                          </span>
                          <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                            {cite.pageOrSection}
                          </span>
                        </div>
                        {cite.quotedExcerpt && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 italic line-clamp-3">
                            &ldquo;{cite.quotedExcerpt}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Suggested Academic Follow-Up Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((fu, fIdx) => (
                      <button
                        key={fIdx}
                        onClick={() => handleSend(fu)}
                        className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded transition-colors text-left"
                      >
                        {fu}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-3">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>Scanning document pages and verifying factual citations...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder={`Ask a question across ${
              activeFilterId === 'all' ? `${papers.length} loaded papers` : activePapersToQuery[0]?.title || 'papers'
            }...`}
            disabled={loading}
            className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Agent</span>
          </button>
        </form>
      </div>
    </div>
  );
};
