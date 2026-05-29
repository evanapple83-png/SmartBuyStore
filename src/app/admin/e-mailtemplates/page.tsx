import { Mail } from 'lucide-react';
import { getEmailTemplates } from '@/lib/db/email-templates';
import { TemplatesManager } from './TemplatesManager';

export const metadata = { title: 'E-mailtemplates · Admin' };

export default async function AdminEmailTemplatesPage() {
  const templates = await getEmailTemplates();

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">E-mailtemplates</h1>
        <p className="text-sm text-muted">
          De teksten die klanten ontvangen bij elke gebeurtenis. Gebruik {'{{'}variabelen{'}}'} — die worden
          automatisch ingevuld. Het daadwerkelijk versturen wordt geactiveerd zodra de mailprovider is gekoppeld (FASE 9).
        </p>
      </div>

      {templates.length === 0 ? (
        <div className="bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
          <Mail size={32} className="mx-auto mb-2 opacity-50" />
          Geen templates gevonden. Draai migratie 0007 in Supabase Studio om de standaardsjablonen te laden.
        </div>
      ) : (
        <TemplatesManager templates={templates} />
      )}
    </div>
  );
}
