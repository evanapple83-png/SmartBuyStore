import { HeroSection } from '@/components/home/HeroSection';
import { USPStrip } from '@/components/home/USPStrip';
import { DealsBanner } from '@/components/home/DealsBanner';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ProductSection } from '@/components/home/ProductSection';
import { BrandScroller } from '@/components/home/BrandScroller';
import { TrustSection } from '@/components/home/TrustSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <USPStrip />
      <DealsBanner />
      <CategoryGrid />
      <ProductSection />
      <BrandScroller />
      <TrustSection />
      <ReviewsSection />
      <NewsletterSection />
    </>
  );
}
