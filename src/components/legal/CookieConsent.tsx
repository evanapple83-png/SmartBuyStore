'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { getConsent, setConsent, OPEN_PREFS_EVENT } from '@/lib/cookie-consent';
import { cn } from '@/lib/utils';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!getConsent()) setVisible(true);
    const reopen = () => {
      const c = getConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setShowPrefs(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_PREFS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_PREFS_EVENT, reopen);
  }, []);

  function save(a: boolean, m: boolean) {
    setConsent({ analytics: a, marketing: m });
    setVisible(false);
    setShowPrefs(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-3 sm:p-4 pointer-events-none">
      <div className="pointer-events-auto max-w-3xl mx-auto bg-surface border border-border rounded-[16px] shadow-2xl p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-[10px] bg-primary/5 flex items-center justify-center shrink-0">
            <Cookie size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-display font-bold text-foreground">Cookies op Smart Buy Store</h2>
            <p className="text-xs text-muted leading-relaxed mt-1">
              We gebruiken noodzakelijke cookies om de winkel te laten werken. Met jouw toestemming gebruiken we
              ook analytische en marketingcookies (bv. voor advertenties). Lees meer in ons{' '}
              <Link href="/cookiebeleid" className="text-primary underline hover:no-underline">
                cookiebeleid
              </Link>
              .
            </p>
          </div>
        </div>

        {showPrefs && (
          <div className="border-t border-border pt-3 mb-3 flex flex-col gap-2.5">
            <PrefRow label="Noodzakelijk" desc="Vereist voor o.a. winkelwagen en bestellen." checked disabled />
            <PrefRow
              label="Analytisch"
              desc="Anonieme statistieken om de winkel te verbeteren."
              checked={analytics}
              onChange={setAnalytics}
            />
            <PrefRow
              label="Marketing"
              desc="Voor gepersonaliseerde advertenties (retargeting)."
              checked={marketing}
              onChange={setMarketing}
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          {!showPrefs && (
            <button
              onClick={() => setShowPrefs(true)}
              className="order-3 sm:order-1 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-background rounded-[10px] transition-colors cursor-pointer"
            >
              Voorkeuren
            </button>
          )}
          {showPrefs ? (
            <button
              onClick={() => save(analytics, marketing)}
              className="px-4 py-2.5 text-sm font-semibold text-foreground border border-border rounded-[10px] hover:bg-background transition-colors cursor-pointer"
            >
              Voorkeuren opslaan
            </button>
          ) : (
            <button
              onClick={() => save(false, false)}
              className="order-2 px-4 py-2.5 text-sm font-semibold text-foreground border border-border rounded-[10px] hover:bg-background transition-colors cursor-pointer"
            >
              Alleen noodzakelijk
            </button>
          )}
          <button
            onClick={() => save(true, true)}
            className="order-1 sm:order-3 px-5 py-2.5 text-sm font-bold bg-accent text-white rounded-[10px] hover:bg-accent/90 transition-colors cursor-pointer"
          >
            Alles accepteren
          </button>
        </div>
      </div>
    </div>
  );
}

function PrefRow({
  label,
  desc,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (c: boolean) => void;
}) {
  return (
    <label className={cn('flex items-start gap-2.5', disabled ? 'opacity-60' : 'cursor-pointer')}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-border text-accent focus:ring-accent/30"
      />
      <span className="text-xs">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="block text-muted">{desc}</span>
      </span>
    </label>
  );
}
