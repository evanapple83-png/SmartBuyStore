'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';

// Hulpfunctie: slug genereren uit naam
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

async function ensureAdminOrStaff() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Niet ingelogd');
  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  if (!profile?.is_active || !['admin', 'staff'].includes(profile.role)) {
    throw new Error('Geen toestemming');
  }
  return supabase;
}

// ─── PRODUCTEN ───────────────────────────────────────────────────────────────

/** Parse de gedeelde media/cashback-velden uit het productformulier. */
function parseMediaAndCashback(formData: FormData): {
  fields?: {
    images_extra: string[];
    brochure_url: string | null;
    cashback_amount: number | null;
    cashback_label: string | null;
  };
  error?: string;
} {
  let images_extra: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get('images_extra') || '[]'));
    if (Array.isArray(parsed)) {
      images_extra = parsed.filter((u): u is string => typeof u === 'string' && u.length > 0);
    }
  } catch {
    // ongeldig JSON → behandel als geen extra foto's
  }

  const cashback_raw = String(formData.get('cashback_amount') || '').trim();
  const cashback_amount = cashback_raw ? Number(cashback_raw) : null;
  if (cashback_amount !== null && (!Number.isFinite(cashback_amount) || cashback_amount < 0)) {
    return { error: 'Cashback-bedrag mag niet negatief zijn' };
  }

  return {
    fields: {
      images_extra,
      brochure_url: String(formData.get('brochure_url') || '').trim() || null,
      cashback_amount,
      // Label alleen bewaren als er ook echt een cashback-bedrag is.
      cashback_label: cashback_amount !== null
        ? String(formData.get('cashback_label') || '').trim() || null
        : null,
    },
  };
}

/** Parse het specs-veld (JSON-object label→waarde) uit het productformulier. */
function parseSpecs(formData: FormData): Record<string, string> {
  try {
    const parsed = JSON.parse(String(formData.get('specs') || '{}'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed)
          .filter(([k, v]) => typeof k === 'string' && typeof v === 'string' && k.trim() && String(v).trim())
          .map(([k, v]) => [k.trim(), String(v).trim()])
      );
    }
  } catch {
    // ongeldig JSON → geen specs
  }
  return {};
}

/**
 * Inkoopprijs + marge opslaan in de admin-only tabel sbs_product_costs.
 * Lege inkoopprijs = rij verwijderen. Best-effort vóór de redirect; een
 * RLS-/migratiefout mag het product-opslaan zelf niet blokkeren.
 */
async function saveProductCosts(supabase: any, productId: string, formData: FormData): Promise<string | null> {
  const purchaseRaw = String(formData.get('purchase_price') || '').trim();
  const marginRaw = String(formData.get('margin_percent') || '').trim();

  if (!purchaseRaw) {
    await supabase.from('sbs_product_costs').delete().eq('product_id', productId);
    return null;
  }

  const purchase_price = Number(purchaseRaw);
  const margin_percent = marginRaw ? Number(marginRaw) : null;
  if (!Number.isFinite(purchase_price) || purchase_price < 0) return 'Inkoopprijs mag niet negatief zijn';
  if (margin_percent !== null && (!Number.isFinite(margin_percent) || margin_percent < 0))
    return 'Marge mag niet negatief zijn';

  const { error } = await supabase
    .from('sbs_product_costs')
    .upsert({ product_id: productId, purchase_price, margin_percent }, { onConflict: 'product_id' });
  if (error) {
    return /relation .* does not exist/i.test(error.message)
      ? 'Inkoop/marge niet opgeslagen: draai migratie 0014 in Supabase.'
      : `Inkoop/marge niet opgeslagen: ${error.message}`;
  }
  return null;
}

export type ProductFormState = {
  ok: boolean;
  error?: string;
  productId?: string;
};

