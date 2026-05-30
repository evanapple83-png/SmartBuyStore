import { getSupabaseServer, getSupabasePublic } from '@/lib/supabase/server';

export type Review = {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  status: 'pending' | 'published' | 'rejected';
  is_verified: boolean;
  created_at: string;
};

export type ReviewAggregate = { avg: number; count: number };

/** Gemiddelde + aantal gepubliceerde reviews per productId (voor lijsten). */
export async function getReviewAggregates(productIds: string[]): Promise<Map<string, ReviewAggregate>> {
  const map = new Map<string, ReviewAggregate>();
  if (productIds.length === 0) return map;
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from('sbs_reviews')
      .select('product_id, rating')
      .eq('status', 'published')
      .in('product_id', productIds);
    if (error) throw error;
    const acc = new Map<string, { sum: number; n: number }>();
    for (const r of data ?? []) {
      const a = acc.get(r.product_id) || { sum: 0, n: 0 };
      a.sum += Number(r.rating); a.n += 1;
      acc.set(r.product_id, a);
    }
    acc.forEach((a, id) => map.set(id, { avg: +(a.sum / a.n).toFixed(1), count: a.n }));
  } catch (err) {
    console.warn('getReviewAggregates (reviews-tabel ontbreekt?)', err);
  }
  return map;
}

export async function getReviewAggregate(productId: string): Promise<ReviewAggregate> {
  return (await getReviewAggregates([productId])).get(productId) || { avg: 0, count: 0 };
}

/** Verrijkt gemapte producten met de echte review-aggregatie (muteert rating/reviewCount). */
export async function enrichProductRatings<T extends { id: string; rating: number; reviewCount: number }>(products: T[]): Promise<T[]> {
  const map = await getReviewAggregates(products.map((p) => p.id));
  for (const p of products) {
    const a = map.get(p.id);
    if (a) { p.rating = a.avg; p.reviewCount = a.count; }
  }
  return products;
}

/** Gepubliceerde reviews voor een product (productpagina). */
export async function getPublishedReviews(productId: string): Promise<Review[]> {
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from('sbs_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as Review[];
  } catch {
    return [];
  }
}

/** Recente gepubliceerde reviews + totaalaggregatie, voor de homepage. */
export async function getHomepageReviews(limit = 3): Promise<{
  avg: number; count: number;
  items: { id: string; author_name: string; rating: number; title: string | null; body: string; is_verified: boolean; product_name: string | null }[];
}> {
  try {
    const supabase = getSupabasePublic();
    const { data, error } = await supabase
      .from('sbs_reviews')
      .select('id, author_name, rating, title, body, is_verified, created_at, sbs_products(name)')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    if (error) throw error;
    const all = data ?? [];
    const count = all.length;
    const avg = count ? +(all.reduce((s: number, r: any) => s + Number(r.rating), 0) / count).toFixed(1) : 0;
    const items = all.slice(0, limit).map((r: any) => ({
      id: r.id, author_name: r.author_name, rating: r.rating, title: r.title, body: r.body,
      is_verified: r.is_verified, product_name: r.sbs_products?.name ?? null,
    }));
    return { avg, count, items };
  } catch {
    return { avg: 0, count: 0, items: [] };
  }
}

/** Reviews voor moderatie (admin/staff). */
export async function getReviewsForModeration(): Promise<(Review & { product_name?: string })[]> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('sbs_reviews')
      .select('*, sbs_products(name, slug)')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({ ...r, product_name: r.sbs_products?.name, product_slug: r.sbs_products?.slug }));
  } catch (err) {
    console.warn('getReviewsForModeration (tabel ontbreekt?)', err);
    return [];
  }
}

/** Mag de huidige ingelogde gebruiker dit product reviewen + heeft 'ie het gekocht? */
export async function getReviewEligibility(productId: string): Promise<{ loggedIn: boolean; hasBought: boolean; alreadyReviewed: boolean }> {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { loggedIn: false, hasBought: false, alreadyReviewed: false };

  try {
    const [{ data: mine }, { data: orders }] = await Promise.all([
      supabase.from('sbs_reviews').select('id').eq('product_id', productId).eq('user_id', user.id).limit(1),
      supabase.from('sbs_orders').select('id, sbs_order_items(product_id)').eq('user_id', user.id)
        .in('status', ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed']),
    ]);
    const hasBought = (orders ?? []).some((o: any) => (o.sbs_order_items ?? []).some((it: any) => it.product_id === productId));
    return { loggedIn: true, hasBought, alreadyReviewed: (mine ?? []).length > 0 };
  } catch {
    return { loggedIn: true, hasBought: false, alreadyReviewed: false };
  }
}
