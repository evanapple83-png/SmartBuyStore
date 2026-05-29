'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getOrderStatusByNumber } from '@/lib/db/order-status-query';

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_DURATION_MS = 60_000; // 60 seconden

type State =
  | { phase: 'polling'; elapsedMs: number }
  | { phase: 'paid' }
  | { phase: 'cancelled' }
  | { phase: 'still_pending' }
  | { phase: 'not_found' };

export function CheckoutReturnClient({ orderNumber }: { orderNumber: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ phase: 'polling', elapsedMs: 0 });
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!orderNumber) {
      setState({ phase: 'not_found' });
      return;
    }

    async function check() {
      const result = await getOrderStatusByNumber(orderNumber);
      if (!result.found) {
        setState({ phase: 'not_found' });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      if (result.status === 'paid' || result.status === 'in_progress' || result.status === 'planned_delivery' || result.status === 'delivered' || result.status === 'completed') {
        setState({ phase: 'paid' });
        if (intervalRef.current) clearInterval(intervalRef.current);
        // Wis cart en redirect naar bevestiging
        try { localStorage.removeItem('sbs_cart'); } catch {}
        setTimeout(() => router.push(`/checkout/bevestiging?order=${encodeURIComponent(orderNumber)}`), 1200);
        return;
      }
      if (result.status === 'cancelled' || result.status === 'refunded') {
        setState({ phase: 'cancelled' });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      // Nog steeds pending
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= MAX_POLL_DURATION_MS) {
        setState({ phase: 'still_pending' });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setState({ phase: 'polling', elapsedMs: elapsed });
    }

    check(); // direct check
    intervalRef.current = setInterval(check, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderNumber, router]);

  if (state.phase === 'not_found') {
    return (
      <Frame>
        <AlertTriangle size={48} className="mx-auto text-amber-600 mb-4" />
        <h1 className="text-2xl font-display font-black mb-2">Bestelling niet gevonden</h1>
        <p className="text-sm text-muted mb-6">
          We konden je bestelling niet vinden. Controleer of je de juiste link gebruikt of neem contact op.
        </p>
        <Link href="/" className="inline-flex items-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]">
          Naar homepage
        </Link>
      </Frame>
    );
  }

  if (state.phase === 'paid') {
    return (
      <Frame>
        <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-4" />
        <h1 className="text-2xl font-display font-black mb-2">Betaling ontvangen!</h1>
        <p className="text-sm text-muted">Je wordt zo doorgestuurd naar de bevestiging...</p>
      </Frame>
    );
  }

  if (state.phase === 'cancelled') {
    return (
      <Frame>
        <AlertTriangle size={48} className="mx-auto text-amber-600 mb-4" />
        <h1 className="text-2xl font-display font-black mb-2">Betaling niet voltooid</h1>
        <p className="text-sm text-muted mb-6">
          Je betaling is geannuleerd of mislukt. Je bestelling <strong className="font-mono">{orderNumber}</strong> is niet doorgegaan.
        </p>
        <Link href="/winkelwagen" className="inline-flex items-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]">
          Opnieuw proberen
        </Link>
      </Frame>
    );
  }

  if (state.phase === 'still_pending') {
    return (
      <Frame>
        <Loader2 size={48} className="mx-auto text-muted mb-4 animate-spin" />
        <h1 className="text-2xl font-display font-black mb-2">Betaling wordt nog verwerkt</h1>
        <p className="text-sm text-muted mb-6">
          Dat duurt soms iets langer dan verwacht. Je krijgt automatisch een bevestigingsmail zodra de betaling rond is.
          Je kunt deze pagina sluiten — er gaat niets verloren.
        </p>
        <p className="font-mono text-xs text-muted">Bestelnummer: {orderNumber}</p>
        <Link href="/account/bestellingen" className="mt-4 inline-flex items-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px]">
          Naar mijn bestellingen
        </Link>
      </Frame>
    );
  }

  // Polling
  return (
    <Frame>
      <Loader2 size={48} className="mx-auto text-primary mb-4 animate-spin" />
      <h1 className="text-2xl font-display font-black mb-2">We controleren je betaling...</h1>
      <p className="text-sm text-muted mb-2">
        Dit duurt meestal slechts een paar seconden. We wachten op een bevestiging van Mollie.
      </p>
      <p className="font-mono text-xs text-muted">Bestelnummer: {orderNumber}</p>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="bg-surface border border-border rounded-[12px] p-8">{children}</div>
    </div>
  );
}
