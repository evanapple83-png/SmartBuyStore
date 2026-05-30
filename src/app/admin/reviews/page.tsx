import { Star } from 'lucide-react';
import { getReviewsForModeration } from '@/lib/db/reviews';
import { ReviewsModeration } from './ReviewsModeration';

export const metadata = { title: 'Reviews · Admin' };

export default async function AdminReviewsPage() {
  const reviews = await getReviewsForModeration();
  const pending = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <p className="text-sm text-muted">
          {reviews.length} review{reviews.length === 1 ? '' : 's'}
          {pending > 0 && <> · <span className="font-semibold text-accent">{pending} wacht op controle</span></>}.
          Alleen gepubliceerde reviews zijn zichtbaar in de webshop.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
          <Star size={32} className="mx-auto mb-2 opacity-50" />
          Nog geen reviews. Zodra klanten een product beoordelen verschijnen ze hier ter controle.
        </div>
      ) : (
        <ReviewsModeration reviews={reviews as any} />
      )}
    </div>
  );
}
