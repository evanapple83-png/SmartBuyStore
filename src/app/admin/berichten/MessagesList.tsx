'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import type { ContactMessage } from '@/lib/db/contact';
import { markContactRead } from '@/lib/db/contact-actions';

function formatDateTime(s: string) {
  return new Date(s).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' });
}

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggle(m: ContactMessage) {
    start(async () => {
      await markContactRead(m.id, !m.is_read);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`bg-surface border rounded-[12px] p-4 ${m.is_read ? 'border-border' : 'border-accent/40 bg-accent/[0.02]'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">{m.name}</span>
                <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline">{m.email}</a>
                {!m.is_read && <span className="text-xs font-medium text-accent bg-accent/10 border border-accent/20 rounded-full px-2 py-0.5">Nieuw</span>}
              </div>
              {m.subject && <div className="text-sm font-medium text-foreground mt-1">{m.subject}</div>}
              <div className="text-xs text-muted mt-0.5">{formatDateTime(m.created_at)}</div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'je bericht'))}`}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px]"
              >
                <Mail size={12} /> Beantwoorden
              </a>
              <button
                onClick={() => toggle(m)}
                disabled={pending}
                className="px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] disabled:opacity-50"
              >
                {m.is_read ? 'Markeer ongelezen' : 'Markeer gelezen'}
              </button>
            </div>
          </div>
          <p className="text-sm text-foreground whitespace-pre-wrap mt-3 pt-3 border-t border-border">{m.message}</p>
        </div>
      ))}
    </div>
  );
}
