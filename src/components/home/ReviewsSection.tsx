import { Star, ShieldCheck } from 'lucide-react';
import { getHomepageReviews } from '@/lib/db/reviews';

export async function ReviewsSection() {
  const { avg, count, items } = await getHomepageReviews(3);

  // Geen verzonnen reviews: tonen pas zodra er echte gepubliceerde reviews zijn.
  if (count === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={24} className={s <= Math.round(avg) ? 'fill-warm text-warm' : 'fill-none text-gray-300'} />
              ))}
            </div>
            <span className="text-3xl font-display font-black text-foreground">{avg.toFixed(1)}</span>
          </div>
          <p className="text-muted text-sm">
            Gebaseerd op <strong className="text-foreground">{count}</strong> {count === 1 ? 'beoordeling' : 'beoordelingen'} van klanten
          </p>
          <h2 className="text-2xl font-display font-black text-foreground mt-4">Wat onze klanten zeggen</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((r) => (
            <div key={r.id} className="bg-surface rounded-[12px] border border-border p-6">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} className={s <= r.rating ? 'fill-warm text-warm' : 'fill-none text-gray-300'} />
                ))}
              </div>
              {r.title && <p className="text-sm font-semibold text-foreground mb-1">{r.title}</p>}
              <p className="text-sm text-foreground/80 leading-relaxed mb-4 italic">&ldquo;{r.body}&rdquo;</p>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {r.author_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{r.author_name}</p>
                  {r.product_name && <p className="text-xs text-muted truncate">over {r.product_name}</p>}
                </div>
                {r.is_verified && (
                  <span className="ml-auto inline-flex items-center gap-1 text-xs bg-success/10 text-success font-bold px-2 py-0.5 rounded-pill shrink-0">
                    <ShieldCheck size={11} /> Geverifieerd
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
