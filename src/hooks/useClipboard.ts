'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface ClipboardData {
  content: string;
  type: string;
  language: string | null;
  timestamp: number;
}

export function useClipboard() {
  const [data, setData] = useState<ClipboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchClipboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clipboard/get');
      
      if (!response.ok) {
        throw new Error('Failed to fetch clipboard content');
      }

      const clipboardData = await response.json();
      setData(clipboardData);
    } catch (error) {
      console.error('Error fetching clipboard:', error);
      toast.error('Failed to load clipboard content');
      // Set default empty state
      setData({
        content: '',
        type: 'text',
        language: null,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const updateClipboard = useCallback(async (content: string) => {
    try {
      setUpdating(true);
      const response = await fetch('/api/clipboard/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update clipboard');
      }

      const updatedData = await response.json();
      setData(updatedData);
      toast.success('Clipboard updated successfully');
      return updatedData;
    } catch (error) {
      console.error('Error updating clipboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update clipboard';
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, []);

  useEffect(() => {
    fetchClipboard();
  }, [fetchClipboard]);

  return {
    data,
    loading,
    updating,
    fetchClipboard,
    updateClipboard,
  };
}

