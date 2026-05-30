import type { Product, Category } from '@/types/product';

/**
 * Mapper: DB-rij (snake_case + joined brand/category) → bestaande Product-type
 * (camelCase). Zorgt dat alle UI-componenten ongemoeid blijven.
 */
export function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.short_name || row.name,
    brand: row.brand?.name || '',
    category: (row.category?.slug || 'koelkasten') as Category,
    currentPrice: Number(row.current_price),
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    energyLabel: row.energy_label || 'A',
    // Reviews komen uit de echte sbs_reviews-tabel (geen verzonnen scores meer).
    // Lijsten/detail verrijken dit nadien met de werkelijke aggregatie.
    rating: 0,
    reviewCount: 0,
    inStock: !!row.in_stock,
    isSameDayDelivery: !!row.is_same_day_delivery,
    isNew: !!row.is_new,
    isOnSale: !!row.is_on_sale,
    images: {
      primary: row.image_primary || '',
      fallback: row.image_fallback || '',
    },
    shortDescription: row.short_description || '',
    features: row.features || [],
    specs: row.specs || {},
    attributes: row.attributes || {},
  };
}

export function mapDbProducts(rows: any[]): Product[] {
  return rows.map(mapDbProduct);
}
