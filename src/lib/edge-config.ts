import { createClient } from '@vercel/edge-config';

/**
 * Get the Edge Config client instance for reading
 * This requires EDGE_CONFIG environment variable to be set
 */
export function getEdgeConfigInstance() {
  try {
    if (!process.env.EDGE_CONFIG) {
      throw new Error('EDGE_CONFIG environment variable is not set');
    }
    const edgeConfig = createClient(process.env.EDGE_CONFIG);
    return edgeConfig;
  } catch (error) {
    console.error('Failed to get Edge Config instance:', error);
    throw new Error('Edge Config is not properly configured. Please check your EDGE_CONFIG environment variable.');
  }
}

/**
 * Get the single clipboard item from Edge Config (read operation)
 */
export async function getClipboardItem(): Promise<string | null> {
  try {
    const edgeConfig = getEdgeConfigInstance();
    const item = await edgeConfig.get('clipboardItem');
    return typeof item === 'string' ? item : null;
  } catch (error) {
    console.error('Failed to get clipboard item:', error);
    return null;
  }
}

/**
 * Save a single clipboard item to Edge Config using Vercel REST API
 * Edge Config writes must use the REST API, not the SDK
 */
// Edge Config has an 8KB limit on Hobby plan
const MAX_CONTENT_SIZE = 8 * 1024; // 8KB in bytes

export async function saveClipboardItem(content: string): Promise<void> {
  try {
    // Check content size before attempting to save
    const contentSize = new TextEncoder().encode(content).length;
    if (contentSize > MAX_CONTENT_SIZE) {
      throw new Error(`Content exceeds the 8KB limit. Current size: ${(contentSize / 1024).toFixed(2)}KB, maximum: 8KB`);
    }

    const edgeConfigId = process.env.EDGE_CONFIG;
    const vercelToken = process.env.VERCEL_TOKEN;

    if (!edgeConfigId) {
      throw new Error('EDGE_CONFIG environment variable is not set');
    }

    if (!vercelToken) {
      throw new Error('VERCEL_TOKEN environment variable is not set. Required for writing to Edge Config.');
    }

    // Extract the connection string ID from EDGE_CONFIG
    // EDGE_CONFIG format: https://edge-config.vercel.com/{id}?token={token}
    const urlMatch = edgeConfigId.match(/edge-config\.vercel\.com\/([^?]+)/);
    const configId = urlMatch ? urlMatch[1] : edgeConfigId;

    // Use Vercel REST API to update Edge Config
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${configId}/items`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            operation: 'upsert',
            key: 'clipboardItem',
            value: content,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save to Edge Config:', response.status, errorText);
      
      // Check if error is due to size limit (8KB for Hobby plan)
      if (response.status === 413 || errorText.includes('size') || errorText.includes('limit') || errorText.includes('exceed')) {
        throw new Error('Storage limit reached: Content exceeds the 8KB Edge Config limit. Please reduce the content size.');
      }
      
      throw new Error(`Failed to save: ${response.status} ${errorText}`);
    }
  } catch (error) {
    console.error('Failed to save clipboard item:', error);
    // Re-throw the error so the API route can handle it properly
    throw error;
  }
}
