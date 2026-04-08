'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

export function RealtimeHelper() {
    const router = useRouter();

    useEffect(() => {
        // Create standard client for listening to WebSockets
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseKey) return;

        const supabase = createClient(supabaseUrl, supabaseKey);

        const channel = supabase.channel('realtime-transfers')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' }, () => {
                // Instantly invisible-refresh the Server Component when anything changes!
                router.refresh();
            })
            .subscribe();
            
        return () => { 
            supabase.removeChannel(channel); 
        };
    }, [router]);

    return null;
}
