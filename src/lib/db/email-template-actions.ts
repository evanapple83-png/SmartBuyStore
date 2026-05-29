'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from './admin-guard';

export async function updateEmailTemplate(
  key: string,
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdmin());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }

  const subject = String(formData.get('subject') || '').trim();
  const body = String(formData.get('body') || '').trim();
  if (!subject) return { ok: false, error: 'Onderwerp is verplicht' };
  if (!body) return { ok: false, error: 'Inhoud is verplicht' };

  const { error } = await supabase
    .from('sbs_email_templates')
    .update({ subject, body })
    .eq('key', key);
  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/e-mailtemplates');
  return { ok: true };
}

export async function toggleEmailTemplate(
  key: string,
  enabled: boolean
): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdmin());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  const { error } = await supabase
    .from('sbs_email_templates')
    .update({ is_enabled: enabled })
    .eq('key', key);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/e-mailtemplates');
  return { ok: true };
}