export async function createProduct(formData: FormData): Promise<ProductFormState> {
  const supabase = await ensureAdminOrStaff();

  const name = String(formData.get('name') || '').trim();
  if (!name) return { ok: false, error: 'Naam is verplicht' };

  const slug = String(formData.get('slug') || '').trim() || slugify(name);
  const brand_id = String(formData.get('brand_id') || '') || null;
  const category_id = String(formData.get('category_id') || '') || null;
  const current_price = Number(formData.get('current_price') || 0);
  const original_price_raw = formData.get('original_price');
  const original_price = original_price_raw ? Number(original_price_raw) : null;

  if (current_price < 0) return { ok: false, error: 'Prijs mag niet negatief zijn' };
  if (original_price !== null && original_price < 0)
    return { ok: false, error: 'Originele prijs mag niet negatief zijn' };

  const featuresStr = String(formData.get('features') || '').trim();
  const features = featuresStr
    ? featuresStr.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const media = parseMediaAndCashback(formData);
  if (media.error) return { ok: false, error: media.error };

  const insert = {
    slug,
    name,
    short_name: String(formData.get('short_name') || name).slice(0, 80),
    sku: String(formData.get('sku') || '').trim() || null,
    brand_id,
    category_id,
    current_price,
    original_price,
    energy_label: (String(formData.get('energy_label') || '') || null) as any,
    warranty_label: String(formData.get('warranty_label') || '').trim() || null,
    stock_count: Math.max(0, Math.floor(Number(formData.get('stock_count') || 0))),
    in_stock: Math.max(0, Math.floor(Number(formData.get('stock_count') || 0))) > 0,
    is_same_day_delivery: formData.get('is_same_day_delivery') === 'on',
    is_new: formData.get('is_new') === 'on',
    is_on_sale: formData.get('is_on_sale') === 'on',
    is_hidden: formData.get('is_hidden') === 'on',
    short_description: String(formData.get('short_description') || '') || null,
    features,
    image_primary: String(formData.get('image_primary') || '') || null,
    image_fallback: String(formData.get('image_fallback') || '') || null,
    specs: parseSpecs(formData),
    ...media.fields,
  };

  const { data, error } = await supabase.from('sbs_products').insert(insert).select('id').single();
  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: /sku/i.test(error.message) ? 'Dit artikelnummer is al in gebruik' : 'Slug bestaat al' };
    }
    return { ok: false, error: error.message };
  }
  // Best-effort: faalt dit (bv. migratie 0014 nog niet gedraaid), dan is het
  // product wél aangemaakt en kan inkoop/marge op de bewerkpagina opnieuw.
  await saveProductCosts(supabase, data.id, formData);

  revalidatePath('/admin/producten');
  redirect(`/admin/producten/${data.id}`);
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductFormState> {
  const supabase = await ensureAdminOrStaff();

  const name = String(formData.get('name') || '').trim();
  if (!name) return { ok: false, error: 'Naam is verplicht' };

  const current_price = Number(formData.get('current_price') || 0);
  if (current_price < 0) return { ok: false, error: 'Prijs mag niet negatief zijn' };

  const original_price_raw = formData.get('original_price');
  const original_price = original_price_raw && original_price_raw !== '' ? Number(original_price_raw) : null;

  const featuresStr = String(formData.get('features') || '').trim();
  const features = featuresStr
    ? featuresStr.split('\n').map((s) => s.trim()).filter(Boolean)
    : [];

  const media = parseMediaAndCashback(formData);
  if (media.error) return { ok: false, error: media.error };

  const update = {
    slug: String(formData.get('slug') || '').trim(),
    name,
    short_name: String(formData.get('short_name') || name).slice(0, 80),
    sku: String(formData.get('sku') || '').trim() || null,
    brand_id: String(formData.get('brand_id') || '') || null,
    category_id: String(formData.get('category_id') || '') || null,
    current_price,
    original_price,
    energy_label: (String(formData.get('energy_label') || '') || null) as any,
    warranty_label: String(formData.get('warranty_label') || '').trim() || null,
    stock_count: Math.max(0, Math.floor(Number(formData.get('stock_count') || 0))),
    in_stock: Math.max(0, Math.floor(Number(formData.get('stock_count') || 0))) > 0,
    is_same_day_delivery: formData.get('is_same_day_delivery') === 'on',
    is_new: formData.get('is_new') === 'on',
    is_on_sale: formData.get('is_on_sale') === 'on',
    is_hidden: formData.get('is_hidden') === 'on',
    short_description: String(formData.get('short_description') || '') || null,
    features,
    image_primary: String(formData.get('image_primary') || '') || null,
    image_fallback: String(formData.get('image_fallback') || '') || null,
    specs: parseSpecs(formData),
    ...media.fields,
  };

  const { error } = await supabase.from('sbs_products').update(update).eq('id', id);
  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: /sku/i.test(error.message) ? 'Dit artikelnummer is al in gebruik' : 'Slug bestaat al' };
    }
    return { ok: false, error: error.message };
  }

  const costsError = await saveProductCosts(supabase, id, formData);

  revalidatePath('/admin/producten');
  revalidatePath(`/admin/producten/${id}`);
  revalidatePath('/');
  revalidatePath(`/product/${update.slug}`);
  if (costsError) return { ok: false, error: costsError };
  return { ok: true, productId: id };
}

