import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const runtime = 'edge';

const CLIPBOARD_KEY = 'clipboard_content';

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    edgeConfig: {
      // Note: process.env.EDGE_CONFIG may not be accessible in edge runtime
      // It's automatically injected by Vercel when Edge Config is linked
      note: 'EDGE_CONFIG is automatically available when linked to project',
    },
    test: {
      canRead: false,
      error: null,
      data: null,
    },
  };

  try {
    // Try to read from Edge Config
    // This will work if Edge Config is properly linked to the project
    const data = await get(CLIPBOARD_KEY);
    debugInfo.test.canRead = true;
    debugInfo.test.data = data;
    debugInfo.test.success = true;
  } catch (error) {
    debugInfo.test.error = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
    };
    debugInfo.test.success = false;
    
    // Provide helpful debugging info
    if (error instanceof Error) {
      if (error.message.includes('EDGE_CONFIG') || error.message.includes('connection')) {
        debugInfo.test.suggestion = 'Make sure Edge Config is linked to your Vercel project in the dashboard';
      }
    }
  }

  return NextResponse.json(debugInfo, { status: 200 });
}

