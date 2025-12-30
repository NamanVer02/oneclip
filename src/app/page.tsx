'use client';

import { useState, FormEvent } from 'react';
import { useClipboard } from '@/hooks/useClipboard';
import CodeDisplay from '@/components/CodeDisplay';

export default function Home() {
  const { data, loading, updating, updateClipboard } = useClipboard();
  const [inputContent, setInputContent] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    try {
      await updateClipboard(inputContent);
      setInputContent('');
    } catch (error) {
      // Error is handled by the hook with toast
    }
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const characterCount = data?.content?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            OneClip
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your online clipboard - share and sync content across devices
          </p>
        </header>

        {/* Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Update Clipboard
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder="Paste or type your content here..."
              className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {inputContent.length} characters
              </span>
              <button
                type="submit"
                disabled={updating || !inputContent.trim()}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {updating ? 'Updating...' : 'Update Clipboard'}
              </button>
            </div>
          </form>
        </div>

        {/* Display Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Current Clipboard Content
            </h2>
            {data && (
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>
                  {characterCount.toLocaleString()} {characterCount === 1 ? 'character' : 'characters'}
                </span>
                <span>•</span>
                <span>Last updated: {formatTimestamp(data.timestamp)}</span>
                {data.language && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium">
                      {data.language}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <CodeDisplay
              content={data?.content || ''}
              language={data?.language || null}
              type={data?.type || 'text'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
