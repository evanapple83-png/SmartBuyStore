'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Populaire zoekopdrachten — voeren een echte zoekopdracht uit. */
const SUGGESTIONS: string[] = [
  'Samsung koelkast',
  'No Frost koelkast',
  'Wasmachine 8 kg',
  'Vaatwasser',
  'Energielabel A',
];

export function SearchBox({ autoFocus = false, className }: { autoFocus?: boolean; className?: string }) {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filtered = value.trim()
    ? SUGGESTIONS.filter((s) => s.toLowerCase().includes(value.trim().toLowerCase()))
    : SUGGESTIONS;

  function search(term: string) {
    const q = term.trim();
    router.push(q ? `/winkel?q=${encodeURIComponent(q)}` : '/winkel');
    setFocused(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    search(value);
  }

  function go(term: string) {
    setValue(term);
    search(term);
  }

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
        <input
          type="search"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => {
            if (blurTimer.current) clearTimeout(blurTimer.current);
            setFocused(true);
          }}
          onBlur={() => {
            blurTimer.current = setTimeout(() => setFocused(false), 150);
          }}
          placeholder="Zoek op product, merk of modelnummer…"
          aria-label="Zoeken"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-[12px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
        />
      </form>

      {focused && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-surface border border-border rounded-[12px] shadow-xl overflow-hidden">
          <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
            Populaire zoekopdrachten
          </p>
          <ul>
            {filtered.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(s)}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-background transition-colors text-left cursor-pointer"
                >
                  <TrendingUp size={14} className="text-muted shrink-0" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
