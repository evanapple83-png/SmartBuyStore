/**
 * Next.js middleware — auth + role-based route protection.
 *
 * Beschermingsregels:
 *   /admin/*          → vereist session + rol in (admin, staff, delivery)
 *   /admin/instellingen, /admin/accounts → admin only
 *   /admin/bezorgplanning  → delivery (+ admin/staff for oversight)
 *   /account/*        → vereist session
 *   /account/login, /account/register, /account/wachtwoord-vergeten → publiek
 *   /api/webhook/*    → publiek (security via re-fetch in handler)
 *   Alle andere       → publiek
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const PUBLIC_ACCOUNT_PATHS = [
  '/account/login',
  '/account/register',
  '/account/wachtwoord-vergeten',
  '/account/wachtwoord-resetten',
  '/account/verifieer',
];

const ADMIN_ONLY_PATHS = ['/admin/instellingen', '/admin/accounts'];
const DELIVERY_PATHS = ['/admin/bezorgplanning'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user, role } = await updateSession(request);

  // /admin/* → must be authenticated + role admin/staff/delivery
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!role || role === 'customer') {
      const url = request.nextUrl.clone();
      url.pathname = '/account';
      return NextResponse.redirect(url);
    }
    // Admin-only paths
    if (ADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p)) && role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
    // Delivery-only zone: bezorger ziet niets anders dan /admin/bezorgplanning
    if (role === 'delivery' && !DELIVERY_PATHS.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/bezorgplanning';
      return NextResponse.redirect(url);
    }
  }

  // /account/* (behalve publieke auth-routes) → must be authenticated
  if (pathname.startsWith('/account') && !PUBLIC_ACCOUNT_PATHS.includes(pathname)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/account/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Ingelogde admin/staff/delivery die op /account/login komt → redirect naar /admin
  if (user && role && role !== 'customer' && PUBLIC_ACCOUNT_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  // Ingelogde klant die op /account/login komt → redirect naar /account
  if (user && role === 'customer' && PUBLIC_ACCOUNT_PATHS.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/account';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match alles BEHALVE:
     * - _next/static (statische assets)
     * - _next/image (image optimalisatie)
     * - favicon.ico
     * - publieke statische bestanden in /public
     * - /api/webhook/* (laten passeren zonder auth check)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
