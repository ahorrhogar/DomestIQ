begin;

create temporary table tmp_airfryer_catalog (
  slug text primary key,
  name text not null,
  brand_name text not null,
  asin text not null,
  capacity text not null,
  power text not null,
  temperature text not null,
  programs text not null,
  rating numeric(3, 2) not null,
  review_count integer not null,
  price numeric(12, 2) not null,
  old_price numeric(12, 2),
  short_description text not null,
  long_description text not null,
  feature_1 text not null,
  feature_2 text not null,
  feature_3 text not null,
  affiliate_url text not null,
  image_url text not null
) on commit drop;

insert into tmp_airfryer_catalog (
  slug,
  name,
  brand_name,
  asin,
  capacity,
  power,
  temperature,
  programs,
  rating,
  review_count,
  price,
  old_price,
  short_description,
  long_description,
  feature_1,
  feature_2,
  feature_3,
  affiliate_url,
  image_url
)
values
  (
    'cecofry-fantastik-window-4000',
    'Cecofry Fantastik Window 4000',
    'Cecotec',
    'UNKNOWN',
    '4 L',
    '1400 W',
    '80-200 C',
    '9 menus',
    4.40,
    1322,
    39.90,
    null,
    'Freidora de aire compacta para uso diario en hogares de 1-2 personas.',
    'Modelo de entrada con ventana frontal para supervisar la coccion y panel tactil sencillo para uso cotidiano con bajo presupuesto.',
    'Ventana frontal para seguir la coccion',
    'Tiempo ajustable hasta 60 minutos',
    'Formato compacto para cocina pequena',
    'https://amzn.to/4ezmAMG',
    'https://m.media-amazon.com/images/I/51SmikZCEcL._AC_SX425_.jpg'
  ),
  (
    'cecofry-supreme-8000',
    'Cecofry Supreme 8000',
    'Cecotec',
    'UNKNOWN',
    '8 L',
    '1800 W',
    '30-200 C',
    '10 menus',
    4.50,
    1613,
    59.90,
    null,
    'Freidora de aire de gran capacidad orientada a familias y lotes grandes.',
    'Opcion de 8 litros para reducir tandas de coccion y ganar comodidad en uso frecuente para 3-5 personas.',
    'Capacidad de 8 litros',
    'Rango de temperatura amplio',
    'Panel de control tactil',
    'https://amzn.to/4tjXWVa',
    'https://m.media-amazon.com/images/I/5177g+9MCDL._AC_SX425_.jpg'
  ),
  (
    'cecofry-full-inoxblack-5500-pro',
    'Cecofry Full InoxBlack 5500 Pro',
    'Cecotec',
    'UNKNOWN',
    '5,5 L',
    '1700 W',
    '80-200 C',
    '8 modos',
    4.40,
    4736,
    43.90,
    null,
    'Freidora de aire equilibrada para uso diario de 2-4 personas.',
    'Modelo consolidado con buena potencia, capacidad intermedia y posicionamiento calidad-precio para cocina diaria.',
    'Acabado InoxBlack',
    'Tecnologia PerfectCook',
    'Panel tactil intuitivo',
    'https://amzn.to/4mCSWbE',
    'https://m.media-amazon.com/images/I/519AN1zQmbL._AC_SX425_.jpg'
  ),
  (
    'cosori-air-fryer-real-metallic-interior-57l',
    'COSORI Air Fryer Real Metallic Interior 5.7L',
    'COSORI',
    'UNKNOWN',
    '5,7 L',
    '1700 W',
    'No visible en extracto',
    'Programas automaticos',
    4.70,
    103765,
    99.99,
    null,
    'Freidora de aire premium para quienes priorizan robustez y marca.',
    'Opcion de gama alta dentro del limite de 100 EUR, con gran volumen de valoraciones y enfoque en durabilidad.',
    'Interior metalico',
    'Cesta de 5,7 litros',
    'Perfil premium y consolidado',
    'https://amzn.to/4cv0gBv',
    'https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX425_.jpg'
  ),
  (
    'cecofry-grill-duoheat-6500-plus',
    'Cecofry&Grill Duoheat 6500 Plus',
    'Cecotec',
    'UNKNOWN',
    '6,5 L',
    '2200 W',
    '40-200 C',
    '12 menus',
    4.30,
    591,
    57.90,
    null,
    'Freidora de aire con funcion grill y alta potencia para uso versatil.',
    'Modelo multifuncion con doble resistencia, ventana y enfoque en recetas variadas con mejor dorado.',
    'Doble resistencia',
    'Ventana de visualizacion',
    'Perfil freidora + grill',
    'https://amzn.to/4dPJC1G',
    'https://m.media-amazon.com/images/I/71qEef7KxUL._AC_SX425_.jpg'
  );

create temporary table tmp_airfryer_refs (
  parent_category_id uuid not null,
  category_id uuid not null,
  merchant_id uuid not null
) on commit drop;

do $$
declare
  v_parent_category_id uuid;
  v_category_id uuid;
  v_merchant_id uuid;
