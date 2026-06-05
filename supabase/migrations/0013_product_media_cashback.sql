-- Smart Buy Store · Migratie 0013 — Productmedia + cashback
-- ──────────────────────────────────────────────────────────
--   • sbs_products.images_extra    → extra productfoto's (galerij)
--   • sbs_products.brochure_url    → product-brochure (PDF, publieke storage-URL)
--   • sbs_products.cashback_amount → actief cashback-bedrag (null = geen cashback)
--   • sbs_products.cashback_label  → optionele toelichting (bv. 'via Samsung')
--
-- Idempotent: veilig om opnieuw te draaien.
-- Storage: brochures gebruiken de bestaande publieke bucket `product-images`
-- (map brochures/), dus geen nieuwe bucket nodig.

alter table public.sbs_products
  add column if not exists images_extra    text[]        not null default array[]::text[],
  add column if not exists brochure_url    text,
  add column if not exists cashback_amount numeric(10,2) check (cashback_amount is null or cashback_amount >= 0),
  add column if not exists cashback_label  text;

comment on column public.sbs_products.images_extra    is 'Extra productfoto''s voor de galerij (publieke storage-URLs), volgorde = weergavevolgorde';
comment on column public.sbs_products.brochure_url    is 'Productbrochure (PDF) — publieke storage-URL';
comment on column public.sbs_products.cashback_amount is 'Cashback-bedrag in euro''s; null = geen actieve cashback. Weergave-functie: wordt NIET verrekend in de winkelwagen';
comment on column public.sbs_products.cashback_label  is 'Optionele cashback-toelichting, bv. ''via Samsung'' of einddatum van de actie';
