import React from 'react';
import { Menu, Plus, Upload, Sparkles, BookOpen } from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onOpenUpload: () => void;
  onNewTopic: () => void;
  paperCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenUpload,
  onNewTopic,
  paperCount,
}) => {
  const tabTitles: Record<ActiveTab, { title: string; category: string }> = {
    dashboard: { title: 'Academic Research Dashboard', category: 'Overview' },
    explorer: { title: 'Research Topic Explorer', category: 'Discovery' },
    analyzer: { title: 'Research Paper Analyzer', category: 'Document Analysis' },
    comparison: { title: 'Multi-Paper Comparative Matrix', category: 'Synthesis' },
    'literature-review': { title: 'Literature Review Generator', category: 'Meta-Analysis' },
    qa: { title: 'Grounded Research Q&A', category: 'Evidence Assistant' },
    library: { title: 'Document & Corpus Library', category: 'Workspace' },
  };

  const current = tabTitles[activeTab] || { title: 'Research Hub', category: 'Workspace' };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle + Breadcrumb trail */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
          <span className="hidden sm:inline">Scholaura</span>
          <span className="hidden sm:inline" aria-hidden="true">/</span>
          <span>{current.category}</span>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900 dark:text-white font-semibold truncate">
            {current.title}
          </span>
        </div>
      </div>

      {/* Zone 3: Primary Actions (Single-line controls) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={onNewTopic}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Explore Topic</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs transition-colors whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Paper</span>
        </button>
      </div>
    </header>
  );
};
