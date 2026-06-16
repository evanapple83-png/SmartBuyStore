'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, ShoppingCart, Trash2, Minus, Plus, Truck, Wrench, Recycle, RotateCcw, ShieldCheck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useBeforeCutoff } from '@/hooks/useDeliveryPromise';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { formatPrice } from '@/lib/price';
import { cn } from '@/lib/utils';

/** First few spec values → "8 kg • 1400 tpm • Energielabel A" */
function specsLine(specs: Record<string, string>): string {
  return Object.values(specs).slice(0, 3).join(' • ');
}

const trustItemsBase = [
  { icon: Wrench, text: 'Gratis professionele installatie' },
  { icon: Recycle, text: 'Gratis afvoer oud apparaat' },
  { icon: RotateCcw, text: '30 dagen retour' },
];

export function CartDrawer() {
  const { items, totalPrice, totalItems, isCartOpen, closeCart, updateQuantity, removeFromCart } = useCart();
  const beforeCutoff = useBeforeCutoff();
  const trustItems = [
    {
      icon: Truck,
      text:
        beforeCutoff === false
          ? 'Morgen in huis — besteltijd voor vandaag (11:00) is verstreken'
          : 'Vandaag bezorgd indien besteld voor 11:00',
    },
    ...trustItemsBase,
  ];
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // ESC to close + focus trap + restore focus
  useEffect(() => {
    if (!isCartOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeCart();
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
    // Focus the panel's close button shortly after open
    const t = setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      clearTimeout(t);
      previouslyFocused.current?.focus?.();
    };
  }, [isCartOpen, closeCart]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isCartOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isCartOpen]);

  return (
    <div
      aria-hidden={!isCartOpen}
      className={cn('fixed inset-0 z-50', isCartOpen ? 'pointer-events-auto' : 'pointer-events-none')}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={cn(
          'absolute inset-0 bg-foreground/40 transition-opacity duration-300',
          isCartOpen ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Winkelwagen"
        className={cn(
          'absolute right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-out',
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h2 className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
            <ShoppingCart size={20} className="text-primary" />
            Winkelwagen
            {totalItems > 0 && (
              <span className="text-sm font-semibold text-muted">({totalItems})</span>
            )}
          </h2>
          <button
            data-autofocus
            onClick={closeCart}
            className="p-2 -mr-2 rounded-[10px] text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
            aria-label="Winkelwagen sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
            <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center">
              <ShoppingCart size={28} className="text-muted" />
            </div>
            <div>
              <h3 className="text-base font-display font-bold text-foreground">Je winkelwagen is leeg</h3>
              <p className="mt-1 text-sm text-muted">
                Bekijk onze aanbiedingen of kies een categorie om te starten.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2 mt-2">
              <Link
                href="/aanbiedingen"
                onClick={closeCart}
                className="w-full bg-accent text-white font-semibold py-2.5 rounded-[12px] hover:bg-accent/90 transition-colors text-sm"
              >
                Bekijk aanbiedingen
              </Link>
              <Link
                href="/winkel"
                onClick={closeCart}
                className="w-full bg-surface border border-primary text-primary font-semibold py-2.5 rounded-[12px] hover:bg-background transition-colors text-sm"
              >
                Alle categorieën
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="relative w-20 h-20 shrink-0 rounded-[10px] bg-gray-50 border border-border overflow-hidden">
                    <ImageWithFallback
                      src={product.images.primary}
                      fallbackSrc={product.images.fallback}
                      alt={product.shortName}
                      fill
                      sizes="80px"
                      className="object-contain p-1.5"
                    />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[11px] font-bold text-muted uppercase tracking-wide">{product.brand}</p>
                    <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
                      {product.shortName}
                    </h3>
                    {specsLine(product.specs) && (
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{specsLine(product.specs)}</p>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-border rounded-[10px] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1.5 text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                          aria-label="Aantal verlagen"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-foreground" aria-live="polite">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          className="p-1.5 text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                          aria-label="Aantal verhogen"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="text-sm font-display font-extrabold text-foreground">
                        €{formatPrice(product.currentPrice * quantity)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="p-1.5 h-fit text-muted hover:text-accent transition-colors cursor-pointer"
                    aria-label={`${product.shortName} verwijderen`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {/* Trust block */}
              <div className="mt-2 rounded-[12px] bg-success/5 border border-success/20 p-3">
                <p className="text-xs font-bold text-foreground mb-2">Levering &amp; service</p>
                <ul className="flex flex-col gap-1.5">
                  {trustItems.map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2 text-xs text-foreground/80">
                      <Icon size={14} className="text-success shrink-0" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Summary + actions */}
            <div className="border-t border-border px-5 py-4 shrink-0 bg-surface">
              <dl className="flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Subtotaal</dt>
                  <dd className="font-semibold text-foreground">€{formatPrice(totalPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Installatie</dt>
                  <dd className="font-semibold text-success">Gratis</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Afvoer oud apparaat</dt>
                  <dd className="font-semibold text-success">Gratis</dd>
                </div>
                <div className="flex justify-between pt-2 mt-1 border-t border-border">
                  <dt className="text-base font-display font-bold text-foreground">Totaal</dt>
                  <dd className="text-base font-display font-extrabold text-foreground">€{formatPrice(totalPrice)}</dd>
                </div>
              </dl>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-accent text-white font-bold py-3 rounded-[12px] hover:bg-accent/90 active:scale-[0.99] transition-all text-sm"
              >
                <ShieldCheck size={18} />
                Veilig afrekenen
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 w-full text-center text-sm font-semibold text-primary hover:underline py-1 cursor-pointer"
              >
                Verder winkelen
              </button>

              <p className="mt-3 text-center text-xs text-muted">
                Betaal veilig met iDEAL, Klarna, Visa of Mastercard
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
