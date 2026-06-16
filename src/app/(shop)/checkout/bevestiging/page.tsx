import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { isMollieConfigured } from '@/lib/mollie/client';

export const metadata = { title: 'Bestelling ontvangen · Smart Buy Store' };

export default async function BevestigingPage({ searchParams }: { searchParams: { order?: string } }) {
  const orderNumber = searchParams.order || '';

  let isPaid = false;
  let orderTotal: number | null = null;
  if (orderNumber) {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sbs_orders')
      .select('status, total_incl_btw')
      .eq('order_number', orderNumber)
      .single();
    if (data) {
      isPaid = ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed'].includes(data.status);
      orderTotal = Number(data.total_incl_btw);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle2 size={56} className="mx-auto text-emerald-600 mb-4" />
      <h1 className="text-3xl font-display font-black text-foreground mb-2">
        {isPaid ? 'Bedankt voor je bestelling!' : 'Bestelling ontvangen!'}
      </h1>

      {orderNumber && (
        <p className="text-sm text-muted mb-4">
          Je bestelnummer is <strong className="font-mono text-foreground">{orderNumber}</strong>
          {orderTotal !== null && (
            <> · totaalbedrag <strong>€ {orderTotal.toFixed(2).replace('.', ',')}</strong></>
          )}.
        </p>
      )}

      {isPaid ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-[12px] p-5 text-left text-sm text-emerald-900 mb-6">
          <strong className="block mb-1">Betaling bevestigd ✓</strong>
          We zijn direct met je bestelling aan de slag. Je ontvangt zo een bevestigingsmail met de factuur.
        </div>
      ) : !isMollieConfigured() ? (
        <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-5 text-left text-sm text-amber-900 mb-6">
          <strong className="block mb-1">Betaling volgt nog</strong>
          We zijn de online betaalmethode aan het inrichten. Je krijgt binnenkort per e-mail de betaallink toegestuurd.
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-5 text-left text-sm text-amber-900 mb-6">
          <strong className="block mb-1">Betaling wordt verwerkt</strong>
          Even geduld — de bevestiging van Mollie komt meestal binnen enkele seconden. Je ontvangt automatisch een e-mail zodra alles rond is.
        </div>
      )}

      <p className="text-sm text-muted mb-8">
        Heb je vragen? Mail naar info@smartbuystore.nl.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/account/bestellingen" className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90">
          Mijn bestellingen
        </Link>
        <Link href="/" className="text-sm font-semibold px-5 py-2.5 rounded-[10px] border border-border hover:bg-surface">
          Naar homepage
        </Link>
      </div>
    </div>
  );
}
