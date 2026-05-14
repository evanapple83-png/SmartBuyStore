import { cn } from '@/lib/utils';
import { hasDiscount, formatPrice, calcSavingsPercent } from '@/lib/price';

interface PriceDisplayProps {
  currentPrice: number;
  originalPrice: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({ currentPrice, originalPrice, size = 'md', className }: PriceDisplayProps) {
  const showDiscount = hasDiscount(currentPrice, originalPrice);
  const savingsPercent = showDiscount ? calcSavingsPercent(currentPrice, originalPrice!) : 0;

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span
        className={cn(
          'font-black font-display text-foreground',
          size === 'lg' && 'text-3xl',
          size === 'md' && 'text-xl',
          size === 'sm' && 'text-lg'
        )}
      >
        €{formatPrice(currentPrice)}
      </span>

      {showDiscount && (
        <>
          <span className="text-muted line-through text-sm">
            €{formatPrice(originalPrice!)}
          </span>
          <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-md">
            -{savingsPercent}%
          </span>
        </>
      )}
    </div>
  );
}
