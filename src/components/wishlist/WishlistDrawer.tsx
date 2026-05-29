'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatPriceShort } from '@/lib/price';
import { cn } from '@/lib/utils';

function specsLine(specs: Record<string, string>): string {
  return Object.values(specs).slice(0, 3).join(' • ');
}

export function WishlistDrawer() {
  const { items, remove, isOpen, close } = useWishlist();
  const { addToCart } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const t = setTimeout(() => panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  function moveToCart(productId: string) {
    const product = items.find((p) => p.id === productId);
    if (!product) return;
    addToCart(product); // opent de winkelwagen-drawer
    close(); // sluit de verlanglijst
  }

  return (
    <div
      aria-hidden={!isOpen}
      className={cn('fixed inset-0 z-50', isOpen ? 'pointer-events-auto' : 'pointer-events-none')}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        className={cn(
          'absolute inset-0 bg-foreground/40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Verlanglijst"
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
            <Heart size={20} className="text-accent" />
            Verlanglijst
            {items.length > 0 && <span className="text-sm font-semibold text-muted">({items.length})</span>}
          </h2>
          <button
            data-autofocus
            onClick={close}
            className="p-2 -mr-2 rounded-[10px] text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            aria-label="Verlanglijst sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <Heart size={28} className="text-muted" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-foreground">Je verlanglijst is leeg</h3>
              <p className="mt-1 text-sm text-muted">
                Tik op het hartje bij een product om het hier te bewaren.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2 mt-2">
              <Link
                href="/aanbiedingen"
                onClick={close}
                className="w-full bg-accent text-white font-semibold py-2.5 rounded-[12px] hover:bg-accent/90 transition-colors text-sm"
              >
                Bekijk aanbiedingen
              </Link>
              <Link
                href="/winkel"
                onClick={close}
                className="w-full bg-surface border border-primary text-primary font-semibold py-2.5 rounded-[12px] hover:bg-background transition-colors text-sm"
              >
                Alle producten
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.map((product) => (
                <div key={product.id} className="flex gap-3">
                  <Link
                    href={`/product/${product.slug}`}
                    onClick={close}
                    className="relative w-20 h-20 shrink-0 rounded-[10px] bg-gray-50 border border-border overflow-hidden"
                  >
                    <ImageWithFallback
                      src={product.images.primary}
                      fallbackSrc={product.images.fallback}
                      alt={product.shortName}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wide">{product.brand}</p>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={close}
                      className="text-sm font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary"
                    >
                      {product.shortName}
                    </Link>
                    {specsLine(product.specs) && (
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{specsLine(product.specs)}</p>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-display font-extrabold text-foreground">
                        €{formatPriceShort(product.currentPrice)}
                      </span>
                      <button
                        onClick={() => moveToCart(product.id)}
                        className="flex items-center gap-1.5 bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-[10px] hover:bg-accent/90 transition-colors cursor-pointer"
                      >
                        <ShoppingCart size={13} />
                        In winkelwagen
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => remove(product.id)}
                    className="p-1.5 h-fit text-muted hover:text-accent transition-colors cursor-pointer"
                    aria-label={`${product.shortName} verwijderen uit verlanglijst`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 shrink-0">
              <Link
                href="/verlanglijst"
                onClick={close}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 rounded-[12px] hover:bg-primary/90 transition-colors text-sm"
              >
                Bekijk volledige verlanglijst
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
