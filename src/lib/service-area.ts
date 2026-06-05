/**
 * Same-day-bezorggebied: Friesland, Groningen, Drenthe, Overijssel,
 * Flevoland en Gelderland — gecheckt op het cijferdeel van de postcode.
 * Ranges volgen de provinciegrenzen op hoofdlijnen (grensplaatsen kunnen
 * een enkele keer afwijken; dit is een servicegebied-indicatie, geen
 * routeplanning).
 */
const SAME_DAY_RANGES: Array<[number, number]> = [
  [1300, 1379], // Flevoland — Almere
  [3770, 3794], // Gelderland — Barneveld e.o.
  [3840, 3925], // Gelderland/Flevoland — Harderwijk, Putten, Nijkerk, Zeewolde
  [4000, 4199], // Gelderland — Tiel/Betuwe
  [5300, 5335], // Gelderland — Bommelerwaard
  [6500, 6599], // Gelderland — Nijmegen e.o.
  [6600, 6999], // Gelderland — Arnhem/Over-Betuwe
  [7000, 7399], // Gelderland — Achterhoek, Zutphen, Apeldoorn
  [7400, 7799], // Overijssel — Deventer, Twente, Vechtdal
  [7800, 7999], // Drenthe — Emmen, Hoogeveen, Meppel
  [8000, 8199], // Overijssel — Zwolle/IJsselland
  [8200, 8325], // Flevoland — Lelystad, Urk, Noordoostpolder
  [8330, 8399], // Overijssel — Steenwijkerland
  [8400, 9299], // Friesland
  [9300, 9499], // Drenthe — Assen e.o.
  [9500, 9999], // Groningen
];

export const POSTCODE_RE = /^(\d{4})\s?[A-Za-z]{2}$/;

/** true/false = binnen/buiten gebied; null = geen geldige postcode. */
export function isInSameDayArea(postcode: string): boolean | null {
  const match = postcode.trim().match(POSTCODE_RE);
  if (!match) return null;
  const digits = Number(match[1]);
  return SAME_DAY_RANGES.some(([from, to]) => digits >= from && digits <= to);
}
