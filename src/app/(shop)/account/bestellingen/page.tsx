import Link from 'next/link';
import { getMyOrders } from '@/lib/db/orders';
import { claimGuestOrders } from '@/lib/db/order-actions';

export const metadata = { title: 'Mijn bestellingen · Smart Buy Store' };

const STATUS_LABELS: Record<string, { label: string; icon: string }> = {
  pending_payment: { label: 'Betaling verwerken', icon: '🟡' },
  paid: { label: 'Betaald', icon: '🟢' },
  in_progress: { label: 'In behandeling', icon: '🔧' },
  planned_delivery: { label: 'Bezorging ingepland', icon: '📅' },
  delivered: { label: 'Bezorgd', icon: '✅' },
  completed: { label: 'Afgerond', icon: '✓' },
  cancelled: { label: 'Geannuleerd', icon: '❌' },
  refunded: { label: 'Terugbetaald', icon: '↩️' },
};

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MyOrdersPage() {
  // Bij iedere paginabezoek even claim-by-email proberen — koppelt oude
  // guest-bestellingen aan dit account.
  await claimGuestOrders();

  const orders = await getMyOrders();

  return (
    <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Mijn bestellingen</h1>
      <p className="text-sm text-muted mb-6">{orders.length} bestelling{orders.length === 1 ? '' : 'en'} gevonden.</p>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted mb-3">Je hebt nog geen bestellingen geplaatst.</p>
          <Link href="/winkel" className="inline-flex items-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]">
            Verder winkelen
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const st = STATUS_LABELS[o.status] || { label: o.status, icon: '•' };
            return (
              <li key={o.id}>
                <Link
                  href={`/account/bestellingen/${o.id}`}
                  className="block border border-border rounded-[12px] p-4 hover:bg-background transition-colors"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="font-mono text-sm font-semibold">{o.order_number}</div>
                      <div className="text-xs text-muted">{formatDate(o.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold tabular-nums">{euro(o.total_incl_btw)}</div>
                      <div className="text-xs">{st.icon} {st.label}</div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
