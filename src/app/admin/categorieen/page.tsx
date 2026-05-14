import { getAllCategoriesForAdmin, getAllProductsForAdmin } from '@/lib/db/catalog';
import { CategoriesTable } from './CategoriesTable';

export const metadata = { title: 'Categorieën · Admin' };

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([getAllCategoriesForAdmin(), getAllProductsForAdmin()]);

  // Tel producten per categorie
  const countByCat: Record<string, number> = {};
  for (const p of products as any[]) {
    if (p.category_id) countByCat[p.category_id] = (countByCat[p.category_id] || 0) + 1;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Categorieën</h1>
        <p className="text-sm text-muted">{categories.length} categorieën. Inactief maken voorkomt zichtbaarheid in de webshop maar verwijdert geen producten.</p>
      </div>

      <CategoriesTable categories={categories as any} productCountByCategory={countByCat} />
    </div>
  );
}
