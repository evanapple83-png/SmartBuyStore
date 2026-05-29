import { getSupabaseServer } from '@/lib/supabase/server';

type Role = 'admin' | 'staff' | 'delivery' | 'customer';

/**
 * Server-side rolcheck voor Server Actions. Gooit bij onvoldoende rechten.
 * Geeft de geauthenticeerde Supabase-server-client terug bij succes.
 */
export async function ensureRole(allowed: Role[]) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Niet ingelogd');
  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('role, is_active')
    .eq('id', user.id)
    .single();
  if (!profile?.is_active || !allowed.includes(profile.role as Role)) {
    throw new Error('Geen toestemming');
  }
  return { supabase, user, role: profile.role as Role };
}

export const ensureAdmin = () => ensureRole(['admin']);
export const ensureAdminOrStaff = () => ensureRole(['admin', 'staff']);
