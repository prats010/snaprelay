import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { generateId } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { filename } = await request.json();
    if (!filename) {
       return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const id = generateId(); // nanoid 10 chars
    // sanitize filename to avoid path traversal or weird object keys
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storagePath = `${id}/${sanitizedFilename}`;

    const supabase = getSupabaseServer();
    
    // We create a signed upload URL that is valid for 1 hour.
    const { data, error } = await supabase
      .storage
      .from('transfers')
      .createSignedUploadUrl(storagePath);

    if (error || !data) {
       throw error || new Error('Failed to create upload URL');
    }

    return NextResponse.json({
       id,
       storagePath,
       signedUrl: data.signedUrl,
       token: data.token // Required for the client to use when uploading
    });
  } catch (error: any) {
    console.error('Prepare Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
