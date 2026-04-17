begin;

create temporary table tmp_fan_catalog (
  slug text primary key,
  name text not null,
  brand_name text not null,
  asin text not null,
  fan_type text not null,
  speed_modes text not null,
  key_specs text not null,
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

insert into tmp_fan_catalog (
  slug,
  name,
  brand_name,
  asin,
  fan_type,
  speed_modes,
  key_specs,
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
    'orbegozo-sf-0147-ventilador-de-pie',
    'Orbegozo SF 0147',
    'Orbegozo',
    'B01D4YVY80',
    'Ventilador de pie',
    '3 velocidades',
    '40 cm, 5 aspas',
    4.30,
    14909,
    20.65,
    29.99,
    'Ventilador de pie economico para uso diario en verano.',
    'Modelo clasico con gran volumen de valoraciones y precio de entrada competitivo para refrescar habitaciones pequenas y medianas.',
    'Precio de entrada competitivo',
    'Formato clasico facil de montar',
    'Modelo con mucha prueba social',
    'https://amzn.to/4mEnAS3',
    'https://m.media-amazon.com/images/I/61n+-Yq1j7L._AC_SX425_.jpg'
  ),
  (
    'cecotec-energysilence-890-skyline',
    'Cecotec EnergySilence 890 Skyline',
    'Cecotec',
    'B092JB4Z7J',
    'Ventilador de torre',
    '3 velocidades, 3 modos',
    '50 W, 76 cm, temporizador',
    4.30,
    4259,
    37.90,
    39.90,
    'Ventilador de torre para espacios reducidos con buen equilibrio calidad-precio.',
    'Opcion vertical para salon o dormitorio con huella estrecha, modo noche y rendimiento solido dentro de su rango.',
    'Diseno vertical que ocupa poco espacio',
    'Buena relacion entre precio y prestaciones',
    'Incluye configuracion de modo noche',
    'https://amzn.to/4erjkmy',
    'https://m.media-amazon.com/images/I/51TVMEm0DqL._AC_SX425_.jpg'
  ),
  (
    'amazon-basics-ventilador-pie-40cm-dc',
    'Amazon Basics Ventilador de pie 40 cm',
    'Amazon Basics',
    'B07VZRHM6T',
    'Ventilador de pie DC',
    '12 velocidades, 3 modos',
    'Motor DC, mando a distancia',
    4.60,
    313,
    31.40,
    null,
    'Ventilador de pie con motor DC y control fino de velocidad.',
    'Modelo orientado a confort nocturno gracias a sus 12 niveles de potencia y mando remoto para ajuste preciso.',
    '12 niveles para ajuste fino de caudal',
    'Motor DC eficiente para uso prolongado',
    'Incluye mando a distancia',
    'https://amzn.to/4cngH2s',
    'https://m.media-amazon.com/images/I/61kV75O1C9L._AC_SX425_.jpg'
  ),
  (
    'orbegozo-sf-0149-ventilador-de-pie',
    'Orbegozo SF 0149',
    'Orbegozo',
    'B07CJ33NX9',
    'Ventilador de pie',
    '3 velocidades',
    '40 cm, oscilacion automatica',
    4.20,
    3891,
    28.08,
    35.50,
    'Ventilador de pie equilibrado para uso cotidiano con presupuesto moderado.',
    'Referencia consolidada para quienes buscan una opcion estable por menos de 30 EUR en temporada de calor.',
    'Muy conocido en ventas estacionales',
    'Facil de configurar y utilizar',
    'Coste competitivo para uso diario',
    'https://amzn.to/4cPz3KW',
    'https://m.media-amazon.com/images/I/713Cf0YK-2L._AC_SX425_.jpg'
  ),
  (
    'dreo-quiet-standing-fan-upgraded',
    'Dreo Quiet Standing Fan [Upgraded]',
    'Dreo',
    'B0DQDQGQPD',
    'Ventilador de pie premium',
    '8 velocidades, 3 modos',
    '20 dB, motor DC, oscilacion 90 grados',
    4.60,
    3422,
    76.49,
    89.99,
    'Ventilador premium enfocado en bajo ruido para uso en dormitorio.',
    'Version mejorada con motor DC, ajuste fino y perfil silencioso para noches de verano con confort sostenido.',
    'Bajo ruido para uso nocturno',
    'Control preciso en multiples velocidades',
    'Flujo de aire potente con consumo contenido',
    'https://amzn.to/4sZQAoV',
    'https://m.media-amazon.com/images/I/71TVVOPK1JL._AC_SY550_.jpg'
  ),
  (
    'dreo-nomad-one-20db',
    'Dreo Nomad One 20dB',
    'Dreo',
    'B09MKPDJRT',
    'Ventilador de torre',
    '4 velocidades, 4 modos',
    '20 dB, 7.6 m/s, temporizador 8 h',
    4.50,
    43629,
    89.99,
    null,
    'Ventilador de torre premium con altisimo volumen de valoraciones.',
    'Modelo de gama alta para quien prioriza silencio, potencia y confianza de usuarios en formato torre moderno.',
    'Muy alta prueba social en Amazon',
    'Enfoque fuerte en silencio y confort',
    'Buen rendimiento para dormitorio moderno',
    'https://amzn.to/484czU2',
    'https://m.media-amazon.com/images/I/71G7qy9UDpL._AC_SY550_.jpg'
  ),
  (
    'cecotec-energysilence-5000-pro',
    'Cecotec EnergySilence 5000 Pro',
    'Cecotec',
    'B092JKQFHB',
    'Ventilador industrial de suelo',
    '3 velocidades',
    '120 W, 20 pulgadas, aspas metalicas',
    4.40,
    452,
    52.90,
    null,
    'Ventilador industrial para mover gran volumen de aire en estancias amplias.',
    'Alternativa robusta para garaje, gimnasio o zonas calurosas donde prima potencia sobre silencio.',
    'Caudal alto en formato industrial',
    'Construccion metalica robusta',
    'Angulo de inclinacion ajustable',
    'https://amzn.to/4sCdodR',
    'https://m.media-amazon.com/images/I/61HxmO64y4L._AC_SX425_.jpg'
  ),
  (
    'cecotec-energysilence-510',
    'Cecotec EnergySilence 510',
    'Cecotec',
    'B092J18KBQ',
    'Ventilador de pie',
    '3 velocidades',
    '40 W, 40 cm, altura regulable',
    3.90,
    4982,
    29.90,
    null,
    'Ventilador de pie basico para presupuesto contenido y uso diario.',
    'Referencia popular de gama economica con ajuste de altura y oscilacion para resolver calor moderado.',
    'Precio accesible en gama de entrada',
    'Altura regulable con oscilacion',
    'Facil de reemplazar en temporada',
    'https://amzn.to/4cV5SFt',
    'https://m.media-amazon.com/images/I/51YFqHbQJnL._AC_SX425_.jpg'
  ),
  (
    'cecotec-energysilence-1020-extremeconnected',
    'Cecotec EnergySilence 1020 ExtremeConnected',
    'Cecotec',
    'B092J5WBKN',
    'Ventilador de pie con mando',
    '6 velocidades, 3 modos',
    '60 W, 10 aspas, temporizador 15 h',
    4.60,
    994,
    57.90,
    null,
    'Ventilador de pie con funciones avanzadas y buen balance de precio.',
    'Punto medio muy completo para verano intenso, con mando remoto, temporizador largo y muy buena valoracion media.',
    'Control remoto y temporizador extenso',
    '10 aspas para flujo mas uniforme',
    'Balance solido entre precio y prestaciones',
    'https://amzn.to/4vCEVie',
    'https://m.media-amazon.com/images/I/51ociv32PYS._AC_SX425_.jpg'
  ),
  (
    'orbegozo-pw-1240-power-fan',
    'Orbegozo PW 1240 Power Fan',
    'Orbegozo',
    'B07R6364VK',
    'Ventilador industrial de suelo',
    '3 velocidades',
    '70 W, aspas metalicas 40 cm',
    4.50,
    158,
    38.50,
    null,
    'Ventilador de suelo para impacto rapido de caudal en espacios amplios.',
    'Modelo industrial de Orbegozo para salon grande o taller, con buena potencia y precio competitivo en su segmento.',
    'Caudal potente para estancias amplias',
    'Asa de transporte entre estancias',
    'Construccion metalica resistente',
    'https://amzn.to/4myFl50',
    'https://m.media-amazon.com/images/I/91hmr+6PBqL._AC_SX425_.jpg'
  );

create temporary table tmp_fan_refs (
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
      c.slug = 'climatizacion'
      or lower(c.name) = 'climatizacion'
    )
  order by case when c.slug = 'climatizacion' then 0 else 1 end, c.updated_at desc nulls last, c.id
  limit 1;

  if v_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Climatizacion', 'climatizacion', v_parent_category_id, true, 40)
    returning id into v_category_id;
  else
    update public.categories c
    set
      slug = coalesce(nullif(c.slug, ''), 'climatizacion'),
      parent_id = v_parent_category_id,
      is_active = true
    where c.id = v_category_id;
  end if;

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_fan_catalog t
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

  delete from tmp_fan_refs;
  insert into tmp_fan_refs (parent_category_id, category_id, merchant_id)
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
    'fanType', t.fan_type,
    'speedModes', t.speed_modes,
    'keySpecs', t.key_specs,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'source', 'amazon-es',
    'sourceArticleSlug', 'mejores-ventiladores-de-pie-para-este-verano-2026',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3),
    'attributes', jsonb_build_object(
      'tipo', t.fan_type,
      'velocidades', t.speed_modes,
      'especificaciones', t.key_specs
    )
  ),
  array['ventilador', 'climatizacion', 'amazon', 'verano-2026', lower(replace(t.brand_name, ' ', '-'))],
  jsonb_build_object(
    'asin', t.asin,
    'fanType', t.fan_type,
    'speedModes', t.speed_modes,
    'rating', t.rating,
    'reviewCount', t.review_count
  ),
  true
from tmp_fan_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_fan_refs r
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
from tmp_fan_catalog t
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
from tmp_fan_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_fan_refs r
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
from tmp_fan_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_fan_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;
