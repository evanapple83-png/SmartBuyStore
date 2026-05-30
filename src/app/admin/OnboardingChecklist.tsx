'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Rocket, X, BookOpen } from 'lucide-react';
import type { OnboardingStep } from '@/lib/db/onboarding';

const HIDE_KEY = 'sbs_onboarding_hidden';

export function OnboardingChecklist({ steps, complete }: { steps: OnboardingStep[]; complete: boolean }) {
  const [hidden, setHidden] = useState(true); // start verborgen tot we localStorage lazen (voorkomt flits)

  useEffect(() => {
    setHidden(localStorage.getItem(HIDE_KEY) === '1');
  }, []);

  // Zodra alles klaar is, niet meer tonen.
  if (complete || hidden) return null;

  const done = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-[12px] border border-primary/20 bg-primary/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Rocket size={18} className="text-primary" />
          <h2 className="text-base font-bold text-foreground">Aan de slag</h2>
          <span className="text-xs text-muted">{done}/{steps.length} klaar</span>
        </div>
        <button onClick={() => { localStorage.setItem(HIDE_KEY, '1'); setHidden(true); }} className="text-muted hover:text-foreground" aria-label="Verbergen">
          <X size={16} />
        </button>
      </div>

      <div className="h-1.5 bg-border rounded-full mt-3 mb-4 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>

      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 text-sm">
            {s.done
              ? <CheckCircle2 size={17} className="text-emerald-600 shrink-0" />
              : <Circle size={17} className="text-muted shrink-0" />}
            <span className={s.done ? 'text-muted line-through' : 'text-foreground'}>{s.label}</span>
            {!s.done && <Link href={s.href} className="ml-auto text-xs font-semibold text-primary hover:underline shrink-0">Regelen →</Link>}
          </li>
        ))}
      </ul>

      <Link href="/admin/help" className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-primary hover:underline">
        <BookOpen size={13} /> Bekijk de volledige handleiding
      </Link>
    </div>
  );
}
