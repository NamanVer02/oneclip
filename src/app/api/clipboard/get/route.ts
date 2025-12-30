import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const runtime = 'edge';

const CLIPBOARD_KEY = 'clipboard_content';

export async function GET() {
  try {
    // Directly use get from @vercel/edge-config like the example
    // When Edge Config is linked to the project, EDGE_CONFIG is automatically available
    const clipboardData = await get(CLIPBOARD_KEY);
    
    if (!clipboardData) {
      return NextResponse.json(
        { 
          content: '', 
          type: 'text', 
          language: null, 
          timestamp: Date.now()
        },
        { status: 200 }
      );
    }

    return NextResponse.json(clipboardData, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/clipboard/get:', error);
    
    // Provide more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    // If it's a connection error, return empty clipboard instead of error
    if (errorName === 'UnexpectedToken' || errorMessage.includes('EDGE_CONFIG')) {
      console.warn('Edge Config not properly configured, returning empty clipboard');
      return NextResponse.json(
        { 
          content: '', 
          type: 'text', 
          language: null, 
          timestamp: Date.now(),
          _debug: {
            error: errorMessage,
            note: 'Edge Config may not be linked to this project'
          }
        },
        { status: 200 }
      );
    }

    const errorDetails = {
      error: 'Failed to fetch clipboard content',
      message: errorMessage,
      _debug: {
        errorType: errorName,
      }
    };

    return NextResponse.json(errorDetails, { status: 500 });
  }
}

