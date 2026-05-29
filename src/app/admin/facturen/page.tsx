import Link from 'next/link';
import { FileText } from 'lucide-react';
import { getInvoiceOrders } from '@/lib/db/orders';

export const metadata = { title: 'Facturen · Admin' };

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Betaald',
  in_progress: 'In behandeling',
  planned_delivery: 'Ingepland',
  delivered: 'Bezorgd',
  completed: 'Afgerond',
  refunded: 'Terugbetaald',
};

export default async function AdminInvoicesPage() {
  const orders = await getInvoiceOrders();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Facturen</h1>
        <p className="text-sm text-muted">
          {orders.length} factu{orders.length === 1 ? 'ur' : 'ren'}. Elke betaalde bestelling krijgt automatisch een factuur.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            <FileText size={32} className="mx-auto mb-2 opacity-50" />
            Nog geen facturen. Zodra een bestelling is betaald verschijnt de factuur hier.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Factuurnr</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Klant</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Factuurdatum</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Bedrag incl. btw</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const cust = o.customer_snapshot as any;
                return (
                  <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-background">
                    <td className="px-4 py-3 font-mono text-xs text-foreground">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{cust?.name || '—'}</div>
                      <div className="text-xs text-muted">{cust?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(o.paid_at || o.created_at)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">{euro(o.total_incl_btw)}</td>
                    <td className="px-4 py-3 text-muted text-xs">{STATUS_LABELS[o.status] || o.status}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/facturen/${o.id}`} className="text-xs font-semibold text-primary hover:underline">
                        Bekijk factuur →
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
