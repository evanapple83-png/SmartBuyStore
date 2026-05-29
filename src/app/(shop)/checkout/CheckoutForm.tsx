'use client';

import { useState, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { createOrder, isSameDayEligible } from '@/lib/db/order-actions';

function euro(n: number) {
  return `€ ${n.toFixed(2).replace('.', ',')}`;
}

type Props = {
  prefill: { name?: string; email?: string; phone?: string };
};

export function CheckoutForm({ prefill }: Props) {
  const router = useRouter();
  const { items, totalPrice, totalItems } = useCart();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(prefill.name || '');
  const [email, setEmail] = useState(prefill.email || '');
  const [phone, setPhone] = useState(prefill.phone || '');
  const [street, setStreet] = useState('');
  const [postal, setPostal] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'same_day'>('standard');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [sameDayChecked, setSameDayChecked] = useState<null | boolean>(null);

  // Postcode-check on change
  async function handlePostalChange(value: string) {
    setPostal(value);
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 4) {
      const ok = await isSameDayEligible(value);
      setSameDayChecked(ok);
      if (!ok && deliveryMethod === 'same_day') setDeliveryMethod('standard');
    } else {
      setSameDayChecked(null);
    }
  }

  // Tomorrow as min for delivery date
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  if (totalItems === 0) {
    return (
      <div className="bg-surface border border-border rounded-[12px] p-8 text-center">
        <p className="text-sm text-muted mb-4">Je winkelmand is leeg.</p>
        <Link href="/winkel" className="inline-flex items-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]">
          Verder winkelen
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError('Ga akkoord met de algemene voorwaarden om door te gaan.');
      return;
    }

    start(async () => {
      const result = await createOrder({
        customer: { name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim() || undefined },
        shippingAddress: {
          street: street.trim(),
          postal_code: postal.trim().toUpperCase(),
          city: city.trim(),
          country: 'Nederland',
        },
        deliveryMethod,
        deliveryDate: deliveryDate || undefined,
        notesCustomer: notes.trim() || undefined,
        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          slug: it.product.slug,
          brand: it.product.brand,
          image: it.product.images.primary,
          qty: it.quantity,
          unitPriceInclBtw: it.product.currentPrice,
        })),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      if (result.checkoutUrl) {
        // Mollie is actief → stuur klant naar Mollie checkout.
        // Cart wissen we PAS op /checkout/return na bevestigde betaling.
        window.location.href = result.checkoutUrl;
        return;
      }

      // Mollie nog niet geconfigureerd (dev / vóór go-live): direct naar bevestiging.
      try { localStorage.removeItem('sbs_cart'); } catch {}
      router.push(`/checkout/bevestiging?order=${encodeURIComponent(result.orderNumber)}`);
    });
  }

  const inputCls =
    'px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all';
  const labelCls = 'text-xs font-semibold uppercase tracking-wide text-muted';

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div className="space-y-6">
        {/* Contactgegevens */}
        <section className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Jouw gegevens</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className={labelCls}>Volledige naam *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} autoComplete="name" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>E-mailadres *</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} autoComplete="email" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Telefoonnummer</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} autoComplete="tel" placeholder="+31 6 ..." />
            </label>
          </div>
        </section>

        {/* Bezorgadres */}
        <section className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Bezorgadres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5 md:col-span-3">
              <span className={labelCls}>Straat + huisnummer *</span>
              <input value={street} onChange={(e) => setStreet(e.target.value)} required className={inputCls} autoComplete="street-address" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className={labelCls}>Postcode *</span>
              <input value={postal} onChange={(e) => handlePostalChange(e.target.value)} required className={inputCls} placeholder="1234 AB" autoComplete="postal-code" />
            </label>
            <label className="flex flex-col gap-1.5 md:col-span-2">
              <span className={labelCls}>Plaats *</span>
              <input value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} autoComplete="address-level2" />
            </label>
          </div>
        </section>

        {/* Bezorging */}
        <section className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Bezorging</h2>

          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 border border-border rounded-[10px] cursor-pointer hover:bg-background">
              <input
                type="radio"
                name="delivery"
                value="standard"
                checked={deliveryMethod === 'standard'}
                onChange={() => setDeliveryMethod('standard')}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm">Reguliere bezorging</div>
                <div className="text-xs text-muted">Standaard bezorging in heel Nederland. Kies een datum.</div>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 border rounded-[10px] cursor-pointer transition-colors ${sameDayChecked === false ? 'opacity-50 cursor-not-allowed border-border' : 'border-border hover:bg-background'}`}>
              <input
                type="radio"
                name="delivery"
                value="same_day"
                checked={deliveryMethod === 'same_day'}
                onChange={() => setDeliveryMethod('same_day')}
                disabled={sameDayChecked === false}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-sm">Same-day bezorging</div>
                <div className="text-xs text-muted">
                  Vandaag besteld voor 12:00 → vandaag bezorgd. Alleen in Friesland, Groningen, Drenthe, Overijssel, Flevoland en Gelderland.
                </div>
                {sameDayChecked === false && (
                  <div className="text-xs text-amber-700 mt-1">⚠ Niet beschikbaar voor postcode <strong>{postal}</strong>.</div>
                )}
                {sameDayChecked === true && (
                  <div className="text-xs text-emerald-700 mt-1">✓ Beschikbaar voor postcode <strong>{postal}</strong>.</div>
                )}
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-1.5 mt-4">
            <span className={labelCls}>{deliveryMethod === 'same_day' ? 'Bezorgdatum (vandaag)' : 'Voorkeurs-bezorgdatum'}</span>
            <input
              type="date"
              value={deliveryDate}
              min={tomorrow}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className={inputCls}
              disabled={deliveryMethod === 'same_day'}
            />
            <span className="text-xs text-muted">Optioneel. Bij geen keuze plannen wij de eerstvolgende beschikbare dag.</span>
          </label>
        </section>

        {/* Notities */}
        <section className="bg-surface border border-border rounded-[12px] p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Opmerkingen voor de bezorger</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={inputCls + ' w-full font-sans'}
            placeholder="Bijv. aanbellen bij buurman, achterom, etc."
          />
        </section>

        {/* AVG */}
        <label className="flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            className="mt-1"
          />
          <span>
            Ik ga akkoord met de{' '}
            <Link href="/voorwaarden" className="text-primary hover:underline">algemene voorwaarden</Link>{' '}
            en{' '}
            <Link href="/privacy" className="text-primary hover:underline">privacyverklaring</Link>.
          </span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-[10px] p-3 text-sm">{error}</div>
        )}
      </div>

      {/* Order summary */}
      <aside className="lg:sticky lg:top-24 h-fit">
        <div className="bg-surface border border-border rounded-[12px] p-5 space-y-3">
          <h2 className="text-sm font-bold text-foreground">Jouw bestelling</h2>

          <div className="space-y-2 max-h-72 overflow-y-auto -mx-2 px-2">
            {items.map((it) => (
              <div key={it.product.id} className="flex justify-between gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground line-clamp-2">{it.product.shortName || it.product.name}</div>
                  <div className="text-xs text-muted">{it.quantity} × {euro(it.product.currentPrice)}</div>
                </div>
                <div className="font-medium tabular-nums">{euro(it.quantity * it.product.currentPrice)}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotaal</span><span className="tabular-nums">{euro(totalPrice)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Bezorgkosten</span><span className="text-emerald-700">Gratis</span></div>
          </div>

          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-bold">Totaal incl. btw</span>
            <span className="font-bold text-lg tabular-nums">{euro(totalPrice)}</span>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white text-sm font-semibold py-3 rounded-[10px] hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Bestelling plaatsen...' : 'Bestelling plaatsen'}
          </button>

          <p className="text-xs text-muted text-center">
            Door op &lsquo;Bestelling plaatsen&rsquo; te klikken wordt je bestelling vastgelegd. Betaling volgt in een aparte stap.
          </p>
        </div>
      </aside>
    </form>
  );
}
