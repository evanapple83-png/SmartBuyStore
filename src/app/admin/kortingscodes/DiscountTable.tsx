'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import type { DiscountCode, DiscountStat } from '@/lib/db/discount-codes';
import { upsertDiscountCode, toggleDiscountActive, deleteDiscountCode } from '@/lib/db/discount-actions';

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}
function validityLabel(c: DiscountCode) {
  if (!c.valid_from && !c.valid_until) return 'Altijd geldig';
  return `${formatDate(c.valid_from)} – ${formatDate(c.valid_until)}`;
}

export function DiscountTable({ codes, stats }: { codes: DiscountCode[]; stats: Record<string, DiscountStat> }) {
  const router = useRouter();
  // Meest effectieve code = meeste betaalde orders (dan hoogste omzet).
  const bestCode = Object.values(stats || {}).sort((a, b) => b.orders - a.orders || b.revenue - a.revenue)[0]?.code;
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<DiscountCode | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const r = await upsertDiscountCode(formData);
      if (!r.ok) { setError(r.error || 'Er ging iets mis'); return; }
      setEditing(null);
      setShowCreate(false);
      router.refresh();
    });
  }

  function toggle(c: DiscountCode) {
    start(async () => {
      await toggleDiscountActive(c.id, !c.is_active);
      router.refresh();
    });
  }

  function doDelete() {
    if (!confirmDelete) return;
    start(async () => {
      await deleteDiscountCode(confirmDelete.id);
      setConfirmDelete(null);
      router.refresh();
    });
  }

  const editTarget = editing;

  return (
    <>
      <div className="bg-surface border border-border rounded-[12px] overflow-hidden mb-4">
        {codes.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            <Tag size={32} className="mx-auto mb-2 opacity-50" />
            Nog geen kortingscodes. Maak er hieronder een aan.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Code</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Korting</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Min. order</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Gebruik</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Betaald</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Omzet</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Geldigheid</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Actie</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-background">
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">
                    {c.code}
                    {bestCode && c.code.toUpperCase() === bestCode && (
                      <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5 align-middle">Top</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : euro(c.value)}</td>
                  <td className="px-4 py-3 text-muted">{c.min_order_total > 0 ? euro(c.min_order_total) : '—'}</td>
                  <td className="px-4 py-3 text-muted tabular-nums">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : ''}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{stats[c.code.toUpperCase()]?.orders || 0}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-muted">{stats[c.code.toUpperCase()] ? euro(stats[c.code.toUpperCase()].revenue) : '—'}</td>
                  <td className="px-4 py-3 text-muted text-xs">{validityLabel(c)}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Actief</span>
                    ) : (
                      <span className="text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5">Inactief</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => toggle(c)} disabled={pending} className="px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] disabled:opacity-50">
                        {c.is_active ? 'Uit' : 'Aan'}
                      </button>
                      <button onClick={() => { setError(null); setEditing(c); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px]">
                        <Edit size={12} /> Bewerken
                      </button>
                      <button onClick={() => setConfirmDelete(c)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-[6px]">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={() => { setError(null); setShowCreate(true); }}
        className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90"
      >
        <Plus size={16} /> Nieuwe kortingscode
      </button>

      {(editTarget || showCreate) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setEditing(null); setShowCreate(false); }}>
          <div className="bg-surface rounded-[12px] max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">{editTarget ? 'Kortingscode bewerken' : 'Nieuwe kortingscode'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {editTarget && <input type="hidden" name="id" value={editTarget.id} />}
              <Field label="Code" name="code" required defaultValue={editTarget?.code || ''} hint="Bv. WELKOM10. Wordt automatisch hoofdletters." />
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Type</span>
                  <select name="type" defaultValue={editTarget?.type || 'percentage'} className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Vast bedrag (€)</option>
                  </select>
                </label>
                <Field label="Waarde" name="value" type="number" required defaultValue={editTarget?.value?.toString() || ''} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Min. orderwaarde (€)" name="min_order_total" type="number" defaultValue={editTarget?.min_order_total?.toString() || '0'} />
                <Field label="Max. gebruik" name="max_uses" type="number" defaultValue={editTarget?.max_uses?.toString() || ''} hint="Leeg = onbeperkt" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Geldig vanaf" name="valid_from" type="date" defaultValue={editTarget?.valid_from || ''} />
                <Field label="Geldig tot" name="valid_until" type="date" defaultValue={editTarget?.valid_until || ''} />
              </div>
              <Field label="Omschrijving" name="description" defaultValue={editTarget?.description || ''} hint="Interne notitie (optioneel)" />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_active" defaultChecked={editTarget?.is_active ?? true} />
                Actief
              </label>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => { setEditing(null); setShowCreate(false); }} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]">
                  Annuleren
                </button>
                <button type="submit" disabled={pending} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-primary/90 disabled:opacity-50">
                  {pending ? 'Bezig...' : 'Opslaan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface rounded-[12px] max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-2">Kortingscode verwijderen?</h2>
            <p className="text-sm text-muted mb-4">
              "<strong>{confirmDelete.code}</strong>" wordt permanent verwijderd. Overweeg in plaats daarvan om de code op inactief te zetten.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]">Annuleren</button>
              <button onClick={doDelete} disabled={pending} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-red-700 disabled:opacity-50">
                {pending ? 'Bezig...' : 'Ja, verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field(props: { label: string; name: string; type?: string; defaultValue?: string; required?: boolean; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {props.label}{props.required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={props.name}
        type={props.type || 'text'}
        step={props.type === 'number' ? 'any' : undefined}
        required={props.required}
        defaultValue={props.defaultValue}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
      />
      {props.hint && <span className="text-xs text-muted">{props.hint}</span>}
    </label>
  );
}
