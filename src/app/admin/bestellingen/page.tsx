import Link from 'next/link';
import { getAllOrdersForAdmin } from '@/lib/db/orders';

export const metadata = { title: 'Bestellingen · Admin' };

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Wacht op betaling', cls: 'bg-amber-50 border-amber-200 text-amber-800' },
  paid: { label: 'Betaald', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  in_progress: { label: 'In behandeling', cls: 'bg-blue-50 border-blue-200 text-blue-800' },
  planned_delivery: { label: 'Ingepland', cls: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  delivered: { label: 'Bezorgd', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  completed: { label: 'Afgerond', cls: 'bg-background border-border text-foreground' },
  cancelled: { label: 'Geannuleerd', cls: 'bg-red-50 border-red-200 text-red-800' },
  refunded: { label: 'Terugbetaald', cls: 'bg-red-50 border-red-200 text-red-800' },
};

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminOrdersPage() {
  const orders = await getAllOrdersForAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bestellingen</h1>
        <p className="text-sm text-muted">{orders.length} bestellingen totaal</p>
      </div>

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            Nog geen bestellingen. Zodra de eerste binnenkomt verschijnt 'ie hier.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Bestelnr</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Klant</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Datum</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Totaal</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Bezorging</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cust = o.customer_snapshot as any;
                const st = STATUS_LABELS[o.status] || { label: o.status, cls: 'bg-background border-border text-foreground' };
                return (
                  <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-background">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{cust?.name || '—'}</div>
                      <div className="text-xs text-muted">{cust?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{euro(o.total_incl_btw)}</td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {o.delivery_method === 'same_day' ? 'Same-day' : 'Standaard'}
                      {o.delivery_date && <div>{formatDate(o.delivery_date)}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${st.cls}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/bestellingen/${o.id}`} className="text-xs font-semibold text-primary hover:underline">
                        Openen →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
