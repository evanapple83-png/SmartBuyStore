import { getSupabaseServer } from '@/lib/supabase/server';
import { getDeliveryOrders } from '@/lib/db/orders';
import { DeliveryBoard } from './DeliveryBoard';

export const metadata = { title: 'Bezorgplanning · Admin' };

export default async function DeliveryPlanningPage() {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  let role: 'admin' | 'staff' | 'delivery' = 'delivery';
  if (user) {
    const { data: profile } = await supabase
      .from('sbs_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role === 'admin' || profile?.role === 'staff') role = profile.role;
  }

  const orders = await getDeliveryOrders();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bezorgplanning</h1>
        <p className="text-sm text-muted">
          {orders.length} bestelling{orders.length === 1 ? '' : 'en'} in te plannen of te bezorgen.
          {role === 'delivery' && ' Markeer een bezorging als afgerond zodra je geleverd hebt.'}
        </p>
      </div>

      <DeliveryBoard
        orders={orders.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          delivery_date: o.delivery_date,
          delivery_method: o.delivery_method,
          customer: o.customer_snapshot,
          shipping: o.shipping_address_snapshot,
          notes_customer: o.notes_customer,
        }))}
        canPlan={role !== 'delivery'}
      />
    </div>
  );
}
