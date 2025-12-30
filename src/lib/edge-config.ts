import { get } from '@vercel/edge-config';

export interface ClipboardContent {
  content: string;
  type: string;
  language: string | null;
  timestamp: number;
}

const CLIPBOARD_KEY = 'clipboard_content';

/**
 * Get clipboard content from Edge Config
 */
export async function getClipboardContent(): Promise<ClipboardContent | null> {
  try {
    const data = await get<ClipboardContent>(CLIPBOARD_KEY);
    return data || null;
  } catch (error) {
    console.error('Error fetching clipboard content:', error);
    return null;
  }
}

