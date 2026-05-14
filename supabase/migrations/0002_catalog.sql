-- ============================================================
-- Smart Buy Store · Migratie 0002 — Productcatalogus
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_brands
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_brands (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  logo_url    text,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_sbs_brands_active on public.sbs_brands(is_active, sort_order);

-- ──────────────────────────────────────────────────────────
-- 2.  sbs_categories
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  parent_id   uuid references public.sbs_categories(id) on delete set null,
  is_active   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_sbs_categories_active on public.sbs_categories(is_active, sort_order);
create index if not exists idx_sbs_categories_parent on public.sbs_categories(parent_id);

-- ──────────────────────────────────────────────────────────
-- 3.  sbs_products
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_products (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  name                text not null,
  short_name          text,

  brand_id            uuid references public.sbs_brands(id) on delete set null,
  category_id         uuid references public.sbs_categories(id) on delete set null,

  current_price       numeric(10, 2) not null check (current_price >= 0),
  original_price      numeric(10, 2) check (original_price is null or original_price >= 0),
  btw_rate            numeric(5, 2) not null default 21.00,

  energy_label        text check (energy_label is null or energy_label in ('A','B','C','D','E','F')),
  rating              numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  review_count        int not null default 0,

  in_stock            boolean not null default true,
  is_same_day_delivery boolean not null default false,
  is_new              boolean not null default false,
  is_on_sale          boolean not null default false,
  is_hidden           boolean not null default false,        -- soft-delete pattern

  short_description   text,
  features            text[] default array[]::text[],
  specs               jsonb not null default '{}'::jsonb,

  image_primary       text,
  image_fallback      text,

  sort_order          int not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_sbs_products_category on public.sbs_products(category_id) where is_hidden = false;
create index if not exists idx_sbs_products_brand on public.sbs_products(brand_id);
create index if not exists idx_sbs_products_visible on public.sbs_products(is_hidden, sort_order);
create index if not exists idx_sbs_products_sale on public.sbs_products(is_on_sale) where is_hidden = false and is_on_sale = true;

-- ──────────────────────────────────────────────────────────
-- 4.  Touch updated_at triggers
-- ──────────────────────────────────────────────────────────
drop trigger if exists trg_sbs_brands_touch on public.sbs_brands;
create trigger trg_sbs_brands_touch
  before update on public.sbs_brands
  for each row execute function public.sbs_touch_updated_at();

drop trigger if exists trg_sbs_categories_touch on public.sbs_categories;
create trigger trg_sbs_categories_touch
  before update on public.sbs_categories
  for each row execute function public.sbs_touch_updated_at();

drop trigger if exists trg_sbs_products_touch on public.sbs_products;
create trigger trg_sbs_products_touch
  before update on public.sbs_products
  for each row execute function public.sbs_touch_updated_at();

-- ──────────────────────────────────────────────────────────
-- 5.  RLS
-- ──────────────────────────────────────────────────────────
alter table public.sbs_brands     enable row level security;
alter table public.sbs_categories enable row level security;
alter table public.sbs_products   enable row level security;

-- Publiek leest alleen actieve/zichtbare items
drop policy if exists "public reads active brands" on public.sbs_brands;
create policy "public reads active brands"
  on public.sbs_brands for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "public reads active categories" on public.sbs_categories;
create policy "public reads active categories"
  on public.sbs_categories for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "public reads visible products" on public.sbs_products;
create policy "public reads visible products"
  on public.sbs_products for select
  to anon, authenticated
  using (is_hidden = false);

-- Admin/staff: volledige CRUD
drop policy if exists "admin staff manage brands" on public.sbs_brands;
create policy "admin staff manage brands"
  on public.sbs_brands for all
  to authenticated
  using (
    exists (select 1 from public.sbs_profiles
            where id = auth.uid() and role in ('admin','staff') and is_active = true)
  )
  with check (
    exists (select 1 from public.sbs_profiles
            where id = auth.uid() and role in ('admin','staff') and is_active = true)
  );

drop policy if exists "admin staff manage categories" on public.sbs_categories;
create policy "admin staff manage categories"
  on public.sbs_categories for all
  to authenticated
  using (
    exists (select 1 from public.sbs_profiles
            where id = auth.uid() and role in ('admin','staff') and is_active = true)
  )
  with check (
    exists (select 1 from public.sbs_profiles
            where id = auth.uid() and role in ('admin','staff') and is_active = true)
  );

drop policy if exists "admin staff manage products" on public.sbs_products;
create policy "admin staff manage products"
  on public.sbs_products for all
  to authenticated
  using (
    exists (select 1 from public.sbs_profiles
            where id = auth.uid() and role in ('admin','staff') and is_active = true)
  )
  with check (
    exists (select 1 from public.sbs_profiles
            where id = auth.uid() and role in ('admin','staff') and is_active = true)
  );
