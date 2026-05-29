import { cn } from '@/lib/utils';
import { hasDiscount, formatPriceShort, calcSavingsPercent, calcSavingsAmount } from '@/lib/price';

interface PriceDisplayProps {
  currentPrice: number;
  originalPrice: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Toon een aparte "Je bespaart €X,-" regel onder de prijs */
  showSavingsAmount?: boolean;
}

export function PriceDisplay({
  currentPrice,
  originalPrice,
  size = 'md',
  className,
  showSavingsAmount = false,
}: PriceDisplayProps) {
  const showDiscount = hasDiscount(currentPrice, originalPrice);
  const savingsPercent = showDiscount ? calcSavingsPercent(currentPrice, originalPrice!) : 0;
  const savingsAmount = showDiscount ? calcSavingsAmount(currentPrice, originalPrice!) : 0;

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span
          className={cn(
            'font-extrabold font-display text-foreground tracking-tight',
            size === 'lg' && 'text-3xl',
            size === 'md' && 'text-xl',
            size === 'sm' && 'text-lg'
          )}
        >
          €{formatPriceShort(currentPrice)}
        </span>

        {showDiscount && (
          <>
            <span className="text-muted line-through text-sm">
              €{formatPriceShort(originalPrice!)}
            </span>
            <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-md">
              -{savingsPercent}%
            </span>
          </>
        )}
      </div>

      {showSavingsAmount && showDiscount && (
        <span className="text-xs font-semibold text-accent">
          Je bespaart €{formatPriceShort(savingsAmount)}
        </span>
      )}
    </div>
  );
}
