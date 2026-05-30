-- ============================================================
-- Smart Buy Store · Migratie 0010 — Website intelligence + foto-storage
--   • sbs_page_views        → first-party paginaweergaven (consent-gated)
--   • storage bucket        → product-images (publieke foto-uploads)
-- Run in Supabase Studio: SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  sbs_page_views — lichte first-party tracking
--     Alleen geschreven na analytics-consent. Geen persoonsgegevens:
--     visitor_id is een willekeurige, niet-herleidbare id (geen IP/e-mail).
-- ──────────────────────────────────────────────────────────
create table if not exists public.sbs_page_views (
  id           bigserial primary key,
  path         text not null,
  referrer     text,
  visitor_id   text,                 -- random first-party id (geen PII)
  session_id   text,
  device       text,                 -- 'mobile' | 'desktop' | 'tablet'
  product_slug text,                 -- ingevuld bij /product/<slug>
  created_at   timestamptz not null default now()
);

create index if not exists idx_sbs_page_views_created on public.sbs_page_views(created_at desc);
create index if not exists idx_sbs_page_views_path on public.sbs_page_views(path);
create index if not exists idx_sbs_page_views_product on public.sbs_page_views(product_slug) where product_slug is not null;

alter table public.sbs_page_views enable row level security;

-- Iedereen mag een paginaweergave insturen (anon), admin/staff leest.
drop policy if exists "anyone logs page view" on public.sbs_page_views;
create policy "anyone logs page view"
  on public.sbs_page_views for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin staff read page views" on public.sbs_page_views;
create policy "admin staff read page views"
  on public.sbs_page_views for select
  to authenticated
  using (public.current_user_role() in ('admin','staff'));

-- ──────────────────────────────────────────────────────────
-- 2.  Storage bucket voor productfoto's (publiek leesbaar)
--     Uploads lopen via de service-role (server action) → RLS-bypass,
--     dus we hoeven geen extra storage.objects-insertpolicy te definiëren.
--     Publieke bucket = afbeeldingen direct via publieke URL bereikbaar.
-- ──────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;
