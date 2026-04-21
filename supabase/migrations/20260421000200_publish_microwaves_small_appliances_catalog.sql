begin;

create temporary table tmp_microwave_small_appliances_catalog (
  slug text primary key,
  rank_position integer not null,
  name text not null,
  brand_name text not null,
  asin text not null,
  rating numeric(3, 2) not null,
  review_count integer not null,
  price numeric(12, 2) not null,
  old_price numeric(12, 2),
  capacity text not null,
  power text not null,
  strong_point text not null,
  ideal_for text not null,
  short_description text not null,
  long_description text not null,
  feature_1 text not null,
  feature_2 text not null,
  feature_3 text not null,
  affiliate_url text not null,
  image_url text not null
) on commit drop;

insert into tmp_microwave_small_appliances_catalog (
  slug,
  rank_position,
  name,
  brand_name,
  asin,
  rating,
  review_count,
  price,
  old_price,
  capacity,
  power,
  strong_point,
  ideal_for,
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
    'severin-mw-7770',
    1,
    'Severin mw7770',
    'Severin',
    'B0B756WF4X',
    4.30,
    2000,
    87.43,
    null,
    '20 L',
    '800 W',
    'Base plana y funcionamiento muy sencillo para uso diario',
    'quien quiere un microondas sin plato giratorio practico y facil de limpiar',
    'Microondas flatbed de entrada con buena relacion calidad-precio y uso diario sencillo.',
    'Severin MW 7770 sin plato giratorio con enfoque en limpieza rapida, manejo simple y buen equilibrio para cocina domestica.',
    'Tecnologia flatbed sin plato giratorio',
    '5 niveles de potencia',
    'Funcion descongelar',
    'https://www.amazon.es/dp/B0B756WF4X?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61H0pyEDpZL._AC_SL1000_.jpg'
  ),
  (
    'cecotec-proclean-4010-flatbed',
    2,
    'Cecotec Microondas de 20L Proclean 3110 Flatbed',
    'Cecotec',
    'B0DLLH4GCW',
    4.10,
    1000,
    63.90,
    null,
    '20 L',
    '700 W',
    'Precio competitivo con formato sin plato',
    'presupuesto ajustado sin renunciar a base plana',
    'Microondas flatbed economico para uso diario ligero y limpieza comoda.',
    'Proclean flatbed con grill y formato compacto para cocinas pequenas, priorizando coste ajustado y funcionalidad basica.',
    'Base plana flatbed',
    'Interior ceramico de facil limpieza',
    'Temporizador 30 minutos',
    'https://www.amazon.es/dp/B0DLLH4GCW?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61oUsEjtgAL._AC_SL1500_.jpg'
  ),
  (
    'caso-mg20-ecostyle-ceramic',
    3,
    'CASO MG 20 Ecostyle Ceramic',
    'CASO',
    'B07KLT25G3',
    4.20,
    700,
    137.58,
    null,
    '20 L',
    '800 W',
    'Buena potencia con base ceramica sin plato',
    'quien quiere mejor reparto de espacio interior para fuentes anchas',
    'Microondas con base ceramica y grill para un uso mas versatil en cocina diaria.',
    'CASO MG20 combina formato sin plato, buen aprovechamiento interior y controles digitales para subir un escalon frente a la gama de entrada.',
    'Base ceramica sin plato giratorio',
    'Grill integrado',
    'Programas automaticos de calentado y descongelado',
    'https://www.amazon.es/dp/B07KLT25G3?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/71LBVgSD58L._AC_SL1500_.jpg'
  ),
  (
    'toshiba-mw2-ag23pf-bk',
    4,
    'Toshiba MW2-AG23PF(BK)',
    'Toshiba',
    'B08CCF68C7',
    4.30,
    500,
    154.69,
    null,
    '23 L',
    '900 W',
    'Capacidad amplia con uso familiar diario',
    'familias que recalientan mucho y buscan interior aprovechable',
    'Microondas 3 en 1 de 23 L para hogares con uso intensivo y necesidad de capacidad.',
    'Toshiba MW2-AG23PF(BK) aporta capacidad, grill y combinaciones para un perfil familiar con uso recurrente.',
    'Funcion grill y combinacion',
    'Modo eco de ahorro energetico',
    'Memoria de posicion de plato',
    'https://www.amazon.es/dp/B08CCF68C7?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/81gnnuwFv6L._AC_SL1500_.jpg'
  ),
  (
    'samsung-mg23t5018-series',
    5,
    'SAMSUNG MG23T5018CW',
    'Samsung',
    'B08986KR5J',
    4.50,
    1000,
    135.15,
    null,
    '23 L',
    '800 W',
    'Muy buen equilibrio entre estetica, potencia y grill',
    'quien quiere un modelo fiable de marca grande con acabados cuidados',
    'Microondas Samsung de 23 L con grill y enfoque en comodidad de uso diario.',
    'Serie MG23T5018 con interior ceramico, funciones de grill y modo eco para un uso polivalente en hogar.',
    'Grill Fry',
    'Ceramica Enamel de facil limpieza',
    'Stand by Eco',
    'https://www.amazon.es/dp/B08986KR5J?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/51HIR2oKxuL._AC_QL10_SX980_SY55_FMwebp_.jpg'
  ),
  (
    'caso-mcg-30-ceramic-chef',
    6,
    'CASO MCG 30 Ceramic Chef',
    'CASO',
    'B01N63P2JK',
    4.20,
    300,
    211.90,
    null,
    '30 L',
    '900 W',
    'Combina microondas, grill y conveccion con base sin plato',
    'quien quiere un microondas muy completo para cocinar mas cosas',
    'Microondas premium 3 en 1 con gran capacidad y perfil multifuncion.',
    'CASO MCG 30 Ceramic Chef destaca por combinar microondas, grill y conveccion en 30 L con base sin plato.',
    'Flatbed sin plato giratorio',
    'Grill y conveccion',
    'Gran capacidad para bandejas amplias',
    'https://www.amazon.es/dp/B01N63P2JK?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61kcyMe3ecL._AC_SL1500_.jpg'
  ),
  (
    'cecotec-proclean-5110-inox',
    7,
    'Cecotec ProClean 5110 Inox',
    'Cecotec',
    'B07HC8YWFX',
    4.00,
    2000,
    69.90,
    null,
    '20 L',
    '800 W',
    'Diseno compacto con buen nivel de potencia',
    'quien quiere formato moderno para cocina pequena',
    'Microondas compacto con grill y acabado inox para cocinas de espacio reducido.',
    'ProClean 5110 Inox ofrece perfil compacto y uso sencillo manteniendo potencia suficiente para tareas diarias.',
    'Acabado frontal inox',
    'Tecnologia 3DWave',
    'Funcion descongelado',
    'https://www.amazon.es/dp/B07HC8YWFX?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61Oo+QqzBiL._AC_SL1500_.jpg'
  ),
  (
    'orbegozo-mig-2525',
    8,
    'Orbegozo MIG 2525',
    'Orbegozo',
    'B005G7L3PS',
    4.10,
    1500,
    153.76,
    null,
    '25 L',
    '900 W',
    'Capacidad correcta con precio competitivo',
    'quien quiere gastar poco y resolver uso diario basico',
    'Microondas con grill y 25 L para quienes priorizan litros utiles y manejo directo.',
    'Orbegozo MIG 2525 combina buena capacidad y potencia para uso domestico general con controles faciles.',
    '25 L de capacidad',
    '9 menus y 8 niveles de potencia',
    'Temporizador con senal de fin',
    'https://www.amazon.es/dp/B005G7L3PS?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61rtdXWxjoL._AC_SL1417_.jpg'
  );

