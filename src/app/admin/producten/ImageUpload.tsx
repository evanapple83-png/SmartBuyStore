'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload, X, Link2, ImageIcon, Star } from 'lucide-react';
import { uploadProductImage } from '@/lib/db/upload-actions';

/**
 * Fotobeheer: hoofdafbeelding + extra galerijfoto's.
 * - Meerdere bestanden tegelijk selecteren/slepen; eerste foto wordt hoofdfoto
 *   als die nog leeg is, de rest komt in de galerij.
 * - Elke extra foto kan tot hoofdfoto gepromoveerd of verwijderd worden.
 * - Waarden landen in verborgen inputs name="image_primary" (string) en
 *   name="images_extra" (JSON-array) zodat de bestaande ProductForm ze meeneemt.
 */
export function ImageUpload({
  defaultValue,
  defaultExtra,
}: {
  defaultValue?: string;
  defaultExtra?: string[];
}) {
  const [primary, setPrimary] = useState(defaultValue || '');
  const [extra, setExtra] = useState<string[]>(defaultExtra || []);
  const [showUrl, setShowUrl] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyCount, setBusyCount] = useState(0);
  const [, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const pending = busyCount > 0;

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError(null);
    setBusyCount(files.length);

    start(async () => {
      const errors: string[] = [];
      // Parallel uploaden; volgorde van selectie blijft bepalend voor de galerij.
      const results = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.set('file', file);
          const r = await uploadProductImage(fd);
          if (!r.ok || !r.url) {
            errors.push(`${file.name}: ${r.error || 'upload mislukt'}`);
            return null;
          }
          return r.url;
        })
      );
      const urls = results.filter((u): u is string => !!u);
      if (urls.length > 0) {
        setPrimary((prevPrimary) => {
          if (!prevPrimary) {
            const [first, ...rest] = urls;
            setExtra((prev) => [...prev, ...rest]);
            return first;
          }
          setExtra((prev) => [...prev, ...urls]);
          return prevPrimary;
        });
      }
      if (errors.length > 0) setError(errors.join(' · '));
      setBusyCount(0);
    });
    e.target.value = '';
  }

  function makePrimary(url: string) {
    setExtra((prev) => {
      const rest = prev.filter((u) => u !== url);
      return primary ? [primary, ...rest] : rest;
    });
    setPrimary(url);
  }

  function removeExtra(url: string) {
    setExtra((prev) => prev.filter((u) => u !== url));
  }

  function removePrimary() {
    // Schuif de eerste galerijfoto door naar hoofdfoto, als die er is.
    setExtra((prev) => {
      if (prev.length > 0) {
        const [first, ...rest] = prev;
        setPrimary(first);
        return rest;
      }
      setPrimary('');
      return prev;
    });
  }

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">Foto's</span>
      <input type="hidden" name="image_primary" value={primary} />
      <input type="hidden" name="images_extra" value={JSON.stringify(extra)} />

      <div className="mt-2 flex items-start gap-4">
        {/* Thumbnails: hoofdfoto + galerij */}
        <div className="flex flex-wrap gap-2 shrink-0 max-w-[60%]">
          <Thumb url={primary} isPrimary onRemove={removePrimary} />
          {extra.map((url) => (
            <Thumb
              key={url}
              url={url}
              onRemove={() => removeExtra(url)}
              onMakePrimary={() => makePrimary(url)}
            />
          ))}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={pending}
              className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-primary/90 disabled:opacity-50"
            >
              <Upload size={15} /> {pending ? `Uploaden (${busyCount})...` : 'Upload foto’s'}
            </button>
            <button
              type="button"
              onClick={() => setShowUrl((v) => !v)}
              className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:bg-background border border-border px-3 py-2 rounded-[10px]"
            >
              <Link2 size={15} /> URL gebruiken
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={onPick}
              className="hidden"
            />
          </div>
          <p className="text-xs text-muted mt-1.5">
            JPG, PNG, WEBP of AVIF — max. 6 MB per foto. Selecteer gerust meerdere bestanden tegelijk;
            de eerste wordt de hoofdfoto, de rest komt in de galerij.
          </p>
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

          {showUrl && (
            <input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              placeholder="https://... (hoofdafbeelding)"
              className="mt-2 w-full px-3 py-2 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Thumb({
  url,
  isPrimary,
  onRemove,
  onMakePrimary,
}: {
  url: string;
  isPrimary?: boolean;
  onRemove: () => void;
  onMakePrimary?: () => void;
}) {
  return (
    <div
      className={`relative w-24 h-24 rounded-[10px] border bg-background overflow-hidden flex items-center justify-center ${
        isPrimary ? 'border-primary ring-2 ring-primary/20' : 'border-border'
      }`}
    >
      {url ? (
        <>
          {/* plain img: preview ongeacht next/image-config */}
          <img src={url} alt={isPrimary ? 'Hoofdfoto' : 'Galerijfoto'} className="w-full h-full object-contain p-1" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
            aria-label="Verwijderen"
          >
            <X size={13} />
          </button>
          {isPrimary ? (
            <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[10px] font-bold text-center py-0.5">
              HOOFDFOTO
            </span>
          ) : (
            onMakePrimary && (
              <button
                type="button"
                onClick={onMakePrimary}
                title="Maak hoofdfoto"
                className="absolute bottom-1 left-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                aria-label="Maak hoofdfoto"
              >
                <Star size={12} />
              </button>
            )
          )}
        </>
      ) : (
        <ImageIcon size={26} className="text-muted/50" />
      )}
    </div>
  );
}
