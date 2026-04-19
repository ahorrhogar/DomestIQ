begin;

create temporary table tmp_terrace_tables_catalog (
  slug text primary key,
  rank_position integer not null,
  name text not null,
  brand_name text not null,
  table_type text not null,
  dimensions text not null,
  rating numeric(3, 2) not null,
  review_count integer not null,
  price numeric(12, 2) not null,
  old_price numeric(12, 2),
  best_for text not null,
  short_description text not null,
  long_description text not null,
  feature_1 text not null,
  feature_2 text not null,
  feature_3 text not null,
  affiliate_url text not null,
  image_url text not null
) on commit drop;

insert into tmp_terrace_tables_catalog (
  slug,
  rank_position,
  name,
  brand_name,
  table_type,
  dimensions,
  rating,
  review_count,
  price,
  old_price,
  best_for,
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
    'casaria-mesa-plegable-acacia-46x46',
    1,
    'Casaria mesa plegable acacia 46 x 46',
    'Casaria',
    'Mesa auxiliar plegable',
    '46 x 46 cm',
    4.60,
    4542,
    35.99,
    null,
    'balcones pequenos y compras de bajo riesgo',
    'Mesa auxiliar compacta y plegable para balcones pequenos y uso diario.',
    'Opcion de entrada con precio competitivo, tamano reducido y miles de valoraciones para comprar con bajo riesgo.',
    'Mesa compacta y facil de guardar',
    'Valoracion media alta con mas de 4500 reseñas',
    'Formato ideal para balcon urbano',
    'https://amzn.to/3Oo5BT9',
    'https://m.media-amazon.com/images/I/81mysC2tsNL._AC_SX522_.jpg'
  ),
  (
    'ipae-saturnia-redonda-90cm',
    2,
    'IPAE Saturnia redonda 90 cm',
    'IPAE',
    'Mesa redonda de resina',
    '90 cm diametro',
    4.30,
    460,
    39.99,
    null,
    'comidas rapidas en terraza sin gastar mucho',
    'Mesa redonda funcional de resina para exterior con coste contenido.',
    'Alternativa practica para terrazas pequenas con una superficie redonda versatil y mantenimiento sencillo.',
    'Formato redondo practico para balcon',
    'Buena relacion tamano precio',
    'Limpieza rapida para uso diario',
    'https://amzn.to/3Qs29r5',
    'https://m.media-amazon.com/images/I/31fAo7fasEL._AC_SX522_.jpg'
  ),
  (
    'casaria-mesa-auxiliar-acacia-45x45',
    3,
    'Casaria mesa auxiliar acacia 45 x 45',
    'Casaria',
    'Mesa auxiliar de madera',
    '45 x 45 x 45 cm',
    4.30,
    2190,
    44.95,
    null,
    'terrazas pequenas con look madera',
    'Mesa auxiliar de acacia para balcones con foco en estetica calida.',
    'Buena opcion para quien busca una mesa de apoyo compacta con acabado de madera y volumen alto de valoraciones.',
    'Acabado acacia muy demandado',
    'Tamano mini para espacios urbanos',
    'Historial de compra consolidado',
    'https://amzn.to/4tVWAQd',
    'https://m.media-amazon.com/images/I/81egF+veYAL._AC_SX522_.jpg'
  ),
  (
    'devoko-mesa-extensible-aluminio-80x80-160',
    4,
    'Devoko mesa extensible aluminio',
    'Devoko',
    'Mesa exterior extensible',
    '80 x 80 x 75 cm (hasta 160 cm)',
    4.60,
    313,
    199.00,
    null,
    'quien recibe visitas y necesita mesa adaptable',
    'Mesa extensible de aluminio para exterior con uso diario y reuniones.',
    'Propuesta versatil para pasar de formato compacto a mesa amplia cuando hay invitados, manteniendo buena valoracion media.',
    'Sistema extensible para mas comensales',
    'Acabado de aluminio para exterior',
    'Solucion todo en uno para terraza',
    'https://amzn.to/4dQppc9',
    'https://m.media-amazon.com/images/I/61I8vG8-fDL._AC_SX522_.jpg'
  ),
  (
    'keter-quartet-95',
    5,
    'Keter Quartet 95',
    'Keter',
    'Mesa cuadrada resina efecto ratan',
    '95 x 74,5 x 95 cm',
    4.60,
    411,
    76.95,
    null,
    'terraza media con foco en equilibrio calidad precio',
    'Mesa cuadrada de resina para exterior con buena estabilidad y presencia.',
    'Modelo equilibrado para subir calidad frente a opciones mini sin saltar a precios premium.',
    'Tamano cuadrado muy versatil',
    'Resina facil de mantener',
    'Buena nota media en su rango',
    'https://amzn.to/4tdA3OQ',
    'https://m.media-amazon.com/images/I/71U-SaOmJjL._AC_SX522_.jpg'
  ),
  (
    'yoevu-mesa-plegable-180cm',
    6,
    'YOEVU mesa plegable 180 cm',
    'YOEVU',
    'Mesa plegable tipo maleta',
    '180 cm de largo',
    4.50,
    100,
    41.90,
    null,
    'comidas grandes o eventos en patio',
    'Mesa plegable larga para reuniones puntuales con facil almacenaje.',
    'Alternativa funcional para ganar muchos asientos por poco presupuesto, ideal para eventos y temporadas de exterior.',
    'Gran superficie util para su precio',
    'Diseno plegable y portable',
    'Facil de guardar cuando no se usa',
    'https://amzn.to/4vH9d3q',
    'https://m.media-amazon.com/images/I/61RTpaKMh9L._AC_SX522_.jpg'
  ),
  (
    'casaria-mesa-plegable-acacia-160x85',
    7,
    'CASARIA mesa plegable acacia 160 x 85',
    'Casaria',
    'Mesa de comedor exterior plegable',
    '160 x 85 cm',
    4.10,
    774,
    101.95,
    null,
    'familias que comen fuera de forma habitual',
    'Mesa plegable grande de acacia para comedor exterior familiar.',
    'Opcion potente para convertir la terraza en zona de comedor diaria sin pasar a precios de gama alta.',
    'Superficie amplia para uso frecuente',
    'Incluye agujero para sombrilla',
    'Buena presencia en madera acacia',
    'https://amzn.to/4chjjjN',
    'https://m.media-amazon.com/images/I/51YhAf07OUL._AC_SX522_.jpg'
  ),
  (
    'hollyhome-mesa-auxiliar-redonda-metal',
    8,
    'HollyHOME mesa auxiliar redonda metal',
    'HollyHOME',
    'Mesa auxiliar redonda',
    'Formato pequeno redondo',
    4.60,
    617,
    36.99,
    null,
    'rincones chill out y balcon de poco fondo',
    'Mesa auxiliar redonda ligera para balcones y zonas de apoyo.',
    'Compra de bajo riesgo para crear un rincon exterior bonito con poco gasto y valoraciones consistentes.',
    'Diseno ligero y facil de mover',
    'Buena valoracion media para su precio',
    'Encaja bien como mesa de apoyo',
    'https://amzn.to/3QgdvP6',
    'https://m.media-amazon.com/images/I/61T3YQY7H6L._AC_SX522_.jpg'
  ),
  (
    'phi-villa-mesa-plegable-cristal',
    9,
    'PHI VILLA mesa plegable cristal',
    'PHI VILLA',
    'Mesa redonda plegable metal y cristal',
    'Formato redondo compacto',
    4.40,
    1405,
    39.99,
    null,
    'quien quiere mesa ligera y facil de plegar',
    'Mesa redonda plegable de cristal para balcones y terrazas versatiles.',
    'Candidata fuerte para espacio urbano por su mezcla de diseno, plegado sencillo y buen historial de valoraciones.',
    'Formato plegable para guardado rapido',
    'Mas de 1400 reseñas',
    'Aspecto visual cuidado para exterior',
    'https://amzn.to/42eiNx3',
    'https://m.media-amazon.com/images/I/71F9aghIMWL._AC_SX522_.jpg'
  ),
  (
    'casaria-set-terraza-mesa-4-sillas',
    10,
    'CASARIA set terraza mesa + 4 sillas',
    'Casaria',
    'Set exterior de 5 piezas',
    'Mesa 120 x 70 cm',
    3.50,
    1126,
    218.99,
    null,
    'quien quiere resolver mesa y sillas en un solo pack',
    'Set completo de mesa exterior y cuatro sillas plegables para montaje rapido.',
    'Solucion integral para equipar la zona de comedor exterior en una sola compra, especialmente util en segunda residencia.',
    'Incluye 4 sillas plegables',
    'Pack cerrado listo para usar',
    'Ideal para resolver terraza completa',
    'https://amzn.to/4tl9qYs',
    'https://m.media-amazon.com/images/I/81WQpAkvukL._AC_SX522_.jpg'
  );

