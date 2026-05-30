import { getAllBrands, getAllProductsForAdmin } from '@/lib/db/catalog';
import { BrandsTable } from './BrandsTable';

export const metadata = { title: 'Merken · Admin' };

export default async function AdminBrandsPage() {
  const [brands, products] = await Promise.all([getAllBrands(), getAllProductsForAdmin()]);

  const countByBrand: Record<string, number> = {};
  for (const p of products as any[]) {
    if (p.brand_id) countByBrand[p.brand_id] = (countByBrand[p.brand_id] || 0) + 1;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Merken</h1>
        <p className="text-sm text-muted">{brands.length} merken. Inactieve merken zijn niet zichtbaar in de webshop maar blijven aan producten gekoppeld.</p>
      </div>

      <BrandsTable brands={brands as any} productCountByBrand={countByBrand} />
    </div>
  );
}