begin
  select c.id
  into v_parent_category_id
  from public.categories c
  where c.parent_id is null
    and (
      c.slug = 'electrodomesticos'
      or lower(c.name) = 'electrodomesticos'
    )
  order by case when c.slug = 'electrodomesticos' then 0 else 1 end, c.updated_at desc nulls last, c.id
  limit 1;

  if v_parent_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos', 'electrodomesticos', null, true, 0)
    returning id into v_parent_category_id;
  else
    update public.categories c
    set
      slug = coalesce(nullif(c.slug, ''), 'electrodomesticos'),
      is_active = true
    where c.id = v_parent_category_id;
  end if;

  select c.id
  into v_category_id
  from public.categories c
  where c.parent_id = v_parent_category_id
    and (
      c.slug in ('electrodomesticos-pequenos', 'pequenos-electrodomesticos')
      or lower(c.name) in (
        'electrodomesticos pequenos',
        'electrodomésticos pequeños',
        'pequenos electrodomesticos',
        'pequeños electrodomésticos'
      )
    )
  order by
    case
      when c.slug = 'electrodomesticos-pequenos' then 0
      when c.slug = 'pequenos-electrodomesticos' then 1
      else 2
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos Pequenos', 'electrodomesticos-pequenos', v_parent_category_id, true, 30)
    returning id into v_category_id;
  else
    update public.categories c
    set
      slug = coalesce(nullif(c.slug, ''), 'electrodomesticos-pequenos'),
      parent_id = v_parent_category_id,
      is_active = true
    where c.id = v_category_id;
  end if;

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_airfryer_catalog t
  on conflict (name) do update
  set is_active = true;

  select m.id
  into v_merchant_id
  from public.merchants m
  where m.domain = 'amzn.to'
     or lower(m.name) in ('amazon afiliados', 'amazon affiliates')
  order by case when m.domain = 'amzn.to' then 0 else 1 end, m.updated_at desc nulls last, m.id
  limit 1;

  if v_merchant_id is null then
    insert into public.merchants (
      name,
      logo_url,
      domain,
      country,
      is_active
    )
    values (
      'Amazon Afiliados',
      'https://logo.clearbit.com/amzn.to',
      'amzn.to',
      'ES',
      true
    )
    returning id into v_merchant_id;
  else
    update public.merchants m
    set
      domain = 'amzn.to',
      country = coalesce(nullif(m.country, ''), 'ES'),
      is_active = true,
      logo_url = coalesce(nullif(m.logo_url, ''), 'https://logo.clearbit.com/amzn.to')
    where m.id = v_merchant_id;
  end if;

  delete from tmp_airfryer_refs;
  insert into tmp_airfryer_refs (parent_category_id, category_id, merchant_id)
  values (v_parent_category_id, v_category_id, v_merchant_id);
end;
$$;

insert into public.products (
  name,
  slug,
  brand_id,
  category_id,
  description,
  short_description,
  long_description,
  specs,
  tags,
  attributes,
  is_active
)
select
  t.name,
  t.slug,
  b.id,
  r.category_id,
  t.short_description,
  t.short_description,
  t.long_description,
  jsonb_build_object(
    'asin', t.asin,
    'capacity', t.capacity,
    'power', t.power,
    'temperature', t.temperature,
    'programs', t.programs,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'source', 'amazon-es',
    'sourceArticleSlug', 'mejores-freidoras-aire-amazon-2026-menos-100-euros',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3),
    'attributes', jsonb_build_object(
      'capacidad', t.capacity,
      'potencia', t.power,
      'temperatura', t.temperature,
      'programas', t.programs
    )
  ),
  array['freidora de aire', 'air fryer', 'electrodomesticos-pequenos', 'amazon', '2026', lower(replace(t.brand_name, ' ', '-'))],
  jsonb_build_object(
    'asin', t.asin,
    'capacity', t.capacity,
    'power', t.power,
    'rating', t.rating,
    'reviewCount', t.review_count
  ),
  true
from tmp_airfryer_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_airfryer_refs r
on conflict (slug) where slug is not null do update
set
  name = excluded.name,
  brand_id = excluded.brand_id,
  category_id = excluded.category_id,
  description = excluded.description,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  specs = excluded.specs,
  tags = excluded.tags,
  attributes = excluded.attributes,
  is_active = true;

insert into public.product_images (
  product_id,
  url,
  is_primary,
  sort_order
)
select
  p.id,
  t.image_url,
  not exists (
    select 1
    from public.product_images pi_primary
    where pi_primary.product_id = p.id
      and pi_primary.is_primary = true
  ) as is_primary,
  coalesce((
    select max(pi_sort.sort_order) + 1
    from public.product_images pi_sort
    where pi_sort.product_id = p.id
  ), 0) as sort_order
from tmp_airfryer_catalog t
join public.products p
  on p.slug = t.slug
where not exists (
  select 1
  from public.product_images pi
  where pi.product_id = p.id
    and pi.url = t.image_url
);

update public.offers o
set
  price = t.price,
  old_price = case
    when t.old_price is not null and t.old_price > t.price then t.old_price
    else null
  end,
  current_price = t.price,
  url = t.affiliate_url,
  stock = true,
  is_active = true,
  is_featured = false,
  source_type = 'manual',
  update_mode = 'manual',
  sync_status = 'ok',
  last_checked_at = now(),
  next_check_at = now() + interval '24 hours',
  last_sync_error = null,
  priority_score = coalesce(o.priority_score, 0),
  freshness_score = 100
from tmp_airfryer_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_airfryer_refs r
where o.product_id = p.id
  and o.merchant_id = r.merchant_id
  and o.url = t.affiliate_url;

insert into public.offers (
  product_id,
  merchant_id,
  price,
  old_price,
  url,
  stock,
  is_active,
  is_featured,
  source_type,
  update_mode,
  sync_status,
  current_price,
  last_checked_at,
  next_check_at,
  priority_score,
  freshness_score
)
select
  p.id,
  r.merchant_id,
  t.price,
  case
    when t.old_price is not null and t.old_price > t.price then t.old_price
    else null
  end,
  t.affiliate_url,
  true,
  true,
  false,
  'manual',
  'manual',
  'ok',
  t.price,
  now(),
  now() + interval '24 hours',
  0,
  100
from tmp_airfryer_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_airfryer_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;