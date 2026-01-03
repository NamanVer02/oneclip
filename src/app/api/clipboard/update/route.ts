import { NextRequest, NextResponse } from 'next/server';
import { saveClipboardItem } from '@/lib/edge-config';

export const runtime = 'edge';

// Edge Config has an 8KB limit on Hobby plan
const MAX_CONTENT_SIZE = 8 * 1024; // 8KB in bytes

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

    // Check content size before attempting to save
    const contentSize = new TextEncoder().encode(content).length;
    if (contentSize > MAX_CONTENT_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Content exceeds the 8KB limit. Current size: ${(contentSize / 1024).toFixed(2)}KB, maximum: 8KB` 
        },
        { status: 413 } // 413 Payload Too Large
      );
    }

    await saveClipboardItem(content);

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/clipboard/update:', error);
    
    // Handle size limit errors with appropriate status code
    const errorMessage = error instanceof Error ? error.message : 'Failed to update clipboard';
    const isSizeLimitError = errorMessage.includes('8KB') || errorMessage.includes('exceed') || errorMessage.includes('limit');
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      },
      { status: isSizeLimitError ? 413 : 500 }
    );
  }
}

// DELETE endpoint to clear the item
export async function DELETE() {
  try {
    await saveClipboardItem('');
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
