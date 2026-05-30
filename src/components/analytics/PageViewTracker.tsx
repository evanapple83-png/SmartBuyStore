'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getConsent, CONSENT_CHANGE_EVENT } from '@/lib/cookie-consent';

const VISITOR_KEY = 'sbs_visitor_id';
const SESSION_KEY = 'sbs_session_id';

function randomId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  if (w < 640) return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
}

function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) { id = randomId(); localStorage.setItem(VISITOR_KEY, id); }
  return id;
}
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) { id = randomId(); sessionStorage.setItem(SESSION_KEY, id); }
  return id;
}

/**
 * Lichte first-party tracker. Stuurt een paginaweergave bij elke route-wijziging,
 * uitsluitend wanneer analytics-consent is gegeven. Gebruikt sendBeacon zodat
 * het de navigatie niet vertraagt.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;

    function send() {
      const consent = getConsent();
      if (!consent?.analytics) return; // geen toestemming → niets versturen
      if (lastSent.current === pathname) return;
      lastSent.current = pathname;

      const payload = JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
        visitorId: getVisitorId(),
        sessionId: getSessionId(),
        device: deviceType(),
      });

      try {
        if (navigator.sendBeacon) {
          navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }));
        } else {
          fetch('/api/track', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true });
        }
      } catch { /* tracking is best-effort */ }
    }

    send();
    // Als de bezoeker ná het laden alsnog consent geeft, stuur de huidige view.
    const onConsent = () => { lastSent.current = null; send(); };
    window.addEventListener(CONSENT_CHANGE_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onConsent);
  }, [pathname]);

  return null;
}
