import Link from 'next/link';
import { Plus, Eye, EyeOff, Upload } from 'lucide-react';
import { getAllProductsForAdmin } from '@/lib/db/catalog';
import { ProductRowActions } from './ProductRowActions';
import { AdminListSearch } from '../AdminListSearch';

export const metadata = { title: 'Producten · Admin' };

export default async function AdminProductsPage({ searchParams }: { searchParams: { q?: string } }) {
  const all = await getAllProductsForAdmin();
  const q = (searchParams.q || '').trim().toLowerCase();
  const products = q
    ? (all as any[]).filter((p) =>
        [p.name, p.short_name, p.sku, p.slug, p.brand?.name].filter(Boolean).some((v: string) => String(v).toLowerCase().includes(q)))
    : all;

  const visible = (products as any[]).filter((p: any) => !p.is_hidden).length;
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
        <div className="flex items-center gap-2">
          <Link
            href="/admin/producten/import"
            className="inline-flex items-center gap-2 bg-surface border border-border text-foreground text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-background transition-colors"
          >
            <Upload size={16} /> Importeren
          </Link>
          <Link
            href="/admin/producten/nieuw"
            className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Nieuw product
          </Link>
        </div>
      </div>

      <AdminListSearch placeholder="Zoek op naam, artikelnummer of merk..." />

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            {q ? 'Geen producten gevonden voor je zoekopdracht.' : <>Nog geen producten. Klik op <strong>Nieuw product</strong> om er één toe te voegen.</>}
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
                    <div className="text-xs text-muted">
                      {p.sku ? <span className="font-mono">{p.sku}</span> : <span className="opacity-60">geen art.nr</span>} · {p.slug}
                    </div>
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
                    {(p.stock_count ?? 0) <= 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                        Uitverkocht
                      </span>
                    ) : (p.stock_count ?? 0) <= 3 ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                        Nog {p.stock_count}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        {p.stock_count} op voorraad
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
