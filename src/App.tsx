import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TopicExplorerView } from './components/TopicExplorerView';
import { PaperAnalyzerView } from './components/PaperAnalyzerView';
import { MultiPaperComparisonView } from './components/MultiPaperComparisonView';
import { LiteratureReviewView } from './components/LiteratureReviewView';
import { ResearchQAView } from './components/ResearchQAView';
import { DocumentLibraryView } from './components/DocumentLibraryView';
import { SAMPLE_PAPERS, ResearchPaper } from './data/samplePapers';
import { ActiveTab, PaperAnalysisResult, LiteratureReviewResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [papers, setPapers] = useState<ResearchPaper[]>(() => {
    try {
      const saved = localStorage.getItem('scholaura_custom_papers') || localStorage.getItem('researchmate_custom_papers');
      if (saved) {
        const parsedCustom: ResearchPaper[] = JSON.parse(saved);
        return [...SAMPLE_PAPERS, ...parsedCustom];
      }
    } catch (e) {
      console.warn('Failed to load custom papers from localStorage');
    }
    return SAMPLE_PAPERS;
  });

  const [selectedPaperId, setSelectedPaperId] = useState<string>(SAMPLE_PAPERS[0].id);
  const [analyses, setAnalyses] = useState<Record<string, PaperAnalysisResult>>({});
  const [recentReviews, setRecentReviews] = useState<LiteratureReviewResult[]>([]);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [explorerTopic, setExplorerTopic] = useState('');

  // Persist custom papers in local storage
  const handleAddPaper = (newPaper: ResearchPaper) => {
    setPapers((prev) => {
      const updated = [newPaper, ...prev];
      try {
        const customOnly = updated.filter((p) => !p.isSample);
        localStorage.setItem('scholaura_custom_papers', JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return updated;
    });
    setSelectedPaperId(newPaper.id);
    setActiveTab('analyzer');
  };

  const handleRemovePaper = (paperId: string) => {
    setPapers((prev) => {
      const updated = prev.filter((p) => p.id !== paperId);
      try {
        const customOnly = updated.filter((p) => !p.isSample);
        localStorage.setItem('scholaura_custom_papers', JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
      return updated;
    });

    if (selectedPaperId === paperId) {
      const remaining = papers.filter((p) => p.id !== paperId);
      if (remaining.length > 0) {
        setSelectedPaperId(remaining[0].id);
      }
    }
  };

  const handleResetSamplePapers = () => {
    try {
      localStorage.removeItem('scholaura_custom_papers');
      localStorage.removeItem('researchmate_custom_papers');
    } catch (e) {}
    setPapers(SAMPLE_PAPERS);
    setSelectedPaperId(SAMPLE_PAPERS[0].id);
  };

  const handleSaveAnalysis = (paperId: string, analysis: PaperAnalysisResult) => {
    setAnalyses((prev) => ({
      ...prev,
      [paperId]: analysis,
    }));
  };

  const handleSaveReview = (review: LiteratureReviewResult) => {
    setRecentReviews((prev) => [review, ...prev]);
  };

  const handleNavigate = (tab: ActiveTab, paperId?: string) => {
    if (paperId) {
      setSelectedPaperId(paperId);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        paperCount={papers.length}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onOpenUpload={() => setActiveTab('library')}
          onNewTopic={() => {
            setExplorerTopic('');
            setActiveTab('explorer');
          }}
          paperCount={papers.length}
        />

        {/* Dynamic Viewport Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              papers={papers}
              onNavigate={handleNavigate}
              analyses={analyses}
              recentReviews={recentReviews}
            />
          )}

          {activeTab === 'explorer' && (
            <TopicExplorerView initialTopic={explorerTopic} />
          )}

          {activeTab === 'analyzer' && (
            <PaperAnalyzerView
              papers={papers}
              selectedPaperId={selectedPaperId}
              onSelectPaper={(id) => setSelectedPaperId(id)}
              analyses={analyses}
              onSaveAnalysis={handleSaveAnalysis}
              onOpenUpload={() => setActiveTab('library')}
            />
          )}

          {activeTab === 'comparison' && (
            <MultiPaperComparisonView papers={papers} />
          )}

          {activeTab === 'literature-review' && (
            <LiteratureReviewView
              papers={papers}
              onSaveReview={handleSaveReview}
            />
          )}

          {activeTab === 'qa' && (
            <ResearchQAView
              papers={papers}
              selectedPaperId={selectedPaperId}
            />
          )}

          {activeTab === 'library' && (
            <DocumentLibraryView
              papers={papers}
              onAddPaper={handleAddPaper}
              onRemovePaper={handleRemovePaper}
              onResetSamplePapers={handleResetSamplePapers}
              onSelectForAnalysis={(id) => {
                setSelectedPaperId(id);
                setActiveTab('analyzer');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
