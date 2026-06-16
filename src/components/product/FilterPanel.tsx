'use client';
import type { Facets, FilterState } from '@/lib/catalog-filters';
import { isDiscriminating } from '@/lib/catalog-filters';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  facets: Facets;
  state: FilterState;
  onChange: (next: FilterState) => void;
}

function toggle(arr: string[], v: string): string[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

export function FilterPanel({ facets, state, onChange }: FilterPanelProps) {
  const set = (patch: Partial<FilterState>) => onChange({ ...state, ...patch });

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* Categorie */}
      {facets.categories.length >= 2 && (
        <CheckboxGroup
          title="Categorie"
          options={facets.categories}
          selected={state.categories}
          onToggle={(v) => set({ categories: toggle(state.categories, v) })}
        />
      )}

      {/* Merk */}
      {facets.brands.length >= 2 && (
        <CheckboxGroup
          title="Merk"
          options={facets.brands}
          selected={state.brands}
          onToggle={(v) => set({ brands: toggle(state.brands, v) })}
        />
      )}

      {/* Prijs */}
      {facets.priceRange && facets.priceRange.min < facets.priceRange.max && (
        <Section title="Prijs">
          <div className="flex items-center gap-2">
            <PriceInput
              placeholder={`${facets.priceRange.min}`}
              value={state.priceMin}
              onChange={(n) => set({ priceMin: n })}
              aria-label="Minimale prijs"
            />
            <span className="text-muted text-sm">—</span>
            <PriceInput
              placeholder={`${facets.priceRange.max}`}
              value={state.priceMax}
              onChange={(n) => set({ priceMax: n })}
              aria-label="Maximale prijs"
            />
          </div>
        </Section>
      )}

      {/* Energielabel */}
      {facets.energyLabels.length >= 2 && (
        <CheckboxGroup
          title="Energielabel"
          options={facets.energyLabels}
          selected={state.energyLabels}
          onToggle={(v) => set({ energyLabels: toggle(state.energyLabels, v) })}
        />
      )}

      {/* Geluidsniveau */}
      {facets.noise.length >= 2 && (
        <CheckboxGroup
          title="Geluidsniveau"
          options={facets.noise}
          selected={state.noise}
          onToggle={(v) => set({ noise: toggle(state.noise, v) })}
        />
      )}

      {/* Inhoud (koelkasten) */}
      {facets.capacities.length >= 2 && (
        <CheckboxGroup
          title="Inhoud"
          options={facets.capacities}
          selected={state.capacities}
          onToggle={(v) => set({ capacities: toggle(state.capacities, v) })}
        />
      )}

      {/* Vulgewicht (wasmachines) */}
      {facets.loads.length >= 2 && (
        <CheckboxGroup
          title="Vulgewicht"
          options={facets.loads}
          selected={state.loads}
          onToggle={(v) => set({ loads: toggle(state.loads, v) })}
        />
      )}

      {/* Centrifugesnelheid (wasmachines) */}
      {facets.spins.length >= 2 && (
        <CheckboxGroup
          title="Centrifugesnelheid"
          options={facets.spins}
          selected={state.spins}
          onToggle={(v) => set({ spins: toggle(state.spins, v) })}
        />
      )}

      {/* Aantal couverts (vaatwassers) */}
      {facets.couverts.length >= 2 && (
        <CheckboxGroup
          title="Aantal couverts"
          options={facets.couverts}
          selected={state.couverts}
          onToggle={(v) => set({ couverts: toggle(state.couverts, v) })}
        />
      )}

      {/* Breedte */}
      {facets.widths.length >= 2 && (
        <CheckboxGroup
          title="Breedte"
          options={facets.widths}
          selected={state.widths}
          onToggle={(v) => set({ widths: toggle(state.widths, v) })}
        />
      )}

      {/* Type */}
      {facets.types.length >= 2 && (
        <CheckboxGroup
          title="Type"
          options={facets.types}
          selected={state.types}
          onToggle={(v) => set({ types: toggle(state.types, v) })}
        />
      )}

      {/* Kleur */}
      {facets.colors.length >= 2 && (
        <CheckboxGroup
          title="Kleur"
          options={facets.colors}
          selected={state.colors}
          onToggle={(v) => set({ colors: toggle(state.colors, v) })}
        />
      )}

      {/* Uitvoering (vrijstaand / inbouw) */}
      {facets.buildTypes.length >= 2 && (
        <CheckboxGroup
          title="Uitvoering"
          options={facets.buildTypes}
          selected={state.buildTypes}
          onToggle={(v) => set({ buildTypes: toggle(state.buildTypes, v) })}
        />
      )}

      {/* Booleans — alleen tonen als ze écht onderscheiden */}
      {(isDiscriminating(facets.noFrostCount, facets.total) ||
        isDiscriminating(facets.sameDayCount, facets.total) ||
        isDiscriminating(facets.onSaleCount, facets.total)) && (
        <Section title="Kenmerken">
          {isDiscriminating(facets.noFrostCount, facets.total) && (
            <ToggleRow
              label="No Frost"
              count={facets.noFrostCount}
              checked={state.noFrost}
              onChange={(c) => set({ noFrost: c })}
            />
          )}
          {isDiscriminating(facets.sameDayCount, facets.total) && (
            <ToggleRow
              label="Vandaag leverbaar"
              count={facets.sameDayCount}
              checked={state.sameDay}
              onChange={(c) => set({ sameDay: c })}
            />
          )}
          {isDiscriminating(facets.onSaleCount, facets.total) && (
            <ToggleRow
              label="Aanbieding"
              count={facets.onSaleCount}
              checked={state.onSale}
              onChange={(c) => set({ onSale: c })}
            />
          )}
        </Section>
      )}
    </div>
  );
}

// ─── Building blocks ───────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-4 first:pt-0">
      <h3 className="text-sm font-display font-bold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: { value: string; label: string; count: number }[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <Section title={title}>
      <ul className="flex flex-col gap-1.5">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => onToggle(o.value)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30 cursor-pointer"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">
                {o.label}
              </span>
              <span className="text-xs text-muted tabular-nums">{o.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function ToggleRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: (c: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-border text-accent focus:ring-accent/30 cursor-pointer"
      />
      <span className="text-sm text-foreground group-hover:text-primary transition-colors flex-1">
        {label}
      </span>
      <span className="text-xs text-muted tabular-nums">{count}</span>
    </label>
  );
}

function PriceInput({
  value,
  onChange,
  placeholder,
  ...rest
}: {
  value: number | null;
  onChange: (n: number | null) => void;
  placeholder: string;
  'aria-label': string;
}) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted">€</span>
      <input
        type="number"
        min={0}
        inputMode="numeric"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className={cn(
          'w-full pl-6 pr-2 py-2 text-sm border border-border rounded-[10px] bg-surface',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all'
        )}
        {...rest}
      />
    </div>
  );
}
