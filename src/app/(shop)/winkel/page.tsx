import { CatalogBrowser } from '@/components/product/CatalogBrowser';
import { getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';
import { enrichProductRatings } from '@/lib/db/reviews';

export const revalidate = 60;

export default async function WinkelPage() {
  const products = await enrichProductRatings(mapDbProducts(await getVisibleProducts()));
  return (
    <CatalogBrowser
      products={products}
      title="Alle producten"
      description="Topmerken witgoed met gratis installatie, zelfde dag bezorging en gratis afvoer van je oude apparaat."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Alle producten' }]}
      pillDimension="category"
    />
  );
}
