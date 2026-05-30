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
  delivery_user_id: string | null;
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
  if (error) {
    console.warn('getAllOrdersForAdmin: falling back to []', error.message);
    return [] as DbOrder[];
  }
  return (data ?? []) as DbOrder[];
}

/** Orders waarvoor een factuur relevant is (betaald of verder in het traject). */
const INVOICEABLE_STATUSES: OrderStatus[] = [
  'paid', 'in_progress', 'planned_delivery', 'delivered', 'completed', 'refunded',
];

export async function getInvoiceOrders() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('sbs_orders')
    .select('*')
    .in('status', INVOICEABLE_STATUSES)
    .order('paid_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.warn('getInvoiceOrders: falling back to []', error.message);
    return [] as DbOrder[];
  }
  return (data ?? []) as DbOrder[];
}

/** Orders die nog bezorgd moeten worden — voor de bezorgplanning.
 *  assignedTo: filter op toegewezen bezorger (gebruikt voor de delivery-rol). */
export async function getDeliveryOrders(opts?: { assignedTo?: string }) {
  const supabase = getSupabaseServer();
  let q = supabase
    .from('sbs_orders')
    .select('*')
    .in('status', ['paid', 'in_progress', 'planned_delivery']);
  if (opts?.assignedTo) q = q.eq('delivery_user_id', opts.assignedTo);
  const { data, error } = await q
    .order('delivery_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) {
    console.warn('getDeliveryOrders: falling back to []', error.message);
    return [] as DbOrder[];
  }
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

export type DashboardStats = {
  newOrdersToday: number;
  deliveriesToday: number;
  revenueExclToday: number;
  unpaidOver24h: number;
  revenueIncl7d: number;
  revenueIncl30d: number;
  orders30d: number;
  aov30d: number;          // gemiddelde orderwaarde 30d (incl. btw)
  openOrders: number;      // betaald maar nog niet bezorgd/afgerond
};

const PAID_STATUSES = ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed'];

export async function getAdminDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabaseServer();
  const today = new Date().toISOString().slice(0, 10);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const since7 = new Date(Date.now() - 7 * 86400_000).toISOString();
  const since30 = new Date(Date.now() - 30 * 86400_000).toISOString();

  const zero: DashboardStats = {
    newOrdersToday: 0, deliveriesToday: 0, revenueExclToday: 0, unpaidOver24h: 0,
    revenueIncl7d: 0, revenueIncl30d: 0, orders30d: 0, aov30d: 0, openOrders: 0,
  };

  try {
    const [newToday, deliverToday, paidToday, unpaidOld, paid7d, paid30d, open] = await Promise.all([
      supabase.from('sbs_orders').select('id', { count: 'exact', head: true }).gte('created_at', today),
      supabase.from('sbs_orders').select('id', { count: 'exact', head: true })
        .eq('delivery_date', today).in('status', ['paid', 'in_progress', 'planned_delivery']),
      supabase.from('sbs_orders').select('subtotal_excl_btw')
        .in('status', PAID_STATUSES).gte('paid_at', today),
      supabase.from('sbs_orders').select('id', { count: 'exact', head: true })
        .eq('status', 'pending_payment').lt('created_at', dayAgo),
      supabase.from('sbs_orders').select('total_incl_btw').in('status', PAID_STATUSES).gte('paid_at', since7),
      supabase.from('sbs_orders').select('total_incl_btw').in('status', PAID_STATUSES).gte('paid_at', since30),
      supabase.from('sbs_orders').select('id', { count: 'exact', head: true })
        .in('status', ['paid', 'in_progress', 'planned_delivery']),
    ]);

    const sum = (rows: any[] | null, key: string) => (rows ?? []).reduce((s, r) => s + Number(r[key] || 0), 0);
    const rev30 = sum(paid30d.data, 'total_incl_btw');
    const n30 = (paid30d.data ?? []).length;

    return {
      newOrdersToday: newToday.count || 0,
      deliveriesToday: deliverToday.count || 0,
      revenueExclToday: sum(paidToday.data, 'subtotal_excl_btw'),
      unpaidOver24h: unpaidOld.count || 0,
      revenueIncl7d: sum(paid7d.data, 'total_incl_btw'),
      revenueIncl30d: rev30,
      orders30d: n30,
      aov30d: n30 > 0 ? +(rev30 / n30).toFixed(2) : 0,
      openOrders: open.count || 0,
    };
  } catch (err) {
    console.warn('Dashboard stats fallback:', err);
    return zero;
  }
}
