'use server';

import { getSupabaseAdmin } from '@/lib/supabase/server';
import { ensureAdminOrStaff } from './admin-guard';

const BUCKET = 'product-images';
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function slugifyName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '').slice(-60);
}

/**
 * Upload van een productfoto naar Supabase Storage (publieke bucket).
 * Loopt via de service-role-client (RLS-bypass). Geeft de publieke URL terug.
 */
export async function uploadProductImage(
  formData: FormData
): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    await ensureAdminOrStaff();
  } catch (e: any) {
    return { ok: false, error: e.message || 'Geen toestemming' };
  }

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Geen bestand ontvangen.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'Afbeelding is te groot (max. 6 MB).' };
  }
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: 'Gebruik een JPG, PNG, WEBP of AVIF.' };
  }

  const admin = getSupabaseAdmin();
  // unieke, nette bestandsnaam
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `products/${Date.now()}-${rand}-${slugifyName(file.name) || 'foto.jpg'}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
    cacheControl: '31536000',
  });
  if (error) {
    const msg = /bucket not found/i.test(error.message)
      ? 'De opslag-bucket ontbreekt nog. Draai migratie 0010 in Supabase.'
      : error.message;
    return { ok: false, error: msg };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
