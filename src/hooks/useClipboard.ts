'use client';

import { useState, useEffect, useCallback } from 'react';

export function useClipboard() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clipboard item from API
  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/clipboard/get');
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content || null);
      } else {
        setError(data.error || 'Failed to fetch clipboard item');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clipboard item');
      console.error('Error fetching clipboard item:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a new clipboard item (replaces the previous one)
  const saveItem = useCallback(async (newContent: string) => {
    try {
      setError(null);
      const response = await fetch('/api/clipboard/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newContent }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh from Edge Config to ensure we have the latest data
        await fetchItem();
        return true;
      } else {
        setError(data.error || 'Failed to save clipboard item');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save clipboard item';
      setError(errorMessage);
      console.error('Error saving clipboard item:', err);
      return false;
    }
  }, [fetchItem]);

  // Clear the clipboard item
  const clearItem = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/clipboard/update', {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh from Edge Config to ensure we have the latest data
        await fetchItem();
        return true;
      } else {
        setError(data.error || 'Failed to clear clipboard item');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear clipboard item';
      setError(errorMessage);
      console.error('Error clearing clipboard item:', err);
      return false;
    }
  }, [fetchItem]);

  // Load item on mount
  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  return {
    content,
    loading,
    error,
    saveItem,
    clearItem,
    refresh: fetchItem,
  };
}
