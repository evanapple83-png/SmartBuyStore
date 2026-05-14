# FASE 6 — Bestellingen en klantaccounts

End-to-end orderflow zonder Mollie. Cart, checkout, admin bestelbeheer, klantbestellingen, statuslog, claim-by-email — alles werkend en gedeployed.

## Wat is opgeleverd

### Database — migratie 0004
Bestand: `supabase/migrations/0004_orders.sql`

- Enums `sbs_order_status` (8 waarden) en `sbs_delivery_method`
- Tabellen:
  - `sbs_addresses` — bezorg-/factuuradressen per klant
  - `sbs_orders` — bestellingen met **snapshots** voor customer + shipping + billing
  - `sbs_order_items` — regels met product-snapshot (overleeft prijs/naamwijzigingen)
  - `sbs_order_status_log` — append-only audit trail
- Sequence + helper `next_order_number()` → `SBS-{YEAR}-{####}` formaat
- Trigger `sbs_log_order_status()` — logt automatisch elke status-overgang met user_id
- Functie `claim_guest_orders_by_email()` (SECURITY DEFINER) — koppelt guest-orders aan account op email match
- RLS-policies: klant ziet eigen, admin/staff/delivery ziet alles, guest checkout via anon-rol toegestaan

### Server actions (`src/lib/db/order-actions.ts`)
- `createOrder(input)` — valideert, berekent btw + totalen, INSERT order + items via admin-client, returnt `{ orderId, orderNumber }`
- `updateOrderStatus(orderId, toStatus, options?)` — transitie-validatie, rolcheck, productie-veilige `paid`-gating
- `setOrderDeliveryDate(orderId, date)` — datum-validatie (geen verleden)
- `isSameDayEligible(postcode)` — postcode-prefix → provincie lookup voor same-day
- `claimGuestOrders()` — wrapper rond RPC, idempotent

### Cart (`/winkelwagen`)
Volledige UI rond de bestaande `useCart` localStorage hook:
- Product-rows met qty +/- en verwijder-knop
- Sticky summary-card met subtotaal + gratis bezorging + totaal
- Lege-staat met "Verder winkelen" CTA
- Doorklik naar `/checkout`

### Checkout (`/checkout`)
Eén-pagina form, server-side prefill voor ingelogde users:
- Contactgegevens (naam, email, telefoon)
- Bezorgadres (straat, postcode, plaats)
- **Live postcode-check** voor same-day delivery (groen ✓ / amber ⚠ feedback)
- Bezorgmethode-keuze (radio): standaard vs same-day (laatste disabled buiten provincie-zone)
- Datepicker (min = morgen) voor reguliere bezorging
- Notitie-veld voor de bezorger
- AVG-verplicht-vinkje
- Sticky order-summary
- Submit → `createOrder` → wist cart → redirect naar `/checkout/bevestiging?order=...`

### Bevestigingspagina (`/checkout/bevestiging`)
Toont bestelnummer + tijdelijke melding "betaling volgt nog" (totdat Mollie er in FASE 7 is). Links naar Mijn bestellingen + homepage.

### Admin dashboard (`/admin`)
Niet meer placeholders — echte stats uit DB:
- Nieuwe bestellingen vandaag
- Te bezorgen vandaag
- Omzet vandaag (excl. btw)
- Onbetaald > 24 uur (amber kleur als > 0)
- Tabel met laatste 10 bestellingen + status-labels

### Admin bestellingen (`/admin/bestellingen` + `/[id]`)
- Lijstpagina met gekleurde status-badges per type, klikbare rijen
- Detailpagina:
  - Bestelnummer + status badge
  - Bestelregels (tabel met snapshot-data)
  - Totalen overzicht
  - **Statuslogboek** — visueel timeline met from→to, wie, wanneer, optionele note
  - Klant-card (mailto link, indicator account/gast)
  - Bezorgadres-card (snapshot)
  - Notitie-van-klant card (alleen als gevuld)
  - **Statuscontroles**:
    - Bezorgdatum-aanpasser (datepicker, min vandaag)
    - Knoppen voor toegestane transities (geen bulk, geen "naar paid" als Mollie configured)
    - **TEST-modus**: zonder `MOLLIE_API_KEY` mag admin handmatig op betaald zetten via aparte knop met dubbele bevestiging (vervalt in FASE 7)
    - Bevestigingsmodals voor annuleren / terugbetalen / paid

