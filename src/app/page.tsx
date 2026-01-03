'use client';

import { useClipboard } from '@/hooks/useClipboard';
import { FormattedDisplay } from '@/components/FormattedDisplay';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const { content, loading, error, saveItem, refresh } = useClipboard();
  const [pasteValue, setPasteValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setPasteValue(pastedText);
    await handleSave(pastedText);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPasteValue(e.target.value);
  };

  const handleSave = async (textToSave?: string) => {
    const text = textToSave || pasteValue.trim();
    if (!text) {
      toast.error('Please enter some content');
      return;
    }

    setIsSaving(true);
    const success = await saveItem(text);
    setIsSaving(false);

    if (success) {
      toast.success('Content saved!');
      setPasteValue(''); // Clear the input after saving
    } else {
      toast.error('Failed to save content');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+V or Cmd+V will trigger paste event
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
      // Let the paste event handle it
      return;
    }
    // Ctrl+Enter or Cmd+Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col py-4 sm:py-8 px-3 sm:px-4 md:px-8 bg-white dark:bg-black">
        <div className="w-full max-w-3xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight sm:leading-10 tracking-tight text-black dark:text-zinc-50 mb-1 sm:mb-2">
              OneClip
            </h1>
            <p className="text-base sm:text-lg leading-6 sm:leading-8 text-zinc-600 dark:text-zinc-400">
              Paste content below to save and view it with auto-formatting.
            </p>
          </div>

          {error && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-xs sm:text-sm">
                Error: {error}
              </p>
            </div>
          )}

          {/* Paste Input Box */}
          <div className="mb-4 sm:mb-6">
            <label htmlFor="paste-input" className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Paste Content Here
            </label>
            <textarea
              id="paste-input"
              value={pasteValue}
              onChange={handleChange}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              placeholder="Paste your content here or type and press Ctrl+Enter / Cmd+Enter to save..."
              className="w-full h-28 sm:h-32 md:h-36 px-3 sm:px-4 py-2.5 sm:py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:border-transparent resize-none font-mono text-xs sm:text-sm"
            />
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="text-xs text-zinc-500 dark:text-zinc-500 hidden sm:block">
                Tip: Paste directly or type and press Ctrl+Enter / Cmd+Enter to save
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 sm:hidden">
                Tip: Paste or type and save
              </p>
              <button
                onClick={() => handleSave()}
                disabled={isSaving || !pasteValue.trim()}
                className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 active:bg-zinc-700 dark:active:bg-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium touch-manipulation"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Display Box */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 sm:mb-2">
              Last Saved Content
            </label>
            {loading ? (
              <div className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6 sm:p-8 text-center">
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">Loading...</p>
              </div>
            ) : (
              <FormattedDisplay content={content} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
