import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';

/**
 * Audit-logboek voor beheeracties (tabel sbs_admin_log).
 *
 * De helper bepaalt zelf welke admin de actie uitvoert (via de server-sessie),
 * zodat call-sites alleen hoeven te beschrijven wát er gebeurde. De insert
 * draait via de service-role en is best-effort: een logfout mag NOOIT de
 * onderliggende beheeractie blokkeren.
 */
export type AdminLogEntry = {
  action: 'create' | 'update' | 'delete' | 'status' | 'login' | 'other';
  entity: string;
  entityId?: string | null;
  label?: string | null;
  details?: Record<string, unknown> | null;
};

export async function logAdminAction(entry: AdminLogEntry): Promise<void> {
  try {
    const server = getSupabaseServer();
    const {
      data: { user },
    } = await server.auth.getUser();
    if (!user) return; // geen sessie → niets te loggen (bv. webhook)

    await getSupabaseAdmin()
      .from('sbs_admin_log')
      .insert({
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId ?? null,
        label: entry.label ?? null,
        details: entry.details ?? null,
        admin_id: user.id,
        admin_email: user.email ?? null,
      });
  } catch {
    // best-effort — bewust stil
  }
}
