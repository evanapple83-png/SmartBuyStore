'use client';
import { useState } from 'react';
import type { Product } from '@/types/product';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { EnergyLabel } from './EnergyLabel';
import { formatPriceShort } from '@/lib/price';
import { cn } from '@/lib/utils';

/**
 * Productgalerij. Toont de actieve foto met hover-zoom; een thumbnail-rail
 * verschijnt zodra er meerdere foto's zijn (hoofdfoto + images_extra).
 */
export function ProductGallery({ product }: { product: Product }) {
  const images = [product.images.primary, ...(product.images.extra || [])].filter(Boolean);
  const [active, setActive] = useState(0);
  const activeSrc = images[active] || product.images.primary;

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square bg-surface rounded-[20px] border border-border overflow-hidden">
        <ImageWithFallback
          key={activeSrc}
          src={activeSrc}
          fallbackSrc={product.images.fallback}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
          {product.isNew && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-pill">NIEUW</span>
          )}
          {product.isOnSale && (
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-pill">SALE</span>
          )}
          {product.cashbackAmount != null && product.cashbackAmount > 0 && (
            <span className="bg-success text-white text-xs font-bold px-3 py-1 rounded-pill shadow-md shadow-success/30">
              € {formatPriceShort(product.cashbackAmount)} CASHBACK
            </span>
          )}
        </div>

        {/* Energielabel */}
        <div className="absolute top-4 right-4">
          <EnergyLabel label={product.energyLabel} size="md" />
        </div>
      </div>

      {/* Thumbnail-rail (alleen bij meerdere foto's) */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Foto ${i + 1} van ${images.length}`}
              aria-current={i === active}
              className={cn(
                'relative w-20 h-20 shrink-0 rounded-[12px] border bg-surface overflow-hidden transition-all cursor-pointer',
                i === active
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/40'
              )}
            >
              <ImageWithFallback
                src={src}
                fallbackSrc={product.images.fallback}
                alt={`${product.shortName} — foto ${i + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
