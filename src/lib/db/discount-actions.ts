'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdminOrStaff } from './admin-guard';

export async function upsertDiscountCode(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdminOrStaff());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }

  const id = String(formData.get('id') || '');
  const code = String(formData.get('code') || '').trim().toUpperCase();
  const type = String(formData.get('type') || 'percentage') as 'percentage' | 'fixed';
  const value = Number(formData.get('value') || 0);
  const min_order_total = Number(formData.get('min_order_total') || 0);
  const maxUsesRaw = String(formData.get('max_uses') || '').trim();
  const max_uses = maxUsesRaw ? Number(maxUsesRaw) : null;
  const valid_from = String(formData.get('valid_from') || '').trim() || null;
  const valid_until = String(formData.get('valid_until') || '').trim() || null;
  const is_active = formData.get('is_active') === 'on';
  const description = String(formData.get('description') || '').trim() || null;

  if (!code) return { ok: false, error: 'Code is verplicht.' };
  if (!/^[A-Z0-9_-]+$/.test(code)) return { ok: false, error: 'Code mag alleen letters, cijfers, - en _ bevatten.' };
  if (type === 'percentage' && (value <= 0 || value > 100)) {
    return { ok: false, error: 'Percentage moet tussen 1 en 100 liggen.' };
  }
  if (type === 'fixed' && value <= 0) return { ok: false, error: 'Bedrag moet groter dan 0 zijn.' };
  if (min_order_total < 0) return { ok: false, error: 'Minimale orderwaarde mag niet negatief zijn.' };
  if (max_uses !== null && (isNaN(max_uses) || max_uses < 1)) {
    return { ok: false, error: 'Maximaal gebruik moet leeg (onbeperkt) of minimaal 1 zijn.' };
  }
  if (valid_from && valid_until && valid_until < valid_from) {
    return { ok: false, error: '"Geldig tot" mag niet vóór "Geldig vanaf" liggen.' };
  }

  const row = { code, type, value, min_order_total, max_uses, valid_from, valid_until, is_active, description };

  if (id) {
    const { error } = await supabase.from('sbs_discount_codes').update(row).eq('id', id);
    if (error) return { ok: false, error: dupOrMsg(error) };
  } else {
    const { error } = await supabase.from('sbs_discount_codes').insert(row);
    if (error) return { ok: false, error: dupOrMsg(error) };
  }

  revalidatePath('/admin/kortingscodes');
  return { ok: true };
}

export async function toggleDiscountActive(
  id: string,
  active: boolean
): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdminOrStaff());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  const { error } = await supabase.from('sbs_discount_codes').update({ is_active: active }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/kortingscodes');
  return { ok: true };
}

export async function deleteDiscountCode(id: string): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdminOrStaff());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  const { error } = await supabase.from('sbs_discount_codes').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/kortingscodes');
  return { ok: true };
}

function dupOrMsg(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Deze code bestaat al.';
  return error.message;
}
