import { getSupabaseServer } from '@/lib/supabase/server';

export type Intelligence = {
  enabled: boolean; // false als tabel ontbreekt (migratie 0010 nog niet gedraaid)
  pageviewsToday: number;
  visitorsToday: number;
  pageviews7d: number;
  visitors7d: number;
  topPages: { path: string; views: number }[];
  topProducts: { slug: string; views: number }[];
  perDay: { day: string; views: number; visitors: number }[];
  conversion7d: number; // % betaalde orders t.o.v. unieke bezoekers
};

const EMPTY: Intelligence = {
  enabled: false,
  pageviewsToday: 0, visitorsToday: 0, pageviews7d: 0, visitors7d: 0,
  topPages: [], topProducts: [], perDay: [], conversion7d: 0,
};

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}
const PRETTY: Record<string, string> = {
  '/': 'Homepage',
  '/winkel': 'Alle producten',
  '/aanbiedingen': 'Aanbiedingen',
  '/winkelwagen': 'Winkelwagen',
  '/checkout': 'Afrekenen',
  '/verlanglijst': 'Verlanglijst',
  '/contact': 'Contact',
};
export function prettyPath(p: string): string {
  if (PRETTY[p]) return PRETTY[p];
  if (p.startsWith('/product/')) return 'Product · ' + p.replace('/product/', '');
  if (p.startsWith('/categorie/')) return 'Categorie · ' + p.replace('/categorie/', '');
  return p;
}

export async function getIntelligence(): Promise<Intelligence> {
  const supabase = getSupabaseServer();
  const now = Date.now();
  const since14 = new Date(now - 14 * 86400_000).toISOString();
  const today = new Date(now).toISOString().slice(0, 10);
  const since7 = new Date(now - 7 * 86400_000).toISOString();

  let rows: { path: string; visitor_id: string | null; product_slug: string | null; created_at: string }[];
  try {
    const { data, error } = await supabase
      .from('sbs_page_views')
      .select('path, visitor_id, product_slug, created_at')
      .gte('created_at', since14)
      .order('created_at', { ascending: false })
      .limit(20000);
    if (error) throw error;
    rows = (data ?? []) as any[];
  } catch (err) {
    console.warn('getIntelligence: tabel ontbreekt of niet bereikbaar', err);
    return EMPTY;
  }

  const in7 = rows.filter((r) => r.created_at >= since7);
  const inToday = rows.filter((r) => r.created_at.slice(0, 10) === today);

  const uniq = (list: typeof rows) => new Set(list.map((r) => r.visitor_id || 'anon')).size;

  // Top pagina's (7d)
  const pageCount = new Map<string, number>();
  for (const r of in7) pageCount.set(r.path, (pageCount.get(r.path) || 0) + 1);
  const topPages = Array.from(pageCount.entries())
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  // Top producten (7d)
  const prodCount = new Map<string, number>();
  for (const r of in7) if (r.product_slug) prodCount.set(r.product_slug, (prodCount.get(r.product_slug) || 0) + 1);
  const topProducts = Array.from(prodCount.entries())
    .map(([slug, views]) => ({ slug, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  // Per dag (laatste 14 dagen, oplopend)
  const perDayMap = new Map<string, { views: number; vis: Set<string> }>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 86400_000).toISOString().slice(0, 10);
    perDayMap.set(d, { views: 0, vis: new Set() });
  }
  for (const r of rows) {
    const d = dayKey(r.created_at);
    const e = perDayMap.get(d);
    if (e) { e.views++; e.vis.add(r.visitor_id || 'anon'); }
  }
  const perDay = Array.from(perDayMap.entries()).map(([day, e]) => ({ day, views: e.views, visitors: e.vis.size }));

  // Conversie: betaalde orders (7d) t.o.v. unieke bezoekers (7d)
  let paidOrders7d = 0;
  try {
    const { count } = await supabase
      .from('sbs_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed'])
      .gte('created_at', since7);
    paidOrders7d = count || 0;
  } catch { /* negeer */ }
  const visitors7d = uniq(in7);
  const conversion7d = visitors7d > 0 ? +((paidOrders7d / visitors7d) * 100).toFixed(1) : 0;

  return {
    enabled: true,
    pageviewsToday: inToday.length,
    visitorsToday: uniq(inToday),
    pageviews7d: in7.length,
    visitors7d,
    topPages,
    topProducts,
    perDay,
    conversion7d,
  };
}
