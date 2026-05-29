'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdminOrStaff } from './admin-guard';

export async function markContactRead(id: string, isRead: boolean): Promise<{ ok: boolean; error?: string }> {
  let supabase;
  try {
    ({ supabase } = await ensureAdminOrStaff());
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  const { error } = await supabase.from('sbs_contact_messages').update({ is_read: isRead }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/berichten');
  return { ok: true };
}
