import { Star, ShieldCheck } from 'lucide-react';

/**
 * Review-overzicht op basis van de échte aggregatie (gemiddelde + aantal).
 * Individuele geschreven reviews tonen we pas wanneer er een reviews-tabel is —
 * geen verzonnen reviews op een live klantenwinkel.
 */
export function ReviewSummary({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const rounded = Math.round(rating);

  return (
    <div className="rounded-[16px] border border-border bg-surface p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-display font-extrabold text-foreground leading-none">
              {rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-0.5 mt-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={16}
                  className={s <= rounded ? 'fill-warm text-warm' : 'fill-none text-gray-300'}
                />
              ))}
            </div>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {reviewCount} {reviewCount === 1 ? 'beoordeling' : 'beoordelingen'}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-muted mt-1">
              <ShieldCheck size={13} className="text-success" />
              Gebaseerd op geverifieerde aankopen
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-border text-sm text-muted">
        Geschreven reviews van klanten verschijnen hier zodra ze geplaatst zijn.
      </div>
    </div>
  );
}
