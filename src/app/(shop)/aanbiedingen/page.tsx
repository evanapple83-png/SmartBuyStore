import { getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Zap } from 'lucide-react';

export const revalidate = 60;

export default async function AanbiedingenPage() {
  const saleProducts = mapDbProducts(await getVisibleProducts({ onSale: true }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={18} className="text-accent fill-accent" />
            <span className="text-xs font-bold text-accent uppercase tracking-widest">Aanbiedingen</span>
          </div>
          <h1 className="text-3xl font-display font-black text-foreground mb-1">
            Alle aanbiedingen
          </h1>
          <p className="text-muted text-sm">
            Dagelijks bijgewerkt — zolang de voorraad strekt. {saleProducts.length} producten in aanbieding.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <p className="text-xs text-muted">Verloopt om middernacht</p>
          <CountdownTimer />
        </div>
      </div>

      <ProductGrid products={saleProducts} columns={4} />
    </div>
  );
}
