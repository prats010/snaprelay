import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { generateId, hashPin } from '@/lib/crypto';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { 
      id, // may be passed from prepare-upload, otherwise we generate one
      type, // 'text' | 'link' | 'file'
      filename, originalFilename, mimeType, sizeBytes, storagePath,
      textContent, url, pin, ttlHours 
    } = body;

    if (!type || !['text', 'link', 'file'].includes(type)) {
       return NextResponse.json({ error: 'Invalid transfer type' }, { status: 400 });
    }

    if (!id) id = generateId();

    let expiresAt = null;
    if (ttlHours && ttlHours > 0) {
       const date = new Date();
       date.setHours(date.getHours() + Number(ttlHours));
       expiresAt = date.toISOString();
    }

    let pinHash = null;
    if (pin && typeof pin === 'string' && pin.trim().length > 0) {
       pinHash = await hashPin(pin);
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.from('transfers').insert({
       id,
       type,
       filename: filename || null,
       original_filename: originalFilename || null,
       mime_type: mimeType || null,
       size_bytes: sizeBytes || null,
       url: url || null,
       text_content: textContent || null,
       storage_path: storagePath || null,
       pin_hash: pinHash,
       expires_at: expiresAt
    });

    if (error) {
       throw error;
    }

    return NextResponse.json({ id, url: `/t/${id}` });
  } catch (error: any) {
    console.error('Transfer Create Error:', error);
    return NextResponse.json({ error: 'Failed to create transfer' }, { status: 500 });
  }
}
