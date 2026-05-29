'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, MapPin, Star } from 'lucide-react';
import { saveAddress, deleteAddress } from '@/lib/db/account-actions';

type Address = {
  id: string;
  label: string | null;
  full_name: string | null;
  phone: string | null;
  street: string;
  postal_code: string;
  city: string;
  country: string;
  is_default_shipping: boolean;
};

export function AddressManager({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Address | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Address | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const r = await saveAddress(formData);
      if (!r.ok) { setError(r.error || 'Er ging iets mis'); return; }
      setEditing(null);
      setShowCreate(false);
      router.refresh();
    });
  }

  function doDelete() {
    if (!confirmDelete) return;
    start(async () => {
      await deleteAddress(confirmDelete.id);
      setConfirmDelete(null);
      router.refresh();
    });
  }

  const target = editing;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {addresses.map((a) => (
          <div key={a.id} className="bg-surface border border-border rounded-[12px] p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MapPin size={14} className="text-muted" />
                {a.label || 'Adres'}
              </div>
              {a.is_default_shipping && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <Star size={10} /> Standaard
                </span>
              )}
            </div>
            <div className="text-sm text-muted mt-2 space-y-0.5">
              {a.full_name && <div className="text-foreground">{a.full_name}</div>}
              <div>{a.street}</div>
              <div>{a.postal_code} {a.city}</div>
              <div>{a.country}</div>
              {a.phone && <div>{a.phone}</div>}
            </div>
            <div className="flex gap-1 mt-3">
              <button onClick={() => { setError(null); setEditing(a); }} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px]">
                <Edit size={12} /> Bewerken
              </button>
              <button onClick={() => setConfirmDelete(a)} className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded-[6px]">
                <Trash2 size={12} /> Verwijderen
              </button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="sm:col-span-2 bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
            Je hebt nog geen adressen opgeslagen.
          </div>
        )}
      </div>

      <button onClick={() => { setError(null); setShowCreate(true); }} className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90">
        <Plus size={16} /> Adres toevoegen
      </button>

      {(target || showCreate) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setEditing(null); setShowCreate(false); }}>
          <div className="bg-surface rounded-[12px] max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">{target ? 'Adres bewerken' : 'Nieuw adres'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {target && <input type="hidden" name="id" value={target.id} />}
              <Field label="Label" name="label" defaultValue={target?.label || ''} placeholder="Thuis, Werk…" />
              <Field label="Naam" name="full_name" defaultValue={target?.full_name || ''} />
              <Field label="Straat + huisnummer" name="street" required defaultValue={target?.street || ''} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Postcode" name="postal_code" required defaultValue={target?.postal_code || ''} />
                <Field label="Plaats" name="city" required defaultValue={target?.city || ''} />
              </div>
              <Field label="Telefoon" name="phone" defaultValue={target?.phone || ''} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="is_default_shipping" defaultChecked={target?.is_default_shipping ?? addresses.length === 0} />
                Gebruik als standaard bezorgadres
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

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface rounded-[12px] max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-2">Adres verwijderen?</h2>
            <p className="text-sm text-muted mb-4">Dit adres wordt permanent verwijderd.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]">Annuleren</button>
              <button onClick={doDelete} disabled={pending} className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-red-700 disabled:opacity-50">{pending ? 'Bezig...' : 'Verwijderen'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field(props: { label: string; name: string; defaultValue?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {props.label}{props.required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={props.name}
        required={props.required}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
      />
    </label>
  );
}
