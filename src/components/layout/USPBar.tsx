import { Wrench, Zap, Trash2, RotateCcw } from 'lucide-react';

const usps = [
  { icon: Wrench, text: 'Gratis installatie bij elk apparaat' },
  { icon: Zap, text: 'Besteld voor 12:00 → Vandaag bezorgd' },
  { icon: Trash2, text: 'Gratis afvoer oud apparaat' },
  { icon: RotateCcw, text: '30 dagen retour' },
];

export function USPBar() {
  return (
    <div className="bg-primary text-white text-xs font-semibold">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 flex-wrap">
        {usps.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon size={12} className="text-success shrink-0" />
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
