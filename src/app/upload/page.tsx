'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Link as LinkIcon, FileText, Loader2, Play, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  
  // AI filename suggestion
  const [suggestedName, setSuggestedName] = useState<string | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  // Transfer State
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Optional placeholder

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
     setContent(e.target.value);
     setFile(null);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0];
    if (!droppedFile) return;

    if (droppedFile.size > 50 * 1024 * 1024) {
      setError('File exceeds 50MB limit.');
      return;
    }

    setFile(droppedFile);
    setContent('');
    setError(null);
    setSuggestedName(null);

    // Trigger AI suggestion in background
    triggerAiSuggestion(droppedFile);
  }, []);

  const triggerAiSuggestion = async (f: File) => {
    setIsSuggesting(true);
    try {
      // In a real implementation we would generate a thumbnail here if it's an image.
      // For this step, we just send the file metadata to our API route.
      const response = await fetch('/api/ai/suggest-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           originalFilename: f.name,
           mimeType: f.type 
           // thumbnailBase64: ... 
        })
      });
      if (response.ok) {
         const data = await response.json();
         if (data.suggestion) {
           setSuggestedName(data.suggestion);
         }
      }
    } catch (e) {
       console.log('AI suggestion failed silently', e);
    } finally {
      setIsSuggesting(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: !!content || !!file, // Disable clicking if something is typed/dropped to let them interact with form
    multiple: false
  });

  const determineType = () => {
    if (file) return 'file';
    if (!content) return 'none';
    const isUrl = /^https?:\/\//i.test(content.trim());
    return isUrl ? 'link' : 'text';
  };

  const type = determineType();

  const handleUpload = async () => {
     if (type === 'none') return;
     setIsUploading(true);
     setError(null);

     try {
       let id;
       
       if (type === 'file' && file) {
          const finalFilename = suggestedName || file.name;
          const prepRes = await fetch('/api/transfer/prepare-upload', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ filename: finalFilename })
          });
          
          if (!prepRes.ok) throw new Error('Failed to prepare upload');
          const prepData = await prepRes.json();
          id = prepData.id;

          const uploadRes = await fetch(prepData.signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file
          });
          
          if (!uploadRes.ok) throw new Error('Failed to send file directly to cloud storage');
          
          const createRes = await fetch('/api/transfer/create', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                id,
                type: 'file',
                filename: finalFilename,
                originalFilename: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
                storagePath: prepData.storagePath
             })
          });
          if (!createRes.ok) throw new Error('Failed to finalize transfer metadata');
          
       } else {
          const createRes = await fetch('/api/transfer/create', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                type,
                url: type === 'link' ? content : null,
                textContent: type === 'text' ? content : null,
             })
          });
          if (!createRes.ok) throw new Error('Failed to create text/link transfer');
          const createData = await createRes.json();
          id = createData.id;
       }

       router.push(`/t/${id}`);
       
     } catch (err: any) {
       setError(err.message || 'Error occurred during transfer');
     } finally {
       setIsUploading(false);
     }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 pt-12">
      <h1 className="mb-2 text-3xl font-bold text-zinc-100 text-center">New Transfer</h1>
      <p className="mb-8 text-center text-zinc-400">Paste text, a URL, or drop a file.</p>

      <div 
        {...getRootProps()} 
        className={`relative overflow-hidden rounded-2xl border-2 transition-colors ${
          isDragActive 
           ? 'border-blue-500 bg-blue-500/10' 
           : type === 'file'
             ? 'border-zinc-700 bg-zinc-900'
             : 'border-dashed border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/50'
        }`}
      >
        <input {...getInputProps()} />

        {type === 'none' && (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
             <UploadCloud className="mb-4 h-10 w-10 text-zinc-600" />
             <p className="text-zinc-300 font-medium">Drag & drop anything here</p>
             <p className="mt-1 text-sm text-zinc-500">or click to open file picker</p>

             <textarea
               onClick={(e) => e.stopPropagation()} // Prevent dropping triggering file picker on text click
               onChange={handleTextChange}
               value={content}
               placeholder="Or just paste your link / text here..."
               className="mt-8 w-full max-w-md resize-none rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
               rows={3}
             />
          </div>
        )}

        {type === 'text' && (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3 text-zinc-400">
               <FileText className="h-5 w-5" />
               <span className="font-medium">Text Snippet Detected</span>
               <button 
                 onClick={(e) => { e.stopPropagation(); setContent(''); }}
                 className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
               >
                 Clear
               </button>
            </div>
            <textarea
               onClick={(e) => e.stopPropagation()}
               onChange={handleTextChange}
               value={content}
               className="w-full h-40 resize-none rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none"
             />
          </div>
        )}

        {type === 'link' && (
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3 text-blue-400">
               <LinkIcon className="h-5 w-5" />
               <span className="font-medium">Link Detected</span>
               <button 
                 onClick={(e) => { e.stopPropagation(); setContent(''); }}
                 className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
               >
                 Clear
               </button>
            </div>
            <textarea
               onClick={(e) => e.stopPropagation()}
               onChange={handleTextChange}
               value={content}
               className="w-full h-14 resize-none rounded-lg border border-blue-900/50 bg-blue-950/20 p-4 text-sm text-blue-200 focus:border-blue-700/50 focus:outline-none"
             />
          </div>
        )}

        {type === 'file' && file && (
           <div className="p-6">
              <div className="mb-4 flex items-center gap-3 text-zinc-300">
                 <UploadCloud className="h-5 w-5 text-indigo-400" />
                 <span className="font-medium text-indigo-300">File Ready</span>
                 <button 
                   onClick={(e) => { e.stopPropagation(); setFile(null); setSuggestedName(null); }}
                   className="ml-auto text-xs text-zinc-500 hover:text-zinc-300"
                 >
                   Clear file
                 </button>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
                 <div className="font-medium text-zinc-200 truncate">{file.name}</div>
                 <div className="mt-1 text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Unknown type'}</div>
              </div>

              {isSuggesting && (
                <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>AI generating smart filename...</span>
                </div>
              )}

              {suggestedName && (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all">
                  <div className="flex flex-col">
                    <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-indigo-400 uppercase">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Suggestion
                    </span>
                     <span className="font-medium text-indigo-100 text-base">{suggestedName}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(new File([file], suggestedName, { type: file.type }));
                      setSuggestedName(null);
                    }}
                    className="rounded-lg bg-indigo-500 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-600 transition active:scale-95 shadow-lg shadow-indigo-500/20"
                  >
                    ✨ Use this
                  </button>
                </div>
              )}
           </div>
        )}
      </div>

      {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={type === 'none' || isUploading}
          className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-zinc-100 px-8 py-3.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white disabled:opacity-50 disabled:hover:bg-zinc-100"
        >
          {isUploading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
          ) : (
            <><Play className="h-4 w-4" /> Start Relay</>
          )}
        </button>
      </div>

    </div>
  );
}