### Klantaccount bestellingen (`/account/bestellingen` + `/[id]`)
- Lijstpagina met klant-vriendelijke labels (🟡 Betaling verwerken / 🟢 Betaald / 🚚 Onderweg / ✅ Bezorgd / ❌ Geannuleerd)
- Detailpagina met dezelfde data als admin, maar zonder admin-acties
- Server-side double check op `order.user_id === user.id` (defense-in-depth bovenop RLS)
- **Automatische claim-by-email**: bij elke pagina-load wordt `claim_guest_orders_by_email()` RPC aangeroepen — koppelt orders met user_id=null waarvan `customer_snapshot.email` matcht

## Foutpreventies geïmplementeerd

| Acceptatiecriterium | Implementatie |
|---|---|
| Klanten zien alleen eigen bestellingen | RLS policy + extra server-check in /account/bestellingen/[id] |
| "Betaald" alleen via Mollie webhook | Server action weigert handmatige transitie naar `paid` als `MOLLIE_API_KEY` is gezet. In TEST (zonder Mollie) is er een aparte knop met dubbele bevestiging. |
| Geen status-terugsteps | `VALID_TRANSITIONS` map in order-actions: alleen vooruit (delivered → paid kan niet) |
| Bezorgdatum niet in verleden | Datepicker `min` attribute + server-side validatie |
| Annuleren = expliciete bevestiging | Modal in `OrderStatusControls` met uitleg "Klant ontvangt mail, refund apart in Mollie" |
| Audit trail compleet | DB-trigger op INSERT/UPDATE registreert automatisch elke status-wijziging met user_id |
| Same-day delivery alleen in 6 provincies | Postcode-prefix check in `isSameDayEligible()` + UI disabled radio + server-side weigering |
| Guest checkout → claim bij login | Functie `claim_guest_orders_by_email()` matched op lowercase email |
| Snapshot patroon | customer/shipping/billing/items allemaal als JSONB snapshots opgeslagen — overleven product/klant-wijzigingen |
| Geen handmatige "Markeer als betaald" in productie | Server action weigert het, UI verbergt knop |

## Build + deploy
- Type-check: schoon
- `npm run build`: 21 routes compileren (was 16 in FASE 5)
- Commit: `FASE 6: bestellingen + klantaccount + checkout + admin bestelbeheer + statuslog`
- Productie deploy: smart-buy-store.vercel.app — alle nieuwe routes geverifieerd live

## Test-flow end-to-end

1. Open https://smart-buy-store.vercel.app → klik op een product → "In winkelmand"
2. Open `/winkelwagen` → verhoog aantal, verwijder, etc. (alles localStorage)
3. Klik "Doorgaan naar afrekenen" → `/checkout`
4. Vul de form in. Probeer postcode `8011 PV` (Zwolle, Overijssel) → same-day groen ✓. Probeer `1011 AB` (Amsterdam) → same-day rood ⚠.
5. Plaats bestelling → bevestigingspagina met bestelnummer
6. Log in als admin → `/admin` toont stat "Nieuwe bestellingen vandaag: 1"
7. `/admin/bestellingen` → klik op de bestelling
8. Status-knoppen werken sequentieel (pending → paid (TEST) → in_progress → planned_delivery → delivered → completed)
9. Audit trail vult zich automatisch — zichtbaar in detail-pagina
10. Log uit + als klant in → `/account/bestellingen` toont je bestelling (gekoppeld via claim-by-email)

## Wat NOG NIET in deze fase zit (komt in FASE 7-9)

- Mollie betalingen (FASE 7) — checkout submit "wacht op betaling" tot Mollie webhook er is
- Automatische facturen (FASE 8)
- Automatische e-mails per status-overgang (FASE 9) — nu krijgt de klant geen mail bij bestelling
- Klant kan zelf annuleren (komt niet — alleen via support)
- Adressenboek `/account/adressen` — slim weggelaten, klant vult per checkout in
- Voorraadcheck bij checkout submit
- Productfoto-upload (komt in FASE 10)

---

**Akkoord op deze fase ontvangen.** Doorgegaan naar FASE 7 — Mollie betalingen.
