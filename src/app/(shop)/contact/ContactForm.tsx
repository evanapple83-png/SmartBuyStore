'use client';

import { useState, useTransition } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { sendContactMessage } from '@/lib/db/public-actions';

export function ContactForm() {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const result = await sendContactMessage(formData);
      if (!result.ok) { setError(result.error || 'Er ging iets mis'); return; }
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="flex items-start gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-[10px] p-4 text-sm not-prose">
        <CheckCircle size={18} className="shrink-0 mt-0.5" />
        <span>Bedankt voor je bericht! We reageren doorgaans binnen één werkdag.</span>
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary';

  return (
    <form onSubmit={handleSubmit} className="not-prose flex flex-col gap-3 max-w-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input name="name" required placeholder="Je naam" className={inputCls} autoComplete="name" />
        <input name="email" type="email" required placeholder="Je e-mailadres" className={inputCls} autoComplete="email" />
      </div>
      <input name="subject" placeholder="Onderwerp (optioneel)" className={inputCls} />
      <textarea name="message" required rows={5} placeholder="Je bericht" className={inputCls} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-accent/90 disabled:opacity-60 self-start"
      >
        <Send size={15} /> {pending ? 'Versturen...' : 'Verstuur bericht'}
      </button>
    </form>
  );
}
