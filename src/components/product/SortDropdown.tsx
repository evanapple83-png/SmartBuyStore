'use client';
import { ArrowUpDown } from 'lucide-react';
import { SORT_OPTIONS, type SortKey } from '@/lib/catalog-filters';

export function SortDropdown({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  return (
    <label className="relative flex items-center gap-2">
      <span className="sr-only">Sorteren op</span>
      <ArrowUpDown size={16} className="text-muted shrink-0 hidden sm:block" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="appearance-none text-sm font-medium text-foreground bg-surface border border-border rounded-[10px] pl-3 pr-8 py-2 cursor-pointer focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
