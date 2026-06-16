import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { getSupabaseServer } from '@/lib/supabase/server';

export const metadata = { title: 'Logboek · Admin' };
export const dynamic = 'force-dynamic';

type LogRow = {
  id: number;
  action: string;
  entity: string;
  entity_id: string | null;
  label: string | null;
  details: Record<string, unknown> | null;
  admin_email: string | null;
  created_at: string;
};

const ENTITY_LABELS: Record<string, string> = {
  product: 'Product',
  category: 'Categorie',
  brand: 'Merk',
  customer: 'Klant',
  order: 'Bestelling',
  discount: 'Kortingscode',
  settings: 'Instellingen',
  team: 'Team',
  email_template: 'E-mailtemplate',
  review: 'Review',
};

const ACTION_LABELS: Record<string, string> = {
  create: 'Aangemaakt',
  update: 'Gewijzigd',
  delete: 'Verwijderd',
  status: 'Status',
  login: 'Ingelogd',
  other: 'Overig',
};

const ACTION_STYLES: Record<string, string> = {
  create: 'bg-success/10 text-success',
  update: 'bg-primary/10 text-primary',
  delete: 'bg-red-100 text-red-700',
  status: 'bg-amber-100 text-amber-700',
  login: 'bg-muted/10 text-muted',
  other: 'bg-muted/10 text-muted',
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function AdminLogboekPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  const { entity } = await searchParams;
  const supabase = getSupabaseServer();

  let query = supabase
    .from('sbs_admin_log')
    .select('id, action, entity, entity_id, label, details, admin_email, created_at')
    .order('created_at', { ascending: false })
    .limit(300);
  if (entity) query = query.eq('entity', entity);

  const { data, error } = await query;
  const rows = (data ?? []) as LogRow[];

  const entities = Object.keys(ENTITY_LABELS);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Logboek</h1>
        <p className="text-sm text-muted">
          Overzicht van beheeracties — wie wat wanneer wijzigde. De laatste 300 gebeurtenissen.
        </p>
      </div>

      {/* Filter op onderdeel */}
      <div className="flex flex-wrap gap-2 mb-5">
        <FilterPill href="/admin/logboek" label="Alles" active={!entity} />
        {entities.map((e) => (
          <FilterPill
            key={e}
            href={`/admin/logboek?entity=${e}`}
            label={ENTITY_LABELS[e]}
            active={entity === e}
          />
        ))}
      </div>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-[12px] p-4 text-sm">
          Het logboek kon niet worden geladen. Is de database-migratie <code>0018_admin_log</code> al uitgevoerd?
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
          <ScrollText size={32} className="mx-auto mb-2 opacity-50" />
          Nog geen acties geregistreerd{entity ? ' voor dit onderdeel' : ''}.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Tijdstip</th>
                <th className="px-4 py-3 font-semibold">Medewerker</th>
                <th className="px-4 py-3 font-semibold">Actie</th>
                <th className="px-4 py-3 font-semibold">Onderdeel</th>
                <th className="px-4 py-3 font-semibold">Omschrijving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-background/60">
                  <td className="px-4 py-3 whitespace-nowrap text-muted tabular-nums">{formatWhen(r.created_at)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">{r.admin_email || '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-pill ${
                        ACTION_STYLES[r.action] ?? ACTION_STYLES.other
                      }`}
                    >
                      {ACTION_LABELS[r.action] ?? r.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">{ENTITY_LABELS[r.entity] ?? r.entity}</td>
                  <td className="px-4 py-3 text-foreground">
                    {r.label || <span className="text-muted">—</span>}
                    {r.details && typeof r.details === 'object' && 'note' in r.details ? (
                      <span className="block text-xs text-muted">{String((r.details as any).note)}</span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-xs font-semibold px-3 py-1.5 rounded-pill border transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-surface text-foreground border-border hover:border-primary/40'
      }`}
    >
      {label}
    </Link>
  );
}
