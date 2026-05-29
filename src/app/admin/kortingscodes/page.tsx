import { getDiscountCodes } from '@/lib/db/discount-codes';
import { DiscountTable } from './DiscountTable';

export const metadata = { title: 'Kortingscodes · Admin' };

export default async function AdminDiscountCodesPage() {
  const codes = await getDiscountCodes();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kortingscodes</h1>
        <p className="text-sm text-muted">
          {codes.length} code{codes.length === 1 ? '' : 's'}. Klanten voeren de code in tijdens het afrekenen.
        </p>
      </div>

      <DiscountTable codes={codes} />
    </div>
  );
}
