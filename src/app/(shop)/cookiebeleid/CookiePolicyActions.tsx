'use client';
import { openCookiePreferences } from '@/lib/cookie-consent';

export function CookiePreferencesButton() {
  return (
    <button
      onClick={openCookiePreferences}
      className="inline-flex items-center bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] hover:bg-primary/90 transition-colors cursor-pointer"
    >
      Cookievoorkeuren aanpassen
    </button>
  );
}
