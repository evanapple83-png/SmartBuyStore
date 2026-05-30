'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, PenLine, CheckCircle } from 'lucide-react';
import type { Review } from '@/lib/db/reviews';
import { submitReview } from '@/lib/db/reviews-actions';

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size} className={s <= Math.round(value) ? 'fill-warm text-warm' : 'fill-none text-gray-300'} />
      ))}
    </div>
  );
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function ProductReviews({
  productId, productSlug, avg, count, reviews,
}: {
  productId: string; productSlug: string; avg: number; count: number; reviews: Review[];
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const r = await submitReview({
        productId, productSlug,
        rating,
        title: String(fd.get('title') || ''),
        body: String(fd.get('body') || ''),
      });
      if (!r.ok) { setError(r.error || 'Er ging iets mis'); return; }
      setDone(true);
    });
  }

  return (
    <div className="max-w-3xl">
      {/* Samenvatting */}
      <div className="rounded-[16px] border border-border bg-surface p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {count > 0 ? (
            <>
              <div className="text-center">
                <div className="text-4xl font-display font-extrabold text-foreground leading-none">{avg.toFixed(1)}</div>
                <div className="mt-1.5"><Stars value={avg} size={16} /></div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-sm font-semibold text-foreground">{count} {count === 1 ? 'beoordeling' : 'beoordelingen'}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted mt-1"><ShieldCheck size={13} className="text-success" /> Van echte klanten</p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-semibold text-foreground">Nog geen reviews</p>
              <p className="text-xs text-muted mt-1">Wees de eerste die dit product beoordeelt.</p>
            </div>
          )}
        </div>
        {!done && (
          <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 self-start bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90">
            <PenLine size={15} /> Schrijf een review
          </button>
        )}
      </div>

      {/* Formulier */}
      {open && !done && (
        <form onSubmit={onSubmit} className="rounded-[16px] border border-border bg-surface p-6 mt-4 space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Jouw beoordeling</span>
            <div className="flex items-center gap-1 mt-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onMouseEnter={() => setHover(s)} onClick={() => setRating(s)} aria-label={`${s} sterren`}>
                  <Star size={26} className={s <= (hover || rating) ? 'fill-warm text-warm' : 'fill-none text-gray-300'} />
                </button>
              ))}
            </div>
          </div>
          <input name="title" placeholder="Titel (optioneel)" className="w-full px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary" />
          <textarea name="body" required rows={4} placeholder="Hoe bevalt het product?" className="w-full px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary" />
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">
              {error}{/Log in/i.test(error) && <> <Link href={`/account/login?redirect=/product/${productSlug}`} className="underline font-semibold">Inloggen</Link></>}
            </div>
          )}
          <p className="text-xs text-muted">Je review wordt na controle geplaatst. Reviews van klanten die het product kochten krijgen een "geverifieerd"-label.</p>
          <button type="submit" disabled={pending} className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50">
            {pending ? 'Versturen...' : 'Review plaatsen'}
          </button>
        </form>
      )}

      {done && (
        <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 p-5 mt-4 flex items-start gap-2 text-sm text-emerald-800">
          <CheckCircle size={18} className="shrink-0 mt-0.5" /> Bedankt voor je review! Hij verschijnt zodra we 'm hebben gecontroleerd.
        </div>
      )}

      {/* Lijst */}
      {reviews.length > 0 && (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-4 last:border-b-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Stars value={r.rating} />
                {r.title && <span className="text-sm font-semibold text-foreground">{r.title}</span>}
                {r.is_verified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <ShieldCheck size={11} /> Geverifieerde aankoop
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/85 mt-1.5 leading-relaxed whitespace-pre-wrap">{r.body}</p>
              <p className="text-xs text-muted mt-1.5">{r.author_name} · {formatDate(r.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
