import React from 'react';
import {
  LayoutDashboard,
  Compass,
  FileText,
  GitCompare,
  BookOpen,
  MessageSquare,
  FolderOpen,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  paperCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  paperCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Research Hub',
      icon: LayoutDashboard,
      description: 'Corpus overview & recent activity',
    },
    {
      id: 'explorer' as ActiveTab,
      label: 'Topic Explorer',
      icon: Compass,
      description: 'Hypothesis & research questions',
    },
    {
      id: 'analyzer' as ActiveTab,
      label: 'Paper Analyzer',
      icon: FileText,
      description: 'Deep extraction & objective/results',
    },
    {
      id: 'comparison' as ActiveTab,
      label: 'Multi-Paper Matrix',
      icon: GitCompare,
      description: 'Comparative table & tradeoffs',
    },
    {
      id: 'literature-review' as ActiveTab,
      label: 'Literature Review',
      icon: BookOpen,
      description: 'Synthesized review generator',
    },
    {
      id: 'qa' as ActiveTab,
      label: 'Research Q&A',
      icon: MessageSquare,
      description: 'Grounded queries with page citations',
    },
    {
      id: 'library' as ActiveTab,
      label: 'Document Library',
      icon: FolderOpen,
      count: paperCount,
      description: 'Upload PDF / TXT corpus',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Zone: 1 clean wordmark */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              S
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-tight">
                Scholaura
              </span>
              <span className="text-[11px] text-slate-400 block leading-tight font-normal">
                Research smarter. Discover deeper.
              </span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
            Research Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-mono font-medium tabular-nums ${
                      isActive
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Corpus Status Card */}
        <div className="p-3 border-t border-slate-800/80">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400">Loaded Papers</span>
              <span className="font-mono font-semibold text-slate-200 tabular-nums">
                {paperCount} {paperCount === 1 ? 'doc' : 'docs'}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Reasoning Engine</span>
              <span className="font-mono text-indigo-400 font-medium">Gemini 3.8</span>
            </div>
            <button
              onClick={() => handleSelect('library')}
              className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium transition-colors text-center block"
            >
              Manage Corpus
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
