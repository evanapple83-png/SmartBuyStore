'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, MapPin, Calendar, Check, Clock } from 'lucide-react';
import { setOrderDeliveryDate, updateOrderStatus } from '@/lib/db/order-actions';

type DeliveryOrder = {
  id: string;
  order_number: string;
  status: string;
  delivery_date: string | null;
  delivery_method: 'standard' | 'same_day';
  customer: any;
  shipping: any;
  notes_customer: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Betaald',
  in_progress: 'In behandeling',
  planned_delivery: 'Ingepland',
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function formatDayHeading(date: string | null) {
  if (!date) return 'Nog niet ingepland';
  const d = new Date(date);
  const label = d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
  if (date === todayISO()) return `Vandaag · ${label}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function DeliveryBoard({ orders, canPlan }: { orders: DeliveryOrder[]; canPlan: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Groepeer per bezorgdatum (null = ongepland), gesorteerd
  const groups = new Map<string, DeliveryOrder[]>();
  for (const o of orders) {
    const key = o.delivery_date || '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(o);
  }
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === '') return 1; // ongepland onderaan
    if (b === '') return -1;
    return a < b ? -1 : 1;
  });

  function markDelivered(id: string) {
    setError(null);
    const order = orders.find((o) => o.id === id);
    start(async () => {
      // Betaalde orders moeten eerst 'in behandeling' worden voordat ze bezorgd kunnen zijn.
      if (order?.status === 'paid' && canPlan) {
        const step = await updateOrderStatus(id, 'in_progress');
        if (!step.ok) { setError(step.error || 'Er ging iets mis'); router.refresh(); return; }
      }
      const r = await updateOrderStatus(id, 'delivered');
      if (!r.ok) setError(r.error || 'Er ging iets mis');
      router.refresh();
    });
  }

  function planDate(id: string, date: string) {
    setError(null);
    const order = orders.find((o) => o.id === id);
    start(async () => {
      const r = await setOrderDeliveryDate(id, date || null);
      if (!r.ok) { setError(r.error || 'Er ging iets mis'); return; }
      // Met een datum zetten we de status door naar 'ingepland' via geldige tussenstappen.
      if (date && order && order.status !== 'planned_delivery') {
        if (order.status === 'paid') {
          const step = await updateOrderStatus(id, 'in_progress');
          if (!step.ok) { setError(step.error || 'Er ging iets mis'); router.refresh(); return; }
        }
        await updateOrderStatus(id, 'planned_delivery', { note: `Ingepland op ${date}` }).catch(() => {});
      }
      router.refresh();
    });
  }

  if (orders.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
        <Truck size={32} className="mx-auto mb-2 opacity-50" />
        Geen openstaande bezorgingen. Alles is bezorgd of er zijn nog geen betaalde bestellingen.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
      )}
      {sortedKeys.map((key) => {
        const list = groups.get(key)!;
        const isToday = key === todayISO();
        return (
          <section key={key || 'unplanned'}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={15} className={isToday ? 'text-accent' : 'text-muted'} />
              <h2 className={`text-sm font-bold ${isToday ? 'text-accent' : 'text-foreground'}`}>
                {formatDayHeading(key || null)}
              </h2>
              <span className="text-xs text-muted">({list.length})</span>
            </div>
            <div className="space-y-2">
              {list.map((o) => (
                <div key={o.id} className="bg-surface border border-border rounded-[12px] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link href={`/admin/bestellingen/${o.id}`} className="font-mono text-xs text-primary hover:underline">
                          {o.order_number}
                        </Link>
                        <span className="text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5">
                          {STATUS_LABELS[o.status] || o.status}
                        </span>
                        {o.delivery_method === 'same_day' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                            <Clock size={11} /> Same-day
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-medium text-foreground mt-1.5">{o.customer?.name || '—'}</div>
                      <div className="flex items-start gap-1 text-xs text-muted mt-0.5">
                        <MapPin size={12} className="mt-0.5 shrink-0" />
                        <span>{o.shipping?.street}, {o.shipping?.postal_code} {o.shipping?.city}</span>
                      </div>
                      {o.notes_customer && (
                        <div className="text-xs text-muted mt-1 italic">"{o.notes_customer}"</div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
                      {canPlan && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="date"
                            defaultValue={o.delivery_date || ''}
                            min={todayISO()}
                            onChange={(e) => planDate(o.id, e.target.value)}
                            disabled={pending}
                            className="px-2.5 py-1.5 text-xs border border-border rounded-[8px] bg-background disabled:opacity-50"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => markDelivered(o.id)}
                        disabled={pending}
                        className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-[8px] hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <Check size={13} /> Markeer bezorgd
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
