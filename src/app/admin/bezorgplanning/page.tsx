import { getSupabaseServer } from '@/lib/supabase/server';
import { getDeliveryOrders } from '@/lib/db/orders';
import { getCouriers } from '@/lib/db/customers';
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
  const canPlan = role !== 'delivery';

  // Bezorgers zien alleen hun eigen toegewezen bestellingen.
  const [orders, couriers] = await Promise.all([
    getDeliveryOrders(canPlan ? undefined : { assignedTo: user?.id }),
    canPlan ? getCouriers() : Promise.resolve([]),
  ]);

  const courierName = new Map(couriers.map((c) => [c.id, c.full_name || 'Bezorger']));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Bezorgplanning</h1>
        <p className="text-sm text-muted">
          {orders.length} bestelling{orders.length === 1 ? '' : 'en'} in te plannen of te bezorgen.
          {role === 'delivery' && ' Dit zijn de bestellingen die aan jou zijn toegewezen.'}
        </p>
      </div>

      <DeliveryBoard
        orders={orders.map((o) => ({
          id: o.id,
          order_number: o.order_number,
          status: o.status,
          delivery_date: o.delivery_date,
          delivery_method: o.delivery_method,
          delivery_user_id: o.delivery_user_id,
          courier_name: o.delivery_user_id ? courierName.get(o.delivery_user_id) ?? null : null,
          customer: o.customer_snapshot,
          shipping: o.shipping_address_snapshot,
          notes_customer: o.notes_customer,
        }))}
        canPlan={canPlan}
        couriers={couriers}
      />
    </div>
  );
}
