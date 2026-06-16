import { getSupabaseServer } from '@/lib/supabase/server';

/**
 * Tellingen voor de admin-notificaties: openstaand werk dat opgepakt moet
 * worden. Gebruikt door de dashboard-banner én de sidebar-badges, zodat een
 * beheerder direct bij het openen van de back-end ziet dat er actie nodig is.
 *
 * - newOrders: betaalde bestellingen die nog verwerkt moeten worden (status 'paid')
 * - unreadMessages: ongelezen contactberichten
 * - pendingReviews: reviews die op moderatie wachten
 */
export type AdminAlerts = {
  newOrders: number;
  unreadMessages: number;
  pendingReviews: number;
  total: number;
};

const ZERO: AdminAlerts = { newOrders: 0, unreadMessages: 0, pendingReviews: 0, total: 0 };

export async function getAdminAlerts(): Promise<AdminAlerts> {
  const supabase = getSupabaseServer();
  try {
    const [orders, messages, reviews] = await Promise.all([
      supabase.from('sbs_orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
      supabase.from('sbs_contact_messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
      supabase.from('sbs_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    const newOrders = orders.count ?? 0;
    const unreadMessages = messages.count ?? 0;
    const pendingReviews = reviews.count ?? 0;
    return { newOrders, unreadMessages, pendingReviews, total: newOrders + unreadMessages + pendingReviews };
  } catch {
    return ZERO;
  }
}
