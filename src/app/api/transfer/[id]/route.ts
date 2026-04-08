import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';
import { verifyPin } from '@/lib/crypto';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { pin } = body;

    const supabase = getSupabaseServer();
    
    // Fetch transfer using admin role to bypass RLS
    const { data: transfer, error } = await supabase
      .from('transfers')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 });
    }

    // Check expiry
    if (transfer.expires_at && new Date(transfer.expires_at) < new Date()) {
       // Lazy deletion: delete it now since it's expired
       if (transfer.storage_path) {
          await supabase.storage.from('transfers').remove([transfer.storage_path]);
       }
       await supabase.from('transfers').delete().eq('id', id);
       return NextResponse.json({ error: 'Transfer has expired' }, { status: 410 });
    }

    // Check PIN if required
    let isSecured = false;
    if (transfer.pin_hash) {
       isSecured = true;
       // If PIN isn't provided or fails verification, return 401 with 'pin_required'
       if (!pin) {
          return NextResponse.json({ error: 'PIN required', pinRequired: true }, { status: 401 });
       }
       const pinDecrypted = await verifyPin(pin, transfer.pin_hash);
       if (!pinDecrypted) {
          return NextResponse.json({ error: 'Invalid PIN', pinRequired: true }, { status: 401 });
       }
    }

    // If it's a file, we need a short-lived signed URL to securely serve it directly from storage
    let downloadUrl = null;
    if (transfer.type === 'file' && transfer.storage_path) {
       const { data: signedData, error: signedError } = await supabase
         .storage
         .from('transfers')
         .createSignedUrl(transfer.storage_path, 60 * 60); // 1 hour validity

       if (!signedError && signedData) {
         downloadUrl = signedData.signedUrl;
       }
    }

    // Strip sensitive fields (like pin_hash) before returning
    delete transfer.pin_hash;

    // Check if the user requesting this is the dashboard owner themselves!
    const authCookie = request.headers.get('cookie')?.includes(`snaprelay_auth=${process.env.DASHBOARD_PASSPHRASE}`);
    const isOwner = !!authCookie;

    return NextResponse.json({
       ...transfer,
       downloadUrl,
       isOwner
    });

  } catch (error: any) {
    console.error('Transfer Access Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServer();

    // Fetch transfer to find storage path
    const { data: transfer } = await supabase
      .from('transfers')
      .select('storage_path')
      .eq('id', id)
      .single();

    // Delete associated file from storage if it exists
    if (transfer?.storage_path) {
      await supabase.storage.from('transfers').remove([transfer.storage_path]);
    }

    // Delete the DB record
    const { error } = await supabase.from('transfers').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Transfer Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
