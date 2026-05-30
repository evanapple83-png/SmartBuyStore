import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ImportClient } from './ImportClient';

export const metadata = { title: 'Producten importeren · Admin' };

export default function ImportPage() {
  return (
    <div>
      <Link href="/admin/producten" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Terug naar producten
      </Link>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Producten importeren (CSV)</h1>
        <p className="text-sm text-muted">Voeg je hele assortiment in één keer toe of werk het bij via een CSV-bestand.</p>
      </div>
      <ImportClient />
    </div>
  );
}
