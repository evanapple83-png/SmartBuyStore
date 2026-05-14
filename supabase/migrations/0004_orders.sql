-- ============================================================
-- Smart Buy Store · Migratie 0004 — Bestellingen + adressen + statuslog
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- Enums
-- ──────────────────────────────────────────────────────────
do $$ begin
  create type public.sbs_order_status as enum (
    'pending_payment',     -- order aangemaakt, wacht op Mollie webhook
    'paid',                -- betaling bevestigd (alleen via webhook)
    'in_progress',         -- in voorbereiding
    'planned_delivery',    -- bezorgdatum vastgesteld
    'delivered',           -- bezorgd
    'completed',           -- afgerond (na review-periode of door admin)
    'cancelled',           -- geannuleerd
    'refunded'             -- terugbetaald
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.sbs_delivery_method as enum ('standard', 'same_day');
exception when duplicate_object then null; end $$;

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_addresses
--     Bezorg- en factuuradressen per klant.
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_addresses (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references public.sbs_profiles(id) on delete cascade,
  label                 text,                              -- bv. "Thuis", "Werk"
  full_name             text,
  phone                 text,
  street                text not null,
  postal_code           text not null,
  city                  text not null,
  country               text not null default 'Nederland',
  is_default_shipping   boolean not null default false,
  is_default_billing    boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_sbs_addresses_user on public.sbs_addresses(user_id);

drop trigger if exists trg_sbs_addresses_touch on public.sbs_addresses;
create trigger trg_sbs_addresses_touch
  before update on public.sbs_addresses
  for each row execute function public.sbs_touch_updated_at();

-- ──────────────────────────────────────────────────────────
-- 2.  Order-number sequence + helper
-- ──────────────────────────────────────────────────────────
create sequence if not exists public.sbs_order_seq;

create or replace function public.next_order_number()
returns text language plpgsql security definer as $$
declare
  yr int := extract(year from now())::int;
  seq bigint;
begin
  seq := nextval('public.sbs_order_seq');
  return format('SBS-%s-%s', yr, lpad(seq::text, 4, '0'));
end;
$$;

grant execute on function public.next_order_number() to authenticated, anon;

-- ──────────────────────────────────────────────────────────
-- 3.  sbs_orders
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_orders (
  id                          uuid primary key default gen_random_uuid(),
  order_number                text not null unique default public.next_order_number(),

  user_id                     uuid references public.sbs_profiles(id) on delete set null,
  status                      public.sbs_order_status not null default 'pending_payment',

  delivery_method             public.sbs_delivery_method not null default 'standard',
  delivery_date               date,
  delivery_postcode           text,

  -- Snapshots — onveranderlijk na aanmaak
  customer_snapshot           jsonb not null,                -- {name, email, phone}
  shipping_address_snapshot   jsonb not null,                -- {full_name, street, postal_code, city, country, phone}
  billing_address_snapshot    jsonb,                         -- nullable: gelijk aan shipping als leeg

  -- Bedragen
  subtotal_excl_btw           numeric(10, 2) not null,
  btw_total                   numeric(10, 2) not null,
  discount_amount             numeric(10, 2) not null default 0,
  delivery_cost               numeric(10, 2) not null default 0,
  total_incl_btw              numeric(10, 2) not null,

  discount_code               text,                          -- snapshot van de code
  notes_customer              text,                          -- wat klant invulde
  notes_internal              text,                          -- alleen team-zichtbaar

  paid_at                     timestamptz,
  delivered_at                timestamptz,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_sbs_orders_user on public.sbs_orders(user_id);
create index if not exists idx_sbs_orders_status on public.sbs_orders(status);
create index if not exists idx_sbs_orders_created on public.sbs_orders(created_at desc);
create index if not exists idx_sbs_orders_delivery_date on public.sbs_orders(delivery_date) where delivery_date is not null;

drop trigger if exists trg_sbs_orders_touch on public.sbs_orders;
create trigger trg_sbs_orders_touch
  before update on public.sbs_orders
  for each row execute function public.sbs_touch_updated_at();

-- ──────────────────────────────────────────────────────────
-- 4.  sbs_order_items
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_order_items (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references public.sbs_orders(id) on delete cascade,
  product_id               uuid references public.sbs_products(id) on delete set null,
  product_snapshot         jsonb not null,                   -- {name, slug, brand, image, sku?}
  qty                      int not null check (qty > 0),
  unit_price_excl_btw      numeric(10, 2) not null,
  btw_rate                 numeric(5, 2) not null default 21.00,
  line_subtotal_excl_btw   numeric(10, 2) not null,
  line_btw                 numeric(10, 2) not null,
  line_total_incl_btw      numeric(10, 2) not null,
  sort_order               int not null default 0,
  created_at               timestamptz not null default now()
);

create index if not exists idx_sbs_order_items_order on public.sbs_order_items(order_id);

-- ──────────────────────────────────────────────────────────
-- 5.  sbs_order_status_log — append-only audit trail
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_order_status_log (
  id            bigserial primary key,
  order_id      uuid not null references public.sbs_orders(id) on delete cascade,
  from_status   public.sbs_order_status,
  to_status     public.sbs_order_status not null,
  by_user_id    uuid references public.sbs_profiles(id),
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_sbs_status_log_order on public.sbs_order_status_log(order_id, created_at desc);

-- Trigger: auto-log status changes
create or replace function public.sbs_log_order_status()
returns trigger language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') then
    insert into public.sbs_order_status_log (order_id, from_status, to_status, by_user_id, note)
    values (new.id, null, new.status, auth.uid(), 'Bestelling aangemaakt');
  elsif (tg_op = 'UPDATE' and old.status is distinct from new.status) then
    insert into public.sbs_order_status_log (order_id, from_status, to_status, by_user_id)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sbs_orders_status_log on public.sbs_orders;
create trigger trg_sbs_orders_status_log
  after insert or update on public.sbs_orders
  for each row execute function public.sbs_log_order_status();

-- ──────────────────────────────────────────────────────────
-- 6.  Claim guest orders bij login
--     Koppel oude bestellingen met user_id=null waarvan
--     customer_snapshot.email match met huidige user.
-- ──────────────────────────────────────────────────────────
create or replace function public.claim_guest_orders_by_email()
returns int language plpgsql security definer set search_path = public as $$
declare
  user_email text;
  affected int;
begin
  select email into user_email from auth.users where id = auth.uid();
  if user_email is null then return 0; end if;

  update sbs_orders
  set user_id = auth.uid()
  where user_id is null
    and lower(customer_snapshot->>'email') = lower(user_email);

  get diagnostics affected = row_count;
  return affected;
end;
$$;

grant execute on function public.claim_guest_orders_by_email() to authenticated;

-- ──────────────────────────────────────────────────────────
-- 7.  RLS
-- ──────────────────────────────────────────────────────────
alter table public.sbs_addresses          enable row level security;
alter table public.sbs_orders             enable row level security;
alter table public.sbs_order_items        enable row level security;
alter table public.sbs_order_status_log   enable row level security;

-- Klant beheert eigen adressen
drop policy if exists "customer manages own addresses" on public.sbs_addresses;
create policy "customer manages own addresses"
  on public.sbs_addresses for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "admin staff see all addresses" on public.sbs_addresses;
create policy "admin staff see all addresses"
  on public.sbs_addresses for select
  to authenticated
  using (public.current_user_role() in ('admin','staff'));

-- Bestellingen: klant ziet eigen, admin/staff/delivery ziet alles
drop policy if exists "customer sees own orders" on public.sbs_orders;
create policy "customer sees own orders"
  on public.sbs_orders for select
  to authenticated
  using (
    auth.uid() = user_id
    or public.current_user_role() in ('admin','staff','delivery')
  );

drop policy if exists "admin staff delivery update orders" on public.sbs_orders;
create policy "admin staff delivery update orders"
  on public.sbs_orders for update
  to authenticated
  using (public.current_user_role() in ('admin','staff','delivery'))
  with check (public.current_user_role() in ('admin','staff','delivery'));

-- Guest checkout: anon mag insert
drop policy if exists "anyone creates orders (guest checkout)" on public.sbs_orders;
create policy "anyone creates orders (guest checkout)"
  on public.sbs_orders for insert
  to anon, authenticated
  with check (true);

-- Order items: zichtbaar als de order zichtbaar is
drop policy if exists "items follow order visibility" on public.sbs_order_items;
create policy "items follow order visibility"
  on public.sbs_order_items for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.sbs_orders o
      where o.id = order_id
        and (
          o.user_id = auth.uid()
          or public.current_user_role() in ('admin','staff','delivery')
        )
    )
  );

drop policy if exists "anyone inserts order items" on public.sbs_order_items;
create policy "anyone inserts order items"
  on public.sbs_order_items for insert
  to anon, authenticated
  with check (true);

-- Status log: lezen wie de order mag zien
drop policy if exists "status log follows order" on public.sbs_order_status_log;
create policy "status log follows order"
  on public.sbs_order_status_log for select
  to authenticated
  using (
    exists (
      select 1 from public.sbs_orders o
      where o.id = order_id
        and (
          o.user_id = auth.uid()
          or public.current_user_role() in ('admin','staff','delivery')
        )
    )
  );
