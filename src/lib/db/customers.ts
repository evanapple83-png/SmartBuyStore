import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

export type AdminCustomer = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'admin' | 'staff' | 'delivery' | 'customer';
  is_active: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  order_count?: number;
};

/**
 * Admin reads customer list. We gebruiken hier de admin-client (service-role)
 * om auth.users.email te kunnen joinen — deze tabel is niet via RLS te queryen.
 */
export async function getCustomersForAdmin(): Promise<AdminCustomer[]> {
  const admin = getSupabaseAdmin();

  // Fetch profiles
  const { data: profiles } = await admin
    .from('sbs_profiles')
    .select('id, full_name, phone, role, is_active, created_at')
    .order('created_at', { ascending: false });

  if (!profiles) return [];

  // Fetch auth users to get emails + last_sign_in
  type AuthUser = { id: string; email?: string | null; last_sign_in_at?: string | null };
  const { data: usersResp } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const userMap = new Map<string, AuthUser>(
    ((usersResp?.users as AuthUser[]) || []).map((u) => [u.id, u])
  );

  return (profiles as any[]).map((p) => ({
    id: p.id,
    email: userMap.get(p.id)?.email || null,
    full_name: p.full_name,
    phone: p.phone,
    role: p.role,
    is_active: p.is_active,
    created_at: p.created_at,
    last_sign_in_at: userMap.get(p.id)?.last_sign_in_at || null,
  }));
}

/** Actieve bezorgers — voor toewijzing in de bezorgplanning. */
export async function getCouriers(): Promise<{ id: string; full_name: string | null }[]> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from('sbs_profiles')
    .select('id, full_name')
    .eq('role', 'delivery')
    .eq('is_active', true)
    .order('full_name', { ascending: true });
  return (data ?? []) as { id: string; full_name: string | null }[];
}

export async function getCustomerByIdForAdmin(id: string) {
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from('sbs_profiles')
    .select('id, full_name, phone, role, is_active, created_at')
    .eq('id', id)
    .single();
  if (!profile) return null;

  const { data: userResp } = await admin.auth.admin.getUserById(id);
  return {
    ...profile,
    email: userResp?.user?.email || null,
    last_sign_in_at: userResp?.user?.last_sign_in_at || null,
  };
}

/**
 * Check of een klant bestellingen heeft — bepaalt of UI verwijder-knop toont.
 * Vandaag bestaat sbs_orders nog niet, geeft daarom 0 terug.
 * Wordt automatisch correct zodra FASE 6 (orders) gedraaid is.
 */
export async function getCustomerOrderCount(userId: string): Promise<number> {
  const supabase = getSupabaseServer();
  const { count, error } = await supabase
    .from('sbs_orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (error) return 0; // tabel bestaat nog niet → graceful
  return count || 0;
}
