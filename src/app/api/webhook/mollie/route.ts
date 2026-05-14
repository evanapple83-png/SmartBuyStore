/**
 * Mollie webhook handler — enige bron-van-waarheid voor betaalstatus.
 *
 * Veiligheid + idempotentie:
 *   1. Mollie body bevat alleen { id }. Wij refetchen via Mollie API.
 *      Dat is de security: een fake id geeft geen geldige Mollie-respons.
 *   2. Idempotentie via UNIQUE (mollie_payment_id, payment_status) op
 *      sbs_mollie_events. Tweede webhook voor dezelfde transition = no-op.
 *   3. Order-status wordt nooit teruggezet — alleen voorwaarts vanuit
 *      het Mollie-resultaat.
 *
 * Werkt zonder middleware-auth (publiek endpoint) — middleware whitelist
 * /api/webhook/* op deze route.
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getMollieClient, isMollieConfigured } from '@/lib/mollie/client';

export const dynamic = 'force-dynamic';

// Mollie kan zowel `id=tr_xxx` form-encoded als JSON sturen.
async function readMollieId(req: Request): Promise<string | null> {
  const contentType = req.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      const json = await req.json();
      return json.id || null;
    } catch { return null; }
  }
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return params.get('id');
  } catch { return null; }
}

export async function POST(req: Request) {
  if (!isMollieConfigured()) {
    console.warn('Mollie webhook received but MOLLIE_API_KEY not configured');
    return new NextResponse('Mollie not configured', { status: 503 });
  }

  const mollieId = await readMollieId(req);
  if (!mollieId || !mollieId.startsWith('tr_')) {
    console.warn('Mollie webhook: missing or invalid id', mollieId);
    return new NextResponse('Bad request', { status: 400 });
  }

  let mollieClient;
  try {
    mollieClient = getMollieClient();
  } catch (err: any) {
    console.error('Mollie client init failed:', err?.message);
    return new NextResponse('Mollie unavailable', { status: 503 });
  }

  // Refetch — security: vertrouw de body niet
  let payment;
  try {
    payment = await mollieClient.payments.get(mollieId);
  } catch (err: any) {
    console.error('Mollie refetch failed for', mollieId, err?.message);
    // 200 retourneren zodat Mollie niet eindeloos blijft retryen voor fake IDs
    return new NextResponse('OK', { status: 200 });
  }

  const orderId = payment.metadata && (payment.metadata as any).order_id;
  if (!orderId) {
    console.warn('Mollie webhook: payment has no order_id metadata', mollieId);
    return new NextResponse('OK', { status: 200 });
  }

  const admin = getSupabaseAdmin();

  // Idempotentie-check: schrijf event in. Bij conflict (zelfde id+status al eerder)
  // krijgen we geen rij terug en slaan we de actie over.
  const { data: eventRow, error: eventErr } = await admin
    .from('sbs_mollie_events')
    .insert({
      mollie_payment_id: payment.id,
      payment_status: payment.status,
      order_id: orderId,
      raw: payment as any,
      result: 'ok',
    })
    .select('id')
    .single();

  if (eventErr) {
    // Conflict op unique key betekent: deze status is al verwerkt.
    // Postgres error code 23505 = unique_violation
    if (eventErr.code === '23505') {
      return new NextResponse('OK (duplicate)', { status: 200 });
    }
    console.error('Mollie event insert failed:', eventErr);
    return new NextResponse('OK', { status: 200 });
  }

  // Update payment-record met laatste Mollie-state
  await admin
    .from('sbs_payments')
    .update({
      status: payment.status,
      method: payment.method ?? null,
      raw: payment as any,
      paid_at: payment.paidAt ?? null,
      canceled_at: payment.canceledAt ?? null,
    })
    .eq('mollie_payment_id', payment.id);

  // Bepaal nieuwe order-status op basis van Mollie-status
  let newOrderStatus: string | null = null;
  let extraUpdate: Record<string, any> = {};

  switch (payment.status) {
    case 'paid':
      newOrderStatus = 'paid';
      extraUpdate.paid_at = new Date().toISOString();
      break;
    case 'canceled':
    case 'expired':
    case 'failed':
      // Order gaat naar cancelled, mits 'ie nog niet betaald is
      newOrderStatus = 'cancelled';
      break;
    case 'open':
    case 'pending':
    case 'authorized':
      // Geen status-wijziging nodig — blijft pending_payment
      break;
  }

  if (newOrderStatus) {
    // Voorkom dat we een al-betaalde order terugzetten op cancelled
    const { data: currentOrder } = await admin
      .from('sbs_orders')
      .select('status')
      .eq('id', orderId)
      .single();

    if (currentOrder) {
      const cur = currentOrder.status;
      const allow =
        (newOrderStatus === 'paid' && cur === 'pending_payment') ||
        (newOrderStatus === 'cancelled' && cur === 'pending_payment');

      if (allow) {
        const { error: updateErr } = await admin
          .from('sbs_orders')
          .update({ status: newOrderStatus, ...extraUpdate })
          .eq('id', orderId);
        if (updateErr) {
          console.error('Order status update failed:', updateErr);
          await admin
            .from('sbs_mollie_events')
            .update({ result: 'error', error_message: updateErr.message })
            .eq('id', eventRow.id);
        }
      }
    }
  }

  await admin
    .from('sbs_mollie_events')
    .update({ processed_at: new Date().toISOString() })
    .eq('id', eventRow.id);

  return new NextResponse('OK', { status: 200 });
}

// Mollie's webhook check pingt soms GET; return 200 zonder body
export async function GET() {
  return new NextResponse('OK', { status: 200 });
}
