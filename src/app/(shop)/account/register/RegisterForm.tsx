'use client';

import { useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

export function RegisterForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 tekens hebben.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('De wachtwoorden komen niet overeen.');
      return;
    }
    if (!acceptTerms) {
      setError('Ga akkoord met de algemene voorwaarden om door te gaan.');
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${firstName} ${lastName}`.trim() },
        emailRedirectTo: `${window.location.origin}/account/verifieer`,
      },
    });
    setLoading(false);

    if (error) {
      // Generieke melding voor "email exists" anti-enumeration scenario
      if (/already|exists|registered/i.test(error.message)) {
        setError(
          'Er bestaat al een account met dit e-mailadres. Probeer in te loggen of gebruik "wachtwoord vergeten".'
        );
      } else {
        setError('Er ging iets mis. Probeer het opnieuw.');
      }
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[10px] p-4 text-sm">
        <strong className="block mb-1">Check je inbox</strong>
        We hebben een verificatie-mail gestuurd naar <strong>{email}</strong>. Klik op de link om je account te activeren.
      </div>
    );
  }

  const inputCls =
    'px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all';
  const labelCls = 'text-xs font-semibold uppercase tracking-wide text-muted';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Voornaam</span>
          <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelCls}>Achternaam</span>
          <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>E-mailadres</span>
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Wachtwoord (min. 8 tekens)</span>
        <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelCls}>Wachtwoord nogmaals</span>
        <input type="password" autoComplete="new-password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} className={inputCls} />
      </label>

      <label className="flex items-start gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          required
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          className="mt-1"
        />
        <span>
          Ik ga akkoord met de{' '}
          <a href="/algemene-voorwaarden" className="text-primary hover:underline">algemene voorwaarden</a> en{' '}
          <a href="/privacyverklaring" className="text-primary hover:underline">privacyverklaring</a>.
        </span>
      </label>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-primary text-white text-sm font-semibold py-2.5 rounded-[10px] hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Bezig...' : 'Account aanmaken'}
      </button>
    </form>
  );
}
