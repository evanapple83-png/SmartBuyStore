import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { ProductGrid } from '@/components/product/ProductGrid';
import { getSaleProducts } from '@/data/products';

export function DealsBanner() {
  const saleProducts = getSaleProducts().slice(0, 4);

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-accent text-xs font-bold uppercase tracking-widest">Aanbiedingen</span>
            </div>
            <h2 className="text-2xl font-display font-black text-foreground">
              Dagelijks bijgewerkte deals
            </h2>
            <p className="text-sm text-muted mt-1">Zolang de voorraad strekt — loopt af om middernacht</p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <CountdownTimer />
            <Link
              href="/aanbiedingen"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors cursor-pointer"
            >
              Alle aanbiedingen
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <ProductGrid products={saleProducts} columns={4} />
      </div>
    </section>
  );
}
