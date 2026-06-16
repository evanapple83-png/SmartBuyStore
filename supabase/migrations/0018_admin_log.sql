-- 0018_admin_log
-- Audit-logboek van beheeracties: wie (welke admin/medewerker) deed wat,
-- wanneer, op welk object. Append-only, traceerbaar per admin.

create table if not exists public.sbs_admin_log (
  id          bigserial primary key,
  action      text not null,                 -- 'create' | 'update' | 'delete' | 'status' | ...
  entity      text not null,                 -- 'product' | 'order' | 'discount' | 'settings' | ...
  entity_id   text,                          -- id van het object (tekst, want soms uuid soms key)
  label       text,                          -- leesbare omschrijving (bv. productnaam)
  details     jsonb,                         -- optionele context (oude/nieuwe waarde, notitie)
  admin_id    uuid references public.sbs_profiles(id) on delete set null,
  admin_email text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_sbs_admin_log_created on public.sbs_admin_log(created_at desc);
create index if not exists idx_sbs_admin_log_admin   on public.sbs_admin_log(admin_id, created_at desc);
create index if not exists idx_sbs_admin_log_entity  on public.sbs_admin_log(entity, entity_id, created_at desc);

alter table public.sbs_admin_log enable row level security;

-- Alleen actieve admin/staff mogen het logboek lezen. Inserts gebeuren via de
-- service-role (server-side, bypasst RLS), dus daarvoor is geen policy nodig.
drop policy if exists sbs_admin_log_select on public.sbs_admin_log;
create policy sbs_admin_log_select on public.sbs_admin_log
  for select using (
    exists (
      select 1 from public.sbs_profiles p
      where p.id = auth.uid() and p.is_active and p.role in ('admin', 'staff')
    )
  );
