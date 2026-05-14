'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '@/lib/db/orders';
import { updateOrderStatus, setOrderDeliveryDate } from '@/lib/db/order-actions';

const ALL_TARGETS: Record<OrderStatus, { value: OrderStatus; label: string; danger?: boolean }[]> = {
  pending_payment: [
    { value: 'paid', label: 'Markeer als betaald (TEST — alleen vóór Mollie)' },
    { value: 'cancelled', label: 'Annuleren', danger: true },
  ],
  paid: [
    { value: 'in_progress', label: 'In behandeling nemen' },
    { value: 'cancelled', label: 'Annuleren', danger: true },
    { value: 'refunded', label: 'Terugbetaling registreren', danger: true },
  ],
  in_progress: [
    { value: 'planned_delivery', label: 'Bezorging inplannen' },
    { value: 'delivered', label: 'Markeer als bezorgd' },
    { value: 'cancelled', label: 'Annuleren', danger: true },
  ],
  planned_delivery: [
    { value: 'delivered', label: 'Markeer als bezorgd' },
    { value: 'cancelled', label: 'Annuleren', danger: true },
  ],
  delivered: [
    { value: 'completed', label: 'Afronden' },
    { value: 'refunded', label: 'Terugbetaling registreren', danger: true },
  ],
  completed: [
    { value: 'refunded', label: 'Terugbetaling registreren', danger: true },
  ],
  cancelled: [],
  refunded: [],
};

export function OrderStatusControls({
  orderId,
  currentStatus,
  mollieConfigured,
  deliveryDate,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  mollieConfigured: boolean;
  deliveryDate: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<OrderStatus | null>(null);
  const [date, setDate] = useState(deliveryDate || '');
  const [dateMsg, setDateMsg] = useState<string | null>(null);

  const targets = ALL_TARGETS[currentStatus] || [];

  function handleClick(to: OrderStatus, danger?: boolean) {
    if (danger || to === 'paid') {
      setConfirm(to);
      return;
    }
    runTransition(to);
  }

  function runTransition(to: OrderStatus) {
    setError(null);
    start(async () => {
      const result = await updateOrderStatus(orderId, to, {
        allowManualPaid: to === 'paid' && !mollieConfigured,
      });
      if (!result.ok) {
        setError(result.error || 'Er ging iets mis');
        setConfirm(null);
        return;
      }
      setConfirm(null);
      router.refresh();
    });
  }

  function saveDate() {
    setDateMsg(null);
    start(async () => {
      const result = await setOrderDeliveryDate(orderId, date || null);
      if (!result.ok) {
        setDateMsg(result.error || 'Er ging iets mis');
        return;
      }
      setDateMsg('Bezorgdatum opgeslagen');
      router.refresh();
    });
  }

  if (targets.length === 0 && currentStatus !== 'cancelled' && currentStatus !== 'refunded') {
    return <p className="text-sm text-muted">Geen verdere statuswijziging mogelijk.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Bezorgdatum aanpassen (alleen voor relevante statussen) */}
      {['paid', 'in_progress', 'planned_delivery'].includes(currentStatus) && (
        <div className="border border-border rounded-[8px] p-3 bg-background">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted">Bezorgdatum</label>
          <div className="flex gap-2 mt-1">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              className="px-3 py-1.5 text-sm border border-border rounded-[8px] bg-surface flex-1"
            />
            <button
              onClick={saveDate}
              disabled={pending}
              className="px-3 py-1.5 text-xs font-semibold bg-foreground text-white rounded-[8px] hover:opacity-90 disabled:opacity-50"
            >
              Opslaan
            </button>
          </div>
          {dateMsg && <p className="text-xs text-emerald-700 mt-1">{dateMsg}</p>}
        </div>
      )}

      {/* Statusknoppen */}
      <div className="flex flex-col gap-2">
        {targets.map((t) => (
          <button
            key={t.value}
            onClick={() => handleClick(t.value, t.danger)}
            disabled={pending}
            className={`text-left px-3 py-2 text-sm rounded-[8px] border transition-colors disabled:opacity-50 ${
              t.danger
                ? 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
                : 'border-border bg-surface hover:bg-background'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-[8px] p-2">{error}</div>
      )}

      {/* Bevestigingsmodal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirm(null)}>
          <div className="bg-surface rounded-[12px] max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-2">Bevestiging</h2>
            <p className="text-sm text-muted mb-4">
              {confirm === 'cancelled' && 'Bestelling annuleren? Klant ontvangt een annuleringsmail. Reeds betaalde bedragen moeten apart terugbetaald worden in Mollie.'}
              {confirm === 'refunded' && 'Bestelling als terugbetaald markeren? Doe dit nadat je de daadwerkelijke terugbetaling in Mollie hebt afgerond.'}
              {confirm === 'paid' && !mollieConfigured && '⚠ TEST-MODUS: Mollie is nog niet gekoppeld. Deze actie zet de bestelling handmatig op betaald, alleen voor ontwikkeling/test. In productie gebeurt dit alleen via Mollie webhook.'}
              {confirm === 'paid' && mollieConfigured && 'Mollie is actief — handmatig op betaald zetten is uitgeschakeld in productie.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]"
              >
                Annuleren
              </button>
              <button
                onClick={() => runTransition(confirm)}
                disabled={pending}
                className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? 'Bezig...' : 'Ja, doorgaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
