'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast';

export function DeleteButton({ transferId, storagePath }: { transferId: string; storagePath?: string | null }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Delete this transfer permanently?')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transfer/${transferId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast('Transfer deleted');
      router.refresh();
    } catch {
      toast('Failed to delete transfer', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="flex items-center rounded-lg border border-card-border bg-surface-raised px-2.5 py-1.5 text-xs font-medium text-zinc-500 hover:text-red-400 hover:border-red-900/30 hover:bg-danger-soft transition-all active:scale-[0.97] disabled:opacity-50"
      aria-label="Delete transfer"
    >
      {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  );
}
