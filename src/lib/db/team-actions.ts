'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ensureAdmin } from './admin-guard';
import { logAdminAction } from './admin-log';

type TeamRole = 'admin' | 'staff' | 'delivery';
const TEAM_ROLES: TeamRole[] = ['admin', 'staff', 'delivery'];

export async function createTeamMember(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureAdmin();
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const full_name = String(formData.get('full_name') || '').trim();
  const role = String(formData.get('role') || '') as TeamRole;
  const password = String(formData.get('password') || '');

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Vul een geldig e-mailadres in.' };
  if (!full_name) return { ok: false, error: 'Naam is verplicht.' };
  if (!TEAM_ROLES.includes(role)) return { ok: false, error: 'Ongeldige rol.' };
  if (password.length < 8) return { ok: false, error: 'Wachtwoord moet minimaal 8 tekens zijn.' };

  const admin = getSupabaseAdmin();

  // Maak auth-user (de trigger maakt automatisch een sbs_profiles-rij met rol 'customer')
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });
  if (createErr) {
    const msg = /already registered|exists/i.test(createErr.message)
      ? 'Er bestaat al een account met dit e-mailadres.'
      : createErr.message;
    return { ok: false, error: msg };
  }

  const userId = created.user?.id;
  if (!userId) return { ok: false, error: 'Aanmaken mislukte onverwacht.' };

  // Werk profiel bij met juiste rol + naam (upsert voor het geval de trigger nog niet liep)
  const { error: profErr } = await admin
    .from('sbs_profiles')
    .upsert({ id: userId, full_name, role, is_active: true }, { onConflict: 'id' });
  if (profErr) {
    // Rol toekennen mislukte — ruim de half-aangemaakte user op zodat er geen weeskind blijft.
    await admin.auth.admin.deleteUser(userId).catch(() => {});
    return { ok: false, error: profErr.message };
  }

  await logAdminAction({ action: 'create', entity: 'team', entityId: userId, label: `${full_name} (${role})` });
  revalidatePath('/admin/accounts');
  revalidatePath('/admin/klanten');
  return { ok: true };
}

export async function updateTeamRole(
  userId: string,
  role: TeamRole
): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureAdmin();
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  if (!TEAM_ROLES.includes(role)) return { ok: false, error: 'Ongeldige rol.' };

  const admin = getSupabaseAdmin();
  const { error } = await admin.from('sbs_profiles').update({ role }).eq('id', userId);
  if (error) {
    // De DB-trigger 'protect_last_admin' kan dit blokkeren.
    return { ok: false, error: humanize(error.message) };
  }
  await logAdminAction({ action: 'update', entity: 'team', entityId: userId, label: `Rol → ${role}` });
  revalidatePath('/admin/accounts');
  return { ok: true };
}

export async function toggleTeamActive(
  userId: string,
  isActive: boolean
): Promise<{ ok: boolean; error?: string }> {
  try {
    await ensureAdmin();
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }
  const admin = getSupabaseAdmin();
  const { error } = await admin.from('sbs_profiles').update({ is_active: isActive }).eq('id', userId);
  if (error) return { ok: false, error: humanize(error.message) };
  await logAdminAction({ action: 'update', entity: 'team', entityId: userId, label: isActive ? 'Geactiveerd' : 'Gedeactiveerd' });
  revalidatePath('/admin/accounts');
  return { ok: true };
}

function humanize(msg: string): string {
  if (/laatste actieve admin/i.test(msg)) {
    return 'Dit is de laatste actieve admin — die kan niet worden gedemoot of gedeactiveerd.';
  }
  return msg;
}
