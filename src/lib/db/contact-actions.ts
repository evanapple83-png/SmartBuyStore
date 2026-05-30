'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ensureAdminOrStaff } from './admin-guard';

export async function markContactRead(id: string, isRead: boolean): Promise<{ ok: boolean; error?: string }> {
  // Rolcheck via de gebruikerssessie; schrijven via service-role zodat dit
  // niet afhangt van RLS-update-policies.
  try {
    await ensureAdminOrStaff();
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  const { error } = await getSupabaseAdmin().from('sbs_contact_messages').update({ is_read: isRead }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/berichten');
  return { ok: true };
}
