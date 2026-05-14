import { notFound } from 'next/navigation';
import { categories } from '@/data/categories';
import { getProductsByCategory } from '@/data/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Category } from '@/types/product';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default function CategoriePage({ params }: PageProps) {
  const category = categories.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const categoryProducts = getProductsByCategory(params.slug as Category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="text-xs font-bold text-muted uppercase tracking-widest mb-2">Categorie</p>
        <h1 className="text-3xl font-display font-black text-foreground mb-2">{category.name}</h1>
        <p className="text-muted text-sm">{category.description}</p>
      </div>

      {categoryProducts.length > 0 ? (
        <ProductGrid products={categoryProducts} columns={4} />
      ) : (
        <div className="text-center py-20 text-muted">
          <p className="text-lg font-semibold mb-2">Geen producten gevonden</p>
          <p className="text-sm">Binnenkort meer producten in deze categorie.</p>
        </div>
      )}
    </div>
  );
}
