'use client';
import { useState } from 'react';
import { products } from '@/data/products';
import type { Category } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';

export default function WinkelPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');

  const filtered = activeCategory === 'all'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-black text-foreground mb-2">Alle producten</h1>
        <p className="text-muted text-sm">{filtered.length} producten gevonden</p>
      </div>
      <div className="mb-6">
        <ProductFilters activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      </div>
      <ProductGrid products={filtered} columns={4} />
    </div>
  );
}
