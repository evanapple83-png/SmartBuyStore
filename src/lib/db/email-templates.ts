import { getSupabaseServer } from '@/lib/supabase/server';

export type EmailTemplate = {
  key: string;
  label: string;
  subject: string;
  body: string;
  description: string | null;
  is_enabled: boolean;
  sort_order: number;
  updated_at: string;
};

/**
 * E-mailsjablonen uit sbs_email_templates. Defensief: ontbrekende tabel → [].
 * Alleen admin (RLS) kan dit lezen/schrijven.
 */
export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  const supabase = getSupabaseServer();
  try {
    const { data, error } = await supabase
      .from('sbs_email_templates')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []) as EmailTemplate[];
  } catch (err) {
    console.warn('getEmailTemplates fallback (tabel ontbreekt?):', err);
    return [];
  }
}
