'use client';
import Link from 'next/link';

import { ArrowRight, CheckCircle, Package, Wrench, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

const trustItems = [
  { icon: Wrench, text: 'Gratis installatie — altijd' },
  { icon: Package, text: 'Zelfde dag bezorging' },
  { icon: RotateCcw, text: 'Gratis afvoer oud apparaat' },
  { icon: CheckCircle, text: '30 dagen retour' },
];

export function HeroSection() {
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

          {/* Right: Product image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-[3/4] max-h-[520px] mx-auto">
              <div className="absolute inset-0 bg-white/5 rounded-[20px] backdrop-blur-sm border border-white/10" />
              <ImageWithFallback
                src="https://sbsnl.nl/wp-content/uploads/2026/04/140117575794718_576x.webp"
                fallbackSrc="https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80"
                alt="Samsung Bespoke Multidoor"
                fill
                sizes="40vw"
                priority
                className="object-contain p-6"
              />
            </div>

            {/* Floating cards */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -left-6 top-1/4 bg-white rounded-[12px] shadow-xl p-3 flex items-center gap-2.5 max-w-[180px]"
            >
              <div className="w-8 h-8 bg-success/20 rounded-[8px] flex items-center justify-center shrink-0">
                <Wrench size={16} className="text-success" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Vandaag geïnstalleerd</p>
                <p className="text-xs text-muted">Professioneel team</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="absolute -right-4 bottom-1/4 bg-white rounded-[12px] shadow-xl p-3 flex items-center gap-2.5"
            >
              <div className="w-8 h-8 bg-accent/10 rounded-[8px] flex items-center justify-center shrink-0">
                <span className="text-accent font-black text-sm">47%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Bespaard</p>
                <p className="text-xs text-muted">Samsung Bespoke</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
