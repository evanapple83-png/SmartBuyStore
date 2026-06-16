import type { EnergyLabel as EnergyLabelType } from '@/types/product';
import { cn } from '@/lib/utils';

const colors: Record<EnergyLabelType, string> = {
  'A+++': 'bg-green-700 text-white',
  'A++': 'bg-green-600 text-white',
  'A+': 'bg-green-500 text-white',
  A: 'bg-green-600 text-white',
  B: 'bg-lime-500 text-white',
  C: 'bg-yellow-400 text-gray-900',
  D: 'bg-orange-400 text-white',
  E: 'bg-orange-600 text-white',
  F: 'bg-red-600 text-white',
  G: 'bg-red-700 text-white',
};

interface EnergyLabelProps {
  label: EnergyLabelType;
  size?: 'sm' | 'md';
}

export function EnergyLabel({ label, size = 'sm' }: EnergyLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-pill whitespace-nowrap',
        colors[label] ?? 'bg-gray-500 text-white',
        size === 'sm' ? 'text-[11px] px-1.5 py-1 leading-none' : 'text-sm px-3 py-1'
      )}
    >
      {label}
    </span>
  );
}
