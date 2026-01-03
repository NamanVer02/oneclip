import { NextResponse } from 'next/server';
import { getClipboardItem } from '@/lib/edge-config';

export const runtime = 'edge';

export async function GET() {
  try {
    const item = await getClipboardItem();
    return NextResponse.json({ success: true, content: item }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/clipboard/get:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to retrieve clipboard item',
        content: null 
      },
      { status: 500 }
    );
  }
}
