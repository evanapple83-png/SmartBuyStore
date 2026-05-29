import type { StoreSettings } from '@/lib/db/settings';

/**
 * Presentationele factuur — gedeeld door admin (/admin/facturen/[id]) en
 * klant (/account/facturen/[id]). Bevat geen knoppen; de print-knop staat
 * in de wrapper-pagina. Print-CSS in globals.css verbergt de chrome.
 */

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function InvoiceDocument({
  order,
  items,
  settings,
}: {
  order: any;
  items: any[];
  settings: StoreSettings;
}) {
  const cust = order.customer_snapshot as any;
  const bill = (order.billing_address_snapshot || order.shipping_address_snapshot) as any;

  const btwGroups = new Map<number, { excl: number; btw: number }>();
  for (const it of items) {
    const rate = Number(it.btw_rate);
    const g = btwGroups.get(rate) || { excl: 0, btw: 0 };
    g.excl += Number(it.line_subtotal_excl_btw);
    g.btw += Number(it.line_btw);
    btwGroups.set(rate, g);
  }

  return (
    <div className="invoice bg-surface border border-border rounded-[12px] p-8 print:border-0 print:p-0">
      {/* Kop */}
      <div className="flex justify-between items-start gap-6 mb-8">
        <div>
          <div className="text-xl font-display font-black tracking-tight">
            {settings.company_name || 'Smart Buy Store'}
          </div>
          <div className="text-xs text-muted mt-2 space-y-0.5">
            {settings.company_legal && <div>{settings.company_legal}</div>}
            {settings.company_street && <div>{settings.company_street}</div>}
            {(settings.company_postal || settings.company_city) && (
              <div>{settings.company_postal} {settings.company_city}</div>
            )}
            {settings.company_country && <div>{settings.company_country}</div>}
            {settings.company_email && <div>{settings.company_email}</div>}
            {settings.company_phone && <div>{settings.company_phone}</div>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold uppercase tracking-wide text-foreground">Factuur</div>
          <div className="text-sm font-mono mt-1">{order.order_number}</div>
          <div className="text-xs text-muted mt-2">
            Factuurdatum: {formatDate(order.paid_at || order.created_at)}
          </div>
        </div>
      </div>

      {/* Factuur aan */}
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">Factuur aan</div>
        <div className="text-sm">
          <div className="font-medium">{bill?.full_name || cust?.name}</div>
          {bill?.street && <div>{bill.street}</div>}
          {(bill?.postal_code || bill?.city) && <div>{bill?.postal_code} {bill?.city}</div>}
          <div className="text-muted">{bill?.country || 'Nederland'}</div>
          {cust?.email && <div className="text-muted mt-1">{cust.email}</div>}
        </div>
      </div>

      {/* Regels */}
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-foreground">
            <th className="text-left py-2 text-xs uppercase tracking-wide text-muted font-semibold">Omschrijving</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-muted font-semibold">Aantal</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-muted font-semibold">Stuk (excl.)</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-muted font-semibold">Btw</th>
            <th className="text-right py-2 text-xs uppercase tracking-wide text-muted font-semibold">Totaal (excl.)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-b border-border">
              <td className="py-2.5">
                <div className="font-medium">{it.product_snapshot?.name}</div>
                {it.product_snapshot?.brand && (
                  <div className="text-xs text-muted">{it.product_snapshot.brand}</div>
                )}
              </td>
              <td className="py-2.5 text-right tabular-nums">{it.qty}</td>
              <td className="py-2.5 text-right tabular-nums">{euro(it.unit_price_excl_btw)}</td>
              <td className="py-2.5 text-right tabular-nums text-muted">{Number(it.btw_rate)}%</td>
              <td className="py-2.5 text-right tabular-nums font-medium">{euro(it.line_subtotal_excl_btw)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totalen */}
      <div className="flex justify-end">
        <div className="w-64 text-sm space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Subtotaal excl. btw</span>
            <span className="tabular-nums">{euro(order.subtotal_excl_btw)}</span>
          </div>
          {Array.from(btwGroups.entries()).map(([rate, g]) => (
            <div key={rate} className="flex justify-between">
              <span className="text-muted">Btw {rate}%</span>
              <span className="tabular-nums">{euro(g.btw)}</span>
            </div>
          ))}
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">Korting{order.discount_code ? ` (${order.discount_code})` : ''}</span>
              <span className="tabular-nums">− {euro(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Bezorgkosten</span>
            <span className="tabular-nums">{order.delivery_cost > 0 ? euro(order.delivery_cost) : 'Gratis'}</span>
          </div>
          <div className="flex justify-between border-t-2 border-foreground pt-2 mt-1 font-bold text-base">
            <span>Totaal incl. btw</span>
            <span className="tabular-nums">{euro(order.total_incl_btw)}</span>
          </div>
        </div>
      </div>

      {/* Voet */}
      <div className="mt-10 pt-4 border-t border-border text-xs text-muted">
        {settings.invoice_footer && <p className="mb-2">{settings.invoice_footer}</p>}
        <div className="flex flex-wrap gap-x-4 gap-y-0.5">
          {settings.company_kvk && <span>KvK: {settings.company_kvk}</span>}
          {settings.company_btw && <span>BTW: {settings.company_btw}</span>}
          {settings.company_iban && <span>IBAN: {settings.company_iban}</span>}
        </div>
      </div>
    </div>
  );
}
