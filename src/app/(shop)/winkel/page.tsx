import { CatalogBrowser } from '@/components/product/CatalogBrowser';
import { getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';
import { enrichProductRatings } from '@/lib/db/reviews';

export const revalidate = 60;

interface WinkelPageProps {
  searchParams?: { q?: string; merk?: string };
}

export default async function WinkelPage({ searchParams }: WinkelPageProps) {
  const query = (searchParams?.q ?? '').trim();
  const brand = (searchParams?.merk ?? '').trim();
  const products = await enrichProductRatings(mapDbProducts(await getVisibleProducts()));

  const title = query
    ? `Zoekresultaten voor "${query}"`
    : brand
      ? brand
      : 'Alle producten';
  const description = query || brand
    ? undefined
    : 'Topmerken witgoed met gratis installatie, zelfde dag bezorging en gratis afvoer van je oude apparaat.';
  const breadcrumbs = query
    ? [{ label: 'Home', href: '/' }, { label: 'Winkel', href: '/winkel' }, { label: 'Zoeken' }]
    : brand
      ? [{ label: 'Home', href: '/' }, { label: 'Merken', href: '/merken' }, { label: brand }]
      : [{ label: 'Home', href: '/' }, { label: 'Alle producten' }];

  return (
    <CatalogBrowser
      products={products}
      title={title}
      description={description}
      breadcrumbs={breadcrumbs}
      pillDimension="category"
      query={query}
      initialBrand={brand}
    />
  );
}
