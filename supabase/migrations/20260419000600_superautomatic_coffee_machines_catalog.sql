begin;

create temporary table tmp_superautomatic_coffee_catalog (
  slug text primary key,
  rank_position integer not null,
  name text not null,
  brand_name text not null,
  asin text not null,
  rating numeric(3, 2) not null,
  review_count integer not null,
  price numeric(12, 2) not null,
  old_price numeric(12, 2),
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

insert into tmp_superautomatic_coffee_catalog (
  slug,
  rank_position,
  name,
  brand_name,
  asin,
  rating,
  review_count,
  price,
  old_price,
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
    'philips-serie-5500-ep5544-50',
    1,
    'Philips Serie 5500 EP5544/50',
    'Philips',
    'B0CTCQKJ1B',
    4.40,
    1651,
    589.00,
    null,
    '20 bebidas calientes y frias con LatteGo y SilentBrew',
    'quien quiere variedad maxima y rutina premium',
    'Cafetera superautomatica orientada a usuarios que quieren recetas variadas con una experiencia muy automatizada.',
    'Modelo de gama alta de Philips con 20 bebidas, tecnologia SilentBrew y sistema LatteGo para facilitar el dia a dia en cafe en casa.',
    '20 bebidas calientes y frias',
    'LatteGo con limpieza rapida',
    'QuickStart y menor ruido con SilentBrew',
    'https://www.amazon.es/Totalmente-Autom%C3%A1tica-Silenciosa-SilentBrew-EP5544/dp/B0CTCQKJ1B?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=983c4bNxKw&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=79f3f1bf85fc66ffa04ca5e16adefdce&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61wUUgUQYoL._AC_SX522_.jpg'
  ),
  (
    'philips-serie-2300-ep2330-10',
    2,
    'Philips Serie 2300 EP2330/10',
    'Philips',
    'B0CDCCZ9K8',
    4.20,
    3795,
    359.99,
    null,
    'LatteGo, pantalla tactil y molinillo ceramico',
    'quien busca equilibrio y facilidad de uso',
    'Cafetera superautomatica de gama media con foco en uso diario y bebidas con leche de forma sencilla.',
    'La Serie 2300 combina sistema LatteGo, personalizacion de bebida y molinillo ceramico para una experiencia equilibrada.',
    'LatteGo con limpieza rapida',
    'Pantalla tactil con iconos y My Coffee Choice',
    'Molinillo ceramico con 12 niveles',
    'https://www.amazon.es/Philips-Serie-2300-Cafetera-Superautom%C3%A1tica/dp/B0CDCCZ9K8?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-2-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=wG3hAlinPE&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=abae5f8b63d1ff93e1a897072827e8c4&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/71qbGYx5YDL._AC_SX522_.jpg'
  ),
  (
    'delonghi-magnifica-s-ecam11-112-b',
    3,
    'DeLonghi Magnifica S ECAM11.112.B',
    'De''Longhi',
    'B0BWSFGQ49',
    4.20,
    57419,
    299.99,
    null,
    'Modelo muy consolidado para espresso diario',
    'quien prioriza fiabilidad y uso constante',
    'Cafetera superautomatica clasica con molinillo integrado y vaporizador manual para cappuccino.',
    'Magnifica S es uno de los modelos mas asentados del segmento por su equilibrio de precio, uso y volumen de valoraciones.',
    'Molinillo integrado con 13 niveles',
    'Vaporizador manual para leche',
    'Programas de enjuague y descalcificacion',
    'https://www.amazon.es/DeLonghi-Magnifica-ECAM11-112-B-Superautom%C3%A1tica-Soft-Touch/dp/B0BWSFGQ49?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-8&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=b6a1bce24c01b94a7a558b596e93b3fc&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/617bJwLkEhL._AC_SX522_.jpg'
  ),
  (
    'cecotec-cremmaet-cube-compact',
    4,
    'Cecotec Cremmaet Cube Compact',
    'Cecotec',
    'B0FP2HTVYR',
    4.00,
    403,
    179.00,
    null,
    'Entrada economica a superautomaticas',
    'quien quiere empezar con menor presupuesto',
    'Cafetera superautomatica compacta orientada a usuarios que quieren cafe en grano sin dar un salto de precio alto.',
    'Con 19 bares, pre-infusion y thermoblock, busca una experiencia de entrada competitiva para uso domestico.',
    '19 bares y sistema de pre-infusion',
    'Thermoblock y 5 niveles de molienda',
    'Panel tactil y formato compacto',
    'https://www.amazon.es/Cecotec-Cafetera-Superautom%C3%A1tica-Pre-Infusi%C3%B3n-Thermoblock/dp/B0FP2HTVYR?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-4-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=NsR0KzN3VZ&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=aa0591bd75841817a886dde6fb503413&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/71UAkdsAiwL._AC_SX522_.jpg'
  ),
  (
    'melitta-solo-e950-222',
    5,
    'Melitta Solo E950-222',
    'Melitta',
    'B00I3YL5T0',
    4.20,
    2807,
    249.99,
    null,
    'Diseno estrecho y enfoque espresso clasico',
    'cocinas pequenas y perfiles de espresso diario',
    'Cafetera superautomatica compacta con molinillo integrado para quienes priorizan espresso en formato reducido.',
    'Melitta Solo apuesta por simplicidad, ancho contenido y ajustes clave para cafe en grano en uso cotidiano.',
    'Formato de 20 cm de ancho',
    '3 intensidades, 3 molidos y 3 temperaturas',
    'Preparacion de 1 o 2 tazas',
    'https://www.amazon.es/Melitta-950-222-automatic%C3%A1-molinillo-integrado/dp/B00I3YL5T0?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=B4EMS01J3LXT&cv_ct_cx=cafetera%2Bsuperautom%C3%A1tica&keywords=cafetera%2Bsuperautom%C3%A1tica&pd_rd_i=B00I3YL5T0&pd_rd_r=03a85da9-6254-4aa4-b386-c6fcd50200f2&pd_rd_w=z6ura&pd_rd_wg=C3qFX&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=SCYK852R67968J644PR1&qid=1776612843&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=cafetera%2Caps%2C221&sr=1-5-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&aref=hKrTslJjTe&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=2e6abdbf5e03c354b7414446d0c6d9c2&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/51DTj6lXb5L._AC_SX522_.jpg'
  );

create temporary table tmp_superautomatic_refs (
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
      c.slug in ('electrodomsticos-y-cocina', 'electrodomesticos-y-cocina')
      or translate(lower(c.name), 'áéíóú', 'aeiou') in ('electrodomesticos y cocina')
    )
  order by
    case
      when c.slug = 'electrodomsticos-y-cocina' then 0
      when c.slug = 'electrodomesticos-y-cocina' then 1
      when translate(lower(c.name), 'áéíóú', 'aeiou') = 'electrodomesticos y cocina' then 2
      else 3
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
      c.slug in ('electrodomsticos-pequeos', 'electrodomesticos-pequenos', 'pequenos-electrodomesticos')
      or translate(lower(c.name), 'áéíóú', 'aeiou') in (
        'electrodomesticos pequenos',
        'pequenos electrodomesticos',
        'electrodomesticos pequenos'
      )
    )
  order by
    case
      when c.slug = 'electrodomsticos-pequeos' then 0
      when c.slug = 'electrodomesticos-pequenos' then 1
      when c.slug = 'pequenos-electrodomesticos' then 2
      else 3
    end,
    c.updated_at desc nulls last,
    c.id
  limit 1;

  if v_category_id is null then
    insert into public.categories (name, slug, parent_id, is_active, sort_order)
    values ('Electrodomesticos Pequenos', 'electrodomesticos-pequenos', v_parent_category_id, true, 10)
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
  from (select distinct t.brand_name from tmp_superautomatic_coffee_catalog t) t
  where lower(b.name) = lower(t.brand_name);

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_superautomatic_coffee_catalog t
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

  delete from tmp_superautomatic_refs;
  insert into tmp_superautomatic_refs (parent_category_id, category_id, merchant_id)
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
    'strongPoint', t.strong_point,
    'idealFor', t.ideal_for,
    'source', 'amazon-es',
    'sourceArticleSlug', 'mejores-cafeteras-superautomaticas-amantes-del-cafe-2026',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3)
  ),
  array[
    'cafetera superautomatica',
    'cafe en grano',
    'espresso',
    'electrodomesticos-pequenos',
    'amazon',
    '2026',
    lower(replace(t.brand_name, ' ', '-'))
  ],
  jsonb_build_object(
    'asin', t.asin,
    'rating', t.rating,
    'reviewCount', t.review_count,
    'idealFor', t.ideal_for,
    'rank', t.rank_position
  ),
  true
from tmp_superautomatic_coffee_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_superautomatic_refs r
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
from tmp_superautomatic_coffee_catalog t
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
from tmp_superautomatic_coffee_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_superautomatic_refs r
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
from tmp_superautomatic_coffee_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_superautomatic_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;
