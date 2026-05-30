import { notFound } from 'next/navigation';
import { CatalogBrowser } from '@/components/product/CatalogBrowser';
import { getCategoryBySlug, getVisibleProducts, getActiveCategories } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';
import { enrichProductRatings } from '@/lib/db/reviews';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 60;

// Pre-render alle actieve categorieën op build-tijd.
export async function generateStaticParams() {
  const cats = await getActiveCategories();
  return (cats as any[]).map((c) => ({ slug: c.slug }));
}

export default async function CategoriePage({ params }: PageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const categoryProducts = await enrichProductRatings(mapDbProducts(await getVisibleProducts({ categorySlug: params.slug })));

  return (
    <CatalogBrowser
      products={categoryProducts}
      title={category.name}
      description={category.description ?? undefined}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Winkel', href: '/winkel' },
        { label: category.name },
      ]}
      pillDimension="type"
    />
  );
}
