'use client';
import { useState } from 'react';
import {
  ShoppingCart,
  CheckCircle,
  Check,
  Truck,
  Wrench,
  Recycle,
  RotateCcw,
  CreditCard,
  PackageCheck,
  ChevronDown,
  HandCoins,
  FileText,
  Download,
  ShieldCheck,
} from 'lucide-react';
import type { Product } from '@/types/product';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { StarRating } from '@/components/ui/StarRating';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PostcodeChecker } from '@/components/product/PostcodeChecker';
import { ProductReviews } from '@/components/product/ProductReviews';
import type { Review } from '@/lib/db/reviews';
import { Breadcrumbs } from '@/components/product/Breadcrumbs';
import { useCart } from '@/hooks/useCart';
import { formatPriceShort } from '@/lib/price';
import { productKeySpecs } from '@/lib/product-display';
import { CATEGORY_LABELS } from '@/lib/catalog-filters';
import { cn } from '@/lib/utils';

interface ProductDetailProps {
  product: Product;
  related: Product[];
  reviews: Review[];
}

const trustListBase = [
  { icon: Wrench, text: 'Gratis professionele installatie' },
  { icon: Recycle, text: 'Gratis afvoer oud apparaat' },
  { icon: RotateCcw, text: '30 dagen retourrecht' },
];

const installSteps = [
  'We plaatsen het apparaat op de juiste plek',
  'We sluiten water en afvoer aan indien aanwezig',
  'We testen of alles naar behoren werkt',
  'We nemen al het verpakkingsmateriaal mee',
  'We voeren je oude apparaat gratis af',
];

const faqs = [
  {
    q: 'Kan mijn oude apparaat worden meegenomen?',
    a: 'Ja. Ons eigen bezorgteam neemt je oude apparaat gratis mee bij de levering — je hoeft niets te regelen.',
  },
  {
    q: 'Wat valt onder gratis installatie?',
    a: 'We plaatsen het apparaat, sluiten water/afvoer aan waar van toepassing, testen de werking en nemen het verpakkingsmateriaal mee.',
  },
  {
    q: 'Wanneer wordt mijn apparaat bezorgd?',
    a: 'Bestel je vóór 12:00, dan bezorgen we vandaag nog. Het exacte bezorgvenster zie je via de postcodecheck en in je bevestiging.',
  },
  {
    q: 'Kan ik achteraf betalen?',
    a: 'Ja, je kunt veilig betalen met iDEAL, Klarna (achteraf), Visa of Mastercard tijdens het afrekenen.',
  },
  {
    q: 'Wat als het apparaat niet past?',
    a: 'Je hebt 30 dagen retourrecht. Past het apparaat niet of voldoet het niet, dan nemen we het kosteloos retour.',
  },
];

