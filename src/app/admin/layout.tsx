import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Box,
  Folder,
  Award,
  Star,
  Tag,
  FileText,
  Mail,
  Settings,
  UserCog,
  Truck,
  MessageSquare,
  BookOpen,
  LogOut,
} from 'lucide-react';

/**
 * Admin layout — sidebar nav + content area.
 * Middleware heeft al gecheckt op session + rol; hier dubbel-check
 * voor defense-in-depth en om rol-specifieke menu's te tonen.
 */

// Admin-paneel toont altijd live data — nooit gecachte gebruikers/orders/etc.
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type Role = 'admin' | 'staff' | 'delivery';

const ALL_LINKS: { href: string; label: string; icon: any; roles: Role[] }[] = [
  { href: '/admin',                label: 'Dashboard',        icon: LayoutDashboard, roles: ['admin', 'staff'] },
  { href: '/admin/bestellingen',   label: 'Bestellingen',     icon: ShoppingBag,     roles: ['admin', 'staff'] },
  { href: '/admin/klanten',        label: 'Klanten',          icon: Users,           roles: ['admin', 'staff'] },
  { href: '/admin/berichten',      label: 'Berichten',        icon: MessageSquare,   roles: ['admin', 'staff'] },
  { href: '/admin/producten',      label: 'Producten',        icon: Box,             roles: ['admin', 'staff'] },
  { href: '/admin/categorieen',    label: 'Categorieën',      icon: Folder,          roles: ['admin', 'staff'] },
  { href: '/admin/merken',         label: 'Merken',           icon: Award,           roles: ['admin', 'staff'] },
  { href: '/admin/reviews',        label: 'Reviews',          icon: Star,            roles: ['admin', 'staff'] },
  { href: '/admin/kortingscodes',  label: 'Kortingscodes',    icon: Tag,             roles: ['admin', 'staff'] },
  { href: '/admin/facturen',       label: 'Facturen',         icon: FileText,        roles: ['admin', 'staff'] },
  { href: '/admin/e-mailtemplates', label: 'E-mailtemplates', icon: Mail,            roles: ['admin'] },
  { href: '/admin/bezorgplanning', label: 'Bezorgplanning',   icon: Truck,           roles: ['admin', 'staff', 'delivery'] },
  { href: '/admin/accounts',       label: 'Team',             icon: UserCog,         roles: ['admin'] },
  { href: '/admin/instellingen',   label: 'Instellingen',     icon: Settings,        roles: ['admin'] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/account/login');

  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('role, full_name, is_active')
    .eq('id', user.id)
    .single();

  const rawRole = profile?.is_active ? profile.role : null;
  if (!rawRole || rawRole === 'customer') redirect('/account');
  const role = rawRole as Role;

  const visibleLinks = ALL_LINKS.filter((l) => l.roles.includes(role));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-lg font-display font-black tracking-tight">
              Smart<span className="text-accent">Buy</span>
            </span>
            <span className="text-xs font-semibold text-muted bg-background border border-border rounded-full px-2 py-0.5">
              ADMIN
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px] transition-colors"
            >
              <Icon size={16} className="text-muted" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          <Link href="/admin/help" className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px] transition-colors">
            <BookOpen size={16} className="text-muted" />
            Handleiding
          </Link>
          <div className="px-3 py-2 text-xs">
            <div className="font-semibold text-foreground truncate">{profile?.full_name || user.email}</div>
            <div className="text-muted capitalize">{role}</div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px] transition-colors"
            >
              <LogOut size={16} className="text-muted" />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
