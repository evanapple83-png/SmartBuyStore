'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';

type Option = { value: string; label: string };

/**
 * Herbruikbaar zoek-/filterbalkje voor admin-lijsten. Schrijft naar de URL
 * (?q= en ?status=) zodat de server-pagina kan filteren.
 */
export function AdminListSearch({
  placeholder = 'Zoeken...',
  statusOptions,
}: {
  placeholder?: string;
  statusOptions?: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');

  // Debounce de zoekterm naar de URL.
  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(Array.from(params.entries()));
      if (q) next.set('q', q); else next.delete('q');
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setStatus(value: string) {
    const next = new URLSearchParams(Array.from(params.entries()));
    if (value) next.set('status', value); else next.delete('status');
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 text-sm border border-border rounded-[10px] bg-surface focus:outline-none focus:border-primary"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground" aria-label="Wissen">
            <X size={15} />
          </button>
        )}
      </div>
      {statusOptions && (
        <select
          defaultValue={params.get('status') || ''}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2.5 text-sm border border-border rounded-[10px] bg-surface focus:outline-none focus:border-primary"
        >
          <option value="">Alle statussen</option>
          {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </div>
  );
}
