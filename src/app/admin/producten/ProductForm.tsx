'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { DbBrand, DbCategory, DbProduct } from '@/lib/db/catalog';
import { createProduct, updateProduct } from '@/lib/db/product-actions';
import { ImageUpload } from './ImageUpload';
import { BrochureUpload } from './BrochureUpload';
import { SpecsEditor } from './SpecsEditor';
import { PriceMarginFields } from './PriceMarginFields';

const ENERGY_LABELS = ['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E'] as const;

type Props = {
  mode: 'create' | 'edit';
  brands: DbBrand[];
  categories: DbCategory[];
  initial?: Partial<DbProduct>;
  initialCosts?: { purchase_price: number; margin_percent: number | null } | null;
};

export function ProductForm({ mode, brands, categories, initial, initialCosts }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmPriceZero, setConfirmPriceZero] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const price = Number(formData.get('current_price') || 0);

    if (price === 0 && !confirmPriceZero) {
      setConfirmPriceZero(true);
      return; // toon bevestigingstekst, gebruiker klikt nogmaals submit
    }

    start(async () => {
      const action = mode === 'create' ? createProduct : updateProduct.bind(null, initial!.id!);
      const result = await action(formData);
      if (!result?.ok) {
        setError(result?.error || 'Er ging iets mis');
        setConfirmPriceZero(false);
        return;
      }
      if (mode === 'edit') {
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Basis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Productnaam" name="name" required defaultValue={initial?.name || ''} />
          <Field label="Korte naam (voor lijsten)" name="short_name" defaultValue={initial?.short_name || ''} />
          <Field label="Artikelnummer (SKU)" name="sku" defaultValue={initial?.sku || ''} hint="Eigen of fabrikant-artikelnummer. Optioneel, maar moet uniek zijn." />
          <Field label="Slug (URL)" name="slug" defaultValue={initial?.slug || ''} hint="Laat leeg om automatisch te genereren uit de naam" />

          <SelectField
            label="Merk"
            name="brand_id"
            defaultValue={initial?.brand_id || ''}
            options={[{ value: '', label: '— Geen merk —' }, ...brands.map((b) => ({ value: b.id, label: b.name }))]}
          />

          <SelectField
            label="Categorie"
            name="category_id"
            defaultValue={initial?.category_id || ''}
            options={[{ value: '', label: '— Geen categorie —' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />

          <SelectField
            label="Energielabel"
            name="energy_label"
            defaultValue={initial?.energy_label || ''}
            options={[{ value: '', label: '—' }, ...ENERGY_LABELS.map((l) => ({ value: l, label: l }))]}
          />

          <Field
            label="Garantielabel"
            name="warranty_label"
            defaultValue={initial?.warranty_label || ''}
            hint={'Bijvoorbeeld "5 jaar garantie" — toont als label op de productkaart en productpagina. Leeg = geen label.'}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Korte beschrijving"
            name="short_description"
            defaultValue={initial?.short_description || ''}
            rows={2}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="Kenmerken (één per regel)"
            name="features"
            defaultValue={(initial?.features || []).join('\n')}
            rows={4}
            hint="Korte verkooppunten, bijvoorbeeld: NoFrost. Volledige specificaties horen in de sectie Specificaties hieronder."
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Specificaties</h2>
        <SpecsEditor defaultValue={initial?.specs || {}} />
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Inkoop, marge &amp; prijs</h2>
        <PriceMarginFields
          initialPurchase={initialCosts?.purchase_price ?? null}
          initialMargin={initialCosts?.margin_percent ?? null}
          initialPrice={initial?.current_price?.toString() || ''}
          btwRate={Number(initial?.btw_rate ?? 21)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <Field
            label="Prijs bij andere webshops (€)"
            name="original_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.original_price?.toString() || ''}
            hint="Optioneel — wat hetzelfde product elders kost. Toont in de shop als doorgehaalde prijs met 'Je bespaart € X'."
          />
        </div>
        {confirmPriceZero && (
          <div className="mt-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-[8px] p-3 text-sm">
            ⚠ Weet je zeker dat dit product gratis is (€ 0)? Klik nogmaals op "Opslaan" om te bevestigen.
          </div>
        )}
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Foto's</h2>
        <ImageUpload defaultValue={initial?.image_primary || ''} defaultExtra={initial?.images_extra || []} />
        <div className="mt-4">
          <Field label="Fallback afbeelding URL (optioneel)" name="image_fallback" defaultValue={initial?.image_fallback || ''} hint="Wordt getoond als de hoofdafbeelding niet laadt." />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Brochure</h2>
        <BrochureUpload defaultValue={initial?.brochure_url || ''} />
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Cashback</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Cashback-bedrag (€)"
            name="cashback_amount"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial?.cashback_amount?.toString() || ''}
            hint="Laat leeg als er geen cashback-actie loopt. Wordt opvallend getoond op de productpagina en productkaart."
          />
          <Field
            label="Toelichting (optioneel)"
            name="cashback_label"
            defaultValue={initial?.cashback_label || ''}
            hint={'Bijvoorbeeld "via Samsung" of "t/m 30 juni". De klant ontvangt dit bedrag terug van de fabrikant; de winkelprijs verandert niet.'}
          />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Voorraad &amp; levering</h2>
        <div className="max-w-xs mb-4">
          <Field
            label="Voorraad (aantal)"
            name="stock_count"
            type="number"
            min="0"
            step="1"
            defaultValue={(initial?.stock_count ?? 0).toString()}
            hint="Wordt automatisch afgeboekt bij verkoop. Bij 0 toont het product als uitverkocht."
          />
        </div>
        <div className="space-y-3">
          <Checkbox label="Same-day delivery beschikbaar" name="is_same_day_delivery" defaultChecked={initial?.is_same_day_delivery ?? false} />
          <Checkbox label="Markeer als 'Nieuw'" name="is_new" defaultChecked={initial?.is_new ?? false} />
          <Checkbox label="Aanbieding" name="is_on_sale" defaultChecked={initial?.is_on_sale ?? false} />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[12px] p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Zichtbaarheid</h2>
        <Checkbox
          label="Verborgen voor klanten"
          name="is_hidden"
          defaultChecked={initial?.is_hidden ?? false}
          hint="Verborgen producten zijn onzichtbaar in de webshop, maar blijven bestaan in bestaande bestellingen."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 -mx-6 px-6 -mb-6 border-t border-border">
        <button
          type="button"
          onClick={() => router.push('/admin/producten')}
          className="px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface rounded-[10px] transition-colors"
        >
          Annuleren
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {pending ? 'Bezig...' : confirmPriceZero ? 'Bevestig: € 0 is correct' : 'Opslaan'}
        </button>
      </div>
    </form>
  );
}

// ─── Field helpers ───────────────────────────────────────────────────────────

function Field(props: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  min?: string;
  required?: boolean;
  defaultValue?: string;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {props.label}{props.required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={props.name}
        type={props.type || 'text'}
        step={props.step}
        min={props.min}
        required={props.required}
        defaultValue={props.defaultValue}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      />
      {props.hint && <span className="text-xs text-muted">{props.hint}</span>}
    </label>
  );
}

function Textarea(props: { label: string; name: string; defaultValue?: string; rows?: number; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{props.label}</span>
      <textarea
        name={props.name}
        rows={props.rows || 3}
        defaultValue={props.defaultValue}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all font-sans"
      />
      {props.hint && <span className="text-xs text-muted">{props.hint}</span>}
    </label>
  );
}

function SelectField(props: { label: string; name: string; defaultValue?: string; options: { value: string; label: string }[] }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{props.label}</span>
      <select
        name={props.name}
        defaultValue={props.defaultValue}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      >
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Checkbox(props: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5">
      <input
        type="checkbox"
        name={props.name}
        defaultChecked={props.defaultChecked}
        className="mt-1"
      />
      <span className="text-sm text-foreground">
        {props.label}
        {props.hint && <span className="block text-xs text-muted mt-0.5">{props.hint}</span>}
      </span>
    </label>
  );
}
