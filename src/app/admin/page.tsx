import Link from 'next/link';
import { Plus, ShoppingBag, Eye, Users, TrendingUp, Tag, BarChart3, BookOpen } from 'lucide-react';
import { getAdminDashboardStats, getAllOrdersForAdmin } from '@/lib/db/orders';
import { getIntelligence, prettyPath } from '@/lib/db/intelligence';
import { getDiscountStats } from '@/lib/db/discount-codes';
import { getLowStockProducts } from '@/lib/db/catalog';
import { getOnboardingStatus } from '@/lib/db/onboarding';
import { OnboardingChecklist } from './OnboardingChecklist';

export const metadata = { title: 'Dashboard · Smart Buy Admin' };

function euro(n: number) {
  return `€ ${Number(n).toFixed(2).replace('.', ',')}`;
}
function euro0(n: number) {
  return `€ ${Math.round(Number(n)).toLocaleString('nl-NL')}`;
}
function formatDateTime(s: string) {
  return new Date(s).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Wacht op betaling', paid: 'Betaald', in_progress: 'In behandeling',
  planned_delivery: 'Ingepland', delivered: 'Bezorgd', completed: 'Afgerond',
  cancelled: 'Geannuleerd', refunded: 'Terugbetaald',
};

export default async function AdminDashboardPage() {
  const [stats, recent, intel, discountStats, lowStock, onboarding] = await Promise.all([
    getAdminDashboardStats(),
    getAllOrdersForAdmin({ limit: 8 }),
    getIntelligence(),
    getDiscountStats(),
    getLowStockProducts(3),
    getOnboardingStatus(),
  ]);

  const topCodes = Object.values(discountStats).sort((a, b) => b.orders - a.orders || b.revenue - a.revenue).slice(0, 5);
  const bestCode = topCodes[0];
  const maxDayViews = Math.max(1, ...intel.perDay.map((d) => d.views));

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">Overzicht van je webshop — omzet, bestellingen en bezoekers.</p>
        </div>
        <Link href="/admin/help" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:bg-surface border border-border px-3 py-2 rounded-[10px] shrink-0">
          <BookOpen size={15} /> Handleiding
        </Link>
      </div>

      <OnboardingChecklist steps={onboarding.steps} complete={onboarding.complete} />

      {/* ── KPI's ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Omzet vandaag (excl. btw)" value={euro(stats.revenueExclToday)} icon={TrendingUp} />
        <StatCard label="Omzet 7 dagen (incl.)" value={euro0(stats.revenueIncl7d)} icon={TrendingUp} />
        <StatCard label="Omzet 30 dagen (incl.)" value={euro0(stats.revenueIncl30d)} icon={TrendingUp} sub={`${stats.orders30d} bestellingen · gem. ${euro0(stats.aov30d)}`} />
        <StatCard label="Nieuwe bestellingen vandaag" value={String(stats.newOrdersToday)} icon={ShoppingBag} />
        <StatCard label="Te bezorgen vandaag" value={String(stats.deliveriesToday)} icon={ShoppingBag} />
        <StatCard label="Openstaand (te verwerken)" value={String(stats.openOrders)} icon={ShoppingBag} highlight={stats.openOrders > 0} />
        <StatCard label="Onbetaald > 24 uur" value={String(stats.unpaidOver24h)} icon={ShoppingBag} highlight={stats.unpaidOver24h > 0} />
        <StatCard label="Conversie (7d)" value={intel.enabled ? `${intel.conversion7d}%` : '—'} icon={BarChart3} sub="orders ÷ bezoekers" />
      </div>

      {/* ── Website intelligence ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Eye size={18} className="text-primary" />
          <h2 className="text-lg font-bold text-foreground">Website-intelligentie</h2>
          <span className="text-xs text-muted">laatste 7 dagen</span>
        </div>

        {!intel.enabled ? (
          <div className="bg-surface border border-border rounded-[12px] p-6 text-sm text-muted">
            Bezoekersstatistieken verschijnen hier zodra migratie 0010 is gedraaid én bezoekers met
            cookie-toestemming de site bekijken.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Bezoekers + grafiek */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-[12px] p-5">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <Mini label="Bezoekers vandaag" value={intel.visitorsToday} icon={Users} />
                <Mini label="Bezoekers 7d" value={intel.visitors7d} icon={Users} />
                <Mini label="Paginaweergaven 7d" value={intel.pageviews7d} icon={Eye} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Bezoekers per dag (14d)</div>
              <div className="flex items-end gap-1 h-24">
                {intel.perDay.map((d) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-primary/15 hover:bg-primary/30 rounded-t transition-colors relative"
                      style={{ height: `${Math.max(4, (d.views / maxDayViews) * 100)}%` }}
                      title={`${d.day}: ${d.views} weergaven, ${d.visitors} bezoekers`}
                    />
                    <span className="text-[9px] text-muted">{d.day.slice(8)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top pagina's */}
            <div className="bg-surface border border-border rounded-[12px] p-5">
              <div className="text-sm font-bold text-foreground mb-3">Meest bekeken pagina's</div>
              {intel.topPages.length === 0 ? (
                <p className="text-sm text-muted">Nog geen data.</p>
              ) : (
                <ul className="space-y-1.5">
                  {intel.topPages.map((p) => (
                    <li key={p.path} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-foreground">{prettyPath(p.path)}</span>
                      <span className="tabular-nums text-muted shrink-0">{p.views}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {intel.enabled && intel.topProducts.length > 0 && (
          <div className="bg-surface border border-border rounded-[12px] p-5 mt-4">
            <div className="text-sm font-bold text-foreground mb-3">Meest bekeken producten (interesse)</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {intel.topProducts.map((p) => (
                <Link key={p.slug} href={`/product/${p.slug}`} className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-[8px] hover:bg-background border border-border">
                  <span className="truncate text-foreground">{p.slug}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted shrink-0"><Eye size={12} /> {p.views}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Lage voorraad ── */}
      {lowStock.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={18} className="text-amber-600" />
            <h2 className="text-lg font-bold text-foreground">Lage voorraad</h2>
            <span className="text-xs text-muted">{lowStock.length} product(en) ≤ 3 stuks</span>
          </div>
          <div className="bg-surface border border-border rounded-[12px] p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(lowStock as any[]).map((p) => (
              <Link key={p.id} href={`/admin/producten/${p.id}`} className="flex items-center justify-between gap-2 text-sm px-3 py-2 rounded-[8px] border border-border hover:bg-background">
                <span className="truncate text-foreground">{p.short_name || p.name}</span>
                <span className={`tabular-nums text-xs font-semibold shrink-0 ${p.stock_count <= 0 ? 'text-red-700' : 'text-amber-700'}`}>
                  {p.stock_count <= 0 ? 'uitverkocht' : `nog ${p.stock_count}`}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Kortingscode-effectiviteit ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Kortingscode-effectiviteit</h2>
          </div>
          <Link href="/admin/kortingscodes" className="text-xs font-semibold text-primary hover:underline">Beheer codes →</Link>
        </div>
        <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
          {topCodes.length === 0 ? (
            <div className="p-6 text-sm text-muted">Nog geen kortingscodes gebruikt in betaalde bestellingen.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-background border-b border-border">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-muted font-semibold">Code</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide text-muted font-semibold">Keer gebruikt</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide text-muted font-semibold">Korting gegeven</th>
                  <th className="text-right px-4 py-2.5 text-xs uppercase tracking-wide text-muted font-semibold">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {topCodes.map((c) => (
                  <tr key={c.code} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5 font-mono font-semibold">
                      {c.code}
                      {bestCode && c.code === bestCode.code && (
                        <span className="ml-2 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Meest effectief</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.orders}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted">{euro(c.totalDiscount)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">{euro(c.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* ── Laatste bestellingen ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Laatste bestellingen</h2>
          <Link href="/admin/bestellingen" className="text-xs font-semibold text-primary hover:underline">Alle bestellingen →</Link>
        </div>
        <div className="bg-surface border border-border rounded-[12px] overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-50" /> Nog geen bestellingen.
            </div>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {recent.map((o) => {
                  const cust = o.customer_snapshot as any;
                  return (
                    <tr key={o.id} className="border-b border-border last:border-b-0 hover:bg-background">
                      <td className="px-4 py-2.5 font-mono text-xs">{o.order_number}</td>
                      <td className="px-4 py-2.5">{cust?.name || '—'}</td>
                      <td className="px-4 py-2.5 text-muted text-xs">{formatDateTime(o.created_at)}</td>
                      <td className="px-4 py-2.5 text-xs">{STATUS_LABELS[o.status] || o.status}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">{euro(o.total_incl_btw)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link href={`/admin/bestellingen/${o.id}`} className="text-xs font-semibold text-primary hover:underline">Openen</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/producten/nieuw" className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90">
          <Plus size={16} /> Nieuw product
        </Link>
        <Link href="/admin/kortingscodes" className="inline-flex items-center gap-2 bg-surface border border-border text-foreground text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-background">
          <Tag size={16} /> Kortingscode aanmaken
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, highlight }: { label: string; value: string; sub?: string; icon: any; highlight?: boolean }) {
  return (
    <div className={`border rounded-[12px] p-4 ${highlight ? 'bg-amber-50 border-amber-200' : 'bg-surface border-border'}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs uppercase tracking-wide text-muted font-semibold">{label}</div>
        <Icon size={15} className="text-muted shrink-0" />
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted mt-0.5">{sub}</div>}
    </div>
  );
}

function Mini({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="rounded-[10px] bg-background border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted mb-1"><Icon size={13} /> {label}</div>
      <div className="text-xl font-bold text-foreground tabular-nums">{value.toLocaleString('nl-NL')}</div>
    </div>
  );
}
