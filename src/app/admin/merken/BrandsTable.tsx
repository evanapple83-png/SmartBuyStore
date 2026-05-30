'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Eye, EyeOff } from 'lucide-react';
import type { DbBrand } from '@/lib/db/catalog';
import { upsertBrand, toggleBrandActive } from '@/lib/db/product-actions';

export function BrandsTable({
  brands,
  productCountByBrand,
}: {
  brands: DbBrand[];
  productCountByBrand: Record<string, number>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<DbBrand | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const result = await upsertBrand(formData);
      if (!result?.ok) { setError(result?.error || 'Er ging iets mis'); return; }
      setEditing(null);
      setShowCreate(false);
      router.refresh();
    });
  }

  function toggle(b: DbBrand) {
    start(async () => {
      await toggleBrandActive(b.id, !b.is_active);
      router.refresh();
    });
  }

  const target = editing;

  return (
    <>
      <div className="bg-surface border border-border rounded-[12px] overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Merk</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Slug</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Producten</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Volgorde</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Status</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Actie</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-border last:border-b-0 hover:bg-background">
                <td className="px-4 py-3 font-medium text-foreground">{b.name}</td>
                <td className="px-4 py-3 text-muted">/{b.slug}</td>
                <td className="px-4 py-3 text-right tabular-nums">{productCountByBrand[b.id] || 0}</td>
                <td className="px-4 py-3 text-right tabular-nums text-muted">{b.sort_order}</td>
                <td className="px-4 py-3">
                  {b.is_active ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5"><Eye size={12} /> Actief</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5"><EyeOff size={12} /> Inactief</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setError(null); setEditing(b); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px]">
                    <Edit size={12} /> Bewerken
                  </button>
                  <button onClick={() => toggle(b)} disabled={pending} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] disabled:opacity-50">
                    {b.is_active ? <><EyeOff size={12} /> Inactief</> : <><Eye size={12} /> Actief</>}
                  </button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">Nog geen merken.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={() => { setError(null); setShowCreate(true); }} className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90">
        <Plus size={16} /> Nieuw merk
      </button>

      {(target || showCreate) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setEditing(null); setShowCreate(false); }}>
          <div className="bg-surface rounded-[12px] max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">{target ? 'Merk bewerken' : 'Nieuw merk'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {target && <input type="hidden" name="id" value={target.id} />}
              <BField label="Naam" name="name" required defaultValue={target?.name || ''} />
              <BField label="Slug" name="slug" defaultValue={target?.slug || ''} hint="Laat leeg om automatisch te genereren" />
              <BField label="Logo-URL" name="logo_url" defaultValue={target?.logo_url || ''} hint="Optioneel" />
              <BField label="Volgorde" name="sort_order" type="number" defaultValue={target?.sort_order?.toString() || '0'} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={target?.is_active ?? true} /> Actief
              </label>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => { setEditing(null); setShowCreate(false); }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]">Annuleren</button>
                <button type="submit" disabled={pending} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-primary/90 disabled:opacity-50">{pending ? 'Bezig...' : 'Opslaan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function BField(props: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{props.label}{props.required && <span className="text-red-500"> *</span>}</span>
      <input name={props.name} type={props.type || 'text'} required={props.required} defaultValue={props.defaultValue}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary" />
      {props.hint && <span className="text-xs text-muted">{props.hint}</span>}
    </label>
  );
}
