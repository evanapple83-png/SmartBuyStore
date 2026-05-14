import Link from 'next/link';
import { Plus, ShoppingBag } from 'lucide-react';
import { getAdminDashboardStats, getAllOrdersForAdmin } from '@/lib/db/orders';

export const metadata = { title: 'Dashboard · Smart Buy Admin' };

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDateTime(s: string) {
  return new Date(s).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
}

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

export default async function AdminDashboardPage() {
  const [stats, recent] = await Promise.all([
    getAdminDashboardStats(),
    getAllOrdersForAdmin({ limit: 10 }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Welkom in het beheerpaneel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Nieuwe bestellingen vandaag" value={String(stats.newOrdersToday)} />
        <StatCard label="Te bezorgen vandaag" value={String(stats.deliveriesToday)} />
        <StatCard label="Omzet vandaag (excl. btw)" value={euro(stats.revenueExclToday)} />
        <StatCard label="Onbetaald > 24 uur" value={String(stats.unpaidOver24h)} highlight={stats.unpaidOver24h > 0} />
      </div>

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden mb-6">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-sm font-bold">Laatste bestellingen</h2>
          <Link href="/admin/bestellingen" className="text-xs font-semibold text-primary hover:underline">
            Alle bestellingen →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">
            <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" />
            Nog geen bestellingen.
          </div>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {recent.map((o) => {
                const cust = o.customer_snapshot as any;
                return (
                  <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-background">
                    <td className="px-4 py-2.5 font-mono text-xs">{o.order_number}</td>
                    <td className="px-4 py-2.5">{cust?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-muted text-xs">{formatDateTime(o.created_at)}</td>
                    <td className="px-4 py-2.5 text-xs">{STATUS_LABELS[o.status] || o.status}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">{euro(o.total_incl_btw)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link href={`/admin/bestellingen/${o.id}`} className="text-xs font-semibold text-primary hover:underline">
                        Openen
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/producten/nieuw"
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90"
        >
          <Plus size={16} /> Nieuw product
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`border rounded-[12px] p-4 ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-surface border-border'}`}>
      <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">{label}</div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}
