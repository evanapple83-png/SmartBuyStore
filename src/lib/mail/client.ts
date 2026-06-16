/**
 * Mail-verzending via Resend REST API.
 *
 * - Server-side only — RESEND_API_KEY staat in env, nooit NEXT_PUBLIC_.
 * - Graceful: zonder key wordt niets verzonden (skipped), exact zoals Mollie
 *   pas live gaat zodra de key er is. Dit blokkeert nooit een bestelling.
 * - Geen extra npm-dependency: we praten direct met de Resend REST API.
 */

export function isMailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

function fromAddress(): string {
  const name = process.env.MAIL_FROM_NAME || 'Smart Buy Store';
  const addr = process.env.MAIL_FROM_ADDRESS || 'noreply@smartbuystore.nl';
  return `${name} <${addr}>`;
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
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return { ok: true, skipped: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        ...(process.env.MAIL_REPLY_TO ? { reply_to: process.env.MAIL_REPLY_TO } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }

    const json = await res.json().catch(() => ({}));
    return { ok: true, skipped: false, id: (json as any)?.id ?? null };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Onbekende mailfout' };
  }
}
