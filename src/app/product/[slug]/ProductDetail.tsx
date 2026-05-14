'use client';
import { useState } from 'react';
import { ShoppingCart, CheckCircle, Truck, Wrench, RotateCcw, Shield } from 'lucide-react';
import type { Product } from '@/types/product';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { EnergyLabel } from '@/components/product/EnergyLabel';
import { DeliveryBadge } from '@/components/product/DeliveryBadge';
import { StarRating } from '@/components/ui/StarRating';
import { ProductGrid } from '@/components/product/ProductGrid';
import { useCart } from '@/hooks/useCart';

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

const guarantees = [
  { icon: Truck, text: 'Zelfde dag bezorging (voor 12:00)' },
  { icon: Wrench, text: 'Gratis professionele installatie' },
  { icon: RotateCcw, text: 'Gratis afvoer oud apparaat' },
  { icon: Shield, text: '30 dagen retourrecht' },
];

export function ProductDetail({ product, related }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [cartState, setCartState] = useState<'idle' | 'loading' | 'success'>('idle');

  function handleAddToCart() {
    if (cartState !== 'idle') return;
    setCartState('loading');
    setTimeout(() => {
      addToCart(product);
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2000);
    }, 300);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* Image */}
        <div className="relative aspect-square bg-surface rounded-[20px] border border-border overflow-hidden">
          <ImageWithFallback
            src={product.images.primary}
            fallbackSrc={product.images.fallback}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            className="object-contain p-8"
          />
          {product.isNew && (
            <div className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-pill">
              NIEUW
            </div>
          )}
          {product.isOnSale && (
            <div className="absolute top-4 left-4 mt-6 bg-accent text-white text-xs font-bold px-3 py-1 rounded-pill">
              SALE
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{product.brand}</p>
            <h1 className="text-2xl font-display font-black text-foreground leading-tight mb-3">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
              <EnergyLabel label={product.energyLabel} size="md" />
            </div>
          </div>

          <PriceDisplay currentPrice={product.currentPrice} originalPrice={product.originalPrice} size="lg" />
          <DeliveryBadge />

          <p className="text-sm text-muted leading-relaxed">{product.shortDescription}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {product.features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 text-xs font-medium bg-primary/5 text-primary px-3 py-1.5 rounded-pill border border-primary/10"
              >
                <CheckCircle size={11} />
                {f}
              </span>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            className={`flex items-center justify-center gap-2 w-full py-4 rounded-[12px] font-bold text-base transition-all duration-200 cursor-pointer ${
              cartState === 'success'
                ? 'bg-success text-white'
                : 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20'
            }`}
          >
            {cartState === 'loading' ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cartState === 'success' ? (
              <>
                <CheckCircle size={20} />
                Toegevoegd aan winkelwagen
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                In winkelwagen — €{product.currentPrice.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
              </>
            )}
          </button>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {guarantees.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs text-muted">
                <Icon size={13} className="text-success shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      {Object.keys(product.specs).length > 0 && (
        <div className="mb-16">
          <h2 className="text-xl font-display font-black text-foreground mb-4">Specificaties</h2>
          <div className="bg-surface rounded-[12px] border border-border overflow-hidden">
            {Object.entries(product.specs).map(([key, value], i) => (
              <div
                key={key}
                className={`flex items-center px-6 py-3 text-sm ${i % 2 === 0 ? 'bg-background' : 'bg-surface'}`}
              >
                <span className="font-semibold text-foreground w-1/2">{key}</span>
                <span className="text-muted">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-display font-black text-foreground mb-6">Vergelijkbare producten</h2>
          <ProductGrid products={related} columns={4} />
        </div>
      )}
    </div>
  );
}
