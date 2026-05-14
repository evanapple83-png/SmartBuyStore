import { USPBar } from '@/components/layout/USPBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/**
 * Shop layout — gedeelde chrome (USPBar + Header + Footer) voor alle
 * klant-facing routes (homepage, productpagina's, categorieën, account, etc.).
 *
 * /admin/* gebruikt deze layout NIET (eigen sidebar-shell).
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <USPBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
