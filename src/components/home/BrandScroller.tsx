import { brands } from '@/data/brands';

export function BrandScroller() {
  const doubled = [...brands, ...brands];

  return (
    <section className="py-10 bg-surface border-y border-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-muted">Topmerken in ons assortiment</p>
      </div>
      <div className="relative">
        <div
          className="flex gap-12 animate-scroll hover:[animation-play-state:paused] w-max"
          style={{ willChange: 'transform' }}
        >
          {doubled.map((brand, i) => (
            <div
              key={`${brand.slug}-${i}`}
              className="flex items-center justify-center px-6 py-3 rounded-[12px] bg-background border border-border hover:border-primary hover:shadow-sm transition-all duration-150 cursor-pointer min-w-[120px]"
            >
              <span className="text-sm font-bold text-foreground whitespace-nowrap">{brand.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
