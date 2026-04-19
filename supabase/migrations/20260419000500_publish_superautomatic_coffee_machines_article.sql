begin;

insert into public.editorial_articles (
  slug,
  path,
  title,
  excerpt,
  cover_image,
  cover_image_alt,
  cover_tone,
  category_slug,
  category_name,
  intent,
  tags,
  read_minutes,
  average_budget,
  related_category_slugs,
  related_product_slugs,
  published_at,
  status,
  is_featured,
  views_count,
  sections
)
values (
  'mejores-cafeteras-superautomaticas-amantes-del-cafe-2026',
  '/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026',
  'Las 5 mejores cafeteras superautomaticas de 2026 para verdaderos amantes del cafe',
  'Comparativa editorial premium de 5 cafeteras superautomaticas con precio visto, pros, contras y recomendacion final para comprar mejor.',
  'https://m.media-amazon.com/images/I/61wUUgUQYoL._AC_SX522_.jpg',
  'Cafetera superautomatica Philips Serie 5500',
  'warm',
  'cocina',
  'Cocina',
  'comparativa',
  array['cafetera superautomatica', 'comparativa', 'cafe', 'espresso', 'guia de compra'],
  13,
  336,
  array['cocina', 'electrodomesticos'],
  array[]::text[],
  '2026-04-19T18:10:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 5',
      'body',
      'La comparativa cruza precio visto, valoraciones, facilidad de uso y enfoque de compra real para hogar, priorizando decisiones con menos riesgo.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Define primero si priorizas espresso, bebidas con leche o formato compacto. Esa decision cambia totalmente que modelo te compensa.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Philips 5500 lidera en experiencia completa, Philips 2300 y DeLonghi Magnifica S equilibran muy bien, y Cecotec/Melitta cubren perfiles de precio y espacio.'
    )
  )
)
on conflict do nothing;

update public.editorial_articles
set
  path = '/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026',
  title = 'Las 5 mejores cafeteras superautomaticas de 2026 para verdaderos amantes del cafe',
  excerpt = 'Comparativa editorial premium de 5 cafeteras superautomaticas con precio visto, pros, contras y recomendacion final para comprar mejor.',
  cover_image = 'https://m.media-amazon.com/images/I/61wUUgUQYoL._AC_SX522_.jpg',
  cover_image_alt = 'Cafetera superautomatica Philips Serie 5500',
  cover_tone = 'warm',
  category_slug = 'cocina',
  category_name = 'Cocina',
  intent = 'comparativa',
  tags = array['cafetera superautomatica', 'comparativa', 'cafe', 'espresso', 'guia de compra'],
  read_minutes = 13,
  average_budget = 336,
  related_category_slugs = array['cocina', 'electrodomesticos'],
  related_product_slugs = array[]::text[],
  published_at = '2026-04-19T18:10:00.000Z'::timestamptz,
  status = 'published',
  is_featured = true,
  sections = jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 5',
      'body',
      'La comparativa cruza precio visto, valoraciones, facilidad de uso y enfoque de compra real para hogar, priorizando decisiones con menos riesgo.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Define primero si priorizas espresso, bebidas con leche o formato compacto. Esa decision cambia totalmente que modelo te compensa.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Philips 5500 lidera en experiencia completa, Philips 2300 y DeLonghi Magnifica S equilibran muy bien, y Cecotec/Melitta cubren perfiles de precio y espacio.'
    )
  ),
  updated_at = now()
where lower(slug) = lower('mejores-cafeteras-superautomaticas-amantes-del-cafe-2026')
   or lower(path) = lower('/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026');

commit;
