import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

export type OrderStatus =
  | 'pending_payment' | 'paid' | 'in_progress'
  | 'planned_delivery' | 'delivered' | 'completed'
  | 'cancelled' | 'refunded';

export type DbOrder = {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  delivery_method: 'standard' | 'same_day';
  delivery_date: string | null;
  delivery_postcode: string | null;
  customer_snapshot: { name: string; email: string; phone?: string };
  shipping_address_snapshot: any;
  billing_address_snapshot: any | null;
  subtotal_excl_btw: number;
  btw_total: number;
  discount_amount: number;
  delivery_cost: number;
  total_incl_btw: number;
  discount_code: string | null;
  notes_customer: string | null;
  notes_internal: string | null;
  paid_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getAllOrdersForAdmin(opts?: { status?: OrderStatus; limit?: number }) {
  const supabase = getSupabaseServer();
  let q = supabase
    .from('sbs_orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (opts?.status) q = q.eq('status', opts.status);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DbOrder[];
}

export async function getOrderById(id: string) {
  const supabase = getSupabaseServer();
  const { data: order } = await supabase
    .from('sbs_orders')
    .select('*')
    .eq('id', id)
    .single();
  if (!order) return null;

  const { data: items } = await supabase
    .from('sbs_order_items')
    .select('*')
    .eq('order_id', id)
    .order('sort_order', { ascending: true });

  const { data: log } = await supabase
    .from('sbs_order_status_log')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: true });

  return {
    order: order as DbOrder,
    items: items ?? [],
    log: log ?? [],
  };
}

// ─── Customer ────────────────────────────────────────────────────────────────

export async function getMyOrders() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('sbs_orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  return (data ?? []) as DbOrder[];
}

// ─── Dashboard stats ─────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
  const supabase = getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [newToday, deliverToday, paidToday, unpaidOld] = await Promise.all([
    supabase.from('sbs_orders').select('id', { count: 'exact', head: true })
      .gte('created_at', today),
    supabase.from('sbs_orders').select('id', { count: 'exact', head: true })
      .eq('delivery_date', today)
      .in('status', ['paid', 'in_progress', 'planned_delivery']),
    supabase.from('sbs_orders').select('total_incl_btw,subtotal_excl_btw')
      .eq('status', 'paid')
      .gte('paid_at', today),
    supabase.from('sbs_orders').select('id', { count: 'exact', head: true })
      .eq('status', 'pending_payment')
      .lt('created_at', dayAgo),
  ]);

  const revenueExclToday = (paidToday.data ?? []).reduce(
    (sum, r: any) => sum + Number(r.subtotal_excl_btw || 0),
    0
  );

  return {
    newOrdersToday: newToday.count || 0,
    deliveriesToday: deliverToday.count || 0,
    revenueExclToday,
    unpaidOver24h: unpaidOld.count || 0,
  };
}
