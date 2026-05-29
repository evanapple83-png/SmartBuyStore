'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import type { StoreSettings } from '@/lib/db/settings';
import { updateStoreSettings } from '@/lib/db/settings-actions';

export function SettingsForm({ settings }: { settings: StoreSettings }) {
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
      const result = await updateStoreSettings(formData);
      if (!result.ok) {
        setError(result.error || 'Er ging iets mis');
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Bedrijf">
        <Field label="Handelsnaam" name="company_name" defaultValue={settings.company_name} />
        <Field label="Juridische naam" name="company_legal" defaultValue={settings.company_legal} hint="Zoals op facturen, bv. Smart Buy Store B.V." />
        <Field label="E-mailadres" name="company_email" type="email" defaultValue={settings.company_email} />
        <Field label="Telefoonnummer" name="company_phone" defaultValue={settings.company_phone} />
      </Section>

      <Section title="Adres">
        <Field label="Straat + huisnummer" name="company_street" defaultValue={settings.company_street} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Postcode" name="company_postal" defaultValue={settings.company_postal} />
          <Field label="Plaats" name="company_city" defaultValue={settings.company_city} />
        </div>
        <Field label="Land" name="company_country" defaultValue={settings.company_country} />
      </Section>

      <Section title="Fiscaal">
        <div className="grid grid-cols-2 gap-4">
          <Field label="KvK-nummer" name="company_kvk" defaultValue={settings.company_kvk} />
          <Field label="BTW-nummer" name="company_btw" defaultValue={settings.company_btw} hint="bv. NL123456789B01" />
        </div>
        <Field label="IBAN" name="company_iban" defaultValue={settings.company_iban} />
      </Section>

      <Section title="Facturen">
        <Field label="Voettekst op factuur" name="invoice_footer" defaultValue={settings.invoice_footer} />
      </Section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? 'Bezig...' : 'Instellingen opslaan'}
        </button>
        {saved && !pending && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
            <Check size={16} /> Opgeslagen
          </span>
        )}
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface border border-border rounded-[12px] p-5">
      <h2 className="text-sm font-bold text-foreground mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field(props: { label: string; name: string; type?: string; defaultValue?: string; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{props.label}</span>
      <input
        name={props.name}
        type={props.type || 'text'}
        defaultValue={props.defaultValue}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
      />
      {props.hint && <span className="text-xs text-muted">{props.hint}</span>}
    </label>
  );
}
