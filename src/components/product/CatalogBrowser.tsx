'use client';
import { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/types/product';
import {
  computeFacets,
  applyFilters,
  sortProducts,
  countActiveFilters,
  EMPTY_FILTERS,
  type FilterState,
  type SortKey,
} from '@/lib/catalog-filters';
import { ProductGrid } from './ProductGrid';
import { FilterPanel } from './FilterPanel';
import { SortDropdown } from './SortDropdown';
import { ActiveFilterChips } from './ActiveFilterChips';
import { Breadcrumbs, type Crumb } from './Breadcrumbs';
import { cn } from '@/lib/utils';

interface CatalogBrowserProps {
  products: Product[];
  breadcrumbs: Crumb[];
  title: string;
  description?: string;
  /** Welke facet de snelfilter-pills aansturen */
  pillDimension?: 'type' | 'category';
}

export function CatalogBrowser({
  products,
  breadcrumbs,
  title,
  description,
  pillDimension = 'type',
}: CatalogBrowserProps) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('recommended');
  const [mobileOpen, setMobileOpen] = useState(false);

  const facets = useMemo(() => computeFacets(products), [products]);
  const results = useMemo(
    () => sortProducts(applyFilters(products, filters), sortKey),
    [products, filters, sortKey]
  );

  const activeCount = countActiveFilters(filters);

  // Quick-filter pills (type of categorie), alleen als er ≥2 opties zijn
  const pillOptions = pillDimension === 'category' ? facets.categories : facets.types;
  const pillKey: keyof FilterState = pillDimension === 'category' ? 'categories' : 'types';
  const selectedPills = filters[pillKey] as string[];
  const showPills = pillOptions.length >= 2;

  function togglePill(value: string) {
    setFilters((f) => {
      const arr = f[pillKey] as string[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...f, [pillKey]: next };
    });
  }

  // Mobile drawer: ESC + scroll lock
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mb-6">
        <h1 className="text-3xl font-display font-extrabold text-foreground tracking-tight">{title}</h1>
        {description && <p className="mt-2 text-muted text-sm max-w-2xl">{description}</p>}
      </header>

      {/* Snelfilter-pills */}
      {showPills && (
        <div className="flex flex-wrap gap-2 mb-6">
          {pillOptions.map((o) => {
            const active = selectedPills.includes(o.value);
            return (
              <button
                key={o.value}
                onClick={() => togglePill(o.value)}
                className={cn(
                  'px-3.5 py-1.5 rounded-pill text-sm font-semibold border transition-all cursor-pointer',
                  active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-foreground border-border hover:border-primary hover:text-primary'
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Toolbar: aantal + sorteren */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted">
          <strong className="text-foreground font-semibold">{results.length}</strong>{' '}
          {results.length === 1 ? 'product' : 'producten'}
        </p>
        <SortDropdown value={sortKey} onChange={setSortKey} />
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-bold text-foreground">Filters</h2>
              {activeCount > 0 && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-xs font-semibold text-accent hover:underline cursor-pointer"
                >
                  Wissen ({activeCount})
                </button>
              )}
            </div>
            <FilterPanel facets={facets} state={filters} onChange={setFilters} />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {activeCount > 0 && (
            <div className="mb-4">
              <ActiveFilterChips state={filters} onChange={setFilters} />
            </div>
          )}

          {results.length > 0 ? (
            <ProductGrid products={results} columns={3} />
          ) : (
            <div className="text-center py-20 text-muted border border-dashed border-border rounded-[16px]">
              <p className="text-lg font-semibold text-foreground mb-1">Geen producten gevonden</p>
              <p className="text-sm mb-4">Pas je filters aan om meer resultaten te zien.</p>
              {activeCount > 0 && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-sm font-semibold text-accent hover:underline cursor-pointer"
                >
                  Alle filters wissen
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: sticky Filters-knop */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-primary text-white font-semibold px-5 py-3 rounded-pill shadow-xl active:scale-95 transition-transform"
      >
        <SlidersHorizontal size={18} />
        Filters
        {activeCount > 0 && (
          <span className="bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      <div
        aria-hidden={!mobileOpen}
        className={cn('lg:hidden fixed inset-0 z-50', mobileOpen ? 'pointer-events-auto' : 'pointer-events-none')}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={cn(
            'absolute inset-0 bg-foreground/40 transition-opacity duration-300',
            mobileOpen ? 'opacity-100' : 'opacity-0'
          )}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
          className={cn(
            'absolute left-0 top-0 h-full w-full max-w-xs bg-surface shadow-2xl flex flex-col transition-transform duration-300 ease-out',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
            <h2 className="flex items-center gap-2 text-lg font-display font-bold text-foreground">
              <SlidersHorizontal size={18} className="text-primary" />
              Filters
            </h2>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-2 -mr-2 rounded-[10px] text-muted hover:text-foreground hover:bg-background transition-colors cursor-pointer"
              aria-label="Filters sluiten"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            <FilterPanel facets={facets} state={filters} onChange={setFilters} />
          </div>

          <div className="border-t border-border p-4 shrink-0 flex gap-2">
            {activeCount > 0 && (
              <button
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="px-4 py-2.5 text-sm font-semibold text-foreground border border-border rounded-[12px] hover:bg-background transition-colors cursor-pointer"
              >
                Wissen
              </button>
            )}
            <button
              onClick={() => setMobileOpen(false)}
              className="flex-1 bg-accent text-white font-bold py-2.5 rounded-[12px] hover:bg-accent/90 transition-colors cursor-pointer"
            >
              Toon {results.length} {results.length === 1 ? 'product' : 'producten'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
