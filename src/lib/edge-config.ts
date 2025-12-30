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
    // Check if EDGE_CONFIG is available
    if (!process.env.EDGE_CONFIG) {
      console.warn('EDGE_CONFIG environment variable not set');
      return null;
    }

    const data = await get<ClipboardContent>(CLIPBOARD_KEY);
    
    if (!data) {
      console.log('No clipboard content found in Edge Config');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching clipboard content from Edge Config:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return null;
  }
}

