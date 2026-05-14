/**
 * Supabase client voor Server Components, Server Actions en Route Handlers.
 * Leest/schrijft cookies via Next.js cookies() — werkt met @supabase/ssr.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getSupabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Components kunnen geen cookies zetten — niet erg, alleen Server Actions wel
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {}
        },
      },
    }
  );
}

/**
 * Service-role client — bypasst RLS. Alleen gebruiken in webhook-handlers,
 * cron-jobs, of bewust admin-side bewerkingen die anders niet door RLS heen komen.
 * NEVER expose this to client code.
 */
export function getSupabaseAdmin() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}
