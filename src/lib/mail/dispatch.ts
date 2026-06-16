import { getSupabaseAdmin } from '@/lib/supabase/server';
import { sendEmail } from './client';

/**
 * Order-gerelateerde transactionele mails. Eén functie per gebeurtenis-key,
 * die het sjabloon uit sbs_email_templates leest, de {{variabelen}} invult,
 * idempotent logt (UNIQUE order_id+event_type) en verstuurt.
 *
 * Faalt stil — een mailprobleem mag NOOIT een bestelling of statuswijziging
 * blokkeren. Zonder RESEND_API_KEY wordt niets verzonden (status 'noop').
 */
export type OrderEmailEvent =
  | 'order_confirmation'
  | 'payment_received'
  | 'order_planned'
  | 'order_on_the_way'
  | 'order_delivered'
  | 'order_cancelled';

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function formatDate(s: string | null) {
  if (!s) return 'nader te bepalen';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => vars[key] ?? '');
}

export async function dispatchOrderEmail(orderId: string, event: OrderEmailEvent): Promise<void> {
  try {
    const admin = getSupabaseAdmin();

    const { data: order } = await admin
      .from('sbs_orders')
      .select('order_number, customer_snapshot, total_incl_btw, delivery_date')
      .eq('id', orderId)
      .single();
    if (!order) return;

    const cust = (order.customer_snapshot as any) || {};
    const to = cust.email;
    if (!to) return;

    const { data: tpl } = await admin
      .from('sbs_email_templates')
      .select('subject, body, is_enabled')
      .eq('key', event)
      .single();

    // Sjabloon ontbreekt of staat uit → niets sturen, wel loggen als 'skipped'.
    if (!tpl || !tpl.is_enabled) {
      await admin
        .from('sbs_email_log')
        .insert({ order_id: orderId, event_type: event, to_email: to, status: 'skipped' })
        .then(undefined, () => {}); // negeer conflict/fout
      return;
    }

    // Bestelregels als platte tekstlijst
    const { data: items } = await admin
      .from('sbs_order_items')
      .select('qty, product_snapshot, line_total_incl_btw')
      .eq('order_id', orderId)
      .order('sort_order', { ascending: true });

    const itemsText = (items ?? [])
      .map((it: any) => `- ${it.qty}× ${it.product_snapshot?.name ?? 'Product'} — ${euro(it.line_total_incl_btw)}`)
      .join('\n');

    const vars: Record<string, string> = {
      customer_name: cust.name || 'klant',
      order_number: order.order_number,
      order_total: euro(order.total_incl_btw),
      delivery_date: formatDate(order.delivery_date),
      order_items: itemsText,
    };

    const subject = fill(tpl.subject, vars);
    const body = fill(tpl.body, vars);

    // Idempotentie: claim de (order_id, event_type)-slot. Bestaat 'ie al → al verstuurd.
    const { data: logRow, error: logErr } = await admin
      .from('sbs_email_log')
      .insert({ order_id: orderId, event_type: event, to_email: to, subject, status: 'sent' })
      .select('id')
      .single();

    if (logErr) {
      // 23505 = al eerder verstuurd voor deze gebeurtenis → niets doen.
      return;
    }

    const result = await sendEmail({ to, subject, text: body });

    let status = 'sent';
    let provider_id: string | null = null;
    let error_message: string | null = null;
    if (result.ok && result.skipped) status = 'noop';        // geen mailprovider gekoppeld
    else if (result.ok) provider_id = result.id;
    else { status = 'error'; error_message = result.error; }

    await admin
      .from('sbs_email_log')
      .update({ status, provider_id, error_message })
      .eq('id', logRow.id);
  } catch (err) {
    console.warn(`dispatchOrderEmail(${event}) faalde stil:`, err);
  }
}
