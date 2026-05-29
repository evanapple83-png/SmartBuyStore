'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, ShieldCheck, Briefcase, Truck } from 'lucide-react';
import { createTeamMember, updateTeamRole, toggleTeamActive } from '@/lib/db/team-actions';

type Member = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: 'admin' | 'staff' | 'delivery';
  is_active: boolean;
  last_sign_in_at: string | null;
};

const ROLE_META: Record<Member['role'], { label: string; icon: any; cls: string }> = {
  admin: { label: 'Admin', icon: ShieldCheck, cls: 'text-primary bg-primary/5 border-primary/20' },
  staff: { label: 'Staff', icon: Briefcase, cls: 'text-blue-800 bg-blue-50 border-blue-200' },
  delivery: { label: 'Bezorger', icon: Truck, cls: 'text-amber-800 bg-amber-50 border-amber-200' },
};

function formatDate(s: string | null) {
  if (!s) return 'Nog niet ingelogd';
  return new Date(s).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function TeamManager({ team }: { team: Member[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const r = await createTeamMember(formData);
      if (!r.ok) { setError(r.error || 'Er ging iets mis'); return; }
      setShowCreate(false);
      router.refresh();
    });
  }

  function changeRole(id: string, role: Member['role']) {
    setRowError(null);
    start(async () => {
      const r = await updateTeamRole(id, role);
      if (!r.ok) setRowError(r.error || 'Er ging iets mis');
      router.refresh();
    });
  }

  function toggleActive(m: Member) {
    setRowError(null);
    start(async () => {
      const r = await toggleTeamActive(m.id, !m.is_active);
      if (!r.ok) setRowError(r.error || 'Er ging iets mis');
      router.refresh();
    });
  }

  return (
    <>
      {rowError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm mb-4">{rowError}</div>
      )}

      <div className="bg-surface border border-border rounded-[12px] overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-background border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Naam</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">E-mail</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Rol</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Laatste login</th>
              <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-muted font-semibold">Actie</th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => {
              const meta = ROLE_META[m.role];
              const Icon = meta.icon;
              return (
                <tr key={m.id} className={`border-b border-border last:border-b-0 ${m.is_active ? '' : 'opacity-60'}`}>
                  <td className="px-4 py-3 font-medium text-foreground">{m.full_name || '—'}</td>
                  <td className="px-4 py-3 text-muted">{m.email || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium border rounded-full px-2 py-0.5 ${meta.cls}`}>
                      <Icon size={12} /> {meta.label}
                    </span>
                    {!m.is_active && <span className="ml-2 text-xs text-muted">(inactief)</span>}
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">{formatDate(m.last_sign_in_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m.id, e.target.value as Member['role'])}
                        disabled={pending}
                        className="text-xs border border-border rounded-[6px] bg-background px-2 py-1.5 disabled:opacity-50"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="delivery">Bezorger</option>
                      </select>
                      <button
                        onClick={() => toggleActive(m)}
                        disabled={pending}
                        className="px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] disabled:opacity-50"
                      >
                        {m.is_active ? 'Deactiveren' : 'Activeren'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {team.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">Nog geen teamleden.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => { setError(null); setShowCreate(true); }}
        className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90"
      >
        <UserPlus size={16} /> Teamlid toevoegen
      </button>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-surface rounded-[12px] max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">Teamlid toevoegen</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <Field label="Naam" name="full_name" required />
              <Field label="E-mailadres" name="email" type="email" required />
              <Field label="Tijdelijk wachtwoord" name="password" type="text" required hint="Minimaal 8 tekens. Teamlid kan dit later zelf wijzigen." />
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Rol</span>
                <select name="role" defaultValue="staff" className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background">
                  <option value="admin">Admin — volledige toegang</option>
                  <option value="staff">Staff — bestellingen/producten/facturen</option>
                  <option value="delivery">Bezorger — alleen bezorgplanning</option>
                </select>
              </label>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]">
                  Annuleren
                </button>
                <button type="submit" disabled={pending} className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-primary/90 disabled:opacity-50">
                  {pending ? 'Bezig...' : 'Aanmaken'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field(props: { label: string; name: string; type?: string; required?: boolean; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {props.label}{props.required && <span className="text-red-500"> *</span>}
      </span>
      <input
        name={props.name}
        type={props.type || 'text'}
        required={props.required}
        className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
      />
      {props.hint && <span className="text-xs text-muted">{props.hint}</span>}
    </label>
  );
}
