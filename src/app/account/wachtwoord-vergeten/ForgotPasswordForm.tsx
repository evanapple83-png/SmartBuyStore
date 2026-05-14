'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = getSupabaseBrowser();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account/wachtwoord-resetten`,
    });
    setLoading(false);
    setSubmitted(true);
  }

  // Altijd dezelfde melding — anti-enumeration
  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[10px] p-4 text-sm">
        Als <strong>{email}</strong> bij ons bekend is, ontvang je binnen een paar minuten een link om je wachtwoord opnieuw in te stellen.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">E-mailadres</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white text-sm font-semibold py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Bezig...' : 'Stuur resetlink'}
      </button>
    </form>
  );
}