export function ProductDetail({ product, related, reviews }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [cartState, setCartState] = useState<'idle' | 'loading' | 'success'>('idle');
  const keySpecs = productKeySpecs(product);
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const trustList = [
    product.isSameDayDelivery
      ? { icon: Truck, text: 'Vandaag bezorgd indien besteld voor 12:00' }
      : { icon: Truck, text: 'Levering binnen 3 tot 5 werkdagen' },
    ...trustListBase,
  ];

  function handleAddToCart() {
    if (cartState !== 'idle') return;
    setCartState('loading');
    setTimeout(() => {
      addToCart(product);
      setCartState('success');
      setTimeout(() => setCartState('idle'), 2000);
    }, 300);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-28 lg:pb-8">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Winkel', href: '/winkel' },
          { label: categoryLabel, href: `/categorie/${product.category}` },
          { label: product.shortName },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 mb-16">
        {/* Gallery */}
        <ProductGallery product={product} />

        {/* Purchase panel */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mb-1">{product.brand}</p>
            <h1 className="text-2xl lg:text-3xl font-display font-extrabold text-foreground leading-tight tracking-tight mb-3">
              {product.name}
            </h1>
            <a href="#reviews" className="inline-flex items-center hover:opacity-80 transition-opacity">
              <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
            </a>
          </div>

          {/* Key specs */}
          {keySpecs.length > 0 && (
            <p className="text-sm font-medium text-foreground">{keySpecs.join(' • ')}</p>
          )}

          <PriceDisplay
            currentPrice={product.currentPrice}
            originalPrice={product.originalPrice}
            size="lg"
            showSavingsAmount
          />

          {/* Cashback-actie */}
          {product.cashbackAmount != null && product.cashbackAmount > 0 && (
            <div className="relative overflow-hidden rounded-[12px] border border-success/30 bg-gradient-to-r from-success/10 via-success/5 to-transparent p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-success text-white flex items-center justify-center shrink-0 shadow-lg shadow-success/30">
                  <HandCoins size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">
                    € {formatPriceShort(product.cashbackAmount)} cashback
                    {product.cashbackLabel && (
                      <span className="font-medium text-muted"> · {product.cashbackLabel}</span>
                    )}
                  </p>
                  <p className="text-sm text-muted mt-0.5">
                    Je ontvangt € {formatPriceShort(product.cashbackAmount)} terug na aankoop — effectief betaal je{' '}
                    <span className="font-bold text-success">
                      € {formatPriceShort(Math.max(0, product.currentPrice - product.cashbackAmount))}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted leading-relaxed">{product.shortDescription}</p>

          {/* Feature chips */}
          {product.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.features.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-primary/5 text-primary px-3 py-1.5 rounded-pill border border-primary/10"
                >
                  <CheckCircle size={11} />
                  {f}
                </span>
              ))}
            </div>
          )}

          {/* Stock + levertijd */}
          <p
            className={cn(
              'flex items-center gap-2 text-sm font-semibold',
              !product.inStock ? 'text-warm' : product.isSameDayDelivery ? 'text-success' : 'text-warm'
            )}
          >
            <PackageCheck size={16} />
            {!product.inStock
              ? 'Tijdelijk uitverkocht'
              : product.isSameDayDelivery
                ? 'Op voorraad — beschikbaar voor levering vandaag'
                : 'Op voorraad — 3 tot 5 werkdagen levertijd'}
          </p>

          {/* CTA */}
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={cn(
              'flex items-center justify-center gap-2 w-full py-4 rounded-[12px] font-bold text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
              cartState === 'success'
                ? 'bg-success text-white'
                : 'bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20'
            )}
          >
            {cartState === 'loading' ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : cartState === 'success' ? (
              <>
                <Check size={20} />
                Toegevoegd aan winkelwagen
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                In winkelwagen — €{formatPriceShort(product.currentPrice)}
              </>
            )}
          </button>

          {/* Trust list */}
          <ul className="flex flex-col gap-2 pt-1">
            {product.warrantyLabel && (
              <li className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <ShieldCheck size={15} className="text-primary shrink-0" />
                {product.warrantyLabel}
              </li>
            )}
            {trustList.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                <Icon size={15} className="text-success shrink-0" />
                {text}
              </li>
            ))}
            <li className="flex items-center gap-2.5 text-sm text-muted">
              <CreditCard size={15} className="text-primary shrink-0" />
              Veilig betalen met iDEAL, Klarna, Visa of Mastercard
            </li>
          </ul>

          {/* Productbrochure */}
          {product.brochureUrl && (
            <a
              href={product.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-[12px] border border-border bg-surface text-sm font-semibold text-foreground hover:border-primary/40 hover:bg-background transition-all"
            >
              <FileText size={16} className="text-primary" />
              Download productbrochure (PDF)
              <Download size={14} className="text-muted" />
            </a>
          )}

          {/* Postcode checker */}
          <PostcodeChecker />
        </div>
      </div>

      {/* ── Specificaties ── */}
      {Object.keys(product.specs).length > 0 && (
        <Section title="Specificaties">
          <div className="bg-surface rounded-[12px] border border-border overflow-hidden max-w-3xl">
            {Object.entries(product.specs).map(([key, value], i) => (
              <div
                key={key}
                className={cn('flex items-center px-6 py-3 text-sm', i % 2 === 0 ? 'bg-background' : 'bg-surface')}
              >
                <span className="font-semibold text-foreground w-1/2">{key}</span>
                <span className="text-muted">{value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── Omschrijving ── */}
      <Section title="Omschrijving">
        <div className="max-w-3xl text-sm text-foreground/80 leading-relaxed">
          <p>{product.shortDescription}</p>
          {product.features.length > 0 && (
            <ul className="mt-4 grid sm:grid-cols-2 gap-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {/* ── Bezorging & installatie ── */}
      <Section title="Bezorging & installatie">
        <div className="max-w-3xl rounded-[16px] border border-success/20 bg-success/5 p-6">
          <p className="text-sm text-foreground mb-4">
            Onze eigen specialisten leveren én installeren je apparaat. Bij elke bestelling inbegrepen:
          </p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {installSteps.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm text-foreground">
                <CheckCircle size={16} className="text-success shrink-0 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ── Reviews ── */}
      <Section title="Reviews" id="reviews">
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          avg={product.rating}
          count={product.reviewCount}
          reviews={reviews}
        />
      </Section>

      {/* ── FAQ ── */}
      <Section title="Veelgestelde vragen">
        <div className="max-w-3xl flex flex-col gap-2">
          {faqs.map((f) => (
            <FaqItem key={f.q} question={f.q} answer={f.a} />
          ))}
        </div>
      </Section>

      {/* ── Vergelijkbare producten ── */}
      {related.length > 0 && (
        <Section title="Vergelijkbare producten">
          <ProductGrid products={related} columns={4} />
        </Section>
      )}

      {/* Sticky mobile add-to-cart bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border px-4 py-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="shrink-0">
          <p className="text-lg font-display font-extrabold text-foreground leading-none">
            €{formatPriceShort(product.currentPrice)}
          </p>
          {product.inStock && <p className="text-[11px] text-success font-medium mt-0.5">Op voorraad</p>}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 rounded-[12px] font-bold text-sm transition-all cursor-pointer disabled:opacity-50',
            cartState === 'success' ? 'bg-success text-white' : 'bg-accent text-white hover:bg-accent/90'
          )}
        >
          {cartState === 'success' ? (
            <>
              <Check size={18} /> Toegevoegd
            </>
          ) : (
            <>
              <ShoppingCart size={18} /> In winkelwagen
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function Section({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 scroll-mt-24">
      <h2 className="text-xl font-display font-extrabold text-foreground mb-5">{title}</h2>
      {children}
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-[12px] bg-surface overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer hover:bg-background transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{question}</span>
        <ChevronDown
          size={18}
          className={cn('text-muted shrink-0 transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <p className="px-5 pb-4 -mt-1 text-sm text-muted leading-relaxed">{answer}</p>}
    </div>
  );
}
