begin;

create temporary table tmp_large_appliances_fridge_catalog (
  slug text primary key,
  rank_position integer not null,
  name text not null,
  brand_name text not null,
  asin text not null,
  rating numeric(3, 2) not null,
  review_count integer not null,
  price numeric(12, 2) not null,
  old_price numeric(12, 2),
  energy_class text not null,
  capacity_liters integer not null,
  dimensions_cm text not null,
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

insert into tmp_large_appliances_fridge_catalog (
  slug,
  rank_position,
  name,
  brand_name,
  asin,
  rating,
  review_count,
  price,
  old_price,
  energy_class,
  capacity_liters,
  dimensions_cm,
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
    'whirlpool-whk-26404-xp5e',
    1,
    'Whirlpool WHK 26404 XP5E',
    'Whirlpool',
    'B0DXFMCB2G',
    4.10,
    18,
    599.00,
    659.00,
    'A',
    355,
    '203.5 x 59.5 x 66.3 cm',
    'Clase energetica A con precio de entrada competitivo',
    'quien quiere empezar a ahorrar en consumo sin irse a gama alta',
    'Frigorifico combi clase A con enfoque claro en eficiencia, precio de entrada y capacidad util para uso familiar.',
    'Modelo Whirlpool de 355 L con enfoque en bajo consumo, tecnologia de frio sin escarcha y dimensiones estandar para cocinas de 60 cm.',
    'Dual No Frost',
    'Compresor Inverter con tecnologia 6th SENSE',
    'Fresh Box+ con control de humedad',
    'https://www.amazon.es/Whirlpool-Frigor%C3%ADfico-libre-instalaci%C3%B3n-26404/dp/B0DXFMCB2G?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.8GqEeGgiMch4RrhcZi3h0ktV5EwJbjpYH03WGLKxyMLWYKj_LC44WwxHa-lDxe7UXCdLmnYRQ_X8-TgL9mWpxffW0vdSDvIM4Zuss8BBueZA0WpsU6oJhLKAfGFJ56VoTArRueDIVM8rajCZ_LQgQXT4Q0ZCsKrYHNW6iMfT20jr51HdvFkXyOzizahT7K0k-tLbJihEFJ8gxPVqjJieEU3VI9tovec6UPMBZulyCRUePzYtFUHexxr3k4OmuHV_7d2fng6vGJybMKbdYQUWVdzMvQXiFnzbhbtGc2ZXUu0.ZeskJvCAoCmC4Z3w_zIBpkxnxGchB4oU3Uf-GiYxClo&dib_tag=se&keywords=frigorifico+combi+bajo+consumo&qid=1776613215&sprefix=frigorifico+combi+bajo+consumo%2Caps%2C198&sr=8-18-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&aref=IsUzp1cUt9&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1&linkCode=ll2&tag=ahorrhogar-21&linkId=d355e46b42dfb18ac7b971db547c0ed6&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/51ntIU8zQGL._AC_SX522_.jpg'
  ),
  (
    'hisense-rb440n4ccb',
    2,
    'Hisense RB440N4CCB',
    'Hisense',
    'B0CW35LJL6',
    4.30,
    220,
    619.00,
    null,
    'B',
    336,
    '202 x 59.5 x 57.9 cm',
    'Equilibrio muy bueno entre precio, capacidad y prestaciones',
    'quien busca un combi eficiente y sin complicaciones',
    'Combi de perfil equilibrado con buena base de valoraciones y tecnologia de frio completa para hogar.',
    'Hisense RB440N4CCB destaca por relacion valor-precio en 336 L con Total No Frost y distribucion uniforme del frio.',
    'Total No Frost',
    'Multi-air Flow',
    'Micro Vents Cooling y Fast Freezing',
    'https://www.amazon.es/Hisense-RB440N4CCB-Frigor%C3%ADfico-Congelamiento-Reversible/dp/B0CW35LJL6?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.8GqEeGgiMch4RrhcZi3h0ktV5EwJbjpYH03WGLKxyMLWYKj_LC44WwxHa-lDxe7UXCdLmnYRQ_X8-TgL9mWpxffW0vdSDvIM4Zuss8BBueZA0WpsU6oJhLKAfGFJ56VoTArRueDIVM8rajCZ_LQgQXT4Q0ZCsKrYHNW6iMfT20jr51HdvFkXyOzizahT7K0k-tLbJihEFJ8gxPVqjJieEU3VI9tovec6UPMBZulyCRUePzYtFUHexxr3k4OmuHV_7d2fng6vGJybMKbdYQUWVdzMvQXiFnzbhbtGc2ZXUu0.ZeskJvCAoCmC4Z3w_zIBpkxnxGchB4oU3Uf-GiYxClo&dib_tag=se&keywords=frigorifico%2Bcombi%2Bbajo%2Bconsumo&qid=1776613215&sprefix=frigorifico%2Bcombi%2Bbajo%2Bconsumo%2Caps%2C198&sr=8-44&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=cc0526e19f21924766e495ea6b3fb728&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61vKSabOZJL._AC_SX522_.jpg'
  ),
  (
    'haier-2d-60-series-5-pro-hdpw5620anpk',
    3,
    'Haier 2D 60 Series 5 Pro HDPW5620ANPK',
    'Haier',
    'B0F66PXHXY',
    4.20,
    149,
    759.00,
    999.00,
    'A',
    409,
    '205 x 59.5 x 66.7 cm',
    'Gran capacidad y funciones de conservacion avanzadas',
    'familias que hacen compra grande semanal',
    'Combi de gran capacidad con conectividad y enfoque en conservacion avanzada para compras semanales amplias.',
    'Haier 2D 60 Series 5 Pro ofrece 409 L, clase A y funcionalidades smart para control de temperatura y humedad.',
    'Total No Frost Air Surround',
    'Conectividad WiFi con app hOn',
    'My Zone Pro y Humidity Zone',
    'https://www.amazon.es/Haier-HDPW5620ANPK-Frigor%C3%ADfico-Botellero-Inteligentes/dp/B0F66PXHXY?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.F3MijT8ARSUcKMWk-6V8NyaugpDVYCgRrAMrKsRZmlTAyc7hfB7vPmYDGwLM4nJ1qOg88YT4Seh-zxWgZvqIN3fklHJlEQImpjh_9Nn_Kc4.R2M6Wb0jR1xsiRjGwL_FO_SUWnQwbSFjc1eWVtq6T0M&dib_tag=se&keywords=frigorifico%2Bcombi%2Bbajo%2Bconsumo&qid=1776613334&sprefix=frigorifico%2Bcombi%2Bbajo%2Bconsumo%2Caps%2C198&sr=8-49-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&xpid=k6yzZ0F0ljfkj&aref=kOlQGLhD94&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfbmV4dA&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=91fa8d37805d7d0c4fc6d49c1c2bdb35&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/51TO56qLqzL._AC_SY550_.jpg'
  ),
  (
    'samsung-bespoke-ai-rb38c607as9-ef',
    4,
    'Samsung Bespoke AI RB38C607AS9/EF',
    'Samsung',
    'B0C668JDL5',
    3.90,
    20,
    899.00,
    null,
    'A',
    387,
    '203 x 59.5 x 65.8 cm',
    'Clase A con ecosistema smart y consumo anual muy ajustado',
    'quien quiere integrar eficiencia y control desde app',
    'Combi Samsung orientado a hogar conectado con clase A y tecnologias de conservacion dual.',
    'Bespoke AI de 387 L con Twin Cooling Plus y SmartThings AI Energy Mode para optimizar consumo y control.',
    'Twin Cooling Plus',
    'SmartThings AI Energy Mode',
    'SpaceMax Technology y cajon Optimal Fresh+',
    'https://www.amazon.es/Samsung-Frigor%C3%ADfico-Bespoke-Cooling-RB38C607AS9/dp/B0C668JDL5?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DXS9WL0C3JXR&dib=eyJ2IjoiMSJ9.8FcUT1mxjy-JZS3SZzN7KMs_DjDWR-fqHTjlmnAPmeNBVKMbMCeZQOWbQmGXoCSfZcgSIrQ4JGvfP3rrYVD6SFBrdPlLEoJj4meXMAEik2qRKg8BLkTvKBUJ1q-hh-Awgzrig0OEsbOvza9SsehKa5C2XRrldzJxdGufdcTj_GnSNZuGrQlRsMDvleDYd559JzOD3aUgWfnNCoSa_joVGtaNECa0atzEEAsnlj0XNvKSYtlSqf95B_M8SnrMtvNUPs2fQ46fT19N5ua_eGbGVhEv6UkxMmmMpFPcGFxQOcQ.KKvdM5Z5iSlDfHk32Zs7bshQJ6zN70KC8640ZCh-TW0&dib_tag=se&keywords=frigorifico+combi+clase+a&qid=1776613465&sprefix=frigorifico+combi+clase+a+%2Caps%2C126&sr=8-10&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&linkCode=ll2&tag=ahorrhogar-21&linkId=c4093e3d4f4fd64177f7ad287f24eda5&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/41+l9M-Oo7L._AC_SX522_.jpg'
  ),
  (
    'siemens-kg39naiat',
    5,
    'Siemens KG39NAIAT',
    'Siemens',
    'B0BC963P5C',
    4.50,
    263,
    1759.00,
    null,
    'A',
    363,
    '203 x 60 x 66.5 cm',
    'Conservacion premium con hyperFresh y valoracion muy alta',
    'quien prioriza calidad de acabado y experiencia a largo plazo',
    'Combi premium orientado a conservacion de alimentos frescos y eficiencia energetica alta.',
    'Siemens KG39NAIAT combina noFrost, hyperFresh y acabado anti-huellas en un formato de 60 cm para cocina exigente.',
    'noFrost',
    'hyperFresh con regulador de humedad',
    'Iluminacion LED softStart y acabado anti-huellas',
    'https://www.amazon.es/Siemens-Frigor%C3%ADfico-instalaci%C3%B3n-hyperFresh-Antihuellas/dp/B0BC963P5C?crid=2LE9K0DJK82UB&dib=eyJ2IjoiMSJ9.pRo_1w6llNEvjgX2FAxYDJlVTgk1RuN-OvMFgmW4LMEkK7HdwXnnuyO2pM0T3gjHVjuriW5-N5LLzlYUAECEuzgpKXj7UoTGaKez9YMGfUQk1rBwCzCt-iq9cPuKjYIc11FplFTkFaN0r6dS8HWk-md-QnAToFsuwQ75KZ0QQhqRUZCUE0O85B7q2CyOa5g6NjGbV92113XlEWlGUT8dcWI9oZrNJDet4Cpvj231y0jf8m39-M5CJI0M4fQ2fzN65PQDAveNgubTxYxAaohK8w9v6gdPPA5ltdJGoGJXzQk.HjAnhDtk-8c4KPqLCHcFUgmi4lVsYf9zbQisKlRVEiU&dib_tag=se&keywords=frigorifico+combi+clase+a%2B%2B&qid=1776613394&sprefix=frigorifico+combi+clase+%2Caps%2C260&sr=8-47&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&linkCode=ll2&tag=ahorrhogar-21&linkId=81cf1deec9ba3c720bf254989382dd2e&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61x6BM197OL._AC_SY879_.jpg'
  );

create temporary table tmp_large_appliances_refs (
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
      or translate(lower(c.name), 'áéíóú', 'aeiou') in (
        'electrodomesticos y cocina',
        'electrodomesticos'
      )
    )
  order by
    case
      when c.slug = 'electrodomesticos-y-cocina' then 0
      when c.slug = 'electrodomsticos-y-cocina' then 1
      when translate(lower(c.name), 'áéíóú', 'aeiou') = 'electrodomesticos y cocina' then 2
      when c.slug = 'electrodomesticos' then 3
      when translate(lower(c.name), 'áéíóú', 'aeiou') = 'electrodomesticos' then 4
      else 5
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
      c.slug in ('electrodomesticos-grandes', 'electrodomsticos-grandes', 'grandes-electrodomesticos')
      or translate(lower(c.name), 'áéíóú', 'aeiou') in (
        'electrodomesticos grandes',
        'grandes electrodomesticos'
      )
    )
  order by
    case
      when c.slug = 'electrodomesticos-grandes' then 0
      when c.slug = 'electrodomsticos-grandes' then 1
      when c.slug = 'grandes-electrodomesticos' then 2
      else 3
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_category_id is null then
    select c.id
    into v_category_id
    from public.categories c
    where c.parent_id is not null
      and (
        c.slug in ('electrodomesticos-grandes', 'electrodomsticos-grandes', 'grandes-electrodomesticos')
        or translate(lower(c.name), 'áéíóú', 'aeiou') in (
          'electrodomesticos grandes',
          'grandes electrodomesticos'
        )
      )
    order by c.updated_at desc nulls last, c.id
    limit 1;
  end if;

  if v_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos Grandes', 'electrodomesticos-grandes', v_parent_category_id, true, 20)
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
  from (select distinct t.brand_name from tmp_large_appliances_fridge_catalog t) t
  where lower(b.name) = lower(t.brand_name);

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_large_appliances_fridge_catalog t
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

  delete from tmp_large_appliances_refs;
  insert into tmp_large_appliances_refs (parent_category_id, category_id, merchant_id)
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
    'energyClass', t.energy_class,
    'capacityLiters', t.capacity_liters,
    'dimensionsCm', t.dimensions_cm,
    'strongPoint', t.strong_point,
    'idealFor', t.ideal_for,
    'source', 'amazon-es',
    'sourceArticleSlug', 'mejores-frigorificos-combi-bajo-consumo-2026',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3)
  ),
  array[
    'frigorifico combi',
    'bajo consumo',
    'electrodomesticos-grandes',
    'electrodomesticos-y-cocina',
    'amazon',
    '2026',
    lower(replace(t.brand_name, ' ', '-'))
  ],
  jsonb_build_object(
    'asin', t.asin,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'energyClass', t.energy_class,
    'capacityLiters', t.capacity_liters,
    'dimensionsCm', t.dimensions_cm,
    'rank', t.rank_position
  ),
  true
from tmp_large_appliances_fridge_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_large_appliances_refs r
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
from tmp_large_appliances_fridge_catalog t
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
from tmp_large_appliances_fridge_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_large_appliances_refs r
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
from tmp_large_appliances_fridge_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_large_appliances_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;
