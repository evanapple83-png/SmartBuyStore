import { getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';
import { VerlanglijstClient } from './VerlanglijstClient';

export const revalidate = 60;

export default async function VerlanglijstPage() {
  const products = mapDbProducts(await getVisibleProducts());
  return <VerlanglijstClient products={products} />;
}
