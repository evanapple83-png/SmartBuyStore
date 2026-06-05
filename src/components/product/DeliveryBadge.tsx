import { Truck } from 'lucide-react';

/**
 * Leverbadge op productkaarten. Groen bij same-day delivery, oranje met
 * 3-5 werkdagen wanneer same-day voor het product uit staat.
 */
export function DeliveryBadge({ sameDay = true }: { sameDay?: boolean }) {
  if (!sameDay) {
    return (
      <div className="flex items-center gap-1.5 bg-warm/10 text-warm text-xs font-semibold px-2.5 py-1 rounded-pill">
        <Truck size={12} className="shrink-0" />
        <span>3-5 werkdagen + gratis installatie</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-pill">
      <Truck size={12} className="shrink-0" />
      <span>Vandaag bezorgd + gratis installatie</span>
    </div>
  );
}
