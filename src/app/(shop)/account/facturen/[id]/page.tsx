import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getOrderById } from '@/lib/db/orders';
import { getStoreSettings } from '@/lib/db/settings';
import { InvoiceDocument } from '@/components/invoice/InvoiceDocument';
import { PrintButton } from '@/components/invoice/PrintButton';

export const metadata = { title: 'Factuur · Smart Buy Store' };

const INVOICEABLE = ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed', 'refunded'];

export default async function MyInvoiceDetailPage({ params }: { params: { id: string } }) {
  // RLS zorgt dat getOrderById alleen de eigen bestelling teruggeeft.
  const [data, settings] = await Promise.all([getOrderById(params.id), getStoreSettings()]);
  if (!data) notFound();
  const { order, items } = data;

  // Alleen betaalde+ bestellingen hebben een factuur.
  if (!INVOICEABLE.includes(order.status)) notFound();

  return (
    <div>
      <div className="no-print flex items-center justify-between mb-6">
        <Link href="/account/facturen" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft size={14} /> Terug naar mijn facturen
        </Link>
        <PrintButton />
      </div>

      <InvoiceDocument order={order} items={items} settings={settings} />
    </div>
  );
}
