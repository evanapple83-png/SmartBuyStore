import { getSupabaseServer } from '@/lib/supabase/server';

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

/** Contactberichten voor admin/staff. Defensief: ontbrekende tabel → []. */
export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = getSupabaseServer();
  try {
    const { data, error } = await supabase
      .from('sbs_contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as ContactMessage[];
  } catch (err) {
    console.warn('getContactMessages fallback (tabel ontbreekt?):', err);
    return [];
  }
}
