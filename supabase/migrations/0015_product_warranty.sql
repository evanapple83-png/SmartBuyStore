-- Smart Buy Store · Migratie 0015 — Garantielabel per product
-- ──────────────────────────────────────────────────────────
-- Vrij tekstlabel (bv. '5 jaar garantie') dat als badge op de productkaart,
-- in de galerij en in de trust-lijst op de productpagina verschijnt.
-- Publieke info → gewoon op sbs_products (anders dan inkoopprijs/0014).
-- Idempotent: veilig om opnieuw te draaien.

alter table public.sbs_products
  add column if not exists warranty_label text;

comment on column public.sbs_products.warranty_label is 'Garantielabel voor klanten, bv. ''5 jaar garantie''; null = geen label';
