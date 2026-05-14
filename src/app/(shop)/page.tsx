import { HeroSection } from '@/components/home/HeroSection';
import { USPStrip } from '@/components/home/USPStrip';
import { DealsBanner } from '@/components/home/DealsBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductSection } from '@/components/home/ProductSection';
import { BrandScroller } from '@/components/home/BrandScroller';
import { TrustSection } from '@/components/home/TrustSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { getVisibleProducts } from '@/lib/db/catalog';
import { mapDbProducts } from '@/lib/db/product-mapper';

export const revalidate = 60; // ISR: ververs max elke minuut

export default async function HomePage() {
  const products = mapDbProducts(await getVisibleProducts());

  return (
    <>
      <HeroSection />
      <USPStrip />
      <DealsBanner products={products} />
      <CategoryGrid />
      <ProductSection products={products} />
      <BrandScroller />
      <TrustSection />
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
