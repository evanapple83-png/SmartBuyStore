'use client';
import type { Category } from '@/types/product';
import { cn } from '@/lib/utils';

const categoryLabels: Record<Category, string> = {
  koelkasten: 'Koelkasten',
  wasmachines: 'Wasmachines',
  vaatwassers: 'Vaatwassers',
  koken: 'Koken & Bakken',
  drogers: 'Drogers',
};

interface ProductFiltersProps {
  activeCategory: Category | 'all';
  onCategoryChange: (cat: Category | 'all') => void;
}

export function ProductFilters({ activeCategory, onCategoryChange }: ProductFiltersProps) {
  const categories: (Category | 'all')[] = ['all', 'koelkasten', 'wasmachines', 'vaatwassers', 'koken', 'drogers'];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onCategoryChange(cat)}
          className={cn(
            'px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-150 cursor-pointer border',
            activeCategory === cat
              ? 'bg-primary text-white border-primary'
              : 'bg-surface text-foreground border-border hover:border-primary hover:text-primary'
          )}
        >
          {cat === 'all' ? 'Alle producten' : categoryLabels[cat]}
        </button>
      ))}
    </div>
  );
}
