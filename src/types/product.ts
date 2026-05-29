export type Category = 'koelkasten' | 'wasmachines' | 'vaatwassers' | 'koken' | 'drogers';
export type EnergyLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

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
  };
  shortDescription: string;
  features: string[];
  specs: Record<string, string>;
  attributes: ProductAttributes;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
