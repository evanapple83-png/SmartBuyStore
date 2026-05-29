import { getSupabaseServer } from '@/lib/supabase/server';

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
