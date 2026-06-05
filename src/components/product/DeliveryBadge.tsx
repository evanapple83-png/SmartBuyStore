'use client';

import { Truck } from 'lucide-react';
import { useBeforeCutoff } from '@/hooks/useDeliveryPromise';

/**
 * Leverbadge op productkaarten.
 * - Same-day aan: vóór 12:00 groen "Vandaag bezorgd", erna groen "Morgen in huis"
 *   (tijdens hydration de voorwaardelijke variant).
 * - Same-day uit: oranje "3-5 werkdagen".
 */
export function DeliveryBadge({ sameDay = true }: { sameDay?: boolean }) {
  const beforeCutoff = useBeforeCutoff();

  if (!sameDay) {
    return (
      <div className="flex items-center gap-1.5 bg-warm/10 text-warm text-xs font-semibold px-2.5 py-1 rounded-pill">
        <Truck size={12} className="shrink-0" />
        <span>3-5 werkdagen + gratis installatie</span>
      </div>
    );
  }

  const text =
    beforeCutoff === false
      ? 'Morgen in huis + gratis installatie'
      : beforeCutoff === true
        ? 'Vandaag bezorgd + gratis installatie'
        : 'Voor 12:00 = vandaag bezorgd + installatie';

  return (
    <div className="flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-pill">
      <Truck size={12} className="shrink-0" />
      <span>{text}</span>
    </div>
  );
}
