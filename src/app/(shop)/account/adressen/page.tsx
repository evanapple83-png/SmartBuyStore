import { getSupabaseServer } from '@/lib/supabase/server';
import { AddressManager } from './AddressManager';

export const metadata = { title: 'Mijn adressen · Smart Buy Store' };

export default async function AddressesPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: addresses } = await supabase
    .from('sbs_addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default_shipping', { ascending: false })
    .order('created_at', { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Mijn adressen</h1>
        <p className="text-sm text-muted">Bewaar je bezorgadressen voor sneller afrekenen.</p>
      </div>
      <AddressManager addresses={addresses ?? []} />
    </div>
  );
}
