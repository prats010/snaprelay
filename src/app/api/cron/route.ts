import { NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Simple auth for cron by requiring a specific header that Vercel sets
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = getSupabaseServer();
    
    // 1. Find expired transfers
    const { data: expiredTransfers, error: fetchError } = await supabase
      .from('transfers')
      .select('id, storage_path')
      .lt('expires_at', new Date().toISOString());

    if (fetchError) throw fetchError;

    if (!expiredTransfers || expiredTransfers.length === 0) {
      return NextResponse.json({ success: true, message: 'No expired transfers to clean up.' });
    }

    // 2. Delete storage files
    const storagePaths = expiredTransfers
      .map(t => t.storage_path)
      .filter(Boolean) as string[];

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase
        .storage
        .from('transfers')
        .remove(storagePaths);
        
      if (storageError) {
        console.error('Error deleting storage files:', storageError);
        // Continue anyway to try deleting DB records
      }
    }

    // 3. Delete database records
    const ids = expiredTransfers.map(t => t.id);
    const { error: dbError } = await supabase
      .from('transfers')
      .delete()
      .in('id', ids);

    if (dbError) throw dbError;

    return NextResponse.json({ 
      success: true, 
      deletedCount: expiredTransfers.length
    });

  } catch (error: any) {
    console.error('Cron Cleanup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
