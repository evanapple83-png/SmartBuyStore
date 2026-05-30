import Link from 'next/link';
import { getCustomersForAdmin } from '@/lib/db/customers';
import { AdminListSearch } from '../AdminListSearch';

export const metadata = { title: 'Klanten · Admin' };

function formatDate(s: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function AdminCustomersPage({ searchParams }: { searchParams: { q?: string } }) {
  const all = await getCustomersForAdmin();
  const q = (searchParams.q || '').trim().toLowerCase();
  // Sluit admin/staff/delivery uit — dit overzicht is voor echte klanten
  let customers = all.filter((c) => c.role === 'customer');
  const teamMembers = all.filter((c) => c.role !== 'customer');
  if (q) {
    customers = customers.filter((c) =>
      [c.full_name, c.email, c.phone].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Klanten</h1>
        <p className="text-sm text-muted">
          {customers.length} klanten · {teamMembers.length} teamleden (zie{' '}
          <Link href="/admin/accounts" className="text-primary hover:underline">
            Team
          </Link>
          )
        </p>
      </div>

      <AdminListSearch placeholder="Zoek op naam, e-mail of telefoon..." />

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted">{q ? 'Geen klanten gevonden.' : 'Nog geen klantaccounts.'}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Naam</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">E-mail</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Telefoon</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Aangemaakt</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Laatste login</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-b-0 hover:bg-background">
                  <td className="px-4 py-3">
                    <Link href={`/admin/klanten/${c.id}`} className="font-medium text-foreground hover:underline">
                      {c.full_name || '—'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-muted">{c.phone || '—'}</td>
                  <td className="px-4 py-3">
                    {c.is_active ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                        Actief
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5">
                        Inactief
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.last_sign_in_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
