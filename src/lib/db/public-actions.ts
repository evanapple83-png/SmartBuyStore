'use server';

import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getStoreSettings } from '@/lib/db/settings';
import { sendEmail } from '@/lib/mail/client';

// Publieke formulieren draaien server-side en zijn al gevalideerd. We schrijven
// via de service-role-client zodat ze niet afhangen van anon-RLS-policies
// (consistent met createOrder/getCustomersForAdmin).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Nieuwsbrief ───────────────────────────────────────────────────────────--

export async function subscribeNewsletter(rawEmail: string): Promise<{ ok: boolean; error?: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Vul een geldig e-mailadres in.' };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('sbs_newsletter_subscribers').insert({ email, source: 'website' });

  // Al ingeschreven (unique violation) behandelen we als succes — geen info-lek, geen frustratie.
  if (error && error.code !== '23505') {
    console.warn('subscribeNewsletter error:', error.message);
    return { ok: false, error: 'Inschrijven lukte niet. Probeer het later opnieuw.' };
  }
  return { ok: true };
}

// ─── Contactformulier ──────────────────────────────────────────────────────--

export async function sendContactMessage(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const subject = String(formData.get('subject') || '').trim() || null;
  const message = String(formData.get('message') || '').trim();

  if (!name) return { ok: false, error: 'Vul je naam in.' };
  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Vul een geldig e-mailadres in.' };
  if (message.length < 10) return { ok: false, error: 'Schrijf een iets uitgebreider bericht (min. 10 tekens).' };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('sbs_contact_messages')
    .insert({ name, email, subject, message });
  if (error) {
    console.warn('sendContactMessage error:', error.message);
    return { ok: false, error: 'Versturen lukte niet. Probeer het later opnieuw of mail ons direct.' };
  }

  // Notificeer de winkel (best-effort; no-op zonder mailprovider).
  try {
    const settings = await getStoreSettings();
    if (settings.company_email) {
      await sendEmail({
        to: settings.company_email,
        subject: `Nieuw contactbericht: ${subject || 'zonder onderwerp'}`,
        text: `Van: ${name} <${email}>\nOnderwerp: ${subject || '—'}\n\n${message}`,
      });
    }
  } catch { /* notificatie is niet kritisch */ }

  return { ok: true };
}
