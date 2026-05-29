'use client';
import { useState, useTransition } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { subscribeNewsletter } from '@/lib/db/public-actions';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setError(null);
    start(async () => {
      const result = await subscribeNewsletter(email);
      if (!result.ok) { setError(result.error || 'Er ging iets mis'); return; }
      setSubmitted(true);
    });
  }

  return (
    <section className="py-16 bg-primary">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <div className="w-12 h-12 bg-success/20 rounded-[12px] flex items-center justify-center mx-auto mb-4">
          <Mail size={22} className="text-success" />
        </div>
        <h2 className="text-2xl font-display font-black text-white mb-2">
          Nooit een aanbieding missen
        </h2>
        <p className="text-white/70 text-sm mb-6">
          Schrijf u in voor onze nieuwsbrief en ontvang als eerste de beste deals en nieuwe arrivals.
        </p>

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-success bg-success/10 rounded-[12px] py-4 px-6">
            <CheckCircle size={20} />
            <span className="font-semibold">Bedankt! Je bent ingeschreven voor onze nieuwsbrief.</span>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="uw@emailadres.nl"
                required
                className="flex-1 px-4 py-3 rounded-[12px] bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-success focus:ring-2 focus:ring-success/20 transition-all duration-150 text-sm"
              />
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 bg-accent text-white font-bold px-5 py-3 rounded-[12px] hover:bg-accent/90 transition-colors cursor-pointer shrink-0 disabled:opacity-60"
              >
                {pending ? 'Bezig...' : 'Inschrijven'}
                <ArrowRight size={16} />
              </button>
            </form>
            {error && <p className="text-sm text-white/90 bg-accent/30 rounded-[8px] py-2 px-3 mt-3 inline-block">{error}</p>}
          </>
        )}

        <p className="text-xs text-white/40 mt-4">
          Geen spam. Afmelden kan altijd. Privacy is belangrijk.
        </p>
      </div>
    </section>
  );
}
