import { getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';
import { WinkelClient } from './WinkelClient';

export const revalidate = 60;

export default async function WinkelPage() {
  const products = mapDbProducts(await getVisibleProducts());
  return <WinkelClient products={products} />;
}
