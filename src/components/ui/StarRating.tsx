import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function StarRating({ rating, reviewCount, size = 'sm', className }: StarRatingProps) {
  const iconSize = size === 'sm' ? 12 : 16;

  // Geen verzonnen sterren: tonen pas zodra er echte reviews zijn.
  if (!reviewCount || reviewCount < 1) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={iconSize}
            className={star <= Math.round(rating) ? 'fill-warm text-warm' : 'fill-none text-gray-300'}
          />
        ))}
      </div>
      <span className={cn('text-muted', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {rating.toFixed(1)}
        {reviewCount !== undefined && (
          <span className="text-muted"> ({reviewCount})</span>
        )}
      </span>
    </div>
  );
}
