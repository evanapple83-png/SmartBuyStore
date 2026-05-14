'use client';

import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

function euro(n: number) {
  return `€ ${n.toFixed(2).replace('.', ',')}`;
}

export function WinkelwagenClient() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();

  if (totalItems === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-muted mb-4" />
        <h1 className="text-2xl font-display font-black text-foreground mb-2">Je winkelmand is leeg</h1>
        <p className="text-sm text-muted mb-6">Voeg producten toe en kom hier terug om af te rekenen.</p>
        <Link
          href="/winkel"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90"
        >
          Verder winkelen
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-display font-black text-foreground mb-6">Winkelmand</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Items */}
        <div className="space-y-3">
          {items.map((it) => (
            <div
              key={it.product.id}
              className="bg-surface border border-border rounded-[12px] p-4 flex gap-4"
            >
              <div className="relative w-24 h-24 flex-shrink-0 bg-background rounded-[8px] overflow-hidden">
                <ImageWithFallback
                  src={it.product.images.primary}
                  fallbackSrc={it.product.images.fallback}
                  alt={it.product.name}
                  fill
                  sizes="96px"
                  className="object-contain p-2"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="text-xs text-muted">{it.product.brand}</div>
                  <Link
                    href={`/product/${it.product.slug}`}
                    className="text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                  >
                    {it.product.shortName || it.product.name}
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center border border-border rounded-[8px]">
                    <button
                      onClick={() => updateQuantity(it.product.id, it.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-background transition-colors disabled:opacity-30"
                      disabled={it.quantity <= 1}
                      aria-label="Eén minder"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-medium tabular-nums">{it.quantity}</span>
                    <button
                      onClick={() => updateQuantity(it.product.id, it.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-background transition-colors"
                      aria-label="Eén meer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-sm font-bold text-foreground tabular-nums">
                      {euro(it.product.currentPrice * it.quantity)}
                    </div>
                    <button
                      onClick={() => removeFromCart(it.product.id)}
                      className="text-muted hover:text-red-600 p-1"
                      aria-label="Verwijderen"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="bg-surface border border-border rounded-[12px] p-5 space-y-3">
            <h2 className="text-sm font-bold text-foreground">Bestelling</h2>

            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotaal ({totalItems} {totalItems === 1 ? 'product' : 'producten'})</span>
              <span className="font-medium tabular-nums">{euro(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Bezorgkosten</span>
              <span className="font-medium text-emerald-700">Gratis</span>
            </div>

            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-bold">Totaal</span>
              <span className="font-bold text-lg tabular-nums">{euro(totalPrice)}</span>
            </div>
            <div className="text-xs text-muted">Inclusief 21% btw</div>

            <Link
              href="/checkout"
              className="block bg-primary text-white text-center text-sm font-semibold py-3 rounded-[10px] hover:bg-primary/90 transition-colors"
            >
              <span className="inline-flex items-center gap-2">
                Doorgaan naar afrekenen <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/winkel"
              className="block text-center text-xs text-muted hover:text-foreground py-1"
            >
              ← Verder winkelen
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
