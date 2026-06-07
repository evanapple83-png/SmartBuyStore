import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentPage } from '@/components/legal/ContentPage';
import { getAllBrands } from '@/lib/db/catalog';

export const metadata: Metadata = { title: 'Merken — Smart Buy Store' };
export const revalidate = 60;

export default async function MerkenPage() {
  const brands = (await getAllBrands()).filter((b: any) => b.is_active !== false);

  return (
    <ContentPage
      title="Merken"
      intro="We leveren topmerken witgoed — altijd met gratis installatie, zelfde dag bezorging en gratis afvoer van je oude apparaat."
    >
      {brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 not-prose">
          {brands.map((b: any) => (
            <Link
              key={b.id}
              href={`/winkel?merk=${encodeURIComponent(b.name)}`}
              className="flex items-center justify-center text-center bg-surface border border-border rounded-[12px] px-4 py-6 text-sm font-display font-bold text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {b.name}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted">Binnenkort meer merken beschikbaar.</p>
      )}

      <p className="text-sm text-muted">
        Staat jouw merk er niet bij of zoek je een specifiek model? Bekijk{' '}
        <Link href="/winkel" className="text-primary underline hover:no-underline">
          alle producten
        </Link>{' '}
        of mail ons via{' '}
        <a href="mailto:info@sbsnl.nl" className="text-primary underline hover:no-underline">
          info@sbsnl.nl
        </a>
        .
      </p>
    </ContentPage>
  );
}
