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

// ─── Tekstzoeken ─────────────────────────────────────────────────────────────

/** Lowercase + diacritics weg, zodat "cafe" ook "Café" vindt. */
function normalize(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Vrije-tekst-match over de relevante productvelden (naam, merk, modelnummer,
 * categorie, korte omschrijving, kenmerken en specs). Elke losse zoekterm moet
 * ergens voorkomen (AND), zodat "samsung koelkast" alleen Samsung-koelkasten geeft.
 */
export function productMatchesQuery(p: Product, query: string): boolean {
  const q = normalize(query.trim());
  if (!q) return true;
  const haystack = normalize(
    [
      p.name,
      p.shortName,
      p.brand,
      p.sku ?? '',
      CATEGORY_LABELS[p.category] ?? p.category,
      p.shortDescription,
      p.features.join(' '),
      Object.values(p.specs).join(' '),
      p.attributes.type ?? '',
      p.attributes.color ?? '',
    ].join(' ')
  );
  return q.split(/\s+/).every((term) => haystack.includes(term));
}

export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) return products;
  return products.filter((p) => productMatchesQuery(p, query));
}

// ─── Numerieke bucket-facetten ────────────────────────────────────────────────
// Numerieke eigenschappen (geluid, breedte, inhoud, vulgewicht, toeren) worden
// als keuze-buckets aangeboden — net als bij grote witgoedshops. Een bucket
// verschijnt alleen wanneer er producten in vallen, dus per categorie tonen
// automatisch alleen de relevante groepen.

export interface Bucket {
  key: string;
  label: string;
  test: (n: number) => boolean;
}

export const NOISE_BUCKETS: Bucket[] = [
  { key: 'noise-zeerstil', label: 'Zeer stil: 41 dB of stiller', test: (n) => n <= 41 },
  { key: 'noise-stil', label: 'Stil: 42–43 dB', test: (n) => n >= 42 && n <= 43 },
  { key: 'noise-normaal', label: 'Normaal: 44–45 dB', test: (n) => n >= 44 && n <= 45 },
  { key: 'noise-luid', label: 'Luider: 46 dB of meer', test: (n) => n >= 46 },
];

export const WIDTH_BUCKETS: Bucket[] = [
  { key: 'width-smal', label: 'Smal: tot 55 cm', test: (n) => n <= 55 },
  { key: 'width-normaal', label: 'Normaal: 56–65 cm', test: (n) => n >= 56 && n <= 65 },
  { key: 'width-breed', label: 'Breed: 66 cm of meer', test: (n) => n >= 66 },
];

export const CAPACITY_BUCKETS: Bucket[] = [
  { key: 'cap-s', label: 'Tot 250 liter', test: (n) => n < 250 },
  { key: 'cap-m', label: '250 – 350 liter', test: (n) => n >= 250 && n < 350 },
  { key: 'cap-l', label: '350 – 450 liter', test: (n) => n >= 350 && n < 450 },
  { key: 'cap-xl', label: '450 liter of meer', test: (n) => n >= 450 },
];

export const LOAD_BUCKETS: Bucket[] = [
  { key: 'load-7', label: 'Tot 7 kg', test: (n) => n <= 7 },
  { key: 'load-8', label: '8 kg', test: (n) => n > 7 && n <= 8 },
  { key: 'load-9', label: '9 kg', test: (n) => n > 8 && n <= 9 },
  { key: 'load-10', label: '10 kg of meer', test: (n) => n > 9 },
];

export const SPIN_BUCKETS: Bucket[] = [
  { key: 'spin-1200', label: 'Tot 1200 tpm', test: (n) => n <= 1200 },
  { key: 'spin-1400', label: '1201 – 1400 tpm', test: (n) => n > 1200 && n <= 1400 },
  { key: 'spin-1600', label: '1400 tpm of meer', test: (n) => n > 1400 },
];

/** Numerieke waarde van een product voor een bucket-dimensie (of null). */
const BUCKET_VALUE = {
  noise: (p: Product) => p.attributes.noise_db ?? null,
  widths: (p: Product) => p.attributes.width_cm ?? null,
  capacities: (p: Product) => p.attributes.capacity_total_l ?? null,
  loads: (p: Product) => p.attributes.load_kg ?? null,
  spins: (p: Product) => p.attributes.spin_rpm ?? null,
} as const;

const BUCKET_DEFS = {
  noise: NOISE_BUCKETS,
  widths: WIDTH_BUCKETS,
  capacities: CAPACITY_BUCKETS,
  loads: LOAD_BUCKETS,
  spins: SPIN_BUCKETS,
} as const;

type BucketDim = keyof typeof BUCKET_DEFS;
const BUCKET_DIMS = Object.keys(BUCKET_DEFS) as BucketDim[];

function matchesBuckets(selected: string[], n: number | null, buckets: Bucket[]): boolean {
  if (!selected.length) return true;
  if (n == null) return false;
  return buckets.some((b) => selected.includes(b.key) && b.test(n));
}

// ─── Filter state ────────────────────────────────────────────────────────────

export interface FilterState {
  categories: string[];
  brands: string[];
  energyLabels: string[];
  colors: string[];
  types: string[];
  buildTypes: string[];
  couverts: string[];
  noise: string[];
  widths: string[];
  capacities: string[];
  loads: string[];
  spins: string[];
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
  couverts: [],
  noise: [],
  widths: [],
  capacities: [],
  loads: [],
  spins: [],
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
    if (f.couverts.length && !(p.attributes.couverts != null && f.couverts.includes(String(p.attributes.couverts))))
      return false;
    for (const dim of BUCKET_DIMS) {
      if (!matchesBuckets(f[dim], BUCKET_VALUE[dim](p), BUCKET_DEFS[dim])) return false;
    }
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
    f.couverts.length +
    f.noise.length +
    f.widths.length +
    f.capacities.length +
    f.loads.length +
    f.spins.length +
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
  couverts: FacetOption[];
  noise: FacetOption[];
  widths: FacetOption[];
  capacities: FacetOption[];
  loads: FacetOption[];
  spins: FacetOption[];
  priceRange: { min: number; max: number } | null;
  noFrostCount: number;
  sameDayCount: number;
  onSaleCount: number;
  inStockCount: number;
  total: number;
}

/** Tel hoeveel producten in elke bucket vallen; lege buckets vallen weg. */
function bucketFacets(
  products: Product[],
  getN: (p: Product) => number | null,
  buckets: Bucket[]
): FacetOption[] {
  return buckets
    .map((b) => ({
      value: b.key,
      label: b.label,
      count: products.filter((p) => {
        const n = getN(p);
        return n != null && b.test(n);
      }).length,
    }))
    .filter((o) => o.count > 0);
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
    couverts: tally(
      products.map((p) => (p.attributes.couverts != null ? String(p.attributes.couverts) : undefined)),
      (v) => `${v} couverts`
    ).sort((a, b) => Number(b.value) - Number(a.value)),
    noise: bucketFacets(products, (p) => p.attributes.noise_db ?? null, NOISE_BUCKETS),
    widths: bucketFacets(products, (p) => p.attributes.width_cm ?? null, WIDTH_BUCKETS),
    capacities: bucketFacets(products, (p) => p.attributes.capacity_total_l ?? null, CAPACITY_BUCKETS),
    loads: bucketFacets(products, (p) => p.attributes.load_kg ?? null, LOAD_BUCKETS),
    spins: bucketFacets(products, (p) => p.attributes.spin_rpm ?? null, SPIN_BUCKETS),
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
