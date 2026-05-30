import { notFound } from 'next/navigation';
import { getProductBySlug, getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProduct, mapDbProducts } from '@/lib/db/product-mapper';
import { getReviewAggregate, getReviewAggregates, getPublishedReviews, getReviewEligibility } from '@/lib/db/reviews';
import { ProductDetail } from './ProductDetail';

interface PageProps {
  params: { slug: string };
}

export const revalidate = 60;

// Pre-render alle zichtbare producten op build-tijd → direct uit cache/CDN.
// Nieuwe producten renderen on-demand (ISR) en worden daarna gecachet.
export async function generateStaticParams() {
  const products = await getVisibleProducts();
  return (products as any[]).map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: PageProps) {
  const dbProduct = await getProductBySlug(params.slug);
  if (!dbProduct) notFound();

  const product = mapDbProduct(dbProduct);
  const all = await getVisibleProducts({ categorySlug: product.category });
  const related = mapDbProducts(all)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Echte reviews (cookie-loos → pagina blijft statisch). Eligibility wordt
  // server-side in de submit-actie afgehandeld, niet hier.
  const [agg, reviews, relAgg] = await Promise.all([
    getReviewAggregate(product.id),
    getPublishedReviews(product.id),
    getReviewAggregates(related.map((r) => r.id)),
  ]);
  product.rating = agg.avg;
  product.reviewCount = agg.count;
  for (const r of related) {
    const a = relAgg.get(r.id);
    if (a) { r.rating = a.avg; r.reviewCount = a.count; }
  }

  return <ProductDetail product={product} related={related} reviews={reviews} />;
}
