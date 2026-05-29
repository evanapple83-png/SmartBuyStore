'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, Check, Scale } from 'lucide-react';
import type { Product } from '@/types/product';
import { useCompare } from '@/hooks/useCompare';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PriceDisplay } from './PriceDisplay';
import { EnergyLabel } from './EnergyLabel';
import { DeliveryBadge } from './DeliveryBadge';
import { StarRating } from '@/components/ui/StarRating';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (productId: string) => void;
  isInWishlist?: boolean;
}

/** First few spec values → "635L • No Frost • Energielabel E" */
function specsLine(specs: Record<string, string>): string {
  return Object.values(specs).slice(0, 3).join(' • ');
}

export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }: ProductCardProps) {
  const [cartState, setCartState] = useState<'idle' | 'loading' | 'success'>('idle');
  const specs = specsLine(product.specs);
  const { toggle: toggleCompare, isSelected, canAdd } = useCompare();
  const inCompare = isSelected(product.id);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (cartState !== 'idle') return;
    setCartState('loading');
    setTimeout(() => {
      setCartState('success');
      onAddToCart?.(product);
      setTimeout(() => setCartState('idle'), 1500);
    }, 300);
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative bg-surface rounded-[12px] overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <ImageWithFallback
          src={product.images.primary}
          fallbackSrc={product.images.fallback}
          alt={product.shortName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges top-left */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-pill">
              NIEUW
            </span>
          )}
          {product.isOnSale && (
            <span className="bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-pill">
              SALE
            </span>
          )}
        </div>

        {/* Energy label top-right */}
        <div className="absolute top-2 right-2">
          <EnergyLabel label={product.energyLabel} />
        </div>

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(product.id);
          }}
          className={cn(
            'absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 shadow-md transition-all duration-150 cursor-pointer',
            'opacity-0 group-hover:opacity-100 md:opacity-0',
            isInWishlist ? 'text-accent' : 'text-muted hover:text-accent'
          )}
          aria-label={isInWishlist ? 'Verwijder uit verlanglijst' : 'Voeg toe aan verlanglijst'}
        >
          <Heart size={16} className={isInWishlist ? 'fill-accent' : ''} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-xs font-bold text-muted uppercase tracking-wide">{product.brand}</p>
        <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.shortName}
        </h3>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {/* Key specs row */}
        {specs && (
          <p className="text-xs text-muted leading-snug line-clamp-1">{specs}</p>
        )}

        <DeliveryBadge />

        {/* Price + CTA pinned to bottom for equal-height cards */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
          <PriceDisplay
            currentPrice={product.currentPrice}
            originalPrice={product.originalPrice}
            size="md"
            showSavingsAmount
          />
          <button
            onClick={handleAddToCart}
            className={cn(
              'w-full flex items-center justify-center gap-1.5 text-sm font-semibold px-3 py-2.5 rounded-[12px] transition-all duration-200 cursor-pointer',
              cartState === 'success'
                ? 'bg-success text-white'
                : 'bg-accent text-white hover:bg-accent/90 active:scale-[0.98]'
            )}
            aria-label={`${product.shortName} in winkelwagen`}
          >
            {cartState === 'loading' ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cartState === 'success' ? (
              <>
                <Check size={16} />
                Toegevoegd
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                In winkelwagen
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              toggleCompare(product);
            }}
            disabled={!inCompare && !canAdd}
            className={cn(
              'flex items-center justify-center gap-1.5 text-xs font-semibold py-1 rounded-[10px] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
              inCompare ? 'text-primary' : 'text-muted hover:text-primary'
            )}
            aria-pressed={inCompare}
            title={!inCompare && !canAdd ? 'Je kunt maximaal 4 producten vergelijken' : undefined}
          >
            {inCompare ? <Check size={13} /> : <Scale size={13} />}
            {inCompare ? 'In vergelijking' : 'Vergelijk'}
          </button>
        </div>
      </div>
    </Link>
  );
}
