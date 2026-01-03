'use client';

import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { toast } from 'sonner';

interface FormattedDisplayProps {
  content: string | null;
}

export function FormattedDisplay({ content }: FormattedDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!content) {
    return (
      <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">No content to display. Paste something above!</p>
      </div>
    );
  }

  const detectLanguage = (text: string): string => {
    const trimmed = text.trim();
    
    // Try to parse as JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Not valid JSON, continue
      }
    }

    // JavaScript/TypeScript patterns
    if (trimmed.includes('function') || trimmed.includes('const ') || trimmed.includes('let ') || trimmed.includes('var ')) {
      return 'javascript';
    }

    // Python patterns
    if (trimmed.includes('def ') || trimmed.includes('import ') || trimmed.includes('from ')) {
      return 'python';
    }

    // HTML patterns
    if (trimmed.includes('<!DOCTYPE') || trimmed.includes('<html') || trimmed.includes('<div')) {
      return 'html';
    }

    // SQL patterns
    if (trimmed.match(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)\b/i)) {
      return 'sql';
    }

    // CSS patterns
    if (trimmed.includes('{') && trimmed.includes(':') && trimmed.includes('}')) {
      return 'css';
    }

    return 'text';
  };

  const formatContent = (text: string): string => {
    const trimmed = text.trim();
    
    // Try to prettify JSON
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return JSON.stringify(parsed, null, 2);
      } catch {
        // Not valid JSON, return as is
      }
    }

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
      console.error('Failed to copy:', err);
    }
  };

  const language = detectLanguage(content);
  const formatted = formatContent(content);
  const shouldHighlight = language !== 'text';

  return (
    <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-black">
      <div className="bg-zinc-50 dark:bg-zinc-900 px-3 sm:px-4 py-2.5 sm:py-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400">
            {language}
          </span>
          {shouldHighlight && (
            <span className="text-xs text-zinc-500 dark:text-zinc-500 hidden sm:inline">
              Auto-formatted
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="px-3 sm:px-3 py-2 sm:py-1.5 text-xs font-medium rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 active:bg-zinc-700 dark:active:bg-zinc-300 transition-colors flex items-center justify-center gap-2 touch-manipulation min-h-[44px] sm:min-h-0"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {shouldHighlight ? (
        <div className="overflow-x-auto">
          <div className="min-w-0">
            <div className="text-xs sm:text-sm">
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '0.75rem',
                  fontSize: 'inherit',
                  borderRadius: 0,
                  background: 'transparent',
                }}
                codeTagProps={{
                  style: {
                    fontSize: 'inherit',
                  },
                }}
                showLineNumbers={false}
                wrapLines
                wrapLongLines
              >
                {formatted}
              </SyntaxHighlighter>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 overflow-x-auto">
          <pre className="text-xs sm:text-sm font-mono text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap break-words">
            {formatted}
          </pre>
        </div>
      )}
    </div>
  );
}

