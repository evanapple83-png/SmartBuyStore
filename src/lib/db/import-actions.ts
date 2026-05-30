'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ensureAdminOrStaff } from './admin-guard';

export type ImportResult = {
  ok: boolean;
  error?: string;
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
};

function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

/** Minimale, robuuste CSV-parser (ondersteunt quotes, komma's en ; als scheidingsteken). */
function parseCsv(text: string): string[][] {
  text = text.replace(/^﻿/, ''); // BOM weg
  const delim = (text.split('\n')[0].match(/;/g)?.length || 0) > (text.split('\n')[0].match(/,/g)?.length || 0) ? ';' : ',';
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === delim) { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const NUM = (v: string) => { const n = Number(String(v).replace(',', '.').replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n; };
const BOOL = (v: string) => /^(ja|yes|true|1|x)$/i.test(String(v).trim());

export async function importProducts(formData: FormData): Promise<ImportResult> {
  const base: ImportResult = { ok: false, created: 0, updated: 0, errors: [] };
  try {
    await ensureAdminOrStaff();
  } catch (e: any) {
    return { ...base, error: e.message || 'Geen toestemming' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { ...base, error: 'Geen CSV-bestand ontvangen.' };
  if (file.size > 4 * 1024 * 1024) return { ...base, error: 'Bestand te groot (max. 4 MB).' };

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { ...base, error: 'CSV bevat geen datarijen.' };

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const iName = col('name'); const iPrice = col('current_price');
  if (iName < 0 || iPrice < 0) {
    return { ...base, error: "CSV mist verplichte kolommen 'name' en 'current_price'. Download het voorbeeldbestand." };
  }
  const idx = {
    name: iName, sku: col('sku'), slug: col('slug'), brand: col('brand'), category: col('category'),
    current_price: iPrice, original_price: col('original_price'), stock_count: col('stock_count'),
    short_description: col('short_description'), energy_label: col('energy_label'), is_hidden: col('is_hidden'),
  };

  const admin = getSupabaseAdmin();
  const [{ data: brands }, { data: cats }] = await Promise.all([
    admin.from('sbs_brands').select('id, slug, name'),
    admin.from('sbs_categories').select('id, slug, name'),
  ]);
  const brandMap = new Map<string, string>();
  for (const b of brands ?? []) { brandMap.set(b.slug.toLowerCase(), b.id); brandMap.set(b.name.toLowerCase(), b.id); }
  const catMap = new Map<string, string>();
  for (const c of cats ?? []) { catMap.set(c.slug.toLowerCase(), c.id); catMap.set(c.name.toLowerCase(), c.id); }

  const result: ImportResult = { ...base, ok: true };
  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');

  for (let ri = 1; ri < rows.length; ri++) {
    const r = rows[ri];
    const rowNum = ri + 1;
    const name = get(r, idx.name);
    if (!name) { result.errors.push({ row: rowNum, message: 'Naam ontbreekt' }); continue; }
    const price = NUM(get(r, idx.current_price));
    if (price === null || price < 0) { result.errors.push({ row: rowNum, message: 'Ongeldige prijs' }); continue; }

    const sku = get(r, idx.sku) || null;
    const slug = get(r, idx.slug) || slugify(name);
    const brandRaw = get(r, idx.brand).toLowerCase();
    const catRaw = get(r, idx.category).toLowerCase();
    const origPrice = NUM(get(r, idx.original_price));
    const stock = idx.stock_count >= 0 ? Math.max(0, Math.floor(NUM(get(r, idx.stock_count)) ?? 0)) : 0;
    const energy = get(r, idx.energy_label).toUpperCase();

    const fields: any = {
      name,
      short_name: name.slice(0, 80),
      sku,
      slug,
      current_price: price,
      original_price: origPrice,
      stock_count: stock,
      in_stock: stock > 0,
      brand_id: brandRaw ? brandMap.get(brandRaw) ?? null : null,
      category_id: catRaw ? catMap.get(catRaw) ?? null : null,
      short_description: get(r, idx.short_description) || null,
      energy_label: ['A', 'B', 'C', 'D', 'E', 'F'].includes(energy) ? energy : null,
      is_hidden: idx.is_hidden >= 0 ? BOOL(get(r, idx.is_hidden)) : false,
    };

    // Bestaand product zoeken: eerst op sku, anders op slug.
    let existingId: string | null = null;
    if (sku) {
      const { data } = await admin.from('sbs_products').select('id').eq('sku', sku).maybeSingle();
      existingId = data?.id ?? null;
    }
    if (!existingId) {
      const { data } = await admin.from('sbs_products').select('id').eq('slug', slug).maybeSingle();
      existingId = data?.id ?? null;
    }

    if (existingId) {
      const { error } = await admin.from('sbs_products').update(fields).eq('id', existingId);
      if (error) result.errors.push({ row: rowNum, message: error.message });
      else result.updated++;
    } else {
      const { error } = await admin.from('sbs_products').insert(fields);
      if (error) result.errors.push({ row: rowNum, message: error.message });
      else result.created++;
    }
  }

  revalidatePath('/admin/producten');
  revalidatePath('/');
  return result;
}