export async function toggleProductHidden(id: string, hidden: boolean) {
  const supabase = await ensureAdminOrStaff();
  const { error } = await supabase.from('sbs_products').update({ is_hidden: hidden }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/producten');
  revalidatePath('/');
}

// ─── CATEGORIEËN ─────────────────────────────────────────────────────────────

export async function upsertCategory(formData: FormData) {
  const supabase = await ensureAdminOrStaff();
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  if (!name) return { ok: false, error: 'Naam is verplicht' };

  const slug = String(formData.get('slug') || '').trim() || slugify(name);
  const description = String(formData.get('description') || '') || null;
  const is_active = formData.get('is_active') === 'on';
  const sort_order = Number(formData.get('sort_order') || 0);

  if (id) {
    const { error } = await supabase
      .from('sbs_categories')
      .update({ slug, name, description, is_active, sort_order })
      .eq('id', id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from('sbs_categories')
      .insert({ slug, name, description, is_active, sort_order });
    if (error) {
      if (error.code === '23505') return { ok: false, error: 'Slug bestaat al' };
      return { ok: false, error: error.message };
    }
  }

  revalidatePath('/admin/categorieen');
  revalidatePath('/');
  return { ok: true };
}

export async function toggleCategoryActive(id: string, active: boolean) {
  const supabase = await ensureAdminOrStaff();

  // Veiligheidscheck: bij deactiveren waarschuw via UI (frontend), maar laat DB toe.
  // We tonen in admin straks welke producten ermee samenhangen.
  const { error } = await supabase
    .from('sbs_categories')
    .update({ is_active: active })
    .eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/categorieen');
  revalidatePath('/');
}

// ─── MERKEN ──────────────────────────────────────────────────────────────────

export async function upsertBrand(formData: FormData) {
  const supabase = await ensureAdminOrStaff();
  const id = String(formData.get('id') || '');
  const name = String(formData.get('name') || '').trim();
  if (!name) return { ok: false, error: 'Naam is verplicht' };

  const slug = String(formData.get('slug') || '').trim() || slugify(name);
  const logo_url = String(formData.get('logo_url') || '').trim() || null;
  const is_active = formData.get('is_active') === 'on';
  const sort_order = Number(formData.get('sort_order') || 0);

  if (id) {
    const { error } = await supabase
      .from('sbs_brands')
      .update({ slug, name, logo_url, is_active, sort_order })
      .eq('id', id);
    if (error) return { ok: false, error: error.code === '23505' ? 'Slug bestaat al' : error.message };
  } else {
    const { error } = await supabase
      .from('sbs_brands')
      .insert({ slug, name, logo_url, is_active, sort_order });
    if (error) return { ok: false, error: error.code === '23505' ? 'Slug bestaat al' : error.message };
  }

  revalidatePath('/admin/merken');
  revalidatePath('/merken');
  revalidatePath('/');
  return { ok: true };
}

export async function toggleBrandActive(id: string, active: boolean) {
  const supabase = await ensureAdminOrStaff();
  const { error } = await supabase.from('sbs_brands').update({ is_active: active }).eq('id', id);
  if (error) throw error;
  revalidatePath('/admin/merken');
  revalidatePath('/merken');
}

// ─── KLANTEN ─────────────────────────────────────────────────────────────────

export async function updateCustomerProfile(id: string, formData: FormData) {
  const supabase = await ensureAdminOrStaff();
  const full_name = String(formData.get('full_name') || '').trim() || null;
  const phone = String(formData.get('phone') || '').trim() || null;
  const is_active = formData.get('is_active') === 'on';

  const { error } = await supabase
    .from('sbs_profiles')
    .update({ full_name, phone, is_active })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/klanten');
  revalidatePath(`/admin/klanten/${id}`);
  return { ok: true };
}
