import { getSupabaseServer } from '@/lib/supabase/server';

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
      <p className="text-sm text-muted mb-6">Beheer hier je naam, e-mailadres en telefoonnummer.</p>

      <dl className="space-y-4 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted font-semibold">Naam</dt>
          <dd className="text-foreground">{profile?.full_name || '—'}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted font-semibold">E-mailadres</dt>
          <dd className="text-foreground">{user.email}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs uppercase tracking-wide text-muted font-semibold">Telefoonnummer</dt>
          <dd className="text-foreground">{profile?.phone || '—'}</dd>
        </div>
      </dl>

      <p className="text-xs text-muted mt-8 italic">
        Bewerken-functionaliteit volgt in FASE 6. In de huidige fase is dit een read-only weergave.
      </p>
    </div>
  );
}
