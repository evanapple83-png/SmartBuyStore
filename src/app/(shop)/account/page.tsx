import { getSupabaseServer } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export default async function AccountIndexPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null; // middleware redirects; safety

  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single();

  return (
    <div className="bg-surface border border-border rounded-[12px] p-6 md:p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Mijn gegevens</h1>
      <p className="text-sm text-muted mb-6">Beheer hier je naam en telefoonnummer.</p>

      <ProfileForm
        email={user.email || ''}
        fullName={profile?.full_name || ''}
        phone={profile?.phone || ''}
      />
    </div>
  );
}
