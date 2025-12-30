import { NextRequest, NextResponse } from 'next/server';
import { detectContentType, formatJson } from '@/lib/content-detection';

// Use Node.js runtime for write operations to Edge Config
export const runtime = 'nodejs';

const CLIPBOARD_KEY = 'clipboard_content';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content must be a string' },
        { status: 400 }
      );
    }

    // Detect content type
    const detection = detectContentType(content);
    
    // Format JSON if detected
    let formattedContent = content;
    if (detection.isValidJson) {
      formattedContent = formatJson(content);
    }

    // Prepare clipboard data
    const clipboardData = {
      content: formattedContent,
      type: detection.type,
      language: detection.language,
      timestamp: Date.now(),
    };

    // Update Edge Config using Vercel Edge Config API
    const edgeConfigUrl = process.env.EDGE_CONFIG;
    const edgeConfigToken = process.env.EDGE_CONFIG_TOKEN;

    if (!edgeConfigUrl || !edgeConfigToken) {
      // In development, return the data without actually updating Edge Config
      // User needs to set up Edge Config in Vercel dashboard
      console.warn('EDGE_CONFIG or EDGE_CONFIG_TOKEN not set. Skipping Edge Config update.');
      return NextResponse.json(clipboardData, { status: 200 });
    }

    // Extract connection string ID from EDGE_CONFIG URL
    // Format: https://edge-config.vercel.com/{connectionStringId}?token=...
    const connectionStringMatch = edgeConfigUrl.match(/edge-config\.vercel\.com\/([^?]+)/);
    if (!connectionStringMatch) {
      console.warn('Invalid EDGE_CONFIG URL format. Skipping Edge Config update.');
      return NextResponse.json(clipboardData, { status: 200 });
    }

    const connectionStringId = connectionStringMatch[1];

    // Update Edge Config via REST API
    try {
      const response = await fetch(
        `https://api.vercel.com/v1/edge-config/${connectionStringId}/items`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${edgeConfigToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [
              {
                operation: 'upsert',
                key: CLIPBOARD_KEY,
                value: clipboardData,
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge Config API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          connectionStringId,
        });
        // Still return the data even if Edge Config update fails
        return NextResponse.json({
          ...clipboardData,
          _debug: {
            edgeConfigUpdateFailed: true,
            status: response.status,
            error: errorText,
          }
        }, { status: 200 });
      }

      console.log('Successfully updated Edge Config');
    } catch (apiError) {
      console.error('Error calling Edge Config API:', {
        error: apiError instanceof Error ? apiError.message : 'Unknown error',
        connectionStringId,
      });
      // Still return the data even if Edge Config update fails
      return NextResponse.json({
        ...clipboardData,
        _debug: {
          edgeConfigUpdateFailed: true,
          error: apiError instanceof Error ? apiError.message : 'Unknown error',
        }
      }, { status: 200 });
    }
    
    return NextResponse.json(clipboardData, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/clipboard/update:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update clipboard content' },
      { status: 500 }
    );
  }
}

