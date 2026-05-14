-- ============================================================
-- Smart Buy Store · Migratie 0003 — Fix RLS-recursie
--
-- Probleem: policies die `exists (select from sbs_profiles ...)`
-- gebruiken triggeren een Postgres "infinite recursion" omdat
-- sbs_profiles zelf ook een policy heeft die sbs_profiles raadpleegt.
--
-- Fix: alle rol-checks routen via de SECURITY DEFINER functie
-- public.current_user_role() — die bypasst RLS en is dus recursie-vrij.
-- ============================================================

-- ───── sbs_profiles: vervang self-joining policies ─────────────────────────
drop policy if exists "admin sees all profiles" on public.sbs_profiles;
create policy "admin sees all profiles"
  on public.sbs_profiles for select
  to authenticated
  using (public.current_user_role() = 'admin');

drop policy if exists "admin updates all profiles" on public.sbs_profiles;
create policy "admin updates all profiles"
  on public.sbs_profiles for update
  to authenticated
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- ───── sbs_brands ──────────────────────────────────────────────────────────
drop policy if exists "admin staff manage brands" on public.sbs_brands;
create policy "admin staff manage brands"
  on public.sbs_brands for all
  to authenticated
  using (public.current_user_role() in ('admin','staff'))
  with check (public.current_user_role() in ('admin','staff'));

-- ───── sbs_categories ──────────────────────────────────────────────────────
drop policy if exists "admin staff manage categories" on public.sbs_categories;
create policy "admin staff manage categories"
  on public.sbs_categories for all
  to authenticated
  using (public.current_user_role() in ('admin','staff'))
  with check (public.current_user_role() in ('admin','staff'));

-- ───── sbs_products ────────────────────────────────────────────────────────
drop policy if exists "admin staff manage products" on public.sbs_products;
create policy "admin staff manage products"
  on public.sbs_products for all
  to authenticated
  using (public.current_user_role() in ('admin','staff'))
  with check (public.current_user_role() in ('admin','staff'));
