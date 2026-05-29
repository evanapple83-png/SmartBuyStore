import { USPBar } from '@/components/layout/USPBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/hooks/useCart';
import { CartDrawer } from '@/components/cart/CartDrawer';

/**
 * Shop layout — gedeelde chrome (USPBar + Header + Footer) voor alle
 * klant-facing routes (homepage, productpagina's, categorieën, account, etc.).
 *
 * CartProvider deelt één winkelwagen-state over de hele shop (count in header,
 * drawer, checkout). CartDrawer leeft hier zodat hij vanaf elke pagina opent.
 *
 * /admin/* gebruikt deze layout NIET (eigen sidebar-shell).
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <USPBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
