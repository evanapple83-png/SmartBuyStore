-- ============================================================
-- Smart Buy Store · Migratie 0005 — Mollie payments + idempotentie
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_payments
--     Historisch logboek van Mollie-betaalpogingen per order.
--     Eén order kan meerdere payment-pogingen hebben bij retries.
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_payments (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references public.sbs_orders(id) on delete cascade,
  mollie_payment_id     text not null unique,
  status                text not null,                  -- mirror van Mollie: open|pending|authorized|paid|canceled|expired|failed
  amount                numeric(10, 2) not null,
  amount_refunded       numeric(10, 2) not null default 0,
  method                text,                           -- ideal|creditcard|bancontact|paypal|...
  checkout_url          text,                           -- URL waar klant naartoe gestuurd wordt
  raw                   jsonb,                          -- volledige Mollie-response (debugging)
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  paid_at               timestamptz,
  canceled_at           timestamptz
);

create index if not exists idx_sbs_payments_order on public.sbs_payments(order_id);
create index if not exists idx_sbs_payments_status on public.sbs_payments(status);

drop trigger if exists trg_sbs_payments_touch on public.sbs_payments;
create trigger trg_sbs_payments_touch
  before update on public.sbs_payments
  for each row execute function public.sbs_touch_updated_at();

-- ──────────────────────────────────────────────────────────
-- 2.  sbs_mollie_events
--     Idempotentie-tabel. Elke unieke (payment_id, status) combinatie
--     mag maximaal 1× verwerkt worden. Mollie kan dezelfde webhook
--     meerdere keren afvuren bij retries — wij doen INSERT ... ON CONFLICT
--     DO NOTHING en als geen rij returned wordt, slaan we de actie over.
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_mollie_events (
  id                bigserial primary key,
  mollie_payment_id text not null,
  payment_status    text not null,
  order_id          uuid references public.sbs_orders(id) on delete cascade,
  received_at       timestamptz not null default now(),
  processed_at      timestamptz,
  result            text not null default 'ok',         -- ok|duplicate|error
  error_message     text,
  raw               jsonb,
  unique (mollie_payment_id, payment_status)            -- ← idempotentie-key
);

create index if not exists idx_sbs_mollie_events_payment on public.sbs_mollie_events(mollie_payment_id, received_at desc);

-- ──────────────────────────────────────────────────────────
-- 3.  RLS
--     Payments en mollie_events zijn alleen voor admin/staff,
--     plus de service-role voor webhook-side updates.
-- ──────────────────────────────────────────────────────────
alter table public.sbs_payments       enable row level security;
alter table public.sbs_mollie_events  enable row level security;

drop policy if exists "admin staff see payments" on public.sbs_payments;
create policy "admin staff see payments"
  on public.sbs_payments for select
  to authenticated
  using (public.current_user_role() in ('admin','staff'));

-- Klanten zien hun eigen payments (via join op order)
drop policy if exists "customer sees own payments" on public.sbs_payments;
create policy "customer sees own payments"
  on public.sbs_payments for select
  to authenticated
  using (
    exists (
      select 1 from public.sbs_orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

-- Inserts/updates lopen via service-role (webhook + server actions met admin client),
-- die heeft RLS-bypass — geen aparte policy nodig.

drop policy if exists "admin staff see mollie events" on public.sbs_mollie_events;
create policy "admin staff see mollie events"
  on public.sbs_mollie_events for select
  to authenticated
  using (public.current_user_role() = 'admin');
