'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServer, getSupabaseAdmin } from '@/lib/supabase/server';
import { ensureAdminOrStaff } from './admin-guard';

const PAID = ['paid', 'in_progress', 'planned_delivery', 'delivered', 'completed'];

export async function submitReview(input: {
  productId: string;
  productSlug?: string;
  rating: number;
  title?: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Log in om een review te plaatsen.' };

  const rating = Math.round(Number(input.rating));
  if (!(rating >= 1 && rating <= 5)) return { ok: false, error: 'Kies 1 t/m 5 sterren.' };
  const body = String(input.body || '').trim();
  if (body.length < 10) return { ok: false, error: 'Schrijf een iets uitgebreider review (min. 10 tekens).' };

  // Al een review van deze gebruiker voor dit product?
  const { data: existing } = await supabase
    .from('sbs_reviews').select('id').eq('product_id', input.productId).eq('user_id', user.id).limit(1);
  if ((existing ?? []).length > 0) return { ok: false, error: 'Je hebt dit product al beoordeeld.' };

  // Geverifieerd = heeft het product daadwerkelijk gekocht.
  const { data: orders } = await supabase
    .from('sbs_orders').select('id, sbs_order_items(product_id)').eq('user_id', user.id).in('status', PAID);
  const hasBought = (orders ?? []).some((o: any) => (o.sbs_order_items ?? []).some((it: any) => it.product_id === input.productId));

  const { data: profile } = await supabase.from('sbs_profiles').select('full_name').eq('id', user.id).single();

  const { error } = await supabase.from('sbs_reviews').insert({
    product_id: input.productId,
    user_id: user.id,
    author_name: (profile?.full_name || 'Klant').slice(0, 80),
    rating,
    title: String(input.title || '').trim().slice(0, 120) || null,
    body: body.slice(0, 2000),
    is_verified: hasBought,
    status: 'pending',
  });
  if (error) return { ok: false, error: error.message };

  if (input.productSlug) revalidatePath(`/product/${input.productSlug}`);
  return { ok: true };
}

// ─── Moderatie (admin/staff) ──────────────────────────────────────────────────

export async function setReviewStatus(id: string, status: 'published' | 'rejected' | 'pending'): Promise<{ ok: boolean; error?: string }> {
  try { await ensureAdminOrStaff(); } catch (e: any) { return { ok: false, error: e.message }; }
  const { error } = await getSupabaseAdmin().from('sbs_reviews').update({ status }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function deleteReview(id: string): Promise<{ ok: boolean; error?: string }> {
  try { await ensureAdminOrStaff(); } catch (e: any) { return { ok: false, error: e.message }; }
  const { error } = await getSupabaseAdmin().from('sbs_reviews').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin/reviews');
  return { ok: true };
}
