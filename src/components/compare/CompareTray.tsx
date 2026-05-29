'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { X, Scale, Check, Minus, ArrowRight, Truck, Wrench } from 'lucide-react';
import { useCompare } from '@/hooks/useCompare';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { StarRating } from '@/components/ui/StarRating';
import { formatPriceShort } from '@/lib/price';
import { CATEGORY_LABELS } from '@/lib/catalog-filters';
import type { Product, Category } from '@/types/product';
import { cn } from '@/lib/utils';

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const yes = <Check size={16} className="text-success mx-auto" aria-label="Ja" />;
const no = <Minus size={16} className="text-muted mx-auto" aria-label="Nee" />;

interface Row {
  label: string;
  render: (p: Product) => React.ReactNode;
}

const ROWS: Row[] = [
  { label: 'Prijs', render: (p) => <span className="font-display font-extrabold">€{formatPriceShort(p.currentPrice)}</span> },
  { label: 'Merk', render: (p) => p.brand },
  { label: 'Categorie', render: (p) => CATEGORY_LABELS[p.category as Category] ?? p.category },
  { label: 'Beoordeling', render: (p) => <StarRating rating={p.rating} reviewCount={p.reviewCount} /> },
  { label: 'Energielabel', render: (p) => p.energyLabel },
  { label: 'Inhoud', render: (p) => (p.attributes.capacity_total_l ? `${p.attributes.capacity_total_l}L` : '—') },
  { label: 'No Frost', render: (p) => (p.attributes.no_frost ? yes : no) },
  { label: 'Geluidsniveau', render: (p) => (p.attributes.noise_db ? `${p.attributes.noise_db} dB` : '—') },
  { label: 'Uitvoering', render: (p) => (p.attributes.build_type ? cap(p.attributes.build_type) : '—') },
  { label: 'Vandaag leverbaar', render: (p) => (p.isSameDayDelivery ? yes : no) },
  { label: 'Gratis installatie', render: () => yes },
  { label: 'Op voorraad', render: (p) => (p.inStock ? yes : no) },
];

export function CompareTray() {
  const { items, remove, clear, isOpen, open, close } = useCompare();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  if (items.length === 0) return null;

  return (
    <>
      {/* Sticky tray */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <Scale size={18} className="text-primary hidden sm:block" />
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              Vergelijk <span className="text-primary">{items.length}</span>
              <span className="hidden sm:inline"> {items.length === 1 ? 'product' : 'producten'}</span>
            </span>
          </div>

          {/* Selected thumbnails */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {items.map((p) => (
              <div
                key={p.id}
                className="relative w-12 h-12 shrink-0 rounded-[8px] border border-border bg-gray-50 overflow-hidden group"
              >
                <ImageWithFallback
                  src={p.images.primary}
                  fallbackSrc={p.images.fallback}
                  alt={p.shortName}
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
                <button
                  onClick={() => remove(p.id)}
                  className="absolute -top-1 -right-1 bg-foreground text-white rounded-full w-4 h-4 flex items-center justify-center shadow cursor-pointer"
                  aria-label={`${p.shortName} verwijderen uit vergelijking`}
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clear}
              className="text-xs font-semibold text-muted hover:text-accent transition-colors cursor-pointer px-2"
            >
              Wissen
            </button>
            <button
              onClick={open}
              disabled={items.length < 2}
              className="flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[12px] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Vergelijk nu
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/50" onClick={close} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Producten vergelijken"
            className="relative bg-surface rounded-[16px] shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <h2 className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
                <Scale size={20} className="text-primary" />
                Producten vergelijken
              </h2>
              <button
                onClick={close}
                className="p-2 -mr-2 rounded-[10px] text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
                aria-label="Sluiten"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-surface w-32 min-w-32" />
                    {items.map((p) => (
                      <th key={p.id} className="p-3 align-top border-l border-border min-w-[160px]">
                        <div className="relative w-full aspect-square bg-gray-50 rounded-[10px] overflow-hidden mb-2">
                          <ImageWithFallback
                            src={p.images.primary}
                            fallbackSrc={p.images.fallback}
                            alt={p.shortName}
                            fill
                            sizes="160px"
                            className="object-contain p-2"
                          />
                          <button
                            onClick={() => remove(p.id)}
                            className="absolute top-1 right-1 bg-white/90 text-muted hover:text-accent rounded-full w-6 h-6 flex items-center justify-center shadow cursor-pointer"
                            aria-label={`${p.shortName} verwijderen`}
                          >
                            <X size={13} />
                          </button>
                        </div>
                        <Link
                          href={`/product/${p.slug}`}
                          onClick={close}
                          className="block text-xs font-semibold text-foreground leading-snug line-clamp-2 hover:text-primary text-left"
                        >
                          {p.shortName}
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, ri) => (
                    <tr key={row.label} className={ri % 2 === 0 ? 'bg-background' : 'bg-surface'}>
                      <th
                        scope="row"
                        className={cn(
                          'sticky left-0 z-10 text-left font-semibold text-foreground px-3 py-3 align-middle',
                          ri % 2 === 0 ? 'bg-background' : 'bg-surface'
                        )}
                      >
                        {row.label}
                      </th>
                      {items.map((p) => (
                        <td key={p.id} className="px-3 py-3 text-center align-middle border-l border-border text-foreground/90">
                          {row.render(p)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-border shrink-0 bg-surface">
              <div className="flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Truck size={13} className="text-success" /> Vandaag bezorgd
                </span>
                <span className="flex items-center gap-1.5">
                  <Wrench size={13} className="text-success" /> Gratis installatie
                </span>
              </div>
              <button
                onClick={clear}
                className="text-sm font-semibold text-accent hover:underline cursor-pointer"
              >
                Vergelijking wissen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
