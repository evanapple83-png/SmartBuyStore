'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Mail, Check } from 'lucide-react';
import type { EmailTemplate } from '@/lib/db/email-templates';
import { updateEmailTemplate, toggleEmailTemplate } from '@/lib/db/email-template-actions';

export function TemplatesManager({ templates }: { templates: EmailTemplate[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    setError(null);
    const formData = new FormData(e.currentTarget);
    start(async () => {
      const result = await updateEmailTemplate(editing.key, formData);
      if (!result.ok) {
        setError(result.error || 'Er ging iets mis');
        return;
      }
      setEditing(null);
      router.refresh();
    });
  }

  function handleToggle(t: EmailTemplate) {
    start(async () => {
      await toggleEmailTemplate(t.key, !t.is_enabled);
      router.refresh();
    });
  }

  return (
    <>
      <div className="space-y-3">
        {templates.map((t) => (
          <div key={t.key} className="bg-surface border border-border rounded-[12px] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Mail size={15} className="text-muted shrink-0" />
                  <span className="font-semibold text-foreground">{t.label}</span>
                  {t.is_enabled ? (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">Actief</span>
                  ) : (
                    <span className="text-xs font-medium text-muted bg-background border border-border rounded-full px-2 py-0.5">Uit</span>
                  )}
                </div>
                <div className="text-sm text-foreground mt-1.5 truncate"><span className="text-muted">Onderwerp:</span> {t.subject}</div>
                {t.description && <div className="text-xs text-muted mt-1">{t.description}</div>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleToggle(t)}
                  disabled={pending}
                  className="px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px] disabled:opacity-50"
                >
                  {t.is_enabled ? 'Uitschakelen' : 'Inschakelen'}
                </button>
                <button
                  onClick={() => { setError(null); setEditing(t); }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-background rounded-[6px]"
                >
                  <Edit size={12} /> Bewerken
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="bg-surface rounded-[12px] max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-1">{editing.label}</h2>
            {editing.description && <p className="text-xs text-muted mb-4">{editing.description}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Onderwerp</span>
                <input
                  name="subject"
                  defaultValue={editing.subject}
                  required
                  className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Inhoud</span>
                <textarea
                  name="body"
                  defaultValue={editing.body}
                  required
                  rows={12}
                  className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary font-mono leading-relaxed"
                />
              </label>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-[8px] p-3 text-sm">{error}</div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-background rounded-[8px]">
                  Annuleren
                </button>
                <button type="submit" disabled={pending} className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[8px] hover:bg-primary/90 disabled:opacity-50">
                  {pending ? 'Bezig...' : <><Check size={14} /> Opslaan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
