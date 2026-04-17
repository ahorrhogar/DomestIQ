-- Post-migration validation for standing fans in Climatizacion.
-- This script returns:
-- 1) Summary counts and health checks
-- 2) Missing expected affiliate URLs (if any)
-- 3) Active offer prices by expected URL

with expected_slugs(slug) as (
  values
    ('orbegozo-sf-0147-ventilador-de-pie'),
    ('cecotec-energysilence-890-skyline'),
    ('amazon-basics-ventilador-pie-40cm-dc'),
    ('orbegozo-sf-0149-ventilador-de-pie'),
    ('dreo-quiet-standing-fan-upgraded'),
    ('dreo-nomad-one-20db'),
    ('cecotec-energysilence-5000-pro'),
    ('cecotec-energysilence-510'),
    ('cecotec-energysilence-1020-extremeconnected'),
    ('orbegozo-pw-1240-power-fan')
),
expected_urls(url) as (
  values
    ('https://amzn.to/4mEnAS3'),
    ('https://amzn.to/4erjkmy'),
    ('https://amzn.to/4cngH2s'),
    ('https://amzn.to/4cPz3KW'),
    ('https://amzn.to/4sZQAoV'),
    ('https://amzn.to/484czU2'),
    ('https://amzn.to/4sCdodR'),
    ('https://amzn.to/4cV5SFt'),
    ('https://amzn.to/4vCEVie'),
    ('https://amzn.to/4myFl50')
),
climatizacion_candidates as (
  select c.id, c.slug, c.name, c.parent_id
  from public.categories c
  where c.slug in ('climatizacion', 'climatizacin')
      or lower(c.name) like 'climatiza%'
),
target_products as (
  select p.id, p.slug, p.name, p.category_id, p.is_active
  from public.products p
  join expected_slugs s on s.slug = p.slug
),
active_offers as (
  select o.id, o.product_id, o.url, o.price, o.old_price, o.is_active, o.merchant_id
  from public.offers o
  join target_products p on p.id = o.product_id
  where o.is_active = true
),
expected_active_offers as (
  select ao.*
  from active_offers ao
  join expected_urls eu on eu.url = ao.url
),
missing_urls as (
  select eu.url
  from expected_urls eu
  left join expected_active_offers eao on eao.url = eu.url
  where eao.url is null
),
unexpected_urls as (
  select ao.url
  from active_offers ao
  left join expected_urls eu on eu.url = ao.url
  where eu.url is null
)
select
  (select count(*) from climatizacion_candidates) as climatizacion_category_candidates,
  (select count(*) from target_products) as products_found_by_expected_slug,
  (select count(*) from target_products tp join climatizacion_candidates c on c.id = tp.category_id) as products_in_climatizacion_candidates,
  (select count(*) from active_offers) as active_offers_for_target_products,
  (select count(*) from expected_active_offers) as active_expected_affiliate_offers,
  (select count(*) from expected_urls) as expected_urls_total,
  (select count(*) from missing_urls) as missing_expected_urls,
  (select count(*) from unexpected_urls) as unexpected_active_offer_urls;

with expected_urls(url) as (
  values
    ('https://amzn.to/4mEnAS3'),
    ('https://amzn.to/4erjkmy'),
    ('https://amzn.to/4cngH2s'),
    ('https://amzn.to/4cPz3KW'),
    ('https://amzn.to/4sZQAoV'),
    ('https://amzn.to/484czU2'),
    ('https://amzn.to/4sCdodR'),
    ('https://amzn.to/4cV5SFt'),
    ('https://amzn.to/4vCEVie'),
    ('https://amzn.to/4myFl50')
),
expected_slugs(slug) as (
  values
    ('orbegozo-sf-0147-ventilador-de-pie'),
    ('cecotec-energysilence-890-skyline'),
    ('amazon-basics-ventilador-pie-40cm-dc'),
    ('orbegozo-sf-0149-ventilador-de-pie'),
    ('dreo-quiet-standing-fan-upgraded'),
    ('dreo-nomad-one-20db'),
    ('cecotec-energysilence-5000-pro'),
    ('cecotec-energysilence-510'),
    ('cecotec-energysilence-1020-extremeconnected'),
    ('orbegozo-pw-1240-power-fan')
),
target_products as (
  select p.id
  from public.products p
  join expected_slugs s on s.slug = p.slug
),
expected_active_offers as (
  select o.url
  from public.offers o
  join target_products tp on tp.id = o.product_id
  where o.is_active = true
)
select eu.url as missing_expected_url
from expected_urls eu
left join expected_active_offers eao on eao.url = eu.url
where eao.url is null
order by eu.url;

with expected_urls(url) as (
  values
    ('https://amzn.to/4mEnAS3'),
    ('https://amzn.to/4erjkmy'),
    ('https://amzn.to/4cngH2s'),
    ('https://amzn.to/4cPz3KW'),
    ('https://amzn.to/4sZQAoV'),
    ('https://amzn.to/484czU2'),
    ('https://amzn.to/4sCdodR'),
    ('https://amzn.to/4cV5SFt'),
    ('https://amzn.to/4vCEVie'),
    ('https://amzn.to/4myFl50')
),
expected_slugs(slug) as (
  values
    ('orbegozo-sf-0147-ventilador-de-pie'),
    ('cecotec-energysilence-890-skyline'),
    ('amazon-basics-ventilador-pie-40cm-dc'),
    ('orbegozo-sf-0149-ventilador-de-pie'),
    ('dreo-quiet-standing-fan-upgraded'),
    ('dreo-nomad-one-20db'),
    ('cecotec-energysilence-5000-pro'),
    ('cecotec-energysilence-510'),
    ('cecotec-energysilence-1020-extremeconnected'),
    ('orbegozo-pw-1240-power-fan')
),
target_products as (
  select p.id, p.slug, p.name
  from public.products p
  join expected_slugs s on s.slug = p.slug
)
select
  tp.slug,
  tp.name,
  o.url,
  o.price,
  o.old_price,
  o.is_active,
  o.updated_at
from public.offers o
join target_products tp on tp.id = o.product_id
join expected_urls eu on eu.url = o.url
where o.is_active = true
order by o.price asc, tp.slug;
