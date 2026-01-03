'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { ClipboardItem } from '@/hooks/useClipboard';

interface CodeDisplayProps {
  item: ClipboardItem;
}

export function CodeDisplay({ item }: CodeDisplayProps) {
  const detectLanguage = (content: string): string => {
    // Simple language detection based on content patterns
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      return 'json';
    }
    if (content.includes('function') || content.includes('const ') || content.includes('let ')) {
      return 'javascript';
    }
    if (content.includes('def ') || content.includes('import ')) {
      return 'python';
    }
    if (content.includes('<!DOCTYPE') || content.includes('<html')) {
      return 'html';
    }
    if (content.includes('SELECT') || content.includes('FROM')) {
      return 'sql';
    }
    return 'text';
  };

  const language = item.type !== 'text' ? item.type : detectLanguage(item.content);

  return (
    <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="bg-zinc-50 dark:bg-zinc-900 px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono">
          {language}
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-500">
          {new Date(item.timestamp).toLocaleString()}
        </span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          borderRadius: 0,
        }}
        showLineNumbers
      >
        {item.content}
      </SyntaxHighlighter>
    </div>
  );
}
