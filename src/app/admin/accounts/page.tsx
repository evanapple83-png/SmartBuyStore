import { getCustomersForAdmin } from '@/lib/db/customers';
import { TeamManager } from './TeamManager';

export const metadata = { title: 'Team · Admin' };

export default async function AdminTeamPage() {
  const all = await getCustomersForAdmin();
  const team = all.filter((c) => c.role !== 'customer');

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted">
          Beheer teamleden en hun rechten. <strong>Admin</strong> = volledige toegang ·{' '}
          <strong>Staff</strong> = bestellingen/producten/facturen ·{' '}
          <strong>Bezorger</strong> = alleen bezorgplanning.
        </p>
      </div>

      <TeamManager
        team={team.map((m) => ({
          id: m.id,
          email: m.email,
          full_name: m.full_name,
          role: m.role as 'admin' | 'staff' | 'delivery',
          is_active: m.is_active,
          last_sign_in_at: m.last_sign_in_at,
        }))}
      />
    </div>
  );
}
