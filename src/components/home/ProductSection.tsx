'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Category, Product } from '@/types/product';
import { ProductGrid } from '@/components/product/ProductGrid';
import { cn } from '@/lib/utils';

type Tab = 'trending' | Category;

const tabs: { id: Tab; label: string }[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'koelkasten', label: 'Koelkasten' },
  { id: 'wasmachines', label: 'Wasmachines' },
  { id: 'vaatwassers', label: 'Vaatwassers' },
];

export function ProductSection({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState<Tab>('trending');

  const filtered = activeTab === 'trending'
    ? products.slice(0, 8)
    : products.filter((p) => p.category === activeTab).slice(0, 8);

  return (
    <section className="py-12 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-display font-black text-foreground">Onze producten</h2>
            <p className="text-muted text-sm mt-1">Topkwaliteit, vandaag bezorgd</p>
          </div>
          <Link
            href="/winkel"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-accent transition-colors cursor-pointer"
          >
            Alle producten <ArrowRight size={14} />
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'px-4 py-2 rounded-pill text-sm font-semibold transition-all duration-150 cursor-pointer border',
                activeTab === id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-foreground border-border hover:border-primary hover:text-primary'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <ProductGrid products={filtered} columns={4} />
      </div>
    </section>
  );
}
