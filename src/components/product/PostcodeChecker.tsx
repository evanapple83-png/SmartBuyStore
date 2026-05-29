'use client';
import { useState } from 'react';
import { MapPin, Truck, Wrench, Recycle, AlertCircle } from 'lucide-react';

const POSTCODE_RE = /^\d{4}\s?[A-Za-z]{2}$/;

/**
 * Bezorgcheck op postcode. De bezorgvensters zijn een illustratieve weergave
 * van de echte zelfde-dag-service (geen live routeplanning) — bewust een UI-demo.
 */
export function PostcodeChecker() {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'idle' | 'ok' | 'invalid'>('idle');

  function check(e: React.FormEvent) {
    e.preventDefault();
    setResult(POSTCODE_RE.test(value.trim()) ? 'ok' : 'invalid');
  }

  return (
    <div className="rounded-[12px] border border-border bg-surface p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-foreground mb-3">
        <MapPin size={16} className="text-primary" />
        Check bezorging op jouw postcode
      </p>

      <form onSubmit={check} className="flex gap-2">
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (result !== 'idle') setResult('idle');
          }}
          placeholder="1234 AB"
          aria-label="Postcode"
          className="flex-1 px-3 py-2.5 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all uppercase placeholder:normal-case"
        />
        <button
          type="submit"
          className="bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-[10px] hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Check
        </button>
      </form>

      {result === 'invalid' && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-accent">
          <AlertCircle size={14} />
          Vul een geldige postcode in (bijv. 1234 AB).
        </p>
      )}

      {result === 'ok' && (
        <ul className="mt-3 flex flex-col gap-1.5">
          <li className="flex items-center gap-2 text-sm text-foreground">
            <Truck size={14} className="text-success shrink-0" />
            Vandaag mogelijk tussen <strong>18:00–22:00</strong>
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <Wrench size={14} className="text-success shrink-0" />
            Gratis installatie inbegrepen
          </li>
          <li className="flex items-center gap-2 text-sm text-foreground">
            <Recycle size={14} className="text-success shrink-0" />
            Oude apparaat wordt gratis meegenomen
          </li>
        </ul>
      )}
    </div>
  );
}
