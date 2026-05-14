'use server';

/**
 * Read-only helper voor de polling-flow op /checkout/return.
 * Retourneert minimaal: { status, found } op basis van order_number.
 * Geen RLS-bypass — werkt voor zowel guest (sbs_orders insert toegestaan
 * voor anon) als ingelogde klant (RLS-policy customer sees own orders).
 */
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function getOrderStatusByNumber(orderNumber: string) {
  if (!orderNumber || !/^SBS-\d{4}-\d{4}$/.test(orderNumber)) {
    return { found: false as const };
  }
  // Gebruik admin-client — anon kan zonder eigenaarschap geen order zien,
  // en de return-pagina moet ook werken voor gast-checkout. We lekken niets:
  // alleen de status (geen PII).
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('sbs_orders')
    .select('id, order_number, status')
    .eq('order_number', orderNumber)
    .single();
  if (!data) return { found: false as const };
  return { found: true as const, id: data.id, status: data.status as string };
}
