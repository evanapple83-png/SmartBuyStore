import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getSupabaseServer } from '@/lib/supabase/server';
import { User, Package, FileText, MapPin, LogOut } from 'lucide-react';

const accountLinks = [
  { href: '/account', label: 'Mijn gegevens', icon: User },
  { href: '/account/adressen', label: 'Mijn adressen', icon: MapPin },
  { href: '/account/bestellingen', label: 'Mijn bestellingen', icon: Package },
  { href: '/account/facturen', label: 'Mijn facturen', icon: FileText },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  // Publieke auth-pagina's renderen geen sidebar
  if (!user) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] bg-background">{children}</main>
        <Footer />
      </>
    );
  }

  const { data: profile } = await supabase
    .from('sbs_profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Sidebar */}
            <aside className="space-y-1">
              <div className="bg-surface border border-border rounded-[12px] p-4 mb-4">
                <div className="text-xs text-muted uppercase tracking-wide font-semibold mb-1">Welkom</div>
                <div className="font-semibold text-foreground truncate">
                  {profile?.full_name || user.email}
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                {accountLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface rounded-[8px] transition-colors"
                  >
                    <Icon size={16} className="text-muted" />
                    {label}
                  </Link>
                ))}
                <form action="/api/auth/logout" method="post" className="mt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface rounded-[8px] transition-colors"
                  >
                    <LogOut size={16} className="text-muted" />
                    Uitloggen
                  </button>
                </form>
              </nav>
            </aside>

            {/* Content */}
            <section>{children}</section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
