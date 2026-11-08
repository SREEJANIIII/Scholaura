import React, { useMemo } from 'react';
import { marked } from 'marked';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    try {
      // Configure marked with github-flavored markdown
      marked.setOptions({
        gfm: true,
        breaks: true,
      });
      return marked.parse(content || '') as string;
    } catch (e) {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-sm [&>p]:mb-3 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-4 [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-3 [&>h3]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>li]:mb-1 [&>strong]:text-slate-900 dark:[&>strong]:text-white [&>blockquote]:border-l-2 [&>blockquote]:border-slate-300 dark:[&>blockquote]:border-slate-700 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-slate-600 dark:[&>blockquote]:text-slate-400 [&>code]:bg-slate-100 dark:[&>code]:bg-slate-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>pre]:bg-slate-900 [&>pre]:text-slate-100 [&>pre]:p-3 [&>pre]:rounded-lg [&>pre]:overflow-x-auto [&>table]:w-full [&>table]:text-xs [&>table]:border-collapse [&>table]:my-3 [&>table_th]:border-b [&>table_th]:border-slate-300 dark:[&>table_th]:border-slate-700 [&>table_th]:p-2 [&>table_th]:text-left [&>table_td]:border-b [&>table_td]:border-slate-200 dark:[&>table_td]:border-slate-800 [&>table_td]:p-2 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
