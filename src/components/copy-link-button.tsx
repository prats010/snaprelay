'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/toast';

export function CopyLinkButton({ link }: { link: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullUrl = `${window.location.origin}${link}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    toast('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-card-hover hover:border-zinc-600 active:scale-[0.97]"
      aria-label="Copy share link"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-400" /> Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Copy Link
        </>
      )}
    </button>
  );
}
