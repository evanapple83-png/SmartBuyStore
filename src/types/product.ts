export type Category = 'koelkasten' | 'wasmachines' | 'vaatwassers' | 'koken' | 'drogers';
export type EnergyLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

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
}

export interface CartItem {
  product: Product;
  quantity: number;
}
