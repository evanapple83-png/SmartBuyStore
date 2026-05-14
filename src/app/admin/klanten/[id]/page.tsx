import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCustomerByIdForAdmin, getCustomerOrderCount } from '@/lib/db/customers';
import { CustomerForm } from './CustomerForm';

export const metadata = { title: 'Klant · Admin' };

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await getCustomerByIdForAdmin(params.id);
  if (!customer) notFound();
  const orderCount = await getCustomerOrderCount(params.id);

  return (
    <div className="max-w-3xl">
      <Link href="/admin/klanten" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Terug naar klanten
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-1">{customer.full_name || customer.email}</h1>
      <p className="text-sm text-muted mb-6">Klantaccount sinds {formatDate(customer.created_at)}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface border border-border rounded-[12px] p-4">
          <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">E-mailadres</div>
          <div className="text-sm text-foreground font-medium break-all">{customer.email || '—'}</div>
        </div>
        <div className="bg-surface border border-border rounded-[12px] p-4">
          <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">Bestellingen</div>
          <div className="text-2xl text-foreground font-bold">{orderCount}</div>
        </div>
        <div className="bg-surface border border-border rounded-[12px] p-4">
          <div className="text-xs uppercase tracking-wide text-muted font-semibold mb-1">Laatste login</div>
          <div className="text-sm text-foreground">{formatDate(customer.last_sign_in_at)}</div>
        </div>
      </div>

      <CustomerForm
        id={customer.id}
        initialFullName={customer.full_name || ''}
        initialPhone={customer.phone || ''}
        initialIsActive={customer.is_active}
        orderCount={orderCount}
      />

      {orderCount > 0 && (
        <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-[8px] p-3 text-sm">
          ⓘ Deze klant heeft {orderCount} bestelling(en). Verwijderen van het klantaccount is niet mogelijk om boekhoudkundige redenen. Voor anonimisering: neem contact op met support.
        </div>
      )}
    </div>
  );
}
