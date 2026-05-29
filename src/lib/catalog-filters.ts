import type { Product, Category } from '@/types/product';
import { calcSavingsPercent } from '@/lib/price';

export const CATEGORY_LABELS: Record<Category, string> = {
  koelkasten: 'Koelkasten',
  wasmachines: 'Wasmachines',
  vaatwassers: 'Vaatwassers',
  koken: 'Koken & Bakken',
  drogers: 'Drogers',
};

// ─── Sorting ─────────────────────────────────────────────────────────────────

export type SortKey =
  | 'recommended'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'discount'
  | 'energy'
  | 'today';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recommended', label: 'Aanbevolen' },
  { key: 'price-asc', label: 'Prijs laag-hoog' },
  { key: 'price-desc', label: 'Prijs hoog-laag' },
  { key: 'rating', label: 'Beste beoordeling' },
  { key: 'discount', label: 'Meeste korting' },
  { key: 'energy', label: 'Energiezuinig' },
  { key: 'today', label: 'Vandaag leverbaar' },
];

const ENERGY_ORDER: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };

function discountPct(p: Product): number {
  return p.originalPrice && p.originalPrice > p.currentPrice
    ? calcSavingsPercent(p.currentPrice, p.originalPrice)
    : 0;
}

export function sortProducts(products: Product[], key: SortKey): Product[] {
  const arr = [...products];
  switch (key) {
    case 'price-asc':
      return arr.sort((a, b) => a.currentPrice - b.currentPrice);
    case 'price-desc':
      return arr.sort((a, b) => b.currentPrice - a.currentPrice);
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating);
    case 'discount':
      return arr.sort((a, b) => discountPct(b) - discountPct(a));
    case 'energy':
      return arr.sort(
        (a, b) => (ENERGY_ORDER[a.energyLabel] ?? 9) - (ENERGY_ORDER[b.energyLabel] ?? 9)
      );
    case 'today':
      return arr.sort((a, b) => Number(b.isSameDayDelivery) - Number(a.isSameDayDelivery));
    case 'recommended':
    default:
      return arr; // DB sort_order al toegepast bij ophalen
  }
}

// ─── Filter state ────────────────────────────────────────────────────────────

export interface FilterState {
  categories: string[];
  brands: string[];
  energyLabels: string[];
  colors: string[];
  types: string[];
  buildTypes: string[];
  priceMin: number | null;
  priceMax: number | null;
  noFrost: boolean;
  sameDay: boolean;
  onSale: boolean;
  inStock: boolean;
}

export const EMPTY_FILTERS: FilterState = {
  categories: [],
  brands: [],
  energyLabels: [],
  colors: [],
  types: [],
  buildTypes: [],
  priceMin: null,
  priceMax: null,
  noFrost: false,
  sameDay: false,
  onSale: false,
  inStock: false,
};

export function applyFilters(products: Product[], f: FilterState): Product[] {
  return products.filter((p) => {
    if (f.categories.length && !f.categories.includes(p.category)) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.energyLabels.length && !f.energyLabels.includes(p.energyLabel)) return false;
    if (f.colors.length && !(p.attributes.color && f.colors.includes(p.attributes.color))) return false;
    if (f.types.length && !(p.attributes.type && f.types.includes(p.attributes.type))) return false;
    if (f.buildTypes.length && !(p.attributes.build_type && f.buildTypes.includes(p.attributes.build_type)))
      return false;
    if (f.priceMin != null && p.currentPrice < f.priceMin) return false;
    if (f.priceMax != null && p.currentPrice > f.priceMax) return false;
    if (f.noFrost && p.attributes.no_frost !== true) return false;
    if (f.sameDay && !p.isSameDayDelivery) return false;
    if (f.onSale && !p.isOnSale) return false;
    if (f.inStock && !p.inStock) return false;
    return true;
  });
}

export function countActiveFilters(f: FilterState): number {
  return (
    f.categories.length +
    f.brands.length +
    f.energyLabels.length +
    f.colors.length +
    f.types.length +
    f.buildTypes.length +
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    (f.noFrost ? 1 : 0) +
    (f.sameDay ? 1 : 0) +
    (f.onSale ? 1 : 0) +
    (f.inStock ? 1 : 0)
  );
}

// ─── Facets (data-driven) ────────────────────────────────────────────────────

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facets {
  categories: FacetOption[];
  brands: FacetOption[];
  energyLabels: FacetOption[];
  colors: FacetOption[];
  types: FacetOption[];
  buildTypes: FacetOption[];
  priceRange: { min: number; max: number } | null;
  noFrostCount: number;
  sameDayCount: number;
  onSaleCount: number;
  inStockCount: number;
  total: number;
}

function tally(values: (string | undefined | null)[], labeller?: (v: string) => string): FacetOption[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    if (!v) continue;
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, label: labeller ? labeller(value) : value, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function computeFacets(products: Product[]): Facets {
  const prices = products.map((p) => p.currentPrice);
  const energyLabels = tally(products.map((p) => p.energyLabel)).sort((a, b) =>
    a.value.localeCompare(b.value)
  );

  return {
    categories: tally(
      products.map((p) => p.category),
      (v) => CATEGORY_LABELS[v as Category] ?? v
    ),
    brands: tally(products.map((p) => p.brand)),
    energyLabels,
    colors: tally(products.map((p) => p.attributes.color)),
    types: tally(products.map((p) => p.attributes.type)),
    buildTypes: tally(
      products.map((p) => p.attributes.build_type),
      (v) => v.charAt(0).toUpperCase() + v.slice(1)
    ),
    priceRange: prices.length
      ? { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) }
      : null,
    noFrostCount: products.filter((p) => p.attributes.no_frost === true).length,
    sameDayCount: products.filter((p) => p.isSameDayDelivery).length,
    onSaleCount: products.filter((p) => p.isOnSale).length,
    inStockCount: products.filter((p) => p.inStock).length,
    total: products.length,
  };
}

/** Een boolean-facet is alleen zinvol als het écht onderscheidt (niet 0, niet alles). */
export function isDiscriminating(count: number, total: number): boolean {
  return count > 0 && count < total;
}
