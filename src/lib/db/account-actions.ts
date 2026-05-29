'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer } from '@/lib/supabase/server';

async function requireUser() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Niet ingelogd');
  return { supabase, user };
}

// ─── Profiel ─────────────────────────────────────────────────────────────────

export async function updateMyProfile(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  let ctx;
  try { ctx = await requireUser(); } catch (e: any) { return { ok: false, error: e.message }; }
  const { supabase, user } = ctx;

  const full_name = String(formData.get('full_name') || '').trim() || null;
  const phone = String(formData.get('phone') || '').trim() || null;

  // role/is_active bewust NIET meegestuurd — RLS staat klant die ook niet toe.
  const { error } = await supabase.from('sbs_profiles').update({ full_name, phone }).eq('id', user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/account');
  return { ok: true };
}

// ─── Adressen ──────────────────────────────────────────────────────────────--

function readAddress(formData: FormData) {
  return {
    label: String(formData.get('label') || '').trim() || null,
    full_name: String(formData.get('full_name') || '').trim() || null,
    phone: String(formData.get('phone') || '').trim() || null,
    street: String(formData.get('street') || '').trim(),
    postal_code: String(formData.get('postal_code') || '').trim().toUpperCase(),
    city: String(formData.get('city') || '').trim(),
    country: String(formData.get('country') || '').trim() || 'Nederland',
    is_default_shipping: formData.get('is_default_shipping') === 'on',
  };
}

export async function saveAddress(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  let ctx;
  try { ctx = await requireUser(); } catch (e: any) { return { ok: false, error: e.message }; }
  const { supabase, user } = ctx;

  const id = String(formData.get('id') || '');
  const a = readAddress(formData);
  if (!a.street || !a.postal_code || !a.city) {
    return { ok: false, error: 'Vul straat, postcode en plaats in.' };
  }

  // Als dit het standaard-bezorgadres wordt, eerst de andere resetten.
  if (a.is_default_shipping) {
    await supabase.from('sbs_addresses').update({ is_default_shipping: false }).eq('user_id', user.id);
  }

  if (id) {
    const { error } = await supabase.from('sbs_addresses').update(a).eq('id', id).eq('user_id', user.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from('sbs_addresses').insert({ ...a, user_id: user.id });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath('/account/adressen');
  return { ok: true };
}

export async function deleteAddress(id: string): Promise<{ ok: boolean; error?: string }> {
  let ctx;
  try { ctx = await requireUser(); } catch (e: any) { return { ok: false, error: e.message }; }
  const { supabase, user } = ctx;

  const { error } = await supabase.from('sbs_addresses').delete().eq('id', id).eq('user_id', user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/account/adressen');
  return { ok: true };
}
