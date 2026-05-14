import type { EnergyLabel as EnergyLabelType } from '@/types/product';
import { cn } from '@/lib/utils';

const colors: Record<EnergyLabelType, string> = {
  A: 'bg-green-600 text-white',
  B: 'bg-lime-500 text-white',
  C: 'bg-yellow-400 text-gray-900',
  D: 'bg-orange-400 text-white',
  E: 'bg-orange-600 text-white',
  F: 'bg-red-600 text-white',
};

interface EnergyLabelProps {
  label: EnergyLabelType;
  size?: 'sm' | 'md';
}

export function EnergyLabel({ label, size = 'sm' }: EnergyLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-bold rounded-pill',
        colors[label],
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
    >
      {label}
    </span>
  );
}
