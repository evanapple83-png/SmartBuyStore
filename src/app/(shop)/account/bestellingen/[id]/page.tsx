import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getOrderById } from '@/lib/db/orders';
import { getSupabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Bestelling · Mijn account' };

const STATUS_LABELS: Record<string, { label: string; icon: string; cls: string }> = {
  pending_payment: { label: 'Betaling verwerken', icon: '🟡', cls: 'bg-amber-50 border-amber-200 text-amber-800' },
  paid: { label: 'Betaald', icon: '🟢', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  in_progress: { label: 'In behandeling', icon: '🔧', cls: 'bg-blue-50 border-blue-200 text-blue-800' },
  planned_delivery: { label: 'Bezorging ingepland', icon: '📅', cls: 'bg-indigo-50 border-indigo-200 text-indigo-800' },
  delivered: { label: 'Bezorgd', icon: '✅', cls: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
  completed: { label: 'Afgerond', icon: '✓', cls: 'bg-background border-border text-foreground' },
  cancelled: { label: 'Geannuleerd', icon: '❌', cls: 'bg-red-50 border-red-200 text-red-800' },
  refunded: { label: 'Terugbetaald', icon: '↩️', cls: 'bg-red-50 border-red-200 text-red-800' },
};

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function CustomerOrderDetailPage({ params }: { params: { id: string } }) {
  const data = await getOrderById(params.id);
  if (!data) notFound();

  // Extra check: deze pagina is alleen voor de eigenaar van de bestelling
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || data.order.user_id !== user.id) notFound();

  const { order, items, log } = data;
  const st = STATUS_LABELS[order.status] || { label: order.status, icon: '•', cls: 'bg-background border-border text-foreground' };
  const ship = order.shipping_address_snapshot as any;

  return (
    <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
      <Link href="/account/bestellingen" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Terug naar mijn bestellingen
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">{order.order_number}</h1>
          <p className="text-sm text-muted">Geplaatst op {formatDate(order.created_at)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${st.cls}`}>
          <span>{st.icon}</span>
          {st.label}
        </span>
      </div>

      {/* Bestelregels */}
      <div className="border border-border rounded-[10px] overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 text-xs uppercase tracking-wide text-muted font-semibold">Product</th>
              <th className="text-right px-4 py-2 text-xs uppercase tracking-wide text-muted font-semibold">Aantal</th>
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
                <td className="px-4 py-3 text-right tabular-nums font-medium">{euro(it.line_total_incl_btw)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-background">
            <tr><td colSpan={2} className="px-4 py-1.5 text-right text-muted">Subtotaal excl. btw</td><td className="px-4 py-1.5 text-right tabular-nums">{euro(order.subtotal_excl_btw)}</td></tr>
            <tr><td colSpan={2} className="px-4 py-1.5 text-right text-muted">Btw 21%</td><td className="px-4 py-1.5 text-right tabular-nums">{euro(order.btw_total)}</td></tr>
            <tr><td colSpan={2} className="px-4 py-1.5 text-right text-muted">Bezorgkosten</td><td className="px-4 py-1.5 text-right tabular-nums">{order.delivery_cost > 0 ? euro(order.delivery_cost) : 'Gratis'}</td></tr>
            <tr className="border-t-2 border-ink"><td colSpan={2} className="px-4 py-2.5 text-right font-bold">Totaal incl. btw</td><td className="px-4 py-2.5 text-right tabular-nums font-bold">{euro(order.total_incl_btw)}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-border rounded-[10px] p-4">
          <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">Bezorgadres</h3>
          <div className="text-sm space-y-0.5">
            <div>{ship?.full_name || order.customer_snapshot?.name}</div>
            <div>{ship?.street}</div>
            <div>{ship?.postal_code} {ship?.city}</div>
            <div className="text-muted">{ship?.country || 'Nederland'}</div>
          </div>
        </div>
        <div className="border border-border rounded-[10px] p-4">
          <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">Bezorging</h3>
          <div className="text-sm space-y-0.5">
            <div><strong>Methode:</strong> {order.delivery_method === 'same_day' ? 'Same-day' : 'Standaard'}</div>
            <div><strong>Geplande datum:</strong> {formatDate(order.delivery_date)}</div>
          </div>
        </div>
      </div>

      {order.notes_customer && (
        <div className="border border-border rounded-[10px] p-4 mb-6">
          <h3 className="text-xs uppercase tracking-wide text-muted font-semibold mb-2">Jouw notitie</h3>
          <p className="text-sm text-foreground whitespace-pre-wrap">{order.notes_customer}</p>
        </div>
      )}

      <p className="text-sm text-muted">
        Vragen over deze bestelling? Mail naar <a href="mailto:info@sbsnl.nl" className="text-primary hover:underline">info@sbsnl.nl</a>.
      </p>
    </div>
  );
}
