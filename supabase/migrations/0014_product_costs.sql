-- Smart Buy Store · Migratie 0014 — Inkoopprijs + marge per product
-- ──────────────────────────────────────────────────────────
-- BEWUST een aparte tabel (niet op sbs_products): inkoopprijzen zijn gevoelige
-- bedrijfsdata en sbs_products is publiek leesbaar via de anon-key. RLS is
-- row-level, geen column-level — een kolom op sbs_products zou via de REST-API
-- lekken. Deze tabel is alleen leesbaar/schrijfbaar voor admin + staff.
--
-- Idempotent: veilig om opnieuw te draaien.

create table if not exists public.sbs_product_costs (
  product_id      uuid primary key references public.sbs_products(id) on delete cascade,
  purchase_price  numeric(10,2) not null check (purchase_price >= 0),  -- inkoopprijs excl. btw
  margin_percent  numeric(6,2)  check (margin_percent is null or margin_percent >= 0),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on table  public.sbs_product_costs is 'Inkoopprijs + beoogde marge per product. ADMIN-ONLY: nooit joinen in publieke queries.';
comment on column public.sbs_product_costs.purchase_price is 'Inkoopprijs excl. btw';
comment on column public.sbs_product_costs.margin_percent is 'Beoogde marge in % bovenop de inkoopprijs (excl. btw)';

drop trigger if exists trg_sbs_product_costs_touch on public.sbs_product_costs;
create trigger trg_sbs_product_costs_touch
  before update on public.sbs_product_costs
  for each row execute function public.sbs_touch_updated_at();

alter table public.sbs_product_costs enable row level security;

drop policy if exists "admin staff manage product costs" on public.sbs_product_costs;
create policy "admin staff manage product costs"
  on public.sbs_product_costs for all
  to authenticated
  using (public.current_user_role() in ('admin', 'staff'))
  with check (public.current_user_role() in ('admin', 'staff'));
