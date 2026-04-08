import Link from 'next/link';
import { PlusCircle, FileText, Link as LinkIcon, FileIcon, Zap, Trash2 } from 'lucide-react';
import { getSupabaseServer } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { CopyLinkButton } from '@/components/copy-link-button';
import { DeleteButton } from '@/components/delete-button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = getSupabaseServer();

  const { data: transfers, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              SnapRelay
            </h1>
            <p className="text-xs text-muted hidden sm:block">Micro-transfer dashboard</p>
          </div>
        </div>
        <Link
          href="/upload"
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-hover active:scale-[0.97] shadow-lg shadow-primary/10"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">New Transfer</span>
          <span className="sm:hidden">New</span>
        </Link>
      </header>

      {/* Content */}
      {error ? (
        <div className="animate-fade-in-up rounded-xl bg-danger-soft p-5 text-red-400 border border-red-900/30 text-sm">
          Failed to load transfers. Check your Supabase connection.
        </div>
      ) : transfers?.length === 0 ? (
        <div className="animate-fade-in-up flex flex-col items-center justify-center rounded-2xl border border-dashed border-card-border py-20 sm:py-28 text-center">
          <div className="mb-5 rounded-2xl bg-surface-raised p-5">
            <PlusCircle className="h-8 w-8 text-muted" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-200">No active transfers</h3>
          <p className="text-sm text-muted max-w-xs mt-2 leading-relaxed">
            Files, links, and text snippets you relay will appear here.
          </p>
          <Link
            href="/upload"
            className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary-hover active:scale-[0.97]"
          >
            <PlusCircle className="h-4 w-4" />
            Create your first relay
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {transfers?.map((tx, i) => (
            <div
              key={tx.id}
              className="animate-fade-in-up group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-card-border bg-card p-4 hover:bg-card-hover hover:border-zinc-700/60 transition-all"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-raised text-muted">
                  {tx.type === 'link' && <LinkIcon className="h-4.5 w-4.5" />}
                  {tx.type === 'text' && <FileText className="h-4.5 w-4.5" />}
                  {tx.type === 'file' && <FileIcon className="h-4.5 w-4.5" />}
                </div>
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-medium text-zinc-200">
                    {tx.type === 'file'
                      ? tx.filename || tx.original_filename
                      : tx.type === 'link'
                        ? tx.url
                        : 'Text Snippet'}
                  </h4>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                    <span className="capitalize rounded bg-surface-raised px-1.5 py-0.5 text-[10px] font-medium">
                      {tx.type}
                    </span>
                    <span>{formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}</span>
                    {tx.size_bytes && (
                      <span>{(tx.size_bytes / 1024 / 1024).toFixed(2)} MB</span>
                    )}
                    {tx.expires_at && (
                      <span
                        className={
                          new Date(tx.expires_at) < new Date()
                            ? 'text-red-400'
                            : ''
                        }
                      >
                        {new Date(tx.expires_at) < new Date()
                          ? 'Expired'
                          : `Expires ${formatDistanceToNow(new Date(tx.expires_at))}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                <Link
                  href={`/t/${tx.id}`}
                  className="flex items-center rounded-lg border border-card-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-card-hover transition-all active:scale-[0.97]"
                >
                  View
                </Link>
                <CopyLinkButton link={`/t/${tx.id}`} />
                <DeleteButton transferId={tx.id} storagePath={tx.storage_path} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
