/**
 * Mail-verzending via Mailgun REST API.
 *
 * - Server-side only — MAILGUN_API_KEY staat in env, nooit NEXT_PUBLIC_.
 * - Graceful: zonder key/domein wordt niets verzonden (skipped), exact zoals
 *   Mollie pas live gaat zodra de key er is. Dit blokkeert nooit een bestelling.
 * - Geen extra npm-dependency: we praten direct met de Mailgun REST API
 *   (form-encoded body + HTTP Basic auth met gebruiker "api").
 * - Regio: Mailgun-accounts die in de EU zijn aangemaakt gebruiken
 *   api.eu.mailgun.net. Zet MAILGUN_REGION=eu (of MAILGUN_API_BASE) wanneer
 *   je account in de EU zit, anders krijg je een 401.
 */

export function isMailConfigured(): boolean {
  return !!(process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN);
}

function fromAddress(): string {
  const name = process.env.MAIL_FROM_NAME || 'Smartbuystore';
  const addr = process.env.MAIL_FROM_ADDRESS || 'noreply@smartbuystore.nl';
  return `${name} <${addr}>`;
}

function apiBase(): string {
  if (process.env.MAILGUN_API_BASE) return process.env.MAILGUN_API_BASE.replace(/\/+$/, '');
  return (process.env.MAILGUN_REGION || '').toLowerCase() === 'eu'
    ? 'https://api.eu.mailgun.net'
    : 'https://api.mailgun.net';
}

export type SendResult =
  | { ok: true; skipped: true }                  // geen key → niets verzonden
  | { ok: true; skipped: false; id: string | null }
  | { ok: false; error: string };

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendResult> {
  const key = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  if (!key || !domain) {
    return { ok: true, skipped: true };
  }

  try {
    const form = new URLSearchParams();
    form.set('from', fromAddress());
    form.set('to', opts.to);
    form.set('subject', opts.subject);
    form.set('text', opts.text);
    if (process.env.MAIL_REPLY_TO) form.set('h:Reply-To', process.env.MAIL_REPLY_TO);

    const auth = Buffer.from(`api:${key}`).toString('base64');
    const res = await fetch(`${apiBase()}/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `Mailgun ${res.status}: ${body.slice(0, 200)}` };
    }

    const json = await res.json().catch(() => ({}));
    return { ok: true, skipped: false, id: (json as any)?.id ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Onbekende mailfout' };
  }
}
