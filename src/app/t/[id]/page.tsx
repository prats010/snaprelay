'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Lock, FileText, Link as LinkIcon, Download, Copy, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TransferAccessPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGone, setIsGone] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // PIN State
  const [needsPin, setNeedsPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const fetchTransfer = async (pinInput?: string) => {
     setLoading(true);
     setError(null);
     setPinError(null);

     try {
        const res = await fetch(`/api/transfer/${id}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ pin: pinInput })
        });

        const json = await res.json();

        if (res.status === 410) {
           setIsGone(true);
        } else if (res.status === 401 && json.pinRequired) {
           setNeedsPin(true);
           if (pinInput) setPinError('Incorrect PIN');
        } else if (!res.ok) {
           setError(json.error || 'Failed to generic data');
        } else {
           setNeedsPin(false);
           setData(json);
        }
     } catch (err: any) {
        setError(err.message || 'Network error');
     } finally {
        setLoading(false);
     }
  };

  useEffect(() => {
     fetchTransfer();
  }, [id]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading && !needsPin) {
     return <div className="flex min-h-screen items-center justify-center"><div className="animate-pulse text-zinc-500">Loading transfer...</div></div>;
  }

  if (isGone) {
     return (
       <div className="flex min-h-screen items-center justify-center p-4">
         <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-950">
               <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100">Expired</h1>
            <p className="mt-2 text-zinc-400">This transfer has expired and is no longer available.</p>
         </div>
       </div>
     );
  }

  if (error && !needsPin) {
     return (
       <div className="flex min-h-screen items-center justify-center p-4">
         <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900">
               <AlertTriangle className="h-8 w-8 text-zinc-500" />
            </div>
            <h1 className="text-2xl font-semibold text-zinc-100">Not Found</h1>
            <p className="mt-2 text-zinc-400">The transfer link is invalid or the item was deleted.</p>
         </div>
       </div>
     );
  }

  if (needsPin) {
     return (
       <div className="flex min-h-screen items-center justify-center p-4">
         <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl">
           <div className="mb-6 flex flex-col items-center">
             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 mb-4">
               <Lock className="h-6 w-6 text-indigo-400" />
             </div>
             <h1 className="text-xl font-semibold">Protected Transfer</h1>
             <p className="text-sm text-zinc-500 mt-2 text-center">This relay is secured with a PIN</p>
           </div>
   
           <form onSubmit={(e) => { e.preventDefault(); fetchTransfer(pin); }} className="space-y-4">
             <div>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full rounded-lg text-center tracking-widest text-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-700"
                  maxLength={6}
                  required
                  autoFocus
                />
                {pinError && <p className="mt-2 text-sm text-center text-red-500">{pinError}</p>}
             </div>
   
             <button
               type="submit"
               disabled={loading}
               className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
             >
               {loading ? 'Decrypting...' : 'View Content'}
             </button>
           </form>
         </div>
       </div>
     );
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-2xl p-6 pt-12 md:pt-24">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
         
         <div className="mb-6 flex items-start justify-between border-b border-zinc-800 pb-6">
            <div>
               <h1 className="text-xl font-bold text-zinc-100">
                  {data.type === 'file' ? data.filename : data.type === 'link' ? 'Shared Link' : 'Shared Text'}
               </h1>
               <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                  <span>Created {formatDistanceToNow(new Date(data.created_at))} ago</span>
                  {data.expires_at && <span>• Expires in {formatDistanceToNow(new Date(data.expires_at))}</span>}
                  {data.size_bytes && <span>• {(data.size_bytes / 1024 / 1024).toFixed(2)} MB</span>}
               </div>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
              {data.type === 'link' && <LinkIcon className="h-6 w-6" />}
              {data.type === 'text' && <FileText className="h-6 w-6" />}
              {data.type === 'file' && <FileText className="h-6 w-6" />} {/* could use specific icon but generic file default */}
            </div>
         </div>

         <div className="py-2">
            {data.type === 'text' && (
              <div className="relative">
                 <div className="max-h-96 w-full overflow-y-auto whitespace-pre-wrap rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300 font-mono">
                    {data.text_content}
                 </div>
              </div>
            )}

            {data.type === 'link' && (
              <div className="break-all rounded-lg border border-blue-900/40 bg-blue-950/20 p-5 text-blue-300">
                 <a href={data.url} target="_blank" rel="noreferrer" className="hover:underline">
                    {data.url}
                 </a>
              </div>
            )}

            {data.type === 'file' && (
               <div className="flex items-center justify-between rounded-lg bg-zinc-900 p-4">
                 <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                       <span className="text-sm font-medium text-zinc-200">{data.filename}</span>
                       <span className="text-xs text-zinc-500">{data.mime_type || 'Unknown format'}</span>
                    </div>
                 </div>
               </div>
            )}
         </div>

         <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            {data.type === 'text' && (
               <button 
                 onClick={() => handleCopy(data.text_content)}
                 className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition"
               >
                 <Copy className="h-4 w-4" /> Copy Text
               </button>
            )}
            {data.type === 'link' && (
               <>
                 <button 
                    onClick={() => handleCopy(data.url)}
                    className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-800 transition"
                 >
                    <Copy className="h-4 w-4" /> Copy Link
                 </button>
                 <a 
                    href={data.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
                 >
                    Launch <LinkIcon className="h-4 w-4" />
                 </a>
               </>
            )}
            {data.type === 'file' && data.downloadUrl && (
               <a 
                 href={data.downloadUrl}
                 download={data.filename}
                 target="_blank"
                 rel="noreferrer"
                 className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 hover:bg-white transition"
               >
                 <Download className="h-4 w-4" /> Download File
               </a>
            )}
         </div>

      </div>
    </div>
  );
}
