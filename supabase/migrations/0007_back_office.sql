-- ============================================================
-- Smart Buy Store · Migratie 0007 — Back-office (FASE 8)
--   • sbs_settings          → bedrijfsgegevens (key-value), voor facturen + footer
--   • sbs_email_templates   → e-mailsjablonen (klaar voor FASE 9 mailkoppeling)
--   • sbs_discount_codes     → kortingscodes
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_settings — generieke key-value winkelinstellingen
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_settings (
  key         text primary key,
  value       text,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_sbs_settings_touch on public.sbs_settings;
create trigger trg_sbs_settings_touch
  before update on public.sbs_settings
  for each row execute function public.sbs_touch_updated_at();

-- Standaardwaarden (overschrijven NIET bij her-run dankzij on conflict do nothing)
insert into public.sbs_settings (key, value) values
  ('company_name',    'Smart Buy Store'),
  ('company_legal',   'Smart Buy Store B.V.'),
  ('company_email',   'info@smartbuystore.nl'),
  ('company_phone',   ''),
  ('company_street',  ''),
  ('company_postal',  ''),
  ('company_city',    ''),
  ('company_country', 'Nederland'),
  ('company_kvk',     ''),
  ('company_btw',     ''),
  ('company_iban',    ''),
  ('invoice_footer',  'Bedankt voor je bestelling bij Smart Buy Store.')
on conflict (key) do nothing;

-- ──────────────────────────────────────────────────────────
-- 2.  sbs_email_templates — sjablonen per gebeurtenis
--     body/subject ondersteunen {{placeholders}} die de
--     mailverzender (FASE 9) invult.
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_email_templates (
  key          text primary key,        -- bv. order_confirmation
  label        text not null,           -- mensvriendelijke naam
  subject      text not null,
  body         text not null,           -- platte tekst / lichte HTML met {{vars}}
  description  text,                    -- uitleg + beschikbare variabelen
  is_enabled   boolean not null default true,
  sort_order   int not null default 0,
  updated_at   timestamptz not null default now()
);

drop trigger if exists trg_sbs_email_templates_touch on public.sbs_email_templates;
create trigger trg_sbs_email_templates_touch
  before update on public.sbs_email_templates
  for each row execute function public.sbs_touch_updated_at();

insert into public.sbs_email_templates (key, label, subject, body, description, sort_order) values
  ('order_confirmation', 'Bestelbevestiging',
   'Je bestelling {{order_number}} is ontvangen',
   E'Beste {{customer_name}},\n\nBedankt voor je bestelling bij Smart Buy Store!\n\nBestelnummer: {{order_number}}\nTotaalbedrag: {{order_total}}\n\nWe sturen je een bericht zodra je bestelling onderweg is.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd direct na het plaatsen van een bestelling. Variabelen: {{customer_name}}, {{order_number}}, {{order_total}}, {{order_items}}.', 1),
  ('payment_received', 'Betaling ontvangen',
   'We hebben je betaling voor {{order_number}} ontvangen',
   E'Beste {{customer_name}},\n\nWe hebben je betaling van {{order_total}} voor bestelling {{order_number}} in goede orde ontvangen. We gaan direct voor je aan de slag.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd na bevestiging via Mollie. Variabelen: {{customer_name}}, {{order_number}}, {{order_total}}.', 2),
  ('order_planned', 'Bezorging ingepland',
   'Je bestelling {{order_number}} wordt bezorgd op {{delivery_date}}',
   E'Beste {{customer_name}},\n\nGoed nieuws! Je bestelling {{order_number}} staat ingepland voor bezorging op {{delivery_date}}.\n\nZorg dat er iemand aanwezig is om de levering in ontvangst te nemen.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd zodra een bezorgdatum is vastgesteld. Variabelen: {{customer_name}}, {{order_number}}, {{delivery_date}}.', 3),
  ('order_delivered', 'Bezorgd',
   'Je bestelling {{order_number}} is bezorgd',
   E'Beste {{customer_name}},\n\nJe bestelling {{order_number}} is bezorgd. We hopen dat je er blij mee bent!\n\nVragen of een probleem? Reageer gerust op deze e-mail.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd na markering als bezorgd. Variabelen: {{customer_name}}, {{order_number}}.', 4),
  ('order_cancelled', 'Annulering',
   'Je bestelling {{order_number}} is geannuleerd',
   E'Beste {{customer_name}},\n\nJe bestelling {{order_number}} is geannuleerd. Een eventueel betaald bedrag wordt teruggestort.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd bij annulering. Variabelen: {{customer_name}}, {{order_number}}.', 5),
  ('account_welcome', 'Welkom (nieuw account)',
   'Welkom bij Smart Buy Store',
   E'Beste {{customer_name}},\n\nWelkom bij Smart Buy Store! Je account is aangemaakt. Je kunt nu sneller bestellen en je bestellingen volgen.\n\nMet vriendelijke groet,\nSmart Buy Store',
   'Verstuurd na registratie. Variabelen: {{customer_name}}.', 6)
on conflict (key) do nothing;

-- ──────────────────────────────────────────────────────────
-- 3.  sbs_discount_codes — kortingscodes
-- ──────────────────────────────────────────────────────────
do $$ begin
  create type public.sbs_discount_type as enum ('percentage', 'fixed');
exception when duplicate_object then null; end $$;

create table if not exists public.sbs_discount_codes (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  type            public.sbs_discount_type not null default 'percentage',
  value           numeric(10, 2) not null check (value >= 0),  -- % of euro
  min_order_total numeric(10, 2) not null default 0,           -- minimale order (incl btw)
  max_uses        int,                                          -- null = onbeperkt
  used_count      int not null default 0,
  valid_from      date,
  valid_until     date,
  is_active       boolean not null default true,
  description     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_sbs_discount_codes_code on public.sbs_discount_codes(lower(code));

drop trigger if exists trg_sbs_discount_codes_touch on public.sbs_discount_codes;
create trigger trg_sbs_discount_codes_touch
  before update on public.sbs_discount_codes
  for each row execute function public.sbs_touch_updated_at();

-- ──────────────────────────────────────────────────────────
-- 4.  Row-Level Security
-- ──────────────────────────────────────────────────────────
alter table public.sbs_settings        enable row level security;
alter table public.sbs_email_templates enable row level security;
alter table public.sbs_discount_codes  enable row level security;

-- Settings: publiek mag lezen (footer/facturen), alleen admin schrijft.
drop policy if exists "public reads settings" on public.sbs_settings;
create policy "public reads settings"
  on public.sbs_settings for select
  to anon, authenticated
  using (true);

drop policy if exists "admin writes settings" on public.sbs_settings;
create policy "admin writes settings"
  on public.sbs_settings for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- E-mailtemplates: alleen admin (lezen + schrijven).
drop policy if exists "admin manages email templates" on public.sbs_email_templates;
create policy "admin manages email templates"
  on public.sbs_email_templates for all
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- Kortingscodes: admin/staff volledige CRUD.
drop policy if exists "admin staff manage discount codes" on public.sbs_discount_codes;
create policy "admin staff manage discount codes"
  on public.sbs_discount_codes for all
  to authenticated
  using (public.current_user_role() in ('admin','staff'))
  with check (public.current_user_role() in ('admin','staff'));

-- Klant/checkout mag een actieve code valideren (alleen lezen van actieve codes).
drop policy if exists "anyone reads active discount codes" on public.sbs_discount_codes;
create policy "anyone reads active discount codes"
  on public.sbs_discount_codes for select
  to anon, authenticated
  using (is_active = true);