create temporary table tmp_microwave_small_appliances_refs (
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
      c.slug in ('electrodomesticos-y-cocina', 'electrodomsticos-y-cocina')
      or lower(c.name) = 'electrodomesticos y cocina'
    )
  order by
    case
      when c.slug = 'electrodomesticos-y-cocina' then 0
      when c.slug = 'electrodomsticos-y-cocina' then 1
      else 2
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_parent_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos y Cocina', 'electrodomesticos-y-cocina', null, true, 0)
    returning id into v_parent_category_id;
  else
    update public.categories c
    set is_active = true
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
        'pequenos electrodomesticos'
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
      parent_id = v_parent_category_id,
      is_active = true
    where c.id = v_category_id;
  end if;

  update public.brands b
  set is_active = true
  from (select distinct t.brand_name from tmp_microwave_small_appliances_catalog t) t
  where lower(b.name) = lower(t.brand_name);

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_microwave_small_appliances_catalog t
  where not exists (
    select 1
    from public.brands b
    where lower(b.name) = lower(t.brand_name)
  );

  select m.id
  into v_merchant_id
  from public.merchants m
  where m.domain = 'amazon.es'
     or lower(m.name) in ('amazon', 'amazon afiliados', 'amazon affiliates')
  order by
    case
      when m.domain = 'amazon.es' then 0
      when lower(m.name) = 'amazon' then 1
      else 2
    end,
    m.updated_at desc nulls last,
    m.id
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
      'Amazon',
      'https://logo.clearbit.com/amazon.es',
      'amazon.es',
      'ES',
      true
    )
    returning id into v_merchant_id;
  else
    update public.merchants m
    set
      domain = coalesce(nullif(m.domain, ''), 'amazon.es'),
      country = coalesce(nullif(m.country, ''), 'ES'),
      is_active = true,
      logo_url = coalesce(nullif(m.logo_url, ''), 'https://logo.clearbit.com/amazon.es')
    where m.id = v_merchant_id;
  end if;

  delete from tmp_microwave_small_appliances_refs;
  insert into tmp_microwave_small_appliances_refs (parent_category_id, category_id, merchant_id)
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
    'rank', t.rank_position,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'capacity', t.capacity,
    'power', t.power,
    'strongPoint', t.strong_point,
    'idealFor', t.ideal_for,
    'source', 'amazon-es',
    'sourceArticleSlug', 'mejores-microondas-sin-plato-giratorio-2026',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3)
  ),
  array[
    'microondas',
    'microondas sin plato giratorio',
    'electrodomesticos-pequenos',
    'electrodomesticos-y-cocina',
    'amazon',
    '2026',
    lower(replace(t.brand_name, ' ', '-'))
  ],
  jsonb_build_object(
    'asin', t.asin,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'capacity', t.capacity,
    'power', t.power,
    'rank', t.rank_position
  ),
  true
from tmp_microwave_small_appliances_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_microwave_small_appliances_refs r
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
from tmp_microwave_small_appliances_catalog t
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
from tmp_microwave_small_appliances_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_microwave_small_appliances_refs r
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
from tmp_microwave_small_appliances_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_microwave_small_appliances_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;
