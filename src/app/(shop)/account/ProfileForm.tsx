'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { updateMyProfile } from '@/lib/db/account-actions';

export function ProfileForm({ email, fullName, phone }: { email: string; fullName: string; phone: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const result = await updateMyProfile(formData);
      if (!result.ok) { setError(result.error || 'Er ging iets mis'); return; }
      setSaved(true);
      router.refresh();
    });
  }

  const labelCls = 'text-xs font-semibold uppercase tracking-wide text-muted';
  const inputCls = 'px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Naam</span>
        <input name="full_name" defaultValue={fullName} className={inputCls} autoComplete="name" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>E-mailadres</span>
        <input value={email} disabled className={inputCls + ' opacity-60'} />
        <span className="text-xs text-muted">Je e-mailadres wijzigen? Neem contact met ons op.</span>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Telefoonnummer</span>
        <input name="phone" defaultValue={phone} className={inputCls} autoComplete="tel" placeholder="+31 6 ..." />
      </label>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50">
          {pending ? 'Bezig...' : 'Opslaan'}
        </button>
        {saved && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700"><Check size={16} /> Opgeslagen</span>
        )}
      </div>
    </form>
  );
}
