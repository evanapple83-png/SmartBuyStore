import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getOrderById } from '@/lib/db/orders';
import { OrderStatusControls } from './OrderStatusControls';

export const metadata = { title: 'Bestelling · Admin' };

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Wacht op betaling',
  paid: 'Betaald',
  in_progress: 'In behandeling',
  planned_delivery: 'Ingepland',
  delivered: 'Bezorgd',
  completed: 'Afgerond',
  cancelled: 'Geannuleerd',
  refunded: 'Terugbetaald',
};

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDateTime(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' });
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getOrderById(params.id);
  if (!data) notFound();
  const { order, items, log } = data;
  const cust = order.customer_snapshot as any;
  const ship = order.shipping_address_snapshot as any;
  const mollieConfigured = !!process.env.MOLLIE_API_KEY;

  return (
    <div className="max-w-5xl">
      <Link href="/admin/bestellingen" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Terug naar bestellingen
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">{order.order_number}</h1>
          <p className="text-sm text-muted">Aangemaakt op {formatDateTime(order.created_at)}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border border-border bg-surface">
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        {/* Left: items + log */}
        <div className="space-y-6">
          {/* Items */}
          <section className="bg-surface border border-border rounded-[12px] overflow-hidden">
            <h2 className="text-sm font-bold p-4 border-b border-border">Bestelregels</h2>
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2 text-xs uppercase tracking-wide text-muted font-semibold">Product</th>
                  <th className="text-right px-4 py-2 text-xs uppercase tracking-wide text-muted font-semibold">Aantal</th>
                  <th className="text-right px-4 py-2 text-xs uppercase tracking-wide text-muted font-semibold">Stukprijs</th>
                  <th className="text-right px-4 py-2 text-xs uppercase tracking-wide text-muted font-semibold">Totaal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it: any) => (
                  <tr key={it.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{it.product_snapshot?.name}</div>
                      <div className="text-xs text-muted">{it.product_snapshot?.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{it.qty}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{euro(Number(it.unit_price_excl_btw) * (1 + Number(it.btw_rate) / 100))}</td>
                    <td className="px-4 py-3 text-right tabular-nums font-medium">{euro(it.line_total_incl_btw)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-background">
                <tr><td colSpan={3} className="px-4 py-2 text-right text-muted">Subtotaal excl. btw</td><td className="px-4 py-2 text-right tabular-nums">{euro(order.subtotal_excl_btw)}</td></tr>
                <tr><td colSpan={3} className="px-4 py-2 text-right text-muted">Btw 21%</td><td className="px-4 py-2 text-right tabular-nums">{euro(order.btw_total)}</td></tr>
                {order.discount_amount > 0 && (
                  <tr><td colSpan={3} className="px-4 py-2 text-right text-muted">Korting{order.discount_code ? ` (${order.discount_code})` : ''}</td><td className="px-4 py-2 text-right tabular-nums">− {euro(order.discount_amount)}</td></tr>
                )}
                <tr><td colSpan={3} className="px-4 py-2 text-right text-muted">Bezorgkosten</td><td className="px-4 py-2 text-right tabular-nums">{order.delivery_cost > 0 ? euro(order.delivery_cost) : 'Gratis'}</td></tr>
                <tr className="border-t-2 border-ink"><td colSpan={3} className="px-4 py-3 text-right font-bold">Totaal incl. btw</td><td className="px-4 py-3 text-right tabular-nums font-bold">{euro(order.total_incl_btw)}</td></tr>
              </tfoot>
            </table>
          </section>

          {/* Status log */}
          <section className="bg-surface border border-border rounded-[12px] p-4">
            <h2 className="text-sm font-bold mb-3">Statuslogboek</h2>
            {log.length === 0 ? (
              <p className="text-sm text-muted">Geen entries.</p>
            ) : (
              <ol className="space-y-3">
                {log.map((entry: any) => (
                  <li key={entry.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {entry.from_status ? (
                            <>
                              <span className="text-muted">{STATUS_LABELS[entry.from_status]}</span>
                              <span className="mx-1.5 text-muted">→</span>
                              <span>{STATUS_LABELS[entry.to_status]}</span>
                            </>
                          ) : (
                            <span>{STATUS_LABELS[entry.to_status]}</span>
                          )}
                        </span>
                        <span className="text-xs text-muted">{formatDateTime(entry.created_at)}</span>
                      </div>
                      {entry.note && <div className="text-xs text-muted mt-0.5">{entry.note}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Right: klant + acties */}
        <aside className="space-y-4">
          <section className="bg-surface border border-border rounded-[12px] p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">Klant</h3>
            <div className="text-sm space-y-1">
              <div className="font-medium">{cust?.name}</div>
              <div><a href={`mailto:${cust?.email}`} className="text-primary hover:underline">{cust?.email}</a></div>
              {cust?.phone && <div className="text-muted">{cust.phone}</div>}
              {order.user_id ? (
                <div className="text-xs text-emerald-700 mt-1">✓ Gekoppeld aan klantaccount</div>
              ) : (
                <div className="text-xs text-muted mt-1">Gast-checkout (geen account)</div>
              )}
            </div>
          </section>

          <section className="bg-surface border border-border rounded-[12px] p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">Bezorgadres</h3>
            <div className="text-sm text-foreground space-y-0.5">
              <div>{ship?.full_name || cust?.name}</div>
              <div>{ship?.street}</div>
              <div>{ship?.postal_code} {ship?.city}</div>
              <div className="text-muted">{ship?.country || 'Nederland'}</div>
            </div>
            <div className="mt-3 text-xs text-muted">
              Methode: {order.delivery_method === 'same_day' ? 'Same-day' : 'Standaard'}
              {order.delivery_date && <div>Datum: {formatDateTime(order.delivery_date).slice(0, 10)}</div>}
            </div>
          </section>

          {order.notes_customer && (
            <section className="bg-surface border border-border rounded-[12px] p-4">
              <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">Notitie van klant</h3>
              <p className="text-sm text-foreground whitespace-pre-wrap">{order.notes_customer}</p>
            </section>
          )}

          <section className="bg-surface border border-border rounded-[12px] p-4">
            <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-3">Status aanpassen</h3>
            <OrderStatusControls
              orderId={order.id}
              currentStatus={order.status}
              mollieConfigured={mollieConfigured}
              deliveryDate={order.delivery_date}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
