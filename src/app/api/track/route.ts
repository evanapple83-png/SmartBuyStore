/**
 * First-party paginaweergave-tracking. Wordt alleen aangeroepen door de
 * client-tracker ná analytics-consent. Schrijft één rij in sbs_page_views.
 * Geen PII: visitor_id is een willekeurige, niet-herleidbare id.
 */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function clip(v: unknown, max: number): string | null {
  if (typeof v !== 'string' || !v) return null;
  return v.slice(0, max);
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = clip(body.path, 300);
  if (!path || !path.startsWith('/')) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const row = {
    path,
    referrer: clip(body.referrer, 300),
    visitor_id: clip(body.visitorId, 64),
    session_id: clip(body.sessionId, 64),
    device: ['mobile', 'tablet', 'desktop'].includes(body.device) ? body.device : null,
    product_slug: path.startsWith('/product/') ? clip(path.replace('/product/', ''), 120) : null,
  };

  try {
    await getSupabaseAdmin().from('sbs_page_views').insert(row);
  } catch {
    // tracking mag nooit een fout aan de bezoeker tonen
  }
  return NextResponse.json({ ok: true });
}
