# FASE 3 — UX & schermen

## Adminstructuur

Eén `/admin/*` route-tree, sticky linkernavigatie + topbar met huidige gebruiker + rol. Verschillende rollen zien verschillende menu-items. Alles Nederlandstalig, alle risico-acties met expliciete bevestiging.

```
/admin                          → Dashboard
/admin/bestellingen             → Bestellingen lijst
/admin/bestellingen/[id]        → Bestelling detail
/admin/klanten                  → Klanten lijst
/admin/klanten/[id]             → Klant detail
/admin/producten                → Producten lijst
/admin/producten/nieuw          → Product toevoegen
/admin/producten/[id]           → Product bewerken
/admin/categorieen              → Categorieën
/admin/kortingscodes            → Kortingscodes
/admin/facturen                 → Facturenlijst
/admin/e-mailtemplates          → E-mailtemplates
/admin/accounts                 → Team beheer            (admin only)
/admin/instellingen             → Instellingen           (admin only)
/admin/bezorgplanning           → Bezorgplanning         (delivery only)
```

Menu zichtbaarheid per rol:
- **Admin**: alles
- **Staff**: Dashboard, Bestellingen, Klanten, Producten, Categorieën, Kortingscodes, Facturen
- **Delivery**: alleen Bezorgplanning

## ADMIN — Schermbeschrijvingen

### 1. Dashboard (`/admin`)
**Doel:** in één oogopslag de status van vandaag zien.

- 4 statkaarten bovenaan: nieuwe bestellingen vandaag, te bezorgen vandaag, omzet vandaag (excl. btw), onbetaalde bestellingen > 24u
- Tabel: laatste 10 bestellingen
- Lage voorraad lijst (later)
- Snelle acties: "Nieuw product", "Bekijk alle bestellingen"

**Foutpreventie:** statkaarten read-only. Alleen "Nieuw product" is een create-actie.

### 2. Bestellingen (`/admin/bestellingen`)
**Doel:** alle bestellingen overzien, filteren, status aanpassen.

**Kolommen:** bestelnummer, klant, datum, totaal incl. btw, betaalstatus (🟢/🟡/🔴), bezorgstatus, actie "Openen".

**Filters:** periode, status, zoekveld, exporteren naar CSV (alleen admin).

**Foutpreventie:** geen bulk-acties in lijstweergave. Alleen "Openen" als actie.

### 3. Bestelling detail (`/admin/bestellingen/[id]`)
**Layout:** twee kolommen.

**Linkerkolom:**
- Bestelnummer + datum
- Statusbalk: pending_payment → paid → in_progress → planned_delivery → delivered → completed
- Bestelregels (snapshot, read-only)
- Totalen (subtotaal, korting, bezorgkosten, BTW, totaal)
- Betaalinformatie: Mollie-status (read-only), payment ID, betaaldatum. **Geen handmatige "Markeer als betaald"-knop**
- Bezorgsectie: methode, datum (datepicker), adres (snapshot, read-only), status-dropdown

**Rechterkolom:**
- Klant card (link naar profiel)
- Notities (intern + klant-notitie)
- Factuur card (download PDF)
- Statuslogboek (audit trail)

**Acties:** Bestelling annuleren (modal met dubbele bevestiging), notitie toevoegen.

**Foutpreventie:**
- Betaalstatus niet bewerkbaar
- Bezorgdatum niet in verleden
- Status alleen voorwaarts
- Annuleren = expliciete modal
- "Verwijderen" bestaat niet

### 4. Klanten (`/admin/klanten`)
**Kolommen:** naam, email, aantal bestellingen, totale omzet lifetime, laatste bestelling, acties.

**Filters:** zoek op naam/email, "heeft bestellingen" / "nog niets besteld".

**Foutpreventie:** geen bulk-delete. Default sortering op "laatste bestelling".

### 5. Klant detail (`/admin/klanten/[id]`)
**Layout:** linker = klantinfo, rechter = bestellingen.

- Naam, email, telefoon
- Adressen (lijst — meerdere toegestaan)
- Account-status: actief/inactief
- Verwijderen-knop:
  - Bij ≥ 1 bestelling: **uitgeschakeld** met tooltip "Klanten met bestellingen kunnen niet worden verwijderd (boekhoudkundige reden)"
  - Bij 0 bestellingen: wel beschikbaar, met bevestigingsmodal

**Foutpreventie:** structureel beschermd via FK + UI. Email aanpassen → waarschuwing.

### 6. Producten (`/admin/producten`)
**Kolommen:** foto, naam + merk, categorie, prijs, voorraad-indicator, status (zichtbaar/verborgen), acties.

**Filters:** categorie, merk, zichtbaarheid, zoek.

**Acties:** bewerken, verbergen/zichtbaar-toggle. **Geen verwijder-knop**.

