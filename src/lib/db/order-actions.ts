'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';
import { getMollieClient, isMollieConfigured, getRedirectUrl, getWebhookUrl } from '@/lib/mollie/client';
import { validateDiscountCode, incrementDiscountUse } from './discount-codes';
import { dispatchOrderEmail } from '@/lib/mail/dispatch';
import type { OrderStatus } from './orders';

const BTW_RATE = 21;
const DELIVERY_COST = 0; // gratis bezorging — staat overal vermeld

// Provincies waar same-day delivery beschikbaar is.
const SAME_DAY_PROVINCES = ['Friesland', 'Groningen', 'Drenthe', 'Overijssel', 'Flevoland', 'Gelderland'];

/**
 * Heel grove postcode→provincie lookup voor same-day beoordeling.
 * 4-cijferige postcode range volgens NL PostNL conventie.
 */
export async function isSameDayEligible(postcode: string): Promise<boolean> {
  const digits = postcode.replace(/\D/g, '').slice(0, 4);
  const n = parseInt(digits, 10);
  if (isNaN(n)) return false;
  // Friesland 8400-8999, Groningen 9700-9999, Drenthe 7700-7999, 9400-9699,
  // Overijssel 7400-8299, Flevoland 8200-8399, 1300-1379, Gelderland 6500-7399, 6700-7399, 8100-8195
  // Vereenvoudigde range — beheerder kan later via Instellingen verfijnen.
  if (n >= 6500 && n <= 8999) return true;   // grote zone Overijssel/Gelderland/Flevoland/Drenthe deel/Friesland deel
  if (n >= 9000 && n <= 9999) return true;   // Friesland deel + Groningen
  if (n >= 1300 && n <= 1379) return true;   // Flevoland deel (Almere)
  return false;
}

// ─── ORDER CREATION (uit checkout) ───────────────────────────────────────────

export type CheckoutInput = {
  customer: { name: string; email: string; phone?: string };
  shippingAddress: {
    street: string;
    postal_code: string;
    city: string;
    country?: string;
  };
  deliveryMethod: 'standard' | 'same_day';
  deliveryDate?: string;
  notesCustomer?: string;
  discountCode?: string;
  items: Array<{
    productId: string;
    name: string;
    slug: string;
    brand: string;
    image?: string;
    qty: number;
    unitPriceInclBtw: number;
  }>;
};

export type CreateOrderResult =
  | { ok: true; orderId: string; orderNumber: string; checkoutUrl: string | null }
  | { ok: false; error: string };

