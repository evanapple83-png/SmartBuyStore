export type Category = 'koelkasten' | 'wasmachines' | 'vaatwassers' | 'koken' | 'drogers';
export type EnergyLabel = 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

/**
 * Genormaliseerde, getypeerde filterfacetten (DB-kolom `attributes`, JSONB).
 * Keys bewust snake_case → identiek aan DB/migratie/seed, geen remap nodig.
 * Alle velden optioneel — niet elk product heeft elke eigenschap.
 */
export interface ProductAttributes {
  type?: string;
  capacity_total_l?: number;
  capacity_fridge_l?: number;
  capacity_freezer_l?: number;
  color?: string;
  width_cm?: number;
  no_frost?: boolean;
  spin_rpm?: number;
  load_kg?: number;
  noise_db?: number;
  couverts?: number;
  build_type?: string; // 'vrijstaand' | 'inbouw'
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  /** Artikelnummer / modelnummer (SKU). Optioneel: niet elk product heeft er een. */
  sku?: string | null;
  brand: string;
  category: Category;
  currentPrice: number;
  originalPrice: number | null;
  energyLabel: EnergyLabel;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isSameDayDelivery: boolean;
  isNew: boolean;
  isOnSale: boolean;
  images: {
    primary: string;
    fallback: string;
    /** Extra galerijfoto's (volgorde = weergavevolgorde). Optioneel: oudere cart-snapshots missen dit veld. */
    extra?: string[];
  };
  /** Productbrochure (PDF, publieke URL). Optioneel: oudere cart-snapshots missen dit veld. */
  brochureUrl?: string | null;
  /** Actieve cashback in euro's (weergave; wordt niet verrekend in de winkelwagen). */
  cashbackAmount?: number | null;
  /** Toelichting bij de cashback, bv. 'via Samsung'. */
  cashbackLabel?: string | null;
  /** Garantielabel voor klanten, bv. '5 jaar garantie'. */
  warrantyLabel?: string | null;
  shortDescription: string;
  features: string[];
  specs: Record<string, string>;
  attributes: ProductAttributes;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
