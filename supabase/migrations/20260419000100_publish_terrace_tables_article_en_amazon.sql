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
  '10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026',
  '/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026',
  '10 mesas de terraza baratas y bonitas en Amazon para comprar en 2026',
  'Comparativa real de 10 mesas de terraza con precio visto, estrellas y recomendaciones para balcon y jardin.',
  'https://m.media-amazon.com/images/I/81mysC2tsNL._AC_SX522_.jpg',
  'Mesa de terraza plegable de acacia para balcon',
  'calm',
  'jardin',
  'Jardin',
  'calidad-precio',
  array['mesa de terraza', 'jardin', 'amazon', 'calidad precio', 'guia de compra'],
  14,
  84,
  array['jardin', 'muebles', 'hogar'],
  array[]::text[],
  '2026-04-19T16:00:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 10',
      'body',
      'La seleccion combina precio visible, valoraciones, formato de mesa y utilidad real por tipo de espacio para reducir riesgo de compra.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de decidir',
      'body',
      'Define uso real, mide el espacio disponible y revisa coste total con envio y devolucion. En mesas de terraza, esos tres puntos evitan la mayoria de errores.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Para balcon pequeno funcionan mejor las auxiliares compactas. Para comidas frecuentes conviene subir a mesa media o extensible aunque el presupuesto sea mayor.'
    )
  )
)
on conflict do nothing;

update public.editorial_articles
set
  path = '/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026',
  title = '10 mesas de terraza baratas y bonitas en Amazon para comprar en 2026',
  excerpt = 'Comparativa real de 10 mesas de terraza con precio visto, estrellas y recomendaciones para balcon y jardin.',
  cover_image = 'https://m.media-amazon.com/images/I/81mysC2tsNL._AC_SX522_.jpg',
  cover_image_alt = 'Mesa de terraza plegable de acacia para balcon',
  cover_tone = 'calm',
  category_slug = 'jardin',
  category_name = 'Jardin',
  intent = 'calidad-precio',
  tags = array['mesa de terraza', 'jardin', 'amazon', 'calidad precio', 'guia de compra'],
  read_minutes = 14,
  average_budget = 84,
  related_category_slugs = array['jardin', 'muebles', 'hogar'],
  related_product_slugs = array[]::text[],
  published_at = '2026-04-19T16:00:00.000Z'::timestamptz,
  status = 'published',
  is_featured = true,
  sections = jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 10',
      'body',
      'La seleccion combina precio visible, valoraciones, formato de mesa y utilidad real por tipo de espacio para reducir riesgo de compra.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de decidir',
      'body',
      'Define uso real, mide el espacio disponible y revisa coste total con envio y devolucion. En mesas de terraza, esos tres puntos evitan la mayoria de errores.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Para balcon pequeno funcionan mejor las auxiliares compactas. Para comidas frecuentes conviene subir a mesa media o extensible aunque el presupuesto sea mayor.'
    )
  ),
  updated_at = now()
where lower(slug) = lower('10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026')
   or lower(path) = lower('/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026');

commit;
