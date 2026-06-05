'use client';

import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { formatPrice } from '@/lib/price';

/**
 * Prijsflow: het systeem vraagt om inkoopprijs + marge en berekent daaruit
 * automatisch de verkoopprijs — geen handmatig rekenwerk.
 *
 * - Inkoopprijs (excl. btw) en marge (%) zijn de verplichte startpunten.
 * - Zodra beide zijn ingevuld wordt de verkoopprijs live (her)berekend:
 *   inkoop × (1 + marge%) × (1 + btw%). Daarna mag je 'm handmatig
 *   bijschaven (bv. afronden naar ,95); pas je inkoop of marge aan, dan
 *   rekent hij opnieuw.
 * - Onder de verkoopprijs staat continu de wérkelijke marge + winst per stuk.
 *
 * Inkoop/marge landen in name="purchase_price" / name="margin_percent"
 * (admin-only tabel sbs_product_costs); de prijs in name="current_price".
 */
export function PriceMarginFields({
  initialPurchase,
  initialMargin,
  initialPrice,
  btwRate,
}: {
  initialPurchase?: number | null;
  initialMargin?: number | null;
  initialPrice?: string;
  btwRate: number;
}) {
  const [purchase, setPurchase] = useState(initialPurchase != null ? String(initialPurchase) : '');
  const [margin, setMargin] = useState(initialMargin != null ? String(initialMargin) : '');
  const [price, setPrice] = useState(initialPrice || '');

  const btwFactor = 1 + btwRate / 100;
  const num = (s: string) => parseFloat(s.replace(',', '.'));

  function computePrice(purchaseStr: string, marginStr: string): string | null {
    const p = num(purchaseStr);
    const m = num(marginStr);
    if (!Number.isFinite(p) || p <= 0 || !Number.isFinite(m)) return null;
    return (p * (1 + m / 100) * btwFactor).toFixed(2);
  }

  // Inkoop of marge wijzigen → verkoopprijs automatisch (her)berekenen.
  function updatePurchase(v: string) {
    setPurchase(v);
    const computed = computePrice(v, margin);
    if (computed !== null) setPrice(computed);
  }
  function updateMargin(v: string) {
    setMargin(v);
    const computed = computePrice(purchase, v);
    if (computed !== null) setPrice(computed);
  }

  const p = num(purchase);
  const priceNum = num(price);
  const m = num(margin);
  const priceExcl = Number.isFinite(priceNum) ? priceNum / btwFactor : null;
  const actualMargin = priceExcl !== null && Number.isFinite(p) && p > 0 ? ((priceExcl - p) / p) * 100 : null;
  const profit = priceExcl !== null && Number.isFinite(p) && p > 0 ? priceExcl - p : null;

  return (
    <div className="space-y-4">
      {/* Stap 1: inkoop + marge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NumField
          label="Inkoopprijs (€, excl. btw)"
          name="purchase_price"
          value={purchase}
          onChange={updatePurchase}
          required
          hint="Wat jij betaalt aan de leverancier. Alleen zichtbaar voor beheer — verschijnt nooit in de webshop."
        />
        <NumField
          label="Marge (%)"
          name="margin_percent"
          value={margin}
          onChange={updateMargin}
          required
          hint="Jouw marge bovenop de inkoopprijs. De verkoopprijs wordt hieruit automatisch berekend."
        />
      </div>

      {/* Stap 2: berekende verkoopprijs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Verkoopprijs (€, incl. {btwRate}% btw)<span className="text-red-500"> *</span>
          </span>
          <input
            name="current_price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="px-3 py-2.5 text-sm font-semibold border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
          <span className="text-xs text-muted">
            Wordt automatisch berekend uit inkoop + marge. Handmatig bijschaven (bv. afronden naar ,95) mag —
            pas je inkoop of marge aan, dan rekent hij opnieuw.
          </span>
        </label>

        {actualMargin !== null && profit !== null && (
          <div
            className={`flex items-start gap-2.5 rounded-[10px] border px-4 py-3 text-sm ${
              profit < 0
                ? 'border-red-200 bg-red-50 text-red-700'
                : Number.isFinite(m) && actualMargin < m - 0.05
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-success/25 bg-success/5 text-foreground'
            }`}
          >
            <Calculator size={16} className="shrink-0 mt-0.5" />
            <span>
              Werkelijke marge: <strong>{actualMargin.toFixed(1)}%</strong> · winst{' '}
              <strong>€ {formatPrice(profit)}</strong> excl. btw per stuk
              {profit < 0 && ' — verkoop onder inkoopprijs!'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function NumField({
  label,
  name,
  value,
  onChange,
  hint,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={name}
        type="number"
        step="0.01"
        min="0"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
      />
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  );
}
