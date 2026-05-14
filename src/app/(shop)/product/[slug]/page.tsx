import { notFound } from 'next/navigation';
import { getProductBySlug, products } from '@/data/products';
import { ProductDetail } from './ProductDetail';

interface PageProps {
  params: { slug: string };
}

export default function ProductPage({ params }: PageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
