'use client';
import { X } from 'lucide-react';
import {
  CATEGORY_LABELS,
  EMPTY_FILTERS,
  countActiveFilters,
  NOISE_BUCKETS,
  WIDTH_BUCKETS,
  CAPACITY_BUCKETS,
  LOAD_BUCKETS,
  SPIN_BUCKETS,
  type FilterState,
} from '@/lib/catalog-filters';
import type { Category } from '@/types/product';

/** Bucket-sleutel → leesbaar label, voor de filter-chips. */
const BUCKET_LABEL: Record<string, string> = Object.fromEntries(
  [...NOISE_BUCKETS, ...WIDTH_BUCKETS, ...CAPACITY_BUCKETS, ...LOAD_BUCKETS, ...SPIN_BUCKETS].map((b) => [
    b.key,
    b.label,
  ])
);

interface Chip {
  label: string;
  clear: () => void;
}

export function ActiveFilterChips({
  state,
  onChange,
}: {
  state: FilterState;
  onChange: (next: FilterState) => void;
}) {
  if (countActiveFilters(state) === 0) return null;

  const chips: Chip[] = [];
  const removeFrom = (key: keyof FilterState, value: string) =>
    onChange({ ...state, [key]: (state[key] as string[]).filter((v) => v !== value) });

  const arrayFacets: { key: keyof FilterState; label: (v: string) => string }[] = [
    { key: 'categories', label: (v) => CATEGORY_LABELS[v as Category] ?? v },
    { key: 'brands', label: (v) => v },
    { key: 'energyLabels', label: (v) => `Label ${v}` },
    { key: 'types', label: (v) => v },
    { key: 'colors', label: (v) => v },
    { key: 'buildTypes', label: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    { key: 'couverts', label: (v) => `${v} couverts` },
    { key: 'noise', label: (v) => BUCKET_LABEL[v] ?? v },
    { key: 'capacities', label: (v) => BUCKET_LABEL[v] ?? v },
    { key: 'loads', label: (v) => BUCKET_LABEL[v] ?? v },
    { key: 'spins', label: (v) => BUCKET_LABEL[v] ?? v },
    { key: 'widths', label: (v) => BUCKET_LABEL[v] ?? v },
  ];

  for (const { key, label } of arrayFacets) {
    for (const v of state[key] as string[]) {
      chips.push({ label: label(v), clear: () => removeFrom(key, v) });
    }
  }

  if (state.priceMin != null || state.priceMax != null) {
    const lo = state.priceMin != null ? `€${state.priceMin}` : '€0';
    const hi = state.priceMax != null ? `€${state.priceMax}` : '∞';
    chips.push({ label: `${lo} – ${hi}`, clear: () => onChange({ ...state, priceMin: null, priceMax: null }) });
  }
  if (state.noFrost) chips.push({ label: 'No Frost', clear: () => onChange({ ...state, noFrost: false }) });
  if (state.sameDay) chips.push({ label: 'Vandaag leverbaar', clear: () => onChange({ ...state, sameDay: false }) });
  if (state.onSale) chips.push({ label: 'Aanbieding', clear: () => onChange({ ...state, onSale: false }) });
  if (state.inStock) chips.push({ label: 'Op voorraad', clear: () => onChange({ ...state, inStock: false }) });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={c.clear}
          className="flex items-center gap-1.5 bg-primary/5 text-primary border border-primary/20 text-xs font-semibold pl-3 pr-2 py-1.5 rounded-pill hover:bg-primary/10 transition-colors cursor-pointer"
        >
          {c.label}
          <X size={13} />
        </button>
      ))}
      <button
        onClick={() => onChange(EMPTY_FILTERS)}
        className="text-xs font-semibold text-accent hover:underline px-2 py-1.5 cursor-pointer"
      >
        Alles wissen
      </button>
    </div>
  );
}
