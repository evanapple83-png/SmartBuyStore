'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerProfile } from '@/lib/db/product-actions';

export function CustomerForm({
  id,
  initialFullName,
  initialPhone,
  initialIsActive,
  orderCount,
}: {
  id: string;
  initialFullName: string;
  initialPhone: string;
  initialIsActive: boolean;
  orderCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const result = await updateCustomerProfile(id, fd);
      if (!result?.ok) {
        setError(result?.error || 'Er ging iets mis');
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-[12px] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Klantgegevens</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Volledige naam</span>
          <input
            name="full_name"
            defaultValue={initialFullName}
            className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">Telefoon</span>
          <input
            name="phone"
            defaultValue={initialPhone}
            className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={initialIsActive} />
        Account actief
      </label>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-[8px] p-3 text-sm">
          Opgeslagen.
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
        <button
          type="button"
          disabled={orderCount > 0}
          title={orderCount > 0 ? 'Klanten met bestellingen kunnen niet worden verwijderd' : ''}
          className="px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Klant verwijderen
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? 'Bezig...' : 'Opslaan'}
        </button>
      </div>
    </form>
  );
}
