'use client';
import { useState } from 'react';
import { MapPin, Truck, Wrench, Recycle, AlertCircle, Clock } from 'lucide-react';
import { isInSameDayArea } from '@/lib/service-area';
import { useBeforeCutoff } from '@/hooks/useDeliveryPromise';

/**
 * Bezorgcheck op postcode. Checkt het cijferdeel tegen het echte
 * same-day-gebied (Friesland, Groningen, Drenthe, Overijssel, Flevoland,
 * Gelderland) en respecteert de 12:00-besteldeadline. Buiten het gebied of
 * zonder same-day/voorraad is de eerlijke belofte 3-5 werkdagen.
 */
export function PostcodeChecker({ sameDayAvailable = true }: { sameDayAvailable?: boolean }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<'idle' | 'in-area' | 'out-area' | 'invalid'>('idle');
  const beforeCutoff = useBeforeCutoff();

  function check(e: React.FormEvent) {
    e.preventDefault();
    const inArea = isInSameDayArea(value);
    setResult(inArea === null ? 'invalid' : inArea ? 'in-area' : 'out-area');
  }

  const sameDayHere = result === 'in-area' && sameDayAvailable;

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

      {(result === 'in-area' || result === 'out-area') && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {sameDayHere ? (
            beforeCutoff === false ? (
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Clock size={14} className="text-warm shrink-0" />
                <span>
                  Besteltijd voor vandaag (12:00) is verstreken — <strong>morgen</strong> bezorgd tussen{' '}
                  <strong>18:00–22:00</strong>
                </span>
              </li>
            ) : (
              <li className="flex items-center gap-2 text-sm text-foreground">
                <Truck size={14} className="text-success shrink-0" />
                <span>
                  Vóór 12:00 besteld = <strong>vandaag</strong> bezorgd tussen <strong>18:00–22:00</strong>
                </span>
              </li>
            )
          ) : result === 'out-area' ? (
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Truck size={14} className="text-warm shrink-0" />
              <span>
                Buiten ons same-day-gebied — bezorging binnen <strong>3 tot 5 werkdagen</strong>
              </span>
            </li>
          ) : (
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Truck size={14} className="text-warm shrink-0" />
              <span>
                Bezorging binnen <strong>3 tot 5 werkdagen</strong>
              </span>
            </li>
          )}
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