export async function createOrder(input: CheckoutInput): Promise<CreateOrderResult> {
  if (!input.items || input.items.length === 0) {
    return { ok: false, error: 'Je winkelmand is leeg.' };
  }
  if (!input.customer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customer.email)) {
    return { ok: false, error: 'Vul een geldig e-mailadres in.' };
  }
  if (!input.customer.name.trim()) {
    return { ok: false, error: 'Vul je naam in.' };
  }
  if (!input.shippingAddress.street || !input.shippingAddress.postal_code || !input.shippingAddress.city) {
    return { ok: false, error: 'Vul een volledig bezorgadres in (straat, postcode, plaats).' };
  }

  // Same-day delivery toegestaan?
  if (input.deliveryMethod === 'same_day') {
    const ok = await isSameDayEligible(input.shippingAddress.postal_code);
    if (!ok) {
      return {
        ok: false,
        error: 'Same-day bezorging is alleen beschikbaar in Friesland, Groningen, Drenthe, Overijssel, Flevoland en Gelderland. Kies reguliere bezorging.',
      };
    }
  }

  // ── Server-side prijs-/voorraadverificatie ──────────────────────────────
  // We vertrouwen NOOIT de prijzen die de client meestuurt. Haal de echte
  // prijs, voorraad en zichtbaarheid op uit de database per productId.
  const admin = getSupabaseAdmin();
  const productIds = Array.from(new Set(input.items.map((it) => it.productId)));
  const { data: dbProducts, error: prodErr } = await admin
    .from('sbs_products')
    .select('id, slug, name, short_name, current_price, btw_rate, in_stock, is_hidden, image_primary, image_fallback, sbs_brands(name)')
    .in('id', productIds);

  if (prodErr) {
    console.error('createOrder product lookup error:', prodErr);
    return { ok: false, error: 'We konden je winkelmand niet verifiëren. Probeer het opnieuw.' };
  }

  const byId = new Map((dbProducts ?? []).map((p: any) => [p.id, p]));

  // Bedragen berekenen op basis van DB-prijzen (incl→excl)
  const lines = [];
  for (let idx = 0; idx < input.items.length; idx++) {
    const it = input.items[idx];
    const p: any = byId.get(it.productId);
    if (!p) {
      return { ok: false, error: 'Een product in je winkelmand bestaat niet meer. Ververs de pagina en probeer het opnieuw.' };
    }
    if (p.is_hidden) {
      return { ok: false, error: `"${p.name}" is niet langer beschikbaar. Verwijder het uit je winkelmand.` };
    }
    if (!p.in_stock) {
      return { ok: false, error: `"${p.name}" is helaas niet meer op voorraad.` };
    }

    const qty = Math.max(1, Math.floor(it.qty));
    const unit_incl = Number(p.current_price);          // ← bron van waarheid: DB
    const btwRate = Number(p.btw_rate) || BTW_RATE;
    const unit_excl = +(unit_incl / (1 + btwRate / 100)).toFixed(2);
    const line_excl = +(unit_excl * qty).toFixed(2);
    const line_incl = +(unit_incl * qty).toFixed(2);
    const line_btw = +(line_incl - line_excl).toFixed(2);

    lines.push({
      sort_order: idx,
      product_id: p.id,
      product_snapshot: {
        name: p.name,
        slug: p.slug,
        brand: p.sbs_brands?.name ?? it.brand,
        image: p.image_primary ?? p.image_fallback ?? it.image,
      },
      qty,
      unit_price_excl_btw: unit_excl,
      btw_rate: btwRate,
      line_subtotal_excl_btw: line_excl,
      line_btw,
      line_total_incl_btw: line_incl,
    });
  }

  const subtotal_excl_btw = +lines.reduce((s, l) => s + l.line_subtotal_excl_btw, 0).toFixed(2);
  const btw_total = +lines.reduce((s, l) => s + l.line_btw, 0).toFixed(2);
  const delivery_cost = DELIVERY_COST;
  const goods_incl_btw = +(subtotal_excl_btw + btw_total).toFixed(2);

  // Kortingscode server-side hervalideren (nooit het clientbedrag vertrouwen).
  let discount_amount = 0;
  let applied_discount_code: string | null = null;
  if (input.discountCode?.trim()) {
    const v = await validateDiscountCode(input.discountCode, goods_incl_btw);
    if (!v.ok) {
      return { ok: false, error: v.error };
    }
    discount_amount = v.discountAmount;
    applied_discount_code = v.code;
  }

  const total_incl_btw = +Math.max(0, goods_incl_btw + delivery_cost - discount_amount).toFixed(2);

  // Maak order (via admin client — anon kan via RLS maar dit is robuuster)
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order, error: orderErr } = await admin
    .from('sbs_orders')
    .insert({
      user_id: user?.id ?? null,
      status: 'pending_payment',
      delivery_method: input.deliveryMethod,
      delivery_date: input.deliveryDate ?? null,
      delivery_postcode: input.shippingAddress.postal_code,
      customer_snapshot: input.customer,
      shipping_address_snapshot: {
        ...input.shippingAddress,
        country: input.shippingAddress.country || 'Nederland',
      },
      billing_address_snapshot: null,
      subtotal_excl_btw,
      btw_total,
      discount_amount,
      delivery_cost,
      total_incl_btw,
      discount_code: applied_discount_code,
      notes_customer: input.notesCustomer || null,
    })
    .select('id, order_number')
    .single();

  if (orderErr) {
    console.error('createOrder insert error:', orderErr);
    return { ok: false, error: 'Bestelling kon niet worden aangemaakt. Probeer het opnieuw.' };
  }

  // Items inserten
  const { error: itemsErr } = await admin
    .from('sbs_order_items')
    .insert(lines.map((l) => ({ ...l, order_id: order.id })));

  if (itemsErr) {
    console.error('createOrder items error:', itemsErr);
    // Cleanup: verwijder de order zodat er geen weeskinderen ontstaan
    await admin.from('sbs_orders').delete().eq('id', order.id);
    return { ok: false, error: 'Bestelregels konden niet worden opgeslagen.' };
  }

  // Kortingscode-gebruik registreren (best-effort, blokkeert de order niet).
  if (applied_discount_code) {
    await incrementDiscountUse(applied_discount_code);
  }

  // Bestelbevestiging mailen (best-effort, blokkeert de order niet).
  await dispatchOrderEmail(order.id, 'order_confirmation');

  // Mollie payment aanmaken (alleen als geconfigureerd)
  let checkoutUrl: string | null = null;
  if (isMollieConfigured()) {
    try {
      const mollie = getMollieClient();
      const payment = await mollie.payments.create({
        amount: { currency: 'EUR', value: total_incl_btw.toFixed(2) },
        description: `Smart Buy Store bestelling ${order.order_number}`,
        redirectUrl: getRedirectUrl(order.order_number),
        webhookUrl: getWebhookUrl(),
        metadata: { order_id: order.id, order_number: order.order_number },
      });

      checkoutUrl = payment._links?.checkout?.href ?? null;

      // Sla payment-poging op (server-side bron-van-waarheid)
      await admin.from('sbs_payments').insert({
        order_id: order.id,
        mollie_payment_id: payment.id,
        status: payment.status,
        amount: total_incl_btw,
        method: payment.method ?? null,
        checkout_url: checkoutUrl,
        raw: payment as any,
      });
    } catch (err: any) {
      console.error('Mollie payment create error:', err?.message || err);
      // De order blijft staan met status pending_payment.
      // De klant ziet een nette foutmelding; admin kan handmatig (TEST) of opnieuw initiëren.
      return {
        ok: false,
        error: 'Online betaling kon niet worden gestart. Probeer het opnieuw of neem contact op.',
      };
    }
  }

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
    checkoutUrl,
  };
}

