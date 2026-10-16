import React from 'react';

interface FormattedMarkdownProps {
  content?: string;
  className?: string;
}

/**
 * Parses inline formatting:
 * **bold**, *italic*, `inline code`, and [link](url)
 */
function renderInline(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match: **bold**, *italic*, `code`, or [link](url)
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(pattern);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Italic
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      return (
        <em key={index} className="italic text-slate-800 dark:text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }

    // Inline Code
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-xs bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Link
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline font-medium transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/**
 * Lightweight, zero-dependency, XSS-safe Markdown Renderer
 */
export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content = '', className = '' }) => {
  if (!content || !content.trim()) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];
  let currentListItems: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = (keyPrefix: number) => {
    if (currentListItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`list-${keyPrefix}`} className="list-decimal space-y-1 pl-5 my-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {currentListItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`list-${keyPrefix}`} className="list-disc space-y-1 pl-5 my-2 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            {currentListItems}
          </ul>
        );
      }
      currentListItems = [];
      isNumberedList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block toggle (```)
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <div
            key={`code-${i}`}
            data-force-dark
            className="my-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner"
          >
            <pre className="whitespace-pre">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        codeBlockLines = [];
        inCodeBlock = false;
      } else {
        flushList(i);
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList(i);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(i);
      elements.push(
        <h4 key={`h3-${i}`} className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1 tracking-tight">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushList(i);
      elements.push(
        <h3 key={`h2-${i}`} className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-3.5 mb-1 tracking-tight">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList(i);
      elements.push(
        <h2 key={`h1-${i}`} className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-4 mb-1.5 tracking-tight">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(i);
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 pl-3.5 py-1 border-l-2 border-cyan-500 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-r-lg text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet List Item (- or *)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (isNumberedList) flushList(i);
      isNumberedList = false;
      currentListItems.push(
        <li key={`li-${i}`}>
          {renderInline(trimmed.slice(2))}
        </li>
      );
      continue;
    }

    // Numbered List Item (e.g. 1. or 2.)
    const numberMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      if (!isNumberedList) flushList(i);
      isNumberedList = true;
      currentListItems.push(
        <li key={`oli-${i}`}>
          {renderInline(numberMatch[2])}
        </li>
      );
      continue;
    }

    // Normal Paragraph
    flushList(i);
    elements.push(
      <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed my-1">
        {renderInline(rawLine)}
      </p>
    );
  }

  flushList(lines.length);

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};

export default FormattedMarkdown;
