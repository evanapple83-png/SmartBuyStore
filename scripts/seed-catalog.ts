/**
 * Seed Smart Buy catalog: brands, categories en products uit src/data/*
 * naar Supabase. Idempotent — herhaalbaar zonder duplicates.
 *
 * Run met:  npx tsx scripts/seed-catalog.ts
 *
 * Vereist env vars:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { products } from '../src/data/products';
import { categories } from '../src/data/categories';
import { brands } from '../src/data/brands';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Mist env vars: NEXT_PUBLIC_SUPABASE_URL en/of SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('▶ Seeding brands...');
  const { error: brandsErr } = await supabase
    .from('sbs_brands')
    .upsert(
      brands.map((b, i) => ({ slug: b.slug, name: b.name, sort_order: i })),
      { onConflict: 'slug' }
    );
  if (brandsErr) throw brandsErr;
  console.log(`  ✓ ${brands.length} brands`);

  console.log('▶ Seeding categories...');
  const { error: catsErr } = await supabase
    .from('sbs_categories')
    .upsert(
      categories.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        sort_order: i,
      })),
      { onConflict: 'slug' }
    );
  if (catsErr) throw catsErr;
  console.log(`  ✓ ${categories.length} categories`);

  // Haal brand_id en category_id uit DB
  const { data: brandRows } = await supabase.from('sbs_brands').select('id, slug');
  const { data: catRows } = await supabase.from('sbs_categories').select('id, slug');
  const brandBySlug = Object.fromEntries(brandRows!.map((b) => [b.slug, b.id]));
  const catBySlug = Object.fromEntries(catRows!.map((c) => [c.slug, c.id]));

  console.log('▶ Seeding products...');
  const productsToInsert = products.map((p, i) => {
    const brandSlug = p.brand.toLowerCase();
    return {
      slug: p.slug,
      name: p.name,
      short_name: p.shortName,
      brand_id: brandBySlug[brandSlug] || null,
      category_id: catBySlug[p.category] || null,
      current_price: p.currentPrice,
      original_price: p.originalPrice,
      energy_label: p.energyLabel,
      rating: p.rating,
      review_count: p.reviewCount,
      in_stock: p.inStock,
      is_same_day_delivery: p.isSameDayDelivery,
      is_new: p.isNew,
      is_on_sale: p.isOnSale,
      is_hidden: false,
      short_description: p.shortDescription,
      features: p.features,
      specs: p.specs,
      image_primary: p.images.primary,
      image_fallback: p.images.fallback,
      sort_order: i,
    };
  });

  const { error: prodErr } = await supabase
    .from('sbs_products')
    .upsert(productsToInsert, { onConflict: 'slug' });
  if (prodErr) throw prodErr;
  console.log(`  ✓ ${productsToInsert.length} products`);

  // Verificatie
  const { count } = await supabase
    .from('sbs_products')
    .select('id', { count: 'exact', head: true });
  console.log(`\n✓ Done. Totaal in DB: ${count} products`);
}

main().catch((err) => {
  console.error('✗ Seed faalde:', err);
  process.exit(1);
});
