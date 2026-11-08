import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Plus,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { ResearchPaper, SAMPLE_PAPERS } from '../data/samplePapers';

interface DocumentLibraryViewProps {
  papers: ResearchPaper[];
  onAddPaper: (paper: ResearchPaper) => void;
  onRemovePaper: (paperId: string) => void;
  onResetSamplePapers: () => void;
  onSelectForAnalysis: (paperId: string) => void;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  papers,
  onAddPaper,
  onRemovePaper,
  onResetSamplePapers,
  onSelectForAnalysis,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [viewingPaper, setViewingPaper] = useState<ResearchPaper | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploadError(null);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTxt = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');

    if (!isPdf && !isTxt) {
      setUploadError('Only PDF (.pdf) and Plain Text (.txt) documents are supported.');
      return;
    }

    setUploading(true);

    try {
      let bodyData: any = {
        filename: file.name,
        fileType: file.type,
      };

      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        bodyData.fileBase64 = base64;
      } else {
        const text = await file.text();
        bodyData.textContent = text;
      }

      const res = await fetch('/api/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse research document.');
      }

      const newPaper: ResearchPaper = {
        id: `paper-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        filename: file.name,
        authors: ['Uploaded Author / Institutional Document'],
        year: new Date().getFullYear(),
        venue: isPdf ? 'Uploaded PDF Document' : 'Uploaded Text Manuscript',
        doi: 'Local Workspace Document',
        pageCount: data.pageCount || 1,
        wordCount: data.wordCount || 0,
        abstract: data.extractedText.slice(0, 450) + '...',
        content: data.extractedText,
        tags: [isPdf ? 'PDF' : 'TXT', 'User Upload'],
        sampleQueries: [
          'What are the primary findings and results reported in this paper?',
          'What methodology and experimental setup were conducted?',
          'What are the documented limitations in this paper?',
        ],
        uploadedAt: new Date().toISOString(),
        isSample: false,
      };

      onAddPaper(newPaper);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Document & Corpus Library</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your research papers, upload new PDF/TXT manuscripts, and inspect indexed page markers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetSamplePapers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Restore default landmark benchmark papers (Attention, ResNet, BERT, LoRA)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Landmark Papers</span>
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-8 rounded-xl border-2 border-dashed transition-colors text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
          className="hidden"
          id="file-upload-input"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {uploading ? 'Extracting & Indexing Document...' : 'Drag & Drop Research Paper Here'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports <strong className="text-slate-700 dark:text-slate-300">PDF (.pdf)</strong> and{' '}
              <strong className="text-slate-700 dark:text-slate-300">Text (.txt)</strong> academic files
            </p>
          </div>

          <div className="pt-2">
            <label
              htmlFor="file-upload-input"
              className={`inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer transition-colors ${
                uploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Browse File From Computer</span>
                </>
              )}
            </label>
          </div>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 inline-flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Corpus Table */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Indexed Documents ({papers.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Available across all 5 research agents
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {paper.title}
                  </h3>
                  {paper.isSample && (
                    <span className="text-[11px] font-mono text-slate-400">
                      [Benchmark]
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {paper.filename}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{paper.pageCount} pages</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{paper.wordCount.toLocaleString()} words</span>
                  <span aria-hidden="true">·</span>
                  <span>{paper.year}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setViewingPaper(paper)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Text</span>
                </button>

                <button
                  onClick={() => onSelectForAnalysis(paper.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                >
                  <span>Analyze</span>
                </button>

                <button
                  onClick={() => onRemovePaper(paper.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                  title="Remove document from corpus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text Inspector Modal */}
      {viewingPaper && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Document Inspector: {viewingPaper.title}
                </h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {viewingPaper.filename} · {viewingPaper.pageCount} pages · {viewingPaper.wordCount.toLocaleString()} words
                </div>
              </div>
              <button
                onClick={() => setViewingPaper(null)}
                className="text-xs font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950 select-text">
              {viewingPaper.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