// ─── ADMIN: STATUS UPDATE ────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled'], // 'paid' alleen vanuit webhook IRL, maar staat hier voor TEST gating
  paid: ['in_progress', 'cancelled', 'refunded'],
  in_progress: ['planned_delivery', 'delivered', 'cancelled'],
  planned_delivery: ['delivered', 'cancelled'],
  delivered: ['completed', 'refunded'],
  completed: ['refunded'],
  cancelled: [],
  refunded: [],
};

export async function updateOrderStatus(
  orderId: string,
  toStatus: OrderStatus,
  options?: { note?: string; allowManualPaid?: boolean }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Niet ingelogd' };

  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  if (!profile?.is_active || !['admin', 'staff', 'delivery'].includes(profile.role)) {
    return { ok: false, error: 'Geen toestemming' };
  }

  const { data: order } = await supabase
    .from('sbs_orders')
    .select('status')
    .eq('id', orderId)
    .single();
  if (!order) return { ok: false, error: 'Bestelling niet gevonden' };

  const currentStatus = order.status as OrderStatus;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(toStatus)) {
    return {
      ok: false,
      error: `Status "${currentStatus}" kan niet direct overgaan naar "${toStatus}".`,
    };
  }

  // Productie-veiligheid: 'paid' mag alleen via webhook (zodra Mollie er is).
  // In dev/test zonder MOLLIE_API_KEY mag admin handmatig — gated met allowManualPaid.
  if (toStatus === 'paid') {
    const mollieConfigured = !!process.env.MOLLIE_API_KEY;
    if (mollieConfigured) {
      return {
        ok: false,
        error: '"Betaald" wordt automatisch gezet door Mollie-webhook. Handmatig zetten is uitgeschakeld.',
      };
    }
    if (!options?.allowManualPaid) {
      return {
        ok: false,
        error: 'Mollie is nog niet gekoppeld. Gebruik de TEST-knop om handmatig op betaald te zetten.',
      };
    }
  }

  // Delivery rol mag alleen `delivered` zetten
  if (profile.role === 'delivery' && toStatus !== 'delivered') {
    return { ok: false, error: 'Bezorgers kunnen alleen de status "Bezorgd" zetten.' };
  }

  const update: any = { status: toStatus };
  if (toStatus === 'paid') update.paid_at = new Date().toISOString();
  if (toStatus === 'delivered') update.delivered_at = new Date().toISOString();

  const { error } = await supabase.from('sbs_orders').update(update).eq('id', orderId);
  if (error) return { ok: false, error: error.message };

  // Optionele notitie aan status-log (de trigger maakt sowieso al een entry, dit voegt note toe)
  if (options?.note?.trim()) {
    await supabase.from('sbs_order_status_log').insert({
      order_id: orderId,
      from_status: currentStatus,
      to_status: toStatus,
      by_user_id: user.id,
      note: options.note.trim(),
    });
  }

  // Statusmail versturen (best-effort, idempotent, blokkeert niets).
  const EMAIL_FOR_STATUS: Partial<Record<OrderStatus, Parameters<typeof dispatchOrderEmail>[1]>> = {
    paid: 'payment_received',
    planned_delivery: 'order_planned',
    delivered: 'order_delivered',
    cancelled: 'order_cancelled',
  };
  const emailEvent = EMAIL_FOR_STATUS[toStatus];
  if (emailEvent) {
    await dispatchOrderEmail(orderId, emailEvent);
  }

  revalidatePath('/admin/bestellingen');
  revalidatePath(`/admin/bestellingen/${orderId}`);
  revalidatePath('/account/bestellingen');
  return { ok: true };
}

export async function setOrderDeliveryDate(orderId: string, date: string | null) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Niet ingelogd' };

  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  if (!profile?.is_active || !['admin', 'staff'].includes(profile.role)) {
    return { ok: false, error: 'Geen toestemming' };
  }

  if (date) {
    const d = new Date(date);
    if (d < new Date(new Date().toISOString().slice(0, 10))) {
      return { ok: false, error: 'Bezorgdatum mag niet in het verleden liggen.' };
    }
  }

  const { error } = await supabase
    .from('sbs_orders')
    .update({ delivery_date: date })
    .eq('id', orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/bestellingen/${orderId}`);
  return { ok: true };
}

// ─── CLAIM GUEST ORDERS (op login) ───────────────────────────────────────────

export async function claimGuestOrders() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { claimed: 0 };

  const { data, error } = await supabase.rpc('claim_guest_orders_by_email');
  if (error) {
    console.error('claimGuestOrders error:', error);
    return { claimed: 0 };
  }
  return { claimed: Number(data || 0) };
}
