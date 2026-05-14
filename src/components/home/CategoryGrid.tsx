import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { categories } from '@/data/categories';

export function CategoryGrid() {
  const [featured, ...rest] = categories;

  return (
    <section className="py-12 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-black text-foreground">Categorieën</h2>
            <p className="text-muted text-sm mt-1">Kies uw apparaattype</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Featured large card */}
          <Link
            href={`/categorie/${featured.slug}`}
            className="relative col-span-2 lg:col-span-1 lg:row-span-2 rounded-[20px] overflow-hidden group cursor-pointer aspect-[4/3] lg:aspect-auto lg:min-h-[400px]"
          >
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs font-bold text-success uppercase tracking-widest mb-1">
                {featured.productCount} producten
              </p>
              <h3 className="text-2xl font-display font-black text-white mb-2">{featured.name}</h3>
              <p className="text-white/80 text-sm mb-3">{featured.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-pill">
                Bekijk alle <ArrowRight size={14} />
              </span>
            </div>
          </Link>

          {/* Smaller cards */}
          {rest.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categorie/${cat.slug}`}
              className="relative rounded-[12px] overflow-hidden group cursor-pointer aspect-video"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-display font-bold text-white">{cat.name}</h3>
                <p className="text-white/70 text-xs">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
