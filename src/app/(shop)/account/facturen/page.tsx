import Link from 'next/link';
import { FileText } from 'lucide-react';
import { getMyOrders } from '@/lib/db/orders';

export const metadata = { title: 'Mijn facturen · Smart Buy Store' };

const INVOICEABLE = ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed', 'refunded'];

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MyInvoicesPage() {
  const all = await getMyOrders();
  const invoices = all.filter((o) => INVOICEABLE.includes(o.status));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mijn facturen</h1>
        <p className="text-sm text-muted">Download of bekijk de facturen van je betaalde bestellingen.</p>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
          <FileText size={32} className="mx-auto mb-2 opacity-50" />
          Je hebt nog geen facturen. Zodra een bestelling is betaald verschijnt de factuur hier.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Factuurnr</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Datum</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Bedrag</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-background">
                  <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(o.paid_at || o.created_at)}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{euro(o.total_incl_btw)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/account/facturen/${o.id}`} className="text-xs font-semibold text-primary hover:underline">
                      Bekijk factuur →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
