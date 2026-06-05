'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload, X, FileText, ExternalLink } from 'lucide-react';
import { uploadProductBrochure } from '@/lib/db/upload-actions';

/**
 * Productbrochure (PDF): upload met preview-link, of verwijderen.
 * Waarde landt in een verborgen input name="brochure_url" zodat de
 * bestaande ProductForm 'm meeneemt bij opslaan.
 */
export function BrochureUpload({ defaultValue }: { defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue || '');
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
      const r = await uploadProductBrochure(fd);
      if (!r.ok || !r.url) { setError(r.error || 'Upload mislukt'); return; }
      setUrl(r.url);
    });
    e.target.value = '';
  }

  // Bestandsnaam uit de URL voor nette weergave
  const fileName = url ? decodeURIComponent(url.split('/').pop() || 'brochure.pdf').replace(/^\d+-[a-z0-9]+-/, '') : '';

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">Productbrochure (PDF)</span>
      <input type="hidden" name="brochure_url" value={url} />

      <div className="mt-2">
        {url ? (
          <div className="flex items-center gap-3 bg-background border border-border rounded-[10px] px-4 py-3">
            <FileText size={20} className="text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Bekijk PDF <ExternalLink size={11} />
              </a>
            </div>
            <button
              type="button"
              onClick={() => setUrl('')}
              className="text-muted hover:text-red-600 p-1"
              aria-label="Brochure verwijderen"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pending}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-primary/90 disabled:opacity-50"
          >
            <Upload size={15} /> {pending ? 'Uploaden...' : 'Upload brochure'}
          </button>
        )}
        <input ref={inputRef} type="file" accept="application/pdf" onChange={onPick} className="hidden" />
        <p className="text-xs text-muted mt-1.5">PDF — max. 20 MB. Klanten kunnen deze downloaden op de productpagina.</p>
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>
    </div>
  );
}
