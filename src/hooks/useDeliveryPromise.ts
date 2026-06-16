'use client';

import { useEffect, useState } from 'react';

export const DELIVERY_CUTOFF_HOUR = 11;

/**
 * Tijd-bewuste leverbelofte voor same-day-producten.
 *
 * Vóór 11:00 (lokale tijd van de klant) mag "vandaag bezorgd" beloofd
 * worden; daarna is de eerlijke belofte "morgen in huis". Tijdens
 * server-rendering/hydration is de kloktijd nog onbekend → null, zodat
 * componenten dan de voorwaardelijke tekst ("indien besteld voor 11:00")
 * tonen en er geen hydration-verschil ontstaat.
 */
export function useBeforeCutoff(): boolean | null {
  const [before, setBefore] = useState<boolean | null>(null);
  useEffect(() => {
    setBefore(new Date().getHours() < DELIVERY_CUTOFF_HOUR);
  }, []);
  return before;
}
