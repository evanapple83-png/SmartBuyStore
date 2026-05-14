/**
 * Mollie SDK initialisatie.
 *
 * - Server-side only — API-key staat in MOLLIE_API_KEY env (test_ of live_)
 * - Niet exposen via NEXT_PUBLIC_
 * - Lazy initialisatie zodat builds zonder env-var niet falen
 */
import { createMollieClient, MollieClient } from '@mollie/api-client';

let _client: MollieClient | null = null;

export function getMollieClient(): MollieClient {
  if (_client) return _client;
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'MOLLIE_API_KEY is not configured. Add it to .env.local (lokaal) of Vercel env vars (productie).'
    );
  }
  _client = createMollieClient({ apiKey });
  return _client;
}

export function isMollieConfigured(): boolean {
  return !!process.env.MOLLIE_API_KEY;
}

export function getWebhookUrl(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/api/webhook/mollie`;
}

export function getRedirectUrl(orderNumber: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}/checkout/return?order=${encodeURIComponent(orderNumber)}`;
}
