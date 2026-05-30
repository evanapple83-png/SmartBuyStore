'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { ensureAdmin } from './admin-guard';
import { SETTINGS_DEFAULTS } from './settings';

const ALLOWED_KEYS = Object.keys(SETTINGS_DEFAULTS);

export async function updateStoreSettings(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdmin());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }

  // Bouw upsert-rijen uit toegestane keys
  const rows = ALLOWED_KEYS.map((key) => ({
    key,
    value: String(formData.get(key) ?? '').trim(),
  }));

  const { error } = await supabase.from('sbs_settings').upsert(rows, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };

  revalidateTag('store-settings'); // gecachte settings verversen (footer/header/facturen)
  revalidatePath('/admin/instellingen');
  revalidatePath('/'); // footer gebruikt sommige waarden
  return { ok: true };
}
