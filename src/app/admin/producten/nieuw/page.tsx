import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAllBrands, getAllCategoriesForAdmin } from '@/lib/db/catalog';
import { ProductForm } from '../ProductForm';

export const metadata = { title: 'Nieuw product · Admin' };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([getAllBrands(), getAllCategoriesForAdmin()]);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/producten" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Terug naar producten
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1">Nieuw product</h1>
      <p className="text-sm text-muted mb-6">Vul de basisgegevens in. Je kunt later altijd aanpassen.</p>

      <ProductForm mode="create" brands={brands as any} categories={categories as any} />
    </div>
  );
}
