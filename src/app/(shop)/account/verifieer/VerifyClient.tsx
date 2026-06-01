'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabaseBrowser } from '@/lib/supabase/browser';

type Status = 'verifying' | 'success' | 'error';

export function VerifyClient() {
  const [status, setStatus] = useState<Status>('verifying');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const supabase = getSupabaseBrowser();

      // Supabase plakt bij een mislukte/verlopen link de fout in de URL-hash.
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const hashError = hash.get('error_description') || hash.get('error');
      if (hashError) {
        if (!cancelled) {
          setErrorMsg(decodeURIComponent(hashError.replace(/\+/g, ' ')));
          setStatus('error');
        }
        return;
      }

      // De browser-client (detectSessionInUrl) wisselt de `code` uit de redirect
      // automatisch in voor een sessie. We wachten kort op die sessie.
      for (let i = 0; i < 10; i++) {
        const { data } = await supabase.auth.getSession();
        if (cancelled) return;
        if (data.session) {
          setStatus('success');
          return;
        }
        await new Promise((r) => setTimeout(r, 400));
      }

      if (!cancelled) {
        setErrorMsg(
          'We konden je sessie niet automatisch bevestigen. Mogelijk is de link verlopen of al gebruikt. Probeer in te loggen — je account is waarschijnlijk al actief.'
        );
        setStatus('error');
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'verifying') {
    return (
      <div className="text-sm text-muted">Bezig met bevestigen van je account…</div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-5">
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-[10px] p-4 text-sm">
          <strong className="block mb-1">E-mailadres bevestigd ✓</strong>
          Je account is geactiveerd. Je bent meteen ingelogd.
        </div>
        <Link
          href="/account"
          className="bg-primary text-white text-sm font-semibold py-2.5 rounded-[10px] text-center hover:bg-primary/90 transition-colors"
        >
          Naar mijn account
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-[10px] p-4 text-sm">
        <strong className="block mb-1">Bevestigen lukte niet</strong>
        {errorMsg}
      </div>
      <Link
        href="/account/login"
        className="bg-primary text-white text-sm font-semibold py-2.5 rounded-[10px] text-center hover:bg-primary/90 transition-colors"
      >
        Naar inloggen
      </Link>
    </div>
  );
}
