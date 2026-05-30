'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Star, ShieldCheck, Check, X, Trash2 } from 'lucide-react';
import { setReviewStatus, deleteReview } from '@/lib/db/reviews-actions';

type Row = {
  id: string; product_id: string; product_name?: string; product_slug?: string;
  author_name: string; rating: number; title: string | null; body: string;
  status: 'pending' | 'published' | 'rejected'; is_verified: boolean; created_at: string;
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Wacht op controle', cls: 'text-amber-800 bg-amber-50 border-amber-200' },
  published: { label: 'Gepubliceerd', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  rejected: { label: 'Afgewezen', cls: 'text-red-700 bg-red-50 border-red-200' },
};

export function ReviewsModeration({ reviews }: { reviews: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function act(fn: () => Promise<any>) {
    start(async () => { await fn(); router.refresh(); });
  }

  return (
    <div className="space-y-3">
      {reviews.map((r) => {
        const meta = STATUS_META[r.status];
        return (
          <div key={r.id} className={`bg-surface border rounded-[12px] p-4 ${r.status === 'pending' ? 'border-accent/40' : 'border-border'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={13} className={s <= r.rating ? 'fill-warm text-warm' : 'fill-none text-gray-300'} />)}
                  </div>
                  {r.title && <span className="text-sm font-semibold text-foreground">{r.title}</span>}
                  <span className={`text-[11px] font-medium border rounded-full px-2 py-0.5 ${meta.cls}`}>{meta.label}</span>
                  {r.is_verified && <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><ShieldCheck size={11} /> Geverifieerd</span>}
                </div>
                <p className="text-sm text-foreground/85 mt-1.5 whitespace-pre-wrap">{r.body}</p>
                <p className="text-xs text-muted mt-1.5">
                  {r.author_name} · {new Date(r.created_at).toLocaleDateString('nl-NL')} · product: {r.product_name || r.product_id}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border">
              {r.status !== 'published' && (
                <button onClick={() => act(() => setReviewStatus(r.id, 'published'))} disabled={pending} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 rounded-[6px] disabled:opacity-50">
                  <Check size={13} /> Publiceren
                </button>
              )}
              {r.status !== 'rejected' && (
                <button onClick={() => act(() => setReviewStatus(r.id, 'rejected'))} disabled={pending} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] disabled:opacity-50">
                  <X size={13} /> Afwijzen
                </button>
              )}
              <button onClick={() => act(() => deleteReview(r.id))} disabled={pending} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-[6px] disabled:opacity-50 ml-auto">
                <Trash2 size={13} /> Verwijderen
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
