'use client';

import { useState } from 'react';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast';

export function DeleteButton({ transferId, storagePath }: { transferId: string; storagePath?: string | null }) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/transfer/${transferId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast('Transfer securely deleted', 'success');
      router.refresh(); // In case RealtimeHelper takes a second, force local refresh
    } catch {
      toast('Failed to delete transfer', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={deleting}
        className="flex items-center rounded-lg border border-card-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-400 hover:border-red-900/30 hover:bg-danger-soft transition-all active:scale-[0.97] disabled:opacity-50"
        aria-label="Delete transfer"
      >
        {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
      </button>

      {showConfirm && (
        <div 
          className="animate-fade-in"
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', padding: '16px' }}
        >
          <div 
            className="animate-scale-in"
            style={{ width: '100%', maxWidth: '384px', borderRadius: '16px', border: '1px solid #27272a', backgroundColor: '#09090b', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)' }}
          >
            <div style={{ marginBottom: '16px', display: 'flex', height: '48px', width: '48px', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 style={{ marginBottom: '8px', fontSize: '18px', fontWeight: 700, color: '#f4f4f5' }}>Delete Relay?</h3>
            <p style={{ marginBottom: '24px', fontSize: '14px', color: '#a1a1aa', lineHeight: '1.6' }}>
              This will permanently delete the file from the cloud and deactivate any share links.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowConfirm(false)} 
                style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 500, color: '#a1a1aa', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={() => { setShowConfirm(false); handleDelete(); }} 
                style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '14px', fontWeight: 700, color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
