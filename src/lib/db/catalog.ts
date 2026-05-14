/**
 * Catalog data access — voor admin + publieke pagina's.
 * Gebruikt server-side Supabase client. RLS handelt zichtbaarheid af.
 */
import { getSupabaseServer } from '@/lib/supabase/server';

export type DbProduct = {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  brand_id: string | null;
  category_id: string | null;
  current_price: number;
  original_price: number | null;
  btw_rate: number;
  energy_label: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | null;
  rating: number | null;
  review_count: number;
  in_stock: boolean;
  is_same_day_delivery: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  is_hidden: boolean;
  short_description: string | null;
  features: string[];
  specs: Record<string, string>;
  image_primary: string | null;
  image_fallback: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type DbCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
};

export type DbBrand = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  is_active: boolean;
  sort_order: number;
};

// ─── Public reads (RLS filtert zichtbaarheid) ────────────────────────────────

export async function getVisibleProducts(opts?: {
  categorySlug?: string;
  onSale?: boolean;
  limit?: number;
}) {
  const supabase = getSupabaseServer();
  let q = supabase
    .from('sbs_products')
    .select('*, brand:sbs_brands(slug, name), category:sbs_categories(slug, name)')
    .eq('is_hidden', false)
    .order('sort_order', { ascending: true });

  if (opts?.onSale) q = q.eq('is_on_sale', true);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw error;

  if (opts?.categorySlug) {
    return (data ?? []).filter((p: any) => p.category?.slug === opts.categorySlug);
  }
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('sbs_products')
    .select('*, brand:sbs_brands(slug, name), category:sbs_categories(slug, name)')
    .eq('slug', slug)
    .eq('is_hidden', false)
    .single();
  return data;
}

export async function getActiveCategories() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('sbs_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('sbs_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data;
}

// ─── Admin reads (RLS staat alles toe voor admin/staff) ──────────────────────

export async function getAllProductsForAdmin() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('sbs_products')
    .select('*, brand:sbs_brands(slug, name), category:sbs_categories(slug, name)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getProductByIdForAdmin(id: string) {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('sbs_products')
    .select('*, brand:sbs_brands(slug, name), category:sbs_categories(slug, name)')
    .eq('id', id)
    .single();
  return data;
}

export async function getAllCategoriesForAdmin() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('sbs_categories')
    .select('*')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getAllBrands() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from('sbs_brands')
    .select('*')
    .order('sort_order', { ascending: true });
  return data ?? [];
}
