import { NextResponse } from 'next/server';
import { getEdgeConfigInstance, getClipboardItem } from '@/lib/edge-config';

export const runtime = 'edge';

export async function GET() {
  try {
    // Check if EDGE_CONFIG is set
    const hasEdgeConfig = !!process.env.EDGE_CONFIG;
    
    // Try to get Edge Config instance
    let edgeConfigStatus = 'unknown';
    try {
      const edgeConfig = getEdgeConfigInstance();
      edgeConfigStatus = 'connected';
    } catch (error) {
      edgeConfigStatus = `error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to get clipboard item
    let item = null;
    let itemError = null;
    try {
      item = await getClipboardItem();
    } catch (error) {
      itemError = error instanceof Error ? error.message : 'Unknown error';
    }

    return NextResponse.json({
      debug: {
        hasEdgeConfigEnvVar: hasEdgeConfig,
        edgeConfigEnvVarLength: process.env.EDGE_CONFIG?.length || 0,
        edgeConfigStatus,
        hasItem: item !== null,
        itemLength: item?.length || 0,
        itemError,
        itemPreview: item ? (item.length > 100 ? item.substring(0, 100) + '...' : item) : null,
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

