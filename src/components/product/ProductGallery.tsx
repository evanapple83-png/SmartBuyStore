import type { Product } from '@/types/product';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { EnergyLabel } from './EnergyLabel';

/**
 * Productgalerij. Toont de hoofdafbeelding met hover-zoom; een thumbnail-rail
 * verschijnt zodra er meerdere afbeeldingen zijn (nu meestal één per product).
 */
export function ProductGallery({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square bg-surface rounded-[20px] border border-border overflow-hidden">
        <ImageWithFallback
          src={product.images.primary}
          fallbackSrc={product.images.fallback}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-pill">NIEUW</span>
          )}
          {product.isOnSale && (
            <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-pill">SALE</span>
          )}
        </div>

        {/* Energielabel */}
        <div className="absolute top-4 right-4">
          <EnergyLabel label={product.energyLabel} size="md" />
        </div>
      </div>
    </div>
  );
}
