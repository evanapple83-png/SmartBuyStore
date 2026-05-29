-- ============================================================
-- Smart Buy Store · Migratie 0008 — Mail-log + nieuwsbrief + contact (FASE 9)
--   • sbs_email_log              → idempotente verzendlog per order-gebeurtenis
--   • sbs_newsletter_subscribers → nieuwsbrief-inschrijvingen
--   • sbs_contact_messages       → contactformulier-berichten
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_email_log — welke mails zijn (geprobeerd te) versturen
--     UNIQUE (order_id, event_type) maakt verzending idempotent:
--     een tweede poging voor dezelfde order+gebeurtenis is een no-op.
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_email_log (
  id            bigserial primary key,
  order_id      uuid references public.sbs_orders(id) on delete cascade,
  event_type    text not null,                  -- order_confirmation | payment_received | order_planned | ...
  to_email      text not null,
  subject       text,
  status        text not null default 'sent',   -- sent | skipped | noop | error
  provider_id   text,                            -- bv. Resend message id
  error_message text,
  created_at    timestamptz not null default now(),
  unique (order_id, event_type)
);

create index if not exists idx_sbs_email_log_order on public.sbs_email_log(order_id, created_at desc);

-- ──────────────────────────────────────────────────────────
-- 2.  sbs_newsletter_subscribers
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  source        text default 'website',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- 3.  sbs_contact_messages
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  subject       text,
  message       text not null,
  is_read       boolean not null default false,
  created_at    timestamptz not null default now()
);

create index if not exists idx_sbs_contact_messages_created on public.sbs_contact_messages(created_at desc);

-- ──────────────────────────────────────────────────────────
-- 4.  Row-Level Security
-- ──────────────────────────────────────────────────────────
alter table public.sbs_email_log              enable row level security;
alter table public.sbs_newsletter_subscribers enable row level security;
alter table public.sbs_contact_messages       enable row level security;

-- Email-log: alleen admin/staff lezen. Inserts lopen via service-role (RLS-bypass).
drop policy if exists "admin staff read email log" on public.sbs_email_log;
create policy "admin staff read email log"
  on public.sbs_email_log for select
  to authenticated
  using (public.current_user_role() in ('admin','staff'));

-- Nieuwsbrief: iedereen mag zich inschrijven (anon insert), admin/staff lezen.
drop policy if exists "anyone subscribes newsletter" on public.sbs_newsletter_subscribers;
create policy "anyone subscribes newsletter"
  on public.sbs_newsletter_subscribers for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin staff read newsletter" on public.sbs_newsletter_subscribers;
create policy "admin staff read newsletter"
  on public.sbs_newsletter_subscribers for select
  to authenticated
  using (public.current_user_role() in ('admin','staff'));

-- Contact: iedereen mag een bericht sturen (anon insert), admin/staff lezen + updaten (gelezen-markeren).
drop policy if exists "anyone sends contact message" on public.sbs_contact_messages;
create policy "anyone sends contact message"
  on public.sbs_contact_messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin staff read contact messages" on public.sbs_contact_messages;
create policy "admin staff read contact messages"
  on public.sbs_contact_messages for select
  to authenticated
  using (public.current_user_role() in ('admin','staff'));

drop policy if exists "admin staff update contact messages" on public.sbs_contact_messages;
create policy "admin staff update contact messages"
  on public.sbs_contact_messages for update
  to authenticated
  using (public.current_user_role() in ('admin','staff'))
  with check (public.current_user_role() in ('admin','staff'));
