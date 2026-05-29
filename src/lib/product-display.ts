import type { Product } from '@/types/product';

/**
 * Compacte "key specs"-regel per categorie, bv. "8 kg • 1400 tpm • Energielabel A • 44 dB".
 * Bouwt op de gestructureerde `attributes`; valt terug op de leesbare `specs`-map
 * zolang migratie 0006 nog niet gedraaid is (attributes leeg).
 */
export function productKeySpecs(product: Product): string[] {
  const a = product.attributes ?? {};
  const out: string[] = [];

  switch (product.category) {
    case 'wasmachines':
      if (a.load_kg) out.push(`${a.load_kg} kg`);
      if (a.spin_rpm) out.push(`${a.spin_rpm} tpm`);
      out.push(`Energielabel ${product.energyLabel}`);
      if (a.noise_db) out.push(`${a.noise_db} dB`);
      break;
    case 'vaatwassers':
      if (a.couverts) out.push(`${a.couverts} couverts`);
      out.push(`Energielabel ${product.energyLabel}`);
      if (a.noise_db) out.push(`${a.noise_db} dB`);
      if (a.build_type) out.push(cap(a.build_type));
      break;
    case 'koelkasten':
      if (a.capacity_total_l) out.push(`${a.capacity_total_l}L`);
      if (a.no_frost) out.push('No Frost');
      out.push(`Energielabel ${product.energyLabel}`);
      if (a.color) out.push(a.color);
      break;
    default:
      out.push(`Energielabel ${product.energyLabel}`);
  }

  // Fallback wanneer attributes (nog) leeg zijn: gebruik leesbare specs-waarden
  if (out.length < 2) {
    return Object.values(product.specs).slice(0, 4);
  }
  return out;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
