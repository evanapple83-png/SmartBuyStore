# FASE 4 — Implementatiebasis

Eerste daadwerkelijke code-actie. Doel: source veilig, auth werkend, rollen & rechten in DB en in middleware, beide layouts (admin + klantaccount) klaar als skelet voor FASE 5–9.

## Wat is opgeleverd

### Stap 1 — Source veilig
- Bestaande front-end source uit `~/Downloads/dpl_DbYieYva16W3zDyQbmfqDJdQyZw3/src/` gekopieerd naar projectmap `~/Documents/Website SBSS Buy/smart-buy-store/`
- Git geïnitialiseerd met `main` branch
- Eerste commit: "Initial commit: front-end as starting point + phase 1-3 docs"
- Remote ingesteld naar `git@github.com:evanapple83-png/SmartBuyStore.git`
- ⚠️ Push naar GitHub moet handmatig door owner (credentials nodig)

### Stap 2 — Dependencies
Toegevoegd aan `package.json`:
- `@supabase/supabase-js` — Supabase client
- `@supabase/ssr` — server-side auth voor App Router
- `drizzle-orm` + `drizzle-kit` — type-safe ORM (komt in latere fases in volle gebruik)
- `postgres` — Postgres driver
- `dotenv` — env-handling

### Stap 3 — Supabase migratie 0001
Bestand: `supabase/migrations/0001_auth_and_profiles.sql`

Inhoud:
- `sbs_role` enum: `admin | staff | delivery | customer`
- `sbs_profiles` tabel (1-op-1 met `auth.users`)
- Trigger `on_auth_user_created`: maakt automatisch profile aan bij signup met rol `customer`
- Trigger `protect_last_admin`: voorkomt dat de laatste actieve admin gedeactiveerd of gedemoot wordt
- Trigger `sbs_touch_updated_at`: bijhouden `updated_at`
- RLS-policies:
  - Klanten zien/updaten alleen eigen profiel
  - Admins zien/updaten alle profielen
- Helper-functie `current_user_role()` voor convenience in latere queries

### Stap 4 — Supabase clients
- `src/lib/supabase/server.ts` — `getSupabaseServer()` voor Server Components/Actions + `getSupabaseAdmin()` met service-role key
- `src/lib/supabase/browser.ts` — `getSupabaseBrowser()` voor Client Components
- `src/lib/supabase/middleware.ts` — `updateSession()` helper voor route-bescherming

### Stap 5 — Middleware
Bestand: `src/middleware.ts`

Route-bescherming:
- `/admin/*` → vereist session + rol in (admin, staff, delivery). Klanten → redirect naar `/account`. Niet ingelogd → redirect naar `/account/login`.
- `/admin/instellingen` en `/admin/accounts` → alleen `admin`
- Delivery-rol kan alleen `/admin/bezorgplanning` zien
- `/account/*` (excl. publieke auth-routes) → vereist session
- `/api/webhook/*` → uitgesloten (security via re-fetch in handler)
- Auth-routes (`/account/login` etc.): redirect ingelogde users weg

### Stap 6 — Klantaccount layout + pagina's
- `src/app/account/layout.tsx` — sidebar met menu (Mijn gegevens, Adressen, Bestellingen, Facturen, Uitloggen)
- `src/app/account/page.tsx` — Mijn gegevens (read-only voor nu)
- `src/app/account/login/page.tsx` + `LoginForm.tsx` — inloggen met generieke foutmelding (anti-enumeration)
- `src/app/account/register/page.tsx` + `RegisterForm.tsx` — account aanmaken met AVG-vinkje + wachtwoord-bevestiging
- `src/app/account/wachtwoord-vergeten/page.tsx` + form — anti-enumeration "als email bekend is..."

### Stap 7 — Logout API route
- `src/app/api/auth/logout/route.ts` — POST → signOut + redirect naar homepage

### Stap 8 — Admin layout (skelet)
- `src/app/admin/layout.tsx` — sidebar met rol-gebaseerd menu
- `src/app/admin/page.tsx` — dashboard placeholder met 4 stat-cards (waarden komen in FASE 6)

### Stap 9 — env-template
- `.env.example` — alle benodigde environment variabelen gedocumenteerd

### Stap 10 — Type-check
- `npx tsc --noEmit` → schoon
- Commit gemaakt: "FASE 4: implementatiebasis — Supabase auth, middleware, admin + account layouts"

## Wat staat klaar voor de volgende fase

| Component | Status |
|---|---|
| Auth-flow (registreren, inloggen, wachtwoord vergeten, uitloggen) | Werkend, alleen Supabase-keys nodig |
| Rollen + RLS in database | Gedefinieerd, klaar om uit te breiden per resource |
| Middleware route-bescherming | Volledig dekkend voor /admin en /account |
| Admin sidebar met menu | Gerenderd, alle links bestaan (pagina-content komt in FASE 5–9) |
| Klantaccount sidebar met menu | Idem |
| Last-admin protection | DB-trigger werkt |
| Auto-profile-bij-signup | DB-trigger werkt |

## Wat de eigenaar nu moet doen om lokaal te draaien

1. **Supabase project aanmaken**
   - Ga naar https://supabase.com → New project
   - Naam: `smartbuystore`
   - Region: West Europe (Frankfurt)
   - DB password kiezen + bewaren

2. **SQL migratie draaien**
   - Supabase Studio → SQL Editor → New query
   - Plak inhoud van `supabase/migrations/0001_auth_and_profiles.sql`
   - Run

3. **Env vars instellen**
   - Kopieer `.env.example` naar `.env.local`
   - Vul `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `SUPABASE_SERVICE_ROLE_KEY` in (uit Supabase → Project Settings → API)

4. **Eerste admin aanmaken**
   - Start lokaal: `npm run dev`
   - Open http://localhost:3000/account/register en maak een account aan
   - Open Supabase Studio → Table editor → `sbs_profiles`
   - Verander de rij van die user: `role` van `customer` naar `admin`
   - Log opnieuw in → je komt direct in `/admin`

5. **Push source naar GitHub** (eenmalig)
   ```
   cd "~/Documents/Website SBSS Buy/smart-buy-store"
   git remote set-url origin https://github.com/evanapple83-png/SmartBuyStore.git
   git push -u origin main
   ```

## Wat NOG NIET gebouwd is (komt in latere fases)

- Productbeheer in admin → FASE 5
- Categoriebeheer in admin → FASE 5
- Klantbeheer in admin → FASE 5
- Bestelbeheer + audit trail → FASE 6
- Cart-pagina + checkout-flow → FASE 6
- Mollie betalingen → FASE 7
- Facturen → FASE 8
- E-mailtemplates + automatische mails → FASE 9
- Tests + handleiding → FASE 10

---

**Akkoord op deze fase ontvangen.** Doorgegaan naar FASE 5 — Producten, categorieën en klanten.