### 7. Product detail / bewerken (`/admin/producten/[id]`)
**Tabbed interface:**
- Tab 1 — Basis: naam, kort-naam, slug (auto), merk, categorie, korte beschrijving
- Tab 2 — Prijs: huidige prijs, originele prijs, BTW-tarief
- Tab 3 — Foto's: upload + sorteer + alt-tekst
- Tab 4 — Specificaties: key-value rijen
- Tab 5 — Voorraad & levering: op voorraad, same-day delivery, energielabel
- Tab 6 — Zichtbaarheid: groot toggle met uitleg

**Sticky onderaan:** Opslaan, Annuleren (met waarschuwing bij onopgeslagen wijzigingen), Verbergen.

**Foutpreventie:**
- Slug-wijziging → waarschuwing over URL-impact
- Prijs €0 → bevestigingsmodal
- Hard-delete bestaat niet in UI

### 8. Categorieën (`/admin/categorieen`)
Lijst met drag-and-drop voor sortering. Inline edit voor naam + actief-status.

**Bij inactief maken:** bevestiging met preview welke producten geraakt worden.

**Foutpreventie:** Categorie met producten = niet hard-verwijderbaar.

### 9. Kortingscodes (`/admin/kortingscodes`)
**Lijst:** code, type, waarde, geldig van/tot, gebruikt aantal, status.

**Bewerken:** code (auto-uppercase), type (% / vast), waarde, min-bestelbedrag, geldig van/tot, max-aantal-gebruik, actief.

**Foutpreventie:**
- **Bij percentage > 25%: waarschuwingsmodal** "Weet je zeker? Dit is een fors kortingspercentage."
- Eindatum na startdatum verplicht
- Verlopen codes lichtgrijs

### 10. Facturen (`/admin/facturen`)
**Kolommen:** factuurnummer, bestelnummer, klant, datum, totaal, BTW, status, download PDF.

**Filters:** jaar, maand, klant, zoek.

**Bulk-export:** maand als ZIP, CSV voor boekhouder.

**Foutpreventie:** geen bewerk-knop, geen verwijder-knop. Facturen onveranderlijk.

### 11. E-mailtemplates (`/admin/e-mailtemplates`)
Lijst van templates (één per status-overgang). Geen verwijderen, alleen bewerken.

**Bij bewerken:**
- Onderwerp + body HTML + body plain text
- Variabelen-helper (klikbaar om in te voegen)
- Preview met testdata
- "Verzend-test naar mezelf" knop

**Foutpreventie:**
- Onbestaande variabelen rood gemarkeerd vóór opslaan
- "Herstel naar standaard" per template
- Versie-historie (laatste 5)

### 12. Accounts (`/admin/accounts`) — admin only
Lijst met team-accounts. Kolom: naam, email, rol, actief, laatste login.

**Acties:** bewerken (naam, rol, actief), wachtwoord-reset, deactiveren (niet verwijderen).

**Nieuwe account:** email + naam + rol → invite-mail.

**Foutpreventie:**
- "Laatste admin"-bescherming
- Rolwijziging admin → staff: modal met uitleg verlies van rechten
- Email-wijziging: waarschuwing

### 13. Instellingen (`/admin/instellingen`) — admin only
**Tabbed:**
- **Bedrijf**: naam, adres, KvK, BTW-nummer, IBAN, contactgegevens, logo
- **Betalingen (Mollie)**: API-key (password-style), na opslaan **gemaskeerd** (`***laatste 4 chars`). Webhook URL read-only. Test/live toggle.
- **Bezorging**: same-day allowlist provincies, bezorgkosten, standaard bezorgduur
- **E-mail**: provider keuze (readonly ref), from-naam, from-adres, reply-to
- **Facturen**: factuurnummer-formaat, volgend nummer, standaard betaaltermijn

**Foutpreventie:**
- Mollie-key wordt nooit getoond na opslaan
- BTW-nummer aanpassen → waarschuwing over oude facturen
- Same-day allowlist leeg = niet opslaanbaar

### 14. Bezorgplanning (`/admin/bezorgplanning`) — delivery only
Vereenvoudigde view: tabs "Vandaag" en "Morgen".

Per bestelling card: bestelnummer + bedrag, adres (klik → Google Maps), klantnaam + telefoon, productlijst, klantnotitie, **één actie-knop**: "Markeer als bezorgd".

**Foutpreventie:**
- Bezorger kan NIETS anders aanpassen dan delivery-status
- Markeer als bezorgd = bevestigingsmodal (anti-vingerfout)

## KLANT — Schermbeschrijvingen

### 1. Registreren (`/account/register`)
**Velden:** voornaam, achternaam, e-mailadres, wachtwoord (min 8 chars, sterkte-meter), wachtwoord nogmaals, AVG-checkbox.

**Na submit:** verificatie-email + "Check je inbox".

**Foutpreventie:**
- Bestaand emailadres → "Er bestaat al een account... [Inloggen] of [Wachtwoord vergeten]"
- Real-time wachtwoord-validatie
- AVG-vinkje verplicht

