'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import type { Product } from '@/types/product';
import { useWishlist } from '@/hooks/useWishlist';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Breadcrumbs } from '@/components/product/Breadcrumbs';

export function VerlanglijstClient({ products }: { products: Product[] }) {
  const { wishlist } = useWishlist();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const liked = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Verlanglijst' }]} />

      <header className="mb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">Verlanglijst</h1>
        <p className="mt-2 text-muted text-sm">
          {mounted
            ? liked.length > 0
              ? `${liked.length} ${liked.length === 1 ? 'product' : 'producten'} bewaard`
              : 'Je hebt nog geen producten bewaard.'
            : ' '}
        </p>
      </header>

      {!mounted ? null : liked.length > 0 ? (
        <ProductGrid products={liked} columns={4} />
      ) : (
        <div className="text-center py-20 border border-dashed border-border rounded-[16px]">
          <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-muted" />
          </div>
          <h2 className="text-lg font-display font-bold text-foreground mb-1">Je verlanglijst is leeg</h2>
          <p className="text-sm text-muted mb-5">
            Tik op het hartje bij een product om het hier te bewaren.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="/aanbiedingen"
              className="bg-accent text-white font-semibold px-5 py-2.5 rounded-[12px] hover:bg-accent/90 transition-colors text-sm"
            >
              Bekijk aanbiedingen
            </Link>
            <Link
              href="/winkel"
              className="bg-surface border border-primary text-primary font-semibold px-5 py-2.5 rounded-[12px] hover:bg-background transition-colors text-sm"
            >
              Alle producten
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
