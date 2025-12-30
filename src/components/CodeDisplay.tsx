'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamically import syntax highlighter to avoid SSR issues
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  { ssr: false }
);

// Dynamically import the theme
let oneDark: any = null;
if (typeof window !== 'undefined') {
  import('react-syntax-highlighter/dist/cjs/styles/prism').then((mod) => {
    oneDark = mod.oneDark;
  });
}

interface CodeDisplayProps {
  content: string;
  language: string | null;
  type: string;
}

export default function CodeDisplay({ content, language, type }: CodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<any>(null);

  useEffect(() => {
    // Load theme on client side
    import('react-syntax-highlighter/dist/cjs/styles/prism').then((mod) => {
      setTheme(mod.oneDark);
    });
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // If no language detected or plain text, display as plain text
  if (!language || type === 'text') {
    return (
      <div className="relative group">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 min-h-[200px]">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm text-gray-900 dark:text-gray-100">
            {content || <span className="text-gray-400 italic">No content</span>}
          </pre>
        </div>
      </div>
    );
  }

  // Display with syntax highlighting
  if (!theme) {
    // Fallback while theme loads
    return (
      <div className="relative group">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 min-h-[200px] border border-gray-200 dark:border-gray-800">
          <pre className="text-gray-100 font-mono text-sm whitespace-pre-wrap">{content}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
        <SyntaxHighlighter
          language={language}
          style={theme}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            minHeight: '200px',
          }}
          wrapLongLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
