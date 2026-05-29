import { MessageSquare } from 'lucide-react';
import { getContactMessages } from '@/lib/db/contact';
import { MessagesList } from './MessagesList';

export const metadata = { title: 'Berichten · Admin' };

export default async function AdminMessagesPage() {
  const messages = await getContactMessages();
  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Berichten</h1>
        <p className="text-sm text-muted">
          {messages.length} bericht{messages.length === 1 ? '' : 'en'} via het contactformulier
          {unread > 0 && <> · <span className="font-semibold text-accent">{unread} ongelezen</span></>}.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="bg-surface border border-border rounded-[12px] p-8 text-center text-sm text-muted">
          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
          Nog geen berichten.
        </div>
      ) : (
        <MessagesList messages={messages} />
      )}
    </div>
  );
}
