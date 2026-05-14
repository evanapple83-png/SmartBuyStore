'use client';
import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
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
            <span className="font-semibold">Bedankt! U ontvangt binnenkort een bevestigingsemail.</span>
          </div>
        ) : (
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
              className="flex items-center gap-2 bg-accent text-white font-bold px-5 py-3 rounded-[12px] hover:bg-accent/90 transition-colors cursor-pointer shrink-0"
            >
              Inschrijven
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        <p className="text-xs text-white/40 mt-4">
          Geen spam. Afmelden kan altijd. Privacy is belangrijk.
        </p>
      </div>
    </section>
  );
}
