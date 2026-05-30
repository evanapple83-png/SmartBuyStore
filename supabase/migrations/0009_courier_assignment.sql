-- ============================================================
-- Smart Buy Store · Migratie 0009 — Bezorger-koppeling + onderweg-mail
--   • sbs_orders.delivery_user_id  → toegewezen bezorger (FK sbs_profiles)
--   • e-mailtemplate order_on_the_way ("Je bezorging is onderweg")
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  Toegewezen bezorger per bestelling
-- ──────────────────────────────────────────────────────────
alter table public.sbs_orders
  add column if not exists delivery_user_id uuid references public.sbs_profiles(id) on delete set null;

create index if not exists idx_sbs_orders_delivery_user
  on public.sbs_orders(delivery_user_id)
  where delivery_user_id is not null;

-- ──────────────────────────────────────────────────────────
-- 2.  Nieuw e-mailsjabloon: bezorging onderweg
-- ──────────────────────────────────────────────────────────
insert into public.sbs_email_templates (key, label, subject, body, description, sort_order) values
  ('order_on_the_way', 'Bezorging onderweg',
   'Je bestelling {{order_number}} is onderweg',
   E'Beste {{customer_name}},\n\nGoed nieuws! Je bestelling {{order_number}} is vandaag onderweg naar je toe. Onze bezorger komt er vandaag aan.\n\nZorg dat er iemand aanwezig is om de levering in ontvangst te nemen.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd zodra een bezorging voor vandaag wordt ingepland (same-day). Variabelen: {{customer_name}}, {{order_number}}.', 35)
on conflict (key) do nothing;
