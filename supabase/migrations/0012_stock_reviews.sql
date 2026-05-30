-- ============================================================
-- Smart Buy Store · Migratie 0012 — Voorraad-aantal + reviews
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  Voorraad als aantal
-- ──────────────────────────────────────────────────────────
alter table public.sbs_products
  add column if not exists stock_count int not null default 0;

-- Geef bestaande 'op voorraad'-producten een startvoorraad (eenmalig),
-- zodat ze niet ineens als uitverkocht tonen. Beheerder past nadien aan.
update public.sbs_products set stock_count = 10
  where in_stock = true and stock_count = 0;

-- Voorkomt dubbel afboeken (webhook + handmatig + retries).
alter table public.sbs_orders
  add column if not exists stock_decremented boolean not null default false;

-- ──────────────────────────────────────────────────────────
-- 2.  Productreviews (echte reviews, met moderatie)
-- ──────────────────────────────────────────────────────────
do $$ begin
  create type public.sbs_review_status as enum ('pending', 'published', 'rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.sbs_reviews (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.sbs_products(id) on delete cascade,
  user_id      uuid references public.sbs_profiles(id) on delete set null,
  order_id     uuid references public.sbs_orders(id) on delete set null,
  author_name  text not null,
  rating       int not null check (rating between 1 and 5),
  title        text,
  body         text not null,
  status       public.sbs_review_status not null default 'pending',
  is_verified  boolean not null default false,   -- gekoppeld aan een echte bestelling
  created_at   timestamptz not null default now()
);

create index if not exists idx_sbs_reviews_product on public.sbs_reviews(product_id, status);
create index if not exists idx_sbs_reviews_status on public.sbs_reviews(status, created_at desc);

alter table public.sbs_reviews enable row level security;

-- Publiek leest alleen gepubliceerde reviews.
drop policy if exists "public reads published reviews" on public.sbs_reviews;
create policy "public reads published reviews"
  on public.sbs_reviews for select
  to anon, authenticated
  using (status = 'published');

-- Ingelogde klant mag een review insturen (komt binnen als 'pending').
drop policy if exists "customer submits review" on public.sbs_reviews;
create policy "customer submits review"
  on public.sbs_reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Klant ziet de eigen (ook nog niet-gepubliceerde) reviews.
drop policy if exists "customer sees own reviews" on public.sbs_reviews;
create policy "customer sees own reviews"
  on public.sbs_reviews for select
  to authenticated
  using (auth.uid() = user_id);

-- Admin/staff modereren alles.
drop policy if exists "admin staff manage reviews" on public.sbs_reviews;
create policy "admin staff manage reviews"
  on public.sbs_reviews for all
  to authenticated
  using (public.current_user_role() in ('admin','staff'))
  with check (public.current_user_role() in ('admin','staff'));
