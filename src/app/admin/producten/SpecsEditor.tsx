'use client';

import { useState } from 'react';
import { Plus, X, ClipboardPaste, Wand2 } from 'lucide-react';

type SpecRow = { key: string; value: string };

/**
 * Specificaties-editor: bewerkbare label/waarde-rijen + "Slim plakken".
 * Plak een ruwe specs-dump van een leverancierssite (label en waarde elk op
 * een eigen regel) en de parser maakt er nette paren van. Tussenkopjes
 * ("Prestatie", "Energie", ...) worden herkend en overgeslagen; losse
 * eenheid-regels (kg, TPM, W, dB) worden aan de waarde geplakt.
 * Waarde landt als JSON-object in een verborgen input name="specs".
 */
export function SpecsEditor({ defaultValue }: { defaultValue?: Record<string, string> }) {
  const [rows, setRows] = useState<SpecRow[]>(
    Object.entries(defaultValue || {}).map(([key, value]) => ({ key, value }))
  );
  const [showPaste, setShowPaste] = useState(false);
  const [pasteText, setPasteText] = useState('');

  const json = JSON.stringify(
    Object.fromEntries(rows.filter((r) => r.key.trim() && r.value.trim()).map((r) => [r.key.trim(), r.value.trim()]))
  );

  function setRow(i: number, patch: Partial<SpecRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function applyPaste() {
    const parsed = parseSpecsDump(pasteText);
    if (parsed.length === 0) return;
    setRows((prev) => {
      // Bestaande keys behouden hun (eventueel handmatig aangepaste) waarde niet:
      // geplakte data wint, dubbele keys binnen de plak zelf worden ontdubbeld.
      const merged = new Map(prev.map((r) => [r.key, r.value]));
      for (const [k, v] of parsed) merged.set(k, v);
      return Array.from(merged, ([key, value]) => ({ key, value }));
    });
    setPasteText('');
    setShowPaste(false);
  }

  return (
    <div>
      <input type="hidden" name="specs" value={json} />

      {rows.length > 0 && (
        <div className="space-y-2 mb-3">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={row.key}
                onChange={(e) => setRow(i, { key: e.target.value })}
                placeholder="Label (bv. Capaciteit trommel)"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
              />
              <input
                value={row.value}
                onChange={(e) => setRow(i, { value: e.target.value })}
                placeholder="Waarde (bv. 7 kg)"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-muted hover:text-red-600 p-1.5"
                aria-label="Rij verwijderen"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, { key: '', value: '' }])}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:bg-background border border-border px-3 py-2 rounded-[10px]"
        >
          <Plus size={15} /> Rij toevoegen
        </button>
        <button
          type="button"
          onClick={() => setShowPaste((v) => !v)}
          className="inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-primary/90"
        >
          <ClipboardPaste size={15} /> Slim plakken
        </button>
      </div>

      {showPaste && (
        <div className="mt-3 border border-primary/30 bg-primary/5 rounded-[10px] p-3">
          <p className="text-xs text-muted mb-2">
            Plak hieronder de specificaties van een leverancier- of fabrikantsite (label en waarde mogen elk op
            een eigen regel staan). Tussenkopjes en losse eenheden worden automatisch herkend. Controleer daarna
            de rijen even — bij een afwijkend bronformaat kun je ze hier nog bijschaven.
          </p>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            placeholder={'Capaciteit trommel\n7\nkg\nMaximale centrifugesnelheid\n1400\nTPM\n...'}
            className="w-full px-3 py-2 text-sm border border-border rounded-[10px] bg-background focus:outline-none focus:border-primary font-mono"
          />
          <button
            type="button"
            onClick={applyPaste}
            disabled={!pasteText.trim()}
            className="mt-2 inline-flex items-center gap-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-[10px] hover:bg-primary/90 disabled:opacity-50"
          >
            <Wand2 size={15} /> Omzetten naar specificaties
          </button>
        </div>
      )}

      <p className="text-xs text-muted mt-2">
        Deze specificaties verschijnen als tabel op de productpagina; de eerste paar waarden ook op de productkaart.
      </p>
    </div>
  );
}

// ─── Parser ──────────────────────────────────────────────────────────────────

/** Losse eenheid-regels die aan de vorige regel geplakt worden ("7" + "kg" → "7 kg"). */
const UNITS = new Set([
  'kg', 'g', 'tpm', 'rpm', 'w', 'kw', 'wh', 'kwh', 'db', 'db(a)', 'l', 'liter',
  'cm', 'mm', 'm', 'm²', 'm³', '°c', 'min', 'minuten', 'uur', '%', 'bar',
  'couverts', 'couvert', 'jaar', 'kwh/jaar', 'l/jaar', 'programma’s', "programma's",
]);

