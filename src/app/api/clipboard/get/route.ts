import { NextResponse } from 'next/server';
import { getClipboardContent } from '@/lib/edge-config';

export const runtime = 'edge';

export async function GET() {
  try {
    const clipboardData = await getClipboardContent();
    
    if (!clipboardData) {
      return NextResponse.json(
        { content: '', type: 'text', language: null, timestamp: Date.now() },
        { status: 200 }
      );
    }

    return NextResponse.json(clipboardData, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/clipboard/get:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clipboard content' },
      { status: 500 }
    );
  }
}

