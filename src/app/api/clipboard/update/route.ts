import { NextRequest, NextResponse } from 'next/server';
import { saveClipboardItem } from '@/lib/edge-config';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    const success = await saveClipboardItem(content);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to save clipboard item' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/clipboard/update:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update clipboard' 
      },
      { status: 500 }
    );
  }
}

// DELETE endpoint to clear the item
export async function DELETE() {
  try {
    const success = await saveClipboardItem('');
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to clear clipboard item' },
        { status: 500 }
      );
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/clipboard/update:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to clear clipboard' 
      },
      { status: 500 }
    );
  }
}
