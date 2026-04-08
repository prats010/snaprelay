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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="animate-in zoom-in-95 duration-200 w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-zinc-100">Delete Relay?</h3>
            <p className="mb-6 text-sm text-zinc-400 leading-relaxed">
              This will permanently delete the file from the cloud server and immediately deactivate any active share links. Wait, are you absolutely sure you want to do this?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowConfirm(false)} 
                className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition"
              >
                Nevermind
              </button>
              <button 
                onClick={() => { setShowConfirm(false); handleDelete(); }} 
                className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition shadow-lg shadow-red-500/20 active:scale-[0.98]"
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