create temporary table tmp_terrace_refs (
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
      c.slug in ('jardin-y-exterior', 'jardin-exterior', 'jardin')
      or lower(c.name) in ('jardin y exterior', 'jardin')
    )
  order by
    case
      when c.slug = 'jardin-y-exterior' then 0
      when c.slug = 'jardin-exterior' then 1
      when c.slug = 'jardin' then 2
      when lower(c.name) = 'jardin y exterior' then 3
      else 4
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_parent_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Jardin y Exterior', 'jardin-y-exterior', null, true, 40)
    returning id into v_parent_category_id;
  else
    update public.categories c
    set
      slug = coalesce(nullif(c.slug, ''), 'jardin-y-exterior'),
      is_active = true
    where c.id = v_parent_category_id;
  end if;

  select c.id
  into v_category_id
  from public.categories c
  where c.parent_id = v_parent_category_id
    and (
      c.slug = 'mesas-de-exterior'
      or lower(c.name) in ('mesas de exterior', 'mesas exterior')
    )
  order by
    case
      when c.slug = 'mesas-de-exterior' then 0
      else 1
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Mesas de Exterior', 'mesas-de-exterior', v_parent_category_id, true, 20)
    returning id into v_category_id;
  else
    update public.categories c
    set
      slug = coalesce(nullif(c.slug, ''), 'mesas-de-exterior'),
      parent_id = v_parent_category_id,
      is_active = true
    where c.id = v_category_id;
  end if;

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_terrace_tables_catalog t
  on conflict (name) do update
  set is_active = true;

  select m.id
  into v_merchant_id
  from public.merchants m
  where m.domain = 'amzn.to'
     or lower(m.name) in ('amazon afiliados', 'amazon affiliates')
  order by
    case
      when m.domain = 'amzn.to' then 0
      when lower(m.name) = 'amazon afiliados' then 1
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
      domain = coalesce(nullif(m.domain, ''), 'amzn.to'),
      country = coalesce(nullif(m.country, ''), 'ES'),
      is_active = true,
      logo_url = coalesce(nullif(m.logo_url, ''), 'https://logo.clearbit.com/amzn.to')
    where m.id = v_merchant_id;
  end if;

  delete from tmp_terrace_refs;
  insert into tmp_terrace_refs (parent_category_id, category_id, merchant_id)
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
    'asin', 'UNKNOWN',
    'rank', t.rank_position,
    'tableType', t.table_type,
    'dimensions', t.dimensions,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'bestFor', t.best_for,
    'source', 'amazon-es',
    'sourceArticleSlug', '10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3),
    'attributes', jsonb_build_object(
      'tipo', t.table_type,
      'dimensiones', t.dimensions,
      'usoRecomendado', t.best_for
    )
  ),
  array[
    'mesa de exterior',
    'mesa de terraza',
    'jardin-y-exterior',
    'mesas-de-exterior',
    'amazon',
    '2026',
    lower(replace(t.brand_name, ' ', '-'))
  ],
  jsonb_build_object(
    'asin', 'UNKNOWN',
    'rating', t.rating,
    'reviewCount', t.review_count,
    'tableType', t.table_type,
    'dimensions', t.dimensions,
    'bestFor', t.best_for,
    'rank', t.rank_position
  ),
  true
from tmp_terrace_tables_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_terrace_refs r
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
from tmp_terrace_tables_catalog t
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
from tmp_terrace_tables_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_terrace_refs r
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
from tmp_terrace_tables_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_terrace_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;
