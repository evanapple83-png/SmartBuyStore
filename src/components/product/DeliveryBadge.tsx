import { Truck } from 'lucide-react';

export function DeliveryBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-2.5 py-1 rounded-pill">
      <Truck size={12} className="shrink-0" />
      <span>Vandaag bezorgd + gratis installatie</span>
    </div>
  );
}
