import { notFound } from 'next/navigation';
import { CatalogBrowser } from '@/components/product/CatalogBrowser';
import { getCategoryBySlug, getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 60;

export default async function CategoriePage({ params }: PageProps) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const categoryProducts = mapDbProducts(await getVisibleProducts({ categorySlug: params.slug }));

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
