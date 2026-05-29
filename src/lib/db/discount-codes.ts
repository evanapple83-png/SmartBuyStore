import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

export type DiscountCode = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_total: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  description: string | null;
  created_at: string;
};

export type DiscountValidation =
  | { ok: true; code: string; type: 'percentage' | 'fixed'; value: number; discountAmount: number }
  | { ok: false; error: string };

/**
 * Valideert een kortingscode tegen een orderbedrag (incl. btw) en berekent
 * het kortingsbedrag. Server-side bron-van-waarheid — wordt zowel door de
 * checkout-UI als door createOrder gebruikt. Leest via RLS (anon mag actieve
 * codes lezen). Hoogt used_count NIET op (dat gebeurt pas bij orderaanmaak).
 */
export async function validateDiscountCode(
  rawCode: string,
  subtotalInclBtw: number
): Promise<DiscountValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: 'Vul een kortingscode in.' };

  const supabase = getSupabaseServer();
  let row: DiscountCode | null = null;
  try {
    const { data, error } = await supabase
      .from('sbs_discount_codes')
      .select('*')
      .ilike('code', code)
      .maybeSingle();
    if (error) throw error;
    row = (data as DiscountCode) ?? null;
  } catch (err) {
    console.warn('validateDiscountCode lookup faalde:', err);
    return { ok: false, error: 'Kortingscode kon niet worden gecontroleerd. Probeer het later opnieuw.' };
  }

  if (!row || !row.is_active) return { ok: false, error: 'Deze kortingscode is ongeldig.' };

  const today = new Date().toISOString().slice(0, 10);
  if (row.valid_from && today < row.valid_from) {
    return { ok: false, error: 'Deze kortingscode is nog niet geldig.' };
  }
  if (row.valid_until && today > row.valid_until) {
    return { ok: false, error: 'Deze kortingscode is verlopen.' };
  }
  if (row.max_uses != null && row.used_count >= row.max_uses) {
    return { ok: false, error: 'Deze kortingscode is niet meer beschikbaar.' };
  }
  if (subtotalInclBtw < Number(row.min_order_total)) {
    return {
      ok: false,
      error: `Deze code geldt vanaf een orderbedrag van € ${Number(row.min_order_total).toFixed(2).replace('.', ',')}.`,
    };
  }

  const base = Math.max(0, Number(subtotalInclBtw));
  let discountAmount =
    row.type === 'percentage'
      ? +(base * (Number(row.value) / 100)).toFixed(2)
      : +Number(row.value).toFixed(2);
  discountAmount = Math.min(discountAmount, base); // nooit meer dan het orderbedrag
  if (discountAmount <= 0) return { ok: false, error: 'Deze kortingscode levert geen korting op dit bedrag op.' };

  return { ok: true, code: row.code, type: row.type, value: Number(row.value), discountAmount };
}

/**
 * Hoogt used_count met 1 op na een succesvolle bestelling. Gebruikt de
 * service-role-client (anon/klant mag codes niet updaten via RLS).
 * Best-effort: faalt dit, dan blijft de order gewoon staan.
 */
export async function incrementDiscountUse(code: string): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('sbs_discount_codes')
      .select('id, used_count')
      .ilike('code', code.trim().toUpperCase())
      .maybeSingle();
    if (!data) return;
    await admin
      .from('sbs_discount_codes')
      .update({ used_count: (data.used_count ?? 0) + 1 })
      .eq('id', data.id);
  } catch (err) {
    console.warn('incrementDiscountUse faalde (order blijft geldig):', err);
  }
}

/** Alle kortingscodes voor admin. Defensief: ontbrekende tabel → []. */
export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const supabase = getSupabaseServer();
  try {
    const { data, error } = await supabase
      .from('sbs_discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as DiscountCode[];
  } catch (err) {
    console.warn('getDiscountCodes fallback (tabel ontbreekt?):', err);
    return [];
  }
}