/**
 * Sectiekoppen uit leverancier-/fabrikant-dumps (groeperingstitels, geen echte
 * label/waarde-paren). Ze worden vóór het koppelen verwijderd, zodat ze niet
 * als waarde in de verkeerde kolom belanden en de hele tabel verschuiven.
 * Alleen ondubbelzinnige groeptitels — echte labels als "Geluidsniveau" of
 * "Kleur van het product" staan hier bewust NIET in.
 */
const SECTION_HEADINGS = new Set([
  'algemeen', 'algemene informatie', 'design', 'design en uitvoering', 'uitvoering',
  'gewicht en omvang', 'afmetingen', 'afmetingen en gewicht', 'maten', 'plaatsing',
  'energie', 'energie en verbruik', 'verbruik', 'prestatie', 'prestaties',
  'capaciteit en inhoud', 'inhoud', 'geluid', 'aansluiting', 'aansluitingen',
  'functies', "programma's en functies", 'comfort', 'overig', 'overige',
  'specificaties', 'productinformatie', 'kenmerken',
]);

function isHeading(line: string): boolean {
  return SECTION_HEADINGS.has(line.toLowerCase().replace(/\s*:\s*$/, '').trim());
}

/** Regels die duidelijk een waarde zijn (en geen label/tussenkopje). */
function isStrongValue(line: string): boolean {
  const l = line.trim();
  if (/^(ja|nee|n\.?v\.?t\.?)$/i.test(l)) return true;
  if (/^[+-]?\d/.test(l)) return true; // begint met cijfer: "7 kg", "178,7 cm", "1.400 tpm", "-18 °C"
  if (/^[A-G]([+]{1,3})?$/.test(l)) return true; // energieklasse: A+++ … G
  if (/^(SN|N|ST|T|SN-T|SN-ST|N-T|N-ST)$/i.test(l)) return true; // klimaatklasse
  if (/^R\d{2,4}[a-z]?$/i.test(l)) return true; // koelmiddel: R600a, R134a
  return false;
}

/**
 * Parse een ruwe specs-dump naar [label, waarde]-paren.
 * Ondersteunt "Label: waarde", tab-gescheiden regels én losse label/waarde-
 * regels die elkaar afwisselen. Sectiekoppen worden weggefilterd.
 */
function parseSpecsDump(raw: string): [string, string][] {
  const rawLines = raw.split('\n').map((l) => l.trim()).filter(Boolean);

  // Stap 1: regels met een expliciete scheiding (":" of tab) zijn al een paar.
  // Stap 2: losse eenheid-regels samenvoegen met de vorige regel.
  // Stap 3: ondubbelzinnige sectiekoppen verwijderen.
  const lines: string[] = [];
  const pairs: [string, string][] = [];
  for (const line of rawLines) {
    const sep = line.match(/^(.{2,}?)(?::|\t)\s*(.+)$/);
    if (sep && !/^https?$/i.test(sep[1])) {
      pairs.push([sep[1].trim(), sep[2].trim()]);
      continue;
    }
    if (isHeading(line)) continue;
    if (lines.length > 0 && UNITS.has(line.toLowerCase())) {
      lines[lines.length - 1] += ` ${line}`;
    } else {
      lines.push(line);
    }
  }

  // Stap 4: label/waarde-alternatie met tussenkopje-detectie:
  // als de "waarde" zelf geen sterke waarde is maar de regel erná wél,
  // dan was de huidige regel een (onbekend) tussenkopje → overslaan.
  let i = 0;
  while (i < lines.length - 1) {
    const label = lines[i];
    const next = lines[i + 1];
    if (!isStrongValue(next)) {
      const after = lines[i + 2];
      if (after !== undefined && isStrongValue(after)) {
        i += 1; // label was een tussenkopje (bv. "Prestatie", "Energie")
        continue;
      }
    }
    pairs.push([label, next]);
    i += 2;
  }

  // Stap 5: vangnet tegen omgedraaide paren. Een normaal paar heeft een
  // beschrijvend label als sleutel; staat er juist een sterke waarde in de
  // sleutel én een beschrijvende tekst in de waarde, dan zijn ze omgewisseld.
  const corrected = pairs.map(([k, v]): [string, string] =>
    isStrongValue(k) && !isStrongValue(v) ? [v, k] : [k, v]
  );

  return corrected.filter(([k, v]) => k && v);
}
