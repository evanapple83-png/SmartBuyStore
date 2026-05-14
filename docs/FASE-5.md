# FASE 5 — Producten, categorieën, klanten

Eerste echte CRUD-fase: catalog komt uit Supabase, admin kan beheren, klantkant leest direct uit DB.

## Wat is opgeleverd

### Database (migratie 0002)
Bestand: `supabase/migrations/0002_catalog.sql`

Toegevoegd:
- `sbs_brands` (id, slug, name, logo_url, is_active, sort_order)
- `sbs_categories` (id, slug, name, description, parent_id, is_active, sort_order)
- `sbs_products` (id, slug, name, short_name, brand_id FK, category_id FK, current_price, original_price, btw_rate, energy_label, rating, review_count, in_stock, is_same_day_delivery, is_new, is_on_sale, **is_hidden** (soft-delete), short_description, features[], specs JSONB, image_primary, image_fallback, sort_order)
- Indexes voor performance (category, brand, visibility, sale)
- Updated_at-triggers op alle drie tabellen
- RLS:
  - Publiek leest alleen `is_active=true` brands/categories en `is_hidden=false` products
  - Admin/staff: volledige CRUD via policy-check op `sbs_profiles.role`

### Seed data
Bestand: `scripts/seed-catalog.ts` (runbaar via `npx tsx scripts/seed-catalog.ts`)

Idempotent (upsert op slug): 10 brands + 5 categories + 8 products uit `src/data/*` naar DB.

### DB helpers
- `src/lib/db/catalog.ts` — server-side queries voor producten/categorieën/merken (public + admin variants)
- `src/lib/db/customers.ts` — klanten ophalen via admin-client (joined met auth.users voor email + last_sign_in)
- `src/lib/db/product-actions.ts` — Server Actions: createProduct, updateProduct, toggleProductHidden, upsertCategory, toggleCategoryActive, updateCustomerProfile
- `src/lib/db/product-mapper.ts` — DB-rij (snake_case) → bestaand `Product`-type (camelCase) zodat UI-components onveranderd blijven

### Admin pagina's

| Route | Inhoud | Foutpreventies |
|---|---|---|
| `/admin/producten` | Lijst met filters, kolommen, status-badges | Geen bulk-actions, geen verwijder-knop |
| `/admin/producten/nieuw` | Form: basis, prijs, foto's, voorraad/levering, zichtbaarheid | €0 prijs vereist dubbele bevestiging; verplichte velden gemarkeerd |
| `/admin/producten/[id]` | Bewerken-form | Slug auto-gegenereerd uit naam |
| `/admin/categorieen` | Lijst met inline edit-modal | Inactief maken toont waarschuwing met aantal getroffen producten |
| `/admin/klanten` | Lijst echte klanten (rol=customer) | Geen verwijder-actie in lijst |
| `/admin/klanten/[id]` | Detail + edit naam/telefoon/actief | "Klant verwijderen" knop **disabled** als `order_count > 0`; tooltip met uitleg |

### Public pagina's nu DB-driven

Veranderd van static `src/data/products.ts` naar Supabase met ISR (60s):

| Route | Wijziging |
|---|---|
| `/` (homepage) | Async server component, geeft products door aan `<ProductSection products>` + `<DealsBanner products>` |
| `/categorie/[slug]` | Async, query op DB met category-slug filter |
| `/product/[slug]` | Async, single-product query + related-by-category |
| `/aanbiedingen` | Async, query op `is_on_sale=true` |
| `/winkel` | Server-side fetch + `<WinkelClient>` voor de filter-state (page→client split) |

**Resultaat:** een product toevoegen in admin verschijnt binnen 60 seconden vanzelf op homepage en categoriepagina's. Verbergen idem.

### Bestaande UI-components (onveranderd)
ProductCard, ProductGrid, ProductDetail, HeroSection, USPStrip, CategoryGrid, BrandScroller, TrustSection, ReviewsSection, NewsletterSection, CountdownTimer, EnergyLabel, PriceDisplay, StarRating — geen wijziging. Mapper zorgt dat de DB-shape al getransformeerd is naar het bestaande `Product`-type.

## Foutpreventies geïmplementeerd

| Acceptatiecriterium | Implementatie |
|---|---|
| Producten verbergen ipv verwijderen | `is_hidden` boolean. Geen DELETE-knop in admin. Verberg-toggle via `ProductRowActions`. |
| Categorieën inactief maken ipv verwijderen | `is_active` boolean. Bij deactiveren: modal met productentelling. |
| Klanten niet verwijderen als bestellingen | DB-trigger volgt in FASE 6, UI-knop is nu al disabled gebaseerd op order-count check. Tooltip legt uit waarom. |
| Slug-conflict | Server action vangt unique-constraint en geeft Nederlandse melding "Slug bestaat al". |
| Prijs negatief | DB check-constraint + server-side validatie. |
| Prijs €0 | Dubbele bevestiging in UI (toont waarschuwing, gebruiker klikt nogmaals submit). |
| Energy label outside A-F | DB check-constraint. |
| Niet-ingelogde admin-toegang | Middleware redirect; server actions checken sessie + rol. |

## Build + deploy

- Type-check: schoon
- `npm run build`: 16 routes, alles compileert
- 3 commits op `main`:
  - `FASE 5: productbeheer + categoriebeheer + klantbeheer in admin (DB schema + admin CRUD)`
  - `FASE 5: public pages lezen uit DB + admin-toevoegingen direct zichtbaar (ISR 60s)`
- Productie deploy: smart-buy-store.vercel.app

## Verificatie (eenmalig handmatig)

1. Log in als admin op `/admin`
2. Open `/admin/producten` — je ziet de 8 geseed producten
3. Klik "Nieuw product" → vul naam + prijs + categorie → opslaan
4. Open op een nieuw tabblad de homepage of `/winkel` — nieuw product verschijnt binnen 60 seconden
5. Verberg een product via de "Verbergen"-knop — verdwijnt van klantkant
6. Open `/admin/categorieen` — probeer een categorie inactief te maken, je ziet de modal met aantallen
7. Open `/admin/klanten` → klik op je eigen account → verwijder-knop is correct disabled

## Wat NOG NIET in deze fase zit

- Productfoto's uploaden via admin (nu alleen URL-input). Komt later — Supabase Storage integratie.
- Productspecs editor (key-value editor). Nu kun je specs alleen via DB-direct of seed bewerken.
- Drag-and-drop voor sortering van categorieën. Nu alleen via numeriek sort_order veld.
- Pagination of zoekfunctie op `/admin/producten` (8 producten is geen issue, wordt issue bij 100+).
- Beheer-paneel voor merken (`sbs_brands`). Alleen via seed of DB-direct.

Alle drie items gepland voor FASE 10 (afronding) of als losse offerte na go-live.

---

**Akkoord op deze fase ontvangen.** Doorgegaan naar FASE 6 — Bestellingen en klantaccounts.
