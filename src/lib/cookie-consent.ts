/**
 * Cookie-consent opslag + helpers (GDPR/ePrivacy).
 * `necessary` staat altijd aan (functioneel: winkelwagen, verlanglijst).
 * `analytics` en `marketing` vereisen expliciete opt-in vóór laden van
 * bijbehorende scripts (bv. retargeting-pixels).
 */
export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
}

export const CONSENT_KEY = 'sbs_cookie_consent';
export const OPEN_PREFS_EVENT = 'sbs-open-cookie-prefs';
export const CONSENT_CHANGE_EVENT = 'sbs-consent-change';

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'marketing' in parsed) return parsed as CookieConsent;
  } catch {
    /* corrupt — behandel als geen keuze */
  }
  return null;
}

export function setConsent(c: { analytics: boolean; marketing: boolean }): void {
  const value: CookieConsent = { necessary: true, analytics: c.analytics, marketing: c.marketing, ts: Date.now() };
  localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: value }));
}

/** Heropent de cookie-voorkeuren (bv. vanuit footer of cookiebeleid). */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_PREFS_EVENT));
}
