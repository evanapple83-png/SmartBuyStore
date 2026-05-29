-- ============================================================
-- Smart Buy Store · Migratie 0006 — Gestructureerde productattributen
-- Voor filterbare facetten op categoriepagina's (Merk/Prijs/Energielabel
-- bestaan al als kolommen; deze migratie voegt de categorie-specifieke,
-- getypeerde facetten toe die nu nog in de losse `specs`-map zitten).
--
-- Run in Supabase Studio (SmartBuy project zmdkuryhojojomimbmpx):
--   SQL Editor → New Query → paste → Run
-- Idempotent: veilig om opnieuw te draaien.
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1.  Kolom + index
-- ──────────────────────────────────────────────────────────
alter table public.sbs_products
  add column if not exists attributes jsonb not null default '{}'::jsonb;

-- GIN-index zodat server-side JSONB-filters snel blijven als de catalogus groeit
create index if not exists idx_sbs_products_attributes
  on public.sbs_products using gin (attributes);

comment on column public.sbs_products.attributes is
  'Genormaliseerde, getypeerde filterfacetten (numbers/booleans/enums). '
  'Bron-van-waarheid voor categoriefilters. `specs` blijft de leesbare PDP-tabel.';

-- ──────────────────────────────────────────────────────────
-- 2.  Backfill — bestaande 8 producten (per slug)
--     Waarden afgeleid uit specs + features + naam.
-- ──────────────────────────────────────────────────────────
update public.sbs_products set attributes = '{
  "type": "Multidoor",
  "capacity_fridge_l": 406,
  "capacity_freezer_l": 209,
  "capacity_total_l": 615,
  "color": "Marineblauw",
  "no_frost": true,
  "build_type": "vrijstaand"
}'::jsonb where slug = 'samsung-bespoke-rf23bb860eqn-multidoor';

update public.sbs_products set attributes = '{
  "load_kg": 8,
  "spin_rpm": 1400,
  "noise_db": 44,
  "build_type": "vrijstaand"
}'::jsonb where slug = 'bauknecht-b6-88-silence-wasmachine';

update public.sbs_products set attributes = '{
  "type": "Koel-vriescombinatie",
  "capacity_total_l": 390,
  "color": "RVS Zilver",
  "build_type": "vrijstaand"
}'::jsonb where slug = 'samsung-rb38c607as9-koel-vriescombinatie-rvs';

update public.sbs_products set attributes = '{
  "type": "Koel-vriescombinatie",
  "capacity_total_l": 341,
  "color": "Zwart/inox",
  "no_frost": true,
  "build_type": "vrijstaand"
}'::jsonb where slug = 'samsung-rb34c652eb1-no-frost-341l';

update public.sbs_products set attributes = '{
  "type": "Koel-vriescombinatie",
  "capacity_total_l": 341,
  "color": "Wit",
  "width_cm": 60,
  "build_type": "vrijstaand"
}'::jsonb where slug = 'samsung-series-6-341l-wit';

update public.sbs_products set attributes = '{
  "type": "Koel-vriescombinatie",
  "color": "Graphite Steel",
  "no_frost": true,
  "build_type": "vrijstaand"
}'::jsonb where slug = 'samsung-rb38c634dsa-graphite';

update public.sbs_products set attributes = '{
  "type": "Koel-vriescombinatie",
  "capacity_fridge_l": 230,
  "capacity_freezer_l": 114,
  "capacity_total_l": 344,
  "color": "Metallic Graphite",
  "no_frost": true,
  "build_type": "vrijstaand"
}'::jsonb where slug = 'samsung-rb33b610esa-metallic-graphite';

update public.sbs_products set attributes = '{
  "couverts": 14,
  "width_cm": 60,
  "noise_db": 44,
  "build_type": "inbouw"
}'::jsonb where slug = 'samsung-dw60m6070ib-vaatwasser';
