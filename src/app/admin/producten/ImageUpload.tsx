'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload, X, Link2, ImageIcon } from 'lucide-react';
import { uploadProductImage } from '@/lib/db/upload-actions';

/**
 * Hoofdafbeelding: upload (primair) met preview, of plak een URL (fallback).
 * De waarde wordt in een verborgen input name="image_primary" gezet zodat de
 * bestaande ProductForm 'm gewoon meeneemt bij opslaan.
 */
export function ImageUpload({ defaultValue }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue || '');
  const [showUrl, setShowUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set('file', file);
    start(async () => {
      const r = await uploadProductImage(fd);
      if (!r.ok || !r.url) { setError(r.error || 'Upload mislukt'); return; }
      setUrl(r.url);
    });
    e.target.value = '';
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">Hoofdafbeelding</span>
      <input type="hidden" name="image_primary" value={url} />

      <div className="mt-2 flex items-start gap-4">
        {/* Preview */}
        <div className="relative w-28 h-28 rounded-[10px] border border-border bg-background overflow-hidden shrink-0 flex items-center justify-center">
          {url ? (
            <>
              {/* plain img: preview ongeacht next/image-config */}
              <img src={url} alt="Productfoto" className="w-full h-full object-contain p-1" />
              <button
                type="button"
                onClick={() => setUrl('')}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                aria-label="Verwijderen"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            <ImageIcon size={26} className="text-muted/50" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload size={15} /> {pending ? 'Uploaden...' : url ? 'Vervang foto' : 'Upload foto'}
            </button>
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:bg-background border border-border px-3 py-2 rounded-[10px]"
            >
              <Link2 size={15} /> URL gebruiken
            </button>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPick} className="hidden" />
          </div>
          <p className="text-xs text-muted mt-1.5">JPG, PNG, WEBP of AVIF — max. 6 MB.</p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

          {showUrl && (
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="mt-2 w-full px-3 py-2 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
            />
          )}
        </div>
      </div>
    </div>
  );
}
