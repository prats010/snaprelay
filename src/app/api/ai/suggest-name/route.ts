import { NextResponse } from 'next/server';
import { suggestFilename } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalFilename, mimeType, thumbnailBase64, textSnippet } = body;

    if (!originalFilename || !mimeType) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Skip AI suggestion if it doesn't match a generic name pattern
    const genericPatterns = [
      /^(img|dsc|screencapture|screenshot|untitled|document|image|video)[\s_-]*\d*/i,
      /^[\d-]+\.(jpg|jpeg|png|mp4|mov|pdf|docx?)$/i // e.g. 20240101-1234.jpg
    ];

    const isGeneric = genericPatterns.some(p => p.test(originalFilename));

    if (!isGeneric) {
       // Return early, not generic enough to waste tokens on
       return NextResponse.json({ suggestion: null });
    }

    const suggestion = await suggestFilename(originalFilename, mimeType, thumbnailBase64, textSnippet);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Suggest Name API Error:', error);
    // As requested, always fail gracefully so it doesn't break upload
    return NextResponse.json({ suggestion: null }, { status: 200 });
  }
}
