-- 0017_energy_label_scale
-- Verruim de toegestane energielabels naar de volledige schaal die op
-- de fysieke labels van witgoed staat: A+++ … E (plus oudere F/G voor
-- bestaande data). De oude constraint stond alleen A–F toe, waardoor
-- A+++/A++/A+ niet konden matchen met de productspecificaties.

alter table public.sbs_products
  drop constraint if exists sbs_products_energy_label_check;

alter table public.sbs_products
  add constraint sbs_products_energy_label_check
  check (
    energy_label is null
    or energy_label in ('A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G')
  );