### 2. Inloggen (`/account/login`)
**Velden:** email, wachtwoord, "onthoud me" checkbox, link "Wachtwoord vergeten?".

**Foutpreventie:**
- Generieke foutmelding (anti-enumeration)
- Na 5 mislukte pogingen: 15 min lockout
- Rate limit op email-niveau

### 3. Wachtwoord vergeten (`/account/wachtwoord-vergeten`)
**Stap 1:** email input → altijd "Als dit e-mailadres bekend is, sturen we een resetlink".

**Stap 2** (via link in email): nieuw wachtwoord + nogmaals.

**Foutpreventie:** reset-link 1 uur geldig.

### 4. Mijn gegevens (`/account`)
- Naam, e-mailadres, telefoon (allemaal bewerkbaar)
- "Wachtwoord wijzigen" knop → modal
- "Account verwijderen":
  - Bij bestellingen ≥ 1: uitgeschakeld met "Je hebt nog bestellingen — neem contact op voor anonimisering"
  - Bij 0: wel beschikbaar, dubbele bevestiging

**Foutpreventie:**
- Email-wijziging vereist verificatie via oud én nieuw adres
- Wachtwoord-wijziging vereist huidig wachtwoord

### 5. Mijn adressen (`/account/adressen`)
Lijst van max 5 adressen. Per adres: type, volledig adres, standaard ja/nee, acties.

**Toevoegen:** modal met velden + standaard-toggle.

**Foutpreventie:** standaard-adres niet verwijderbaar als enige.

### 6. Mijn bestellingen (`/account/bestellingen`)
**Kolommen:** bestelnummer, datum, totaal, status (🟡 Betaling verwerken / 🟢 Betaald / 🚚 Onderweg / ✅ Bezorgd / ❌ Geannuleerd), acties (Bekijken, Factuur).

**Detail-view:** bestelregels (read-only), statusbalk, totalen, bezorgadres + datum, klantnotitie, factuur-download, "Heb je een vraag?" link.

**Foutpreventie:**
- RLS: klant ziet alléén eigen bestellingen
- Geen "Annuleren" knop voor klant — alleen contact

### 7. Mijn facturen (`/account/facturen`)
**Kolommen:** factuurnummer, bestelnummer (link), datum, totaal, download PDF.

**Foutpreventie:** RLS + signed URLs (1 uur geldig).

## Globale UI-conventies

| Conventie | Detail |
|---|---|
| Taal | 100% Nederlands. Geen Engelse fallback. |
| Risico-acties | Modal met expliciete bevestiging en uitleg van gevolg |
| Onomkeerbare acties | Vermijden waar kan; soft-delete als standaard |
| Foutmeldingen | Menselijk taalgebruik + suggestie wat te doen |
| Loading states | Skeleton screens / spinners; nooit lege witte pagina |
| Empty states | Lege lijsten met nuttige melding |
| Toegankelijkheid | Aria-labels, focus-states zichtbaar, WCAG AA contrast |
| Mobiel | Admin werkt op tablet/telefoon; tabellen → cards op smal scherm |
| Persistent navigation | Sticky sidebar admin, vaste header klant |
| Audit-trail zichtbaar | Statuswijzigingen tonen wie + wanneer |

## Foutpreventie-samenvatting

| Actie | Bescherming |
|---|---|
| Klant verwijderen die bestellingen heeft | UI-knop disabled + DB FK |
| Product verwijderen | Knop bestaat niet — alleen "Verbergen" |
| Categorie verwijderen | Knop bestaat niet — alleen "Inactief" |
| Factuur bewerken/verwijderen | Knoppen bestaan niet — DB REVOKE UPDATE |
| Handmatige "Betaald"-status | Knop bestaat niet in UI |
| Laatste admin demoten/verwijderen | DB-trigger + UI-knop disabled |
| Kortingscode > 25% | Modal-bevestiging met uitleg |
| Bestelling annuleren (na betaling) | Modal: "Refund moet apart in Mollie" |
| Mollie API-key onthullen | Wordt gemaskeerd na opslaan |
| Bezorgdatum in verleden | Datepicker blokkeert |
| Status terugzetten (delivered → paid) | UI blokkeert — alleen voorwaarts |
| Email aanpassen door admin | Waarschuwing over login-impact |
| BTW-nummer aanpassen | Waarschuwing: oude facturen behouden oud nummer |
| Categorie inactief maken | Modal toont welke producten geraakt worden |
| Email-template typefout | Real-time validatie vóór opslaan |
| URL-manipulation door klant | RLS op DB-niveau |
| Markeren als bezorgd | Modal met bevestiging |
| Account verwijderen door klant met bestellingen | UI disabled + support-contact suggestie |

---

**Akkoord op deze fase ontvangen.** Doorgegaan naar FASE 4 — Implementatiebasis.
