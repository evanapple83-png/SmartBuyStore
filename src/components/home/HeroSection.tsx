'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle, Package, Wrench, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { EnergyLabel } from '@/components/product/EnergyLabel';
import type { Product } from '@/types/product';

const trustItems = [
  { icon: Wrench, text: 'Gratis installatie — altijd' },
  { icon: Package, text: 'Zelfde dag bezorging' },
  { icon: RotateCcw, text: 'Gratis afvoer oud apparaat' },
  { icon: CheckCircle, text: '30 dagen retour' },
];

const ROTATE_MS = 4500;

export function HeroSection({ products = [] }: { products?: Product[] }) {
  const reduceMotion = useReducedMotion();
  // Toon een handvol producten met een bruikbare foto; aanbiedingen eerst.
  const slides = products
    .filter((p) => p.images?.primary)
    .sort((a, b) => Number(b.isOnSale) - Number(a.isOnSale))
    .slice(0, 6);

  const [index, setIndex] = useState(0);
  const current = slides[index];

  // Auto-roteren (uit bij reduced-motion of <2 slides).
  useEffect(() => {
    if (reduceMotion || slides.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [reduceMotion, slides.length]);

  return (
    <section className="relative bg-gradient-to-br from-primary via-[#0d2a5c] to-[#0B1F42] overflow-hidden">
      {/* Background pattern (decoratief — mag geen klikken opvangen) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-white"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-success/20 text-success text-xs font-bold px-3 py-1.5 rounded-pill mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Vandaag nog bezorgd — bestel voor 11:00
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-tight mb-5">
              Thuis bezorgd.
              <br />
              <span className="text-success">Geïnstalleerd.</span>
              <br />
              Klaar.
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
              Topmerken witgoed. Vandaag besteld voor 11:00 = vandaag in huis, professioneel geïnstalleerd. Gratis.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                href="/aanbiedingen"
                className="inline-flex items-center gap-2 bg-accent text-white font-bold px-6 py-3.5 rounded-[12px] hover:bg-accent/90 transition-all duration-150 cursor-pointer shadow-lg shadow-accent/30"
              >
                Bekijk aanbiedingen
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/winkel"
                className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-6 py-3.5 rounded-[12px] hover:bg-white/10 transition-all duration-150 cursor-pointer"
              >
                Alle categorieën
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {trustItems.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm text-white/80">
                  <Icon size={14} className="text-success shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Product carousel */}
          {current && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-[3/4] max-h-[520px] mx-auto">
                <div className="absolute inset-0 bg-white/5 rounded-[20px] backdrop-blur-sm border border-white/10" />

                {/* Energielabel badge */}
                <div className="absolute top-4 right-4 z-20">
                  <EnergyLabel label={current.energyLabel} size="md" />
                </div>

                {/* Roterende productfoto (klikbaar) */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Link href={`/product/${current.slug}`} className="block w-full h-full" aria-label={current.shortName}>
                      <ImageWithFallback
                        src={current.images.primary}
                        fallbackSrc={current.images.fallback}
                        alt={current.shortName}
                        fill
                        sizes="40vw"
                        priority
                        className="object-contain p-6"
                      />
                    </Link>
                  </motion.div>
                </AnimatePresence>

                {/* Navigatie-dots */}
                {slides.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {slides.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => setIndex(i)}
                        aria-label={`Toon product ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${
                          i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Floating card: value prop (statisch) */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -left-6 top-[18%] bg-white rounded-[12px] shadow-xl p-3 flex items-center gap-2.5 max-w-[180px]"
              >
                <div className="w-8 h-8 bg-success/20 rounded-[8px] flex items-center justify-center shrink-0">
                  <Wrench size={16} className="text-success" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Vandaag geïnstalleerd</p>
                  <p className="text-xs text-muted">Professioneel team</p>
                </div>
              </motion.div>

              {/* Floating card: huidig product (dynamisch) */}
              <Link
                href={`/product/${current.slug}`}
                className="absolute -right-4 bottom-[14%] bg-white rounded-[12px] shadow-xl p-3 w-[200px] block hover:shadow-2xl transition-shadow"
              >
                <p className="text-[10px] font-bold text-muted uppercase tracking-wide">{current.brand}</p>
                <p className="text-xs font-bold text-foreground leading-snug line-clamp-2 mb-1.5">
                  {current.shortName}
                </p>
                <div className="flex items-end justify-between gap-2">
                  <PriceDisplay
                    currentPrice={current.currentPrice}
                    originalPrice={current.originalPrice}
                    size="sm"
                  />
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white shrink-0">
                    <ArrowRight size={13} />
                  </span>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
