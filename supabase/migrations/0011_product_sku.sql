-- ============================================================
-- Smart Buy Store · Migratie 0011 — Artikelnummer (SKU) per product
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

alter table public.sbs_products
  add column if not exists sku text;

-- Uniek waar ingevuld (leeg/NULL mag meermaals voorkomen).
create unique index if not exists uq_sbs_products_sku
  on public.sbs_products (sku)
  where sku is not null and sku <> '';

-- Handig voor zoeken op artikelnummer.
create index if not exists idx_sbs_products_sku on public.sbs_products (sku) where sku is not null;
