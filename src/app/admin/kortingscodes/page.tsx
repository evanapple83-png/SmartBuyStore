import { getDiscountCodes, getDiscountStats } from '@/lib/db/discount-codes';
import { DiscountTable } from './DiscountTable';

export const metadata = { title: 'Kortingscodes · Admin' };

export default async function AdminDiscountCodesPage() {
  const [codes, stats] = await Promise.all([getDiscountCodes(), getDiscountStats()]);

  const totals = Object.values(stats).reduce(
    (a, s) => ({ orders: a.orders + s.orders, discount: a.discount + s.totalDiscount, revenue: a.revenue + s.revenue }),
    { orders: 0, discount: 0, revenue: 0 }
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kortingscodes</h1>
        <p className="text-sm text-muted">
          {codes.length} code{codes.length === 1 ? '' : 's'} · samen {totals.orders} keer verzilverd in betaalde
          bestellingen ({totals.revenue > 0 ? `€ ${totals.revenue.toFixed(2).replace('.', ',')} omzet` : 'nog geen omzet'}).
        </p>
      </div>

      <DiscountTable codes={codes} stats={stats} />
    </div>
  );
}
