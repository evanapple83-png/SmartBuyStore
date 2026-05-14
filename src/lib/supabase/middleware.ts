/**
 * Supabase session refresh helper voor middleware.
 * Zorgt dat de session cookie ververst wordt bij elke request.
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Haal de rol op uit sbs_profiles voor route-gating
  let role: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('sbs_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();
    role = profile?.is_active ? profile.role : null;
  }

  return { supabase, response, user, role };
}
