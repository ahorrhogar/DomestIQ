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
  'review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros',
  '/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros',
  'COSORI 5,7 L por menos de 100 EUR: review honesta de la mejor freidora de aire calidad precio',
  'Analisis real de la COSORI 5,7 L: opinion editorial, ficha tecnica, pros, contras y veredicto final para comprar mejor.',
  'https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX522_.jpg',
  'COSORI Air Fryer 5,7 L en cocina',
  'warm',
  'cocina',
  'Cocina',
  'calidad-precio',
  array['freidora de aire', 'cosori', 'review', 'calidad precio', 'menos de 100 eur'],
  10,
  85,
  array['cocina', 'electrodomesticos'],
  array[]::text[],
  '2026-04-19T17:15:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Mi opinion',
      'body',
      'La COSORI 5,7 L ofrece un equilibrio muy solido entre precio, capacidad util y sensacion de compra segura para uso frecuente.'
    ),
    jsonb_build_object(
      'heading',
      'Lo que mas me gusta y lo que menos me convence',
      'body',
      'A favor: 5,7 L, 1700 W, gran volumen de valoraciones y uso sencillo. A mejorar: no es la opcion mas barata y puede sobrar tamano para una persona.'
    ),
    jsonb_build_object(
      'heading',
      'Veredicto final',
      'body',
      'Si buscas una freidora de aire calidad precio por debajo de 100 EUR con criterio de compra realista, es una recomendacion fuerte.'
    )
  )
)
on conflict do nothing;

update public.editorial_articles
set
  path = '/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros',
  title = 'COSORI 5,7 L por menos de 100 EUR: review honesta de la mejor freidora de aire calidad precio',
  excerpt = 'Analisis real de la COSORI 5,7 L: opinion editorial, ficha tecnica, pros, contras y veredicto final para comprar mejor.',
  cover_image = 'https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX522_.jpg',
  cover_image_alt = 'COSORI Air Fryer 5,7 L en cocina',
  cover_tone = 'warm',
  category_slug = 'cocina',
  category_name = 'Cocina',
  intent = 'calidad-precio',
  tags = array['freidora de aire', 'cosori', 'review', 'calidad precio', 'menos de 100 eur'],
  read_minutes = 10,
  average_budget = 85,
  related_category_slugs = array['cocina', 'electrodomesticos'],
  related_product_slugs = array[]::text[],
  published_at = '2026-04-19T17:15:00.000Z'::timestamptz,
  status = 'published',
  is_featured = true,
  sections = jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Mi opinion',
      'body',
      'La COSORI 5,7 L ofrece un equilibrio muy solido entre precio, capacidad util y sensacion de compra segura para uso frecuente.'
    ),
    jsonb_build_object(
      'heading',
      'Lo que mas me gusta y lo que menos me convence',
      'body',
      'A favor: 5,7 L, 1700 W, gran volumen de valoraciones y uso sencillo. A mejorar: no es la opcion mas barata y puede sobrar tamano para una persona.'
    ),
    jsonb_build_object(
      'heading',
      'Veredicto final',
      'body',
      'Si buscas una freidora de aire calidad precio por debajo de 100 EUR con criterio de compra realista, es una recomendacion fuerte.'
    )
  ),
  updated_at = now()
where lower(slug) = lower('review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros')
   or lower(path) = lower('/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros');

commit;
