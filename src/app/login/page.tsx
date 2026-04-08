'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Zap } from 'lucide-react';

export default function LoginPage() {
  const [passphrase, setPassphrase] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });

      if (response.ok) {
        router.push('/');
        router.refresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Incorrect passphrase');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {/* Subtle gradient backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>

      <div className="animate-scale-in relative w-full max-w-sm rounded-2xl border border-card-border bg-card p-8 shadow-2xl shadow-black/30">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft animate-pulse-glow">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">SnapRelay</h1>
          <p className="mt-1.5 text-sm text-muted">Enter passphrase to access dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => {
                setPassphrase(e.target.value);
                setError('');
              }}
              placeholder="Passphrase"
              className="w-full rounded-xl border border-card-border bg-surface px-4 py-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
              autoFocus
            />
            {error && (
              <p className="mt-2.5 text-sm text-red-400 animate-fade-in-down flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passphrase}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary-hover active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-primary"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Unlock'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-zinc-600">
          Self-hosted micro-transfer tool
        </p>
      </div>
    </div>
  );
}
