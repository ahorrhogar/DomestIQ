begin;

create temporary table tmp_thermomix_alternatives_catalog (
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

insert into tmp_thermomix_alternatives_catalog (
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
    'cecotec-mambo-11090',
    1,
    'Cecotec Mambo 11090',
    'Cecotec',
    'B0BJQQ78BY',
    4.10,
    346,
    219.00,
    null,
    '37 funciones con app, bascula y jarra de 3,3 L',
    'quien quiere equilibrio calidad-precio para cocinar casi todo',
    'Robot de cocina multifuncion con enfoque de compra equilibrada para uso frecuente en casa.',
    'Cecotec Mambo 11090 combina 37 funciones, app de recetas, bascula integrada y jarra inox de 3,3 L para resolver cocina diaria con buena relacion calidad-precio.',
    '37 funciones de cocina',
    'App Mambo con recetas guiadas',
    'Bascula integrada y AutoCleaning',
    'https://www.amazon.es/Cecotec-Multifunci%C3%B3n-inoxidable-Lavavajillas-Accesorios/dp/B0BJQQ78BY?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot%2Bde%2Bcocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=y3WD7Mfc1I&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=e51abc2d9c020551da432a290d775932&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/51sB4hpk8OL._AC_SX425_.jpg'
  ),
  (
    'cecotec-mambo-touch-habana',
    2,
    'Cecotec Mambo Touch Habana',
    'Cecotec',
    'B0BMLJF3XC',
    4.50,
    36,
    403.90,
    407.90,
    'pantalla tactil de 5 pulgadas y doble jarra',
    'quien prioriza experiencia guiada y acabados mas premium',
    'Robot de cocina orientado a usuarios que valoran pantalla tactil y versatilidad en preparaciones delicadas.',
    'Mambo Touch Habana integra pantalla TFT de 5 pulgadas, 37 funciones y doble jarra (inox + ceramica) para una experiencia de cocina mas premium.',
    'Pantalla TFT Soft Touch de 5 pulgadas',
    'Doble jarra con opcion ceramica antiadherente',
    'Sistema OneClick para cambio rapido de accesorios',
    'https://www.amazon.es/Cecotec-Multifunci%C3%B3n-Funciones-Revestimiento-Antiadherencia/dp/B0BMLJF3XC?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot+de+cocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-2-spons&aref=1EgGftmZqa&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=ahorrhogar-21&linkId=61a86667de6dd5951e4c03cb5acf6493&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/619fmVfB89L._AC_SX425_.jpg'
  ),
  (
    'ufesa-totalchef-rk7',
    3,
    'Ufesa TotalChef RK7',
    'Ufesa',
    'B09MWMJG76',
    4.10,
    641,
    339.99,
    599.99,
    'pantalla de 7 pulgadas, WiFi y 30 funciones',
    'quien quiere recetas guiadas y cocina muy asistida',
    'Robot de cocina smart con pantalla de 7 pulgadas, enfoque guiado y buena capacidad para uso semanal.',
    'Ufesa RK7 combina 30 funciones, conectividad WiFi, 8 programas automaticos y jarra de 4,5 L para usuarios que priorizan cocina paso a paso.',
    'Pantalla tactil digital de 7 pulgadas',
    'WiFi con recetas guiadas',
    'Bascula integrada y jarra de 4,5 L',
    'https://www.amazon.es/Ufesa-TotalChef-Inteligente-Multifunci%C3%B3n-Interactivo/dp/B09MWMJG76?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=1628EY8EP9YAC&cv_ct_cx=robot%2Bde%2Bcocina&keywords=robot%2Bde%2Bcocina&pd_rd_i=B09MWMJG76&pd_rd_r=9cbb59a2-6669-447d-8bd8-afb943da2e04&pd_rd_w=OsPTI&pd_rd_wg=4drJh&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=WE0EG0AWQ7R4VYNNYXFJ&qid=1776613042&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=robo%2Caps%2C145&sr=1-2-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=XZStHP0nwc&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=64d13dde18f3b79495a12fa208f914d5&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/71TQd4oQH-L._AC_SX425_.jpg'
  ),
  (
    'newlux-smartchef-v50',
    4,
    'NEWLUX SmartChef V50',
    'NEWLUX',
    'B00SBCZDDI',
    4.10,
    2787,
    59.90,
    null,
    'precio de entrada muy bajo para cocina diaria',
    'quien quiere gastar lo minimo y cocinar sin complicarse',
    'Robot de cocina economico de 5 litros para uso diario basico en guisos, arroces y menus rapidos.',
    'NEWLUX SmartChef V50 ofrece 9 funciones, 8 menus automaticos y programacion 24h en un rango de precio muy ajustado para iniciarse.',
    'Capacidad de 5 L',
    'Programable 24h con mantenimiento de calor',
    '9 funciones y 8 menus automaticos',
    'https://www.amazon.es/NEWLUX-Robot-Multifunci%C3%B3n-Mod-Newcook-Antiadherente-autom%C3%A1ticos/dp/B00SBCZDDI?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=1628EY8EP9YAC&cv_ct_cx=robot%2Bde%2Bcocina&keywords=robot%2Bde%2Bcocina&pd_rd_i=B00SBCZDDI&pd_rd_r=9cbb59a2-6669-447d-8bd8-afb943da2e04&pd_rd_w=OsPTI&pd_rd_wg=4drJh&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=WE0EG0AWQ7R4VYNNYXFJ&qid=1776613042&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=robo%2Caps%2C145&sr=1-5-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&aref=3PfPJN051s&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=22e809224b4630893a3177cee8ba5c3c&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/51b1NhImcIL._AC_SX425_.jpg'
  ),
  (
    'ufesa-totalchef-rk10',
    5,
    'Ufesa TotalChef RK10',
    'Ufesa',
    'B0FKT6CZPN',
    4.10,
    641,
    549.99,
    null,
    'pantalla Full Touch de 10 pulgadas y modo muy visual',
    'quien prioriza experiencia de uso sobre precio final',
    'Robot de cocina con pantalla de 10 pulgadas para usuarios que buscan cocina guiada con enfoque visual premium.',
    'Ufesa RK10 integra 30 funciones, 15 programas automaticos, WiFi y bascula para un perfil de uso asistido y una interfaz mas amplia.',
    'Pantalla tactil de 10 pulgadas',
    '30 funciones con 15 programas automaticos',
    'Jarra de 4,5 L con bascula integrada',
    'https://www.amazon.es/Ufesa-Multifunci%C3%B3n-Inteligente-Interactiva-Accesorios/dp/B0FKT6CZPN?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot%2Bde%2Bcocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-23&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=f479fd1f974233e7934782cd471b7a1a&ref_=as_li_ss_tl',
    'https://m.media-amazon.com/images/I/61Z3mCCETKL._AC_SX425_.jpg'
  );

create temporary table tmp_thermomix_refs (
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
  from (select distinct t.brand_name from tmp_thermomix_alternatives_catalog t) t
  where lower(b.name) = lower(t.brand_name);

  insert into public.brands (name, is_active)
  select distinct t.brand_name, true
  from tmp_thermomix_alternatives_catalog t
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

  delete from tmp_thermomix_refs;
  insert into tmp_thermomix_refs (parent_category_id, category_id, merchant_id)
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
    'sourceArticleSlug', 'mejores-robots-de-cocina-baratos-alternativas-thermomix-2026',
    'features', jsonb_build_array(t.feature_1, t.feature_2, t.feature_3)
  ),
  array[
    'robot de cocina',
    'alternativas a thermomix',
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
from tmp_thermomix_alternatives_catalog t
join public.brands b
  on lower(b.name) = lower(t.brand_name)
cross join tmp_thermomix_refs r
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
from tmp_thermomix_alternatives_catalog t
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
from tmp_thermomix_alternatives_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_thermomix_refs r
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
from tmp_thermomix_alternatives_catalog t
join public.products p
  on p.slug = t.slug
cross join tmp_thermomix_refs r
where not exists (
  select 1
  from public.offers o
  where o.product_id = p.id
    and o.merchant_id = r.merchant_id
    and o.url = t.affiliate_url
);

commit;
