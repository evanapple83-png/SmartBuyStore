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

// ─── Financieel: winst + verschuldigde btw ───────────────────────────────────

export type FinanceStats = {
  profitMonth: number;       // winst excl. btw, deze maand
  profitQuarter: number;     // winst excl. btw, dit kwartaal
  btwMonth: number;          // verschuldigde btw over verkopen, deze maand
  btwQuarter: number;        // verschuldigde btw over verkopen, dit kwartaal
  itemsWithCost: number;     // verkochte artikelen mét ingevulde inkoopprijs (kwartaal)
  itemsTotal: number;        // alle verkochte artikelen (kwartaal)
  quarterLabel: string;      // bv. "Q2 2026"
};

/**
 * Winst = verkoop excl. btw − inkoop (uit sbs_product_costs) per verkocht
 * artikel, minus het excl.-deel van kortingen. Artikelen zonder ingevulde
 * inkoopprijs tellen niet mee in de winst (coverage zichtbaar in de UI).
 * Verschuldigde btw = btw over betaalde verkopen, gecorrigeerd voor korting
 * (indicatie — voorbelasting over inkoopfacturen gaat er bij de aangifte nog af).
 */
export async function getFinanceStats(): Promise<FinanceStats> {
  const supabase = getSupabaseServer();
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const quarterStart = new Date(now.getFullYear(), quarter * 3, 1).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const zero: FinanceStats = {
    profitMonth: 0, profitQuarter: 0, btwMonth: 0, btwQuarter: 0,
    itemsWithCost: 0, itemsTotal: 0, quarterLabel: `Q${quarter + 1} ${now.getFullYear()}`,
  };

  try {
    const { data: orders } = await supabase
      .from('sbs_orders')
      .select('id, paid_at, btw_total, discount_amount')
      .in('status', PAID_STATUSES)
      .gte('paid_at', quarterStart);
    if (!orders || orders.length === 0) return zero;

    const orderIds = orders.map((o) => o.id);
    const { data: items } = await supabase
      .from('sbs_order_items')
      .select('order_id, product_id, quantity, line_subtotal_excl_btw')
      .in('order_id', orderIds);

    const productIds = Array.from(new Set((items ?? []).map((i) => i.product_id).filter(Boolean)));
    const { data: costs } = productIds.length
      ? await supabase.from('sbs_product_costs').select('product_id, purchase_price').in('product_id', productIds)
      : { data: [] as any[] };
    const costByProduct = new Map((costs ?? []).map((c) => [c.product_id, Number(c.purchase_price)]));

    // Winst per order optellen (alleen artikelen met bekende inkoopprijs)
    const profitByOrder = new Map<string, number>();
    let itemsWithCost = 0;
    let itemsTotal = 0;
    for (const it of items ?? []) {
      itemsTotal += 1;
      const purchase = it.product_id ? costByProduct.get(it.product_id) : undefined;
      if (purchase === undefined) continue;
      itemsWithCost += 1;
      const lineProfit = Number(it.line_subtotal_excl_btw || 0) - Number(it.quantity || 0) * purchase;
      profitByOrder.set(it.order_id, (profitByOrder.get(it.order_id) || 0) + lineProfit);
    }

    let profitMonth = 0, profitQuarter = 0, btwMonth = 0, btwQuarter = 0;
    for (const o of orders) {
      const discount = Number(o.discount_amount || 0);
      // Korting is incl. btw → excl.-deel van de winst af, btw-deel van de btw af (21%).
      const orderProfit = (profitByOrder.get(o.id) || 0) - discount / 1.21;
      const orderBtw = Math.max(0, Number(o.btw_total || 0) - (discount * 0.21) / 1.21);
      const inMonth = o.paid_at && o.paid_at >= monthStart;
      profitQuarter += orderProfit;
      btwQuarter += orderBtw;
      if (inMonth) {
        profitMonth += orderProfit;
        btwMonth += orderBtw;
      }
    }

    return {
      profitMonth: +profitMonth.toFixed(2),
      profitQuarter: +profitQuarter.toFixed(2),
      btwMonth: +btwMonth.toFixed(2),
      btwQuarter: +btwQuarter.toFixed(2),
      itemsWithCost,
      itemsTotal,
      quarterLabel: zero.quarterLabel,
    };
  } catch (err) {
    console.warn('Finance stats fallback:', err);
    return zero;
  }
}

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
