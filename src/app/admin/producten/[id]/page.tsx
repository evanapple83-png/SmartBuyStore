import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getAllBrands, getAllCategoriesForAdmin, getProductByIdForAdmin } from '@/lib/db/catalog';
import { ProductForm } from '../ProductForm';

export const metadata = { title: 'Product bewerken · Admin' };

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, brands, categories] = await Promise.all([
    getProductByIdForAdmin(params.id),
    getAllBrands(),
    getAllCategoriesForAdmin(),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/admin/producten" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Terug naar producten
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-1">{product.short_name || product.name}</h1>
      <p className="text-sm text-muted mb-6">/{product.slug}</p>

      <ProductForm mode="edit" initial={product as any} brands={brands as any} categories={categories as any} />
    </div>
  );
}
