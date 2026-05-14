import { notFound } from 'next/navigation';
import { getProductBySlug, getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProduct, mapDbProducts } from '@/lib/db/product-mapper';
import { ProductDetail } from './ProductDetail';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 60;

export default async function ProductPage({ params }: PageProps) {
  const dbProduct = await getProductBySlug(params.slug);
  if (!dbProduct) notFound();

  const product = mapDbProduct(dbProduct);
  const all = await getVisibleProducts({ categorySlug: product.category });
  const related = mapDbProducts(all)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
