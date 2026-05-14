import Link from 'next/link';
import { Plus, Eye, EyeOff } from 'lucide-react';
import { getAllProductsForAdmin } from '@/lib/db/catalog';
import { ProductRowActions } from './ProductRowActions';

export const metadata = { title: 'Producten · Admin' };

export default async function AdminProductsPage() {
  const products = await getAllProductsForAdmin();

  const visible = products.filter((p: any) => !p.is_hidden).length;
  const hidden = products.length - visible;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Producten</h1>
          <p className="text-sm text-muted">
            {products.length} totaal · {visible} zichtbaar · {hidden} verborgen
          </p>
        </div>
        <Link
          href="/admin/producten/nieuw"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Nieuw product
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            Nog geen producten. Klik op <strong>Nieuw product</strong> om er één toe te voegen.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Naam</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Merk</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Categorie</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Prijs</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Voorraad</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Actie</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-b border-border last:border-b-0 hover:bg-background transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/producten/${p.id}`} className="font-medium text-foreground hover:underline">
                      {p.short_name || p.name}
                    </Link>
                    <div className="text-xs text-muted">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted">{p.brand?.name || '—'}</td>
                  <td className="px-4 py-3 text-muted">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    € {Number(p.current_price).toFixed(2).replace('.', ',')}
                    {p.original_price && (
                      <div className="text-xs text-muted line-through">
                        € {Number(p.original_price).toFixed(2).replace('.', ',')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.in_stock ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        Op voorraad
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5">
                        Niet op voorraad
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.is_hidden ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5">
                        <EyeOff size={12} /> Verborgen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        <Eye size={12} /> Zichtbaar
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowActions id={p.id} isHidden={p.is_hidden} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
