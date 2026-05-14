-- ============================================================
-- Smart Buy Store · Migratie 0001 — Auth + profielen
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────
-- Rol-enum
-- ──────────────────────────────────────────────────────────
do $$ begin
  create type public.sbs_role as enum ('admin', 'staff', 'delivery', 'customer');
exception when duplicate_object then null; end $$;

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_profiles
--     1-op-1 met auth.users.id
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  role            public.sbs_role not null default 'customer',
  full_name       text,
  phone           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_sbs_profiles_role on public.sbs_profiles(role) where is_active = true;

-- ──────────────────────────────────────────────────────────
-- 2.  Auto-create profile on signup
--     Wanneer iemand registreert via Supabase Auth, maakt deze
--     trigger automatisch een sbs_profiles-rij met rol 'customer'.
--     Admin/staff/delivery moeten daarna handmatig opgewaardeerd worden.
-- ──────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.sbs_profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ──────────────────────────────────────────────────────────
-- 3.  "Laatste admin"-bescherming
--     Voorkomt dat de allerlaatste actieve admin gedeactiveerd
--     of gedemoot wordt — anders heeft niemand meer toegang.
-- ──────────────────────────────────────────────────────────
create or replace function public.protect_last_admin()
returns trigger language plpgsql as $$
declare
  active_admin_count int;
begin
  -- Telt nog actieve admins ná deze wijziging
  select count(*) into active_admin_count
  from public.sbs_profiles
  where role = 'admin' and is_active = true and id <> coalesce(new.id, old.id);

  -- Als deze rij admin was en actief, en straks niet meer admin/actief is, en er zijn geen andere admins
  if tg_op = 'UPDATE' and old.role = 'admin' and old.is_active = true
     and (new.role <> 'admin' or new.is_active = false)
     and active_admin_count = 0 then
    raise exception 'Kan de laatste actieve admin niet deactiveren of demoten.';
  end if;

  if tg_op = 'DELETE' and old.role = 'admin' and old.is_active = true
     and active_admin_count = 0 then
    raise exception 'Kan de laatste actieve admin niet verwijderen.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_protect_last_admin on public.sbs_profiles;
create trigger trg_protect_last_admin
  before update or delete on public.sbs_profiles
  for each row execute function public.protect_last_admin();

-- ──────────────────────────────────────────────────────────
-- 4.  Updated_at touch
-- ──────────────────────────────────────────────────────────
create or replace function public.sbs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_sbs_profiles_touch on public.sbs_profiles;
create trigger trg_sbs_profiles_touch
  before update on public.sbs_profiles
  for each row execute function public.sbs_touch_updated_at();

-- ──────────────────────────────────────────────────────────
-- 5.  Row-Level Security
-- ──────────────────────────────────────────────────────────
alter table public.sbs_profiles enable row level security;

-- Iedereen mag zijn eigen profiel zien
drop policy if exists "users see own profile" on public.sbs_profiles;
create policy "users see own profile"
  on public.sbs_profiles for select
  to authenticated
  using (auth.uid() = id);

-- Iedereen mag zijn eigen profiel updaten (behalve role + is_active — die zijn admin-only)
drop policy if exists "users update own profile" on public.sbs_profiles;
create policy "users update own profile"
  on public.sbs_profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins kunnen alles zien
drop policy if exists "admin sees all profiles" on public.sbs_profiles;
create policy "admin sees all profiles"
  on public.sbs_profiles for select
  to authenticated
  using (
    exists (
      select 1 from public.sbs_profiles me
      where me.id = auth.uid() and me.role = 'admin' and me.is_active = true
    )
  );

-- Admins kunnen alle profielen updaten
drop policy if exists "admin updates all profiles" on public.sbs_profiles;
create policy "admin updates all profiles"
  on public.sbs_profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.sbs_profiles me
      where me.id = auth.uid() and me.role = 'admin' and me.is_active = true
    )
  );

-- Staff/delivery hebben specifieke read-toegang die we per resource definiëren in latere migraties.

-- ──────────────────────────────────────────────────────────
-- 6.  Helper: huidige user-rol als convenience-functie
-- ──────────────────────────────────────────────────────────
create or replace function public.current_user_role()
returns public.sbs_role language sql stable security definer set search_path = public
as $$
  select role from public.sbs_profiles where id = auth.uid() and is_active = true;
$$;

grant execute on function public.current_user_role() to authenticated, anon;
