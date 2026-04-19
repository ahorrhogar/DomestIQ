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
  'mejores-robots-de-cocina-baratos-alternativas-thermomix-2026',
  '/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026',
  'Mejores robots de cocina baratos: 5 alternativas a Thermomix con muy buena relacion calidad-precio',
  'Comparativa editorial de 5 alternativas a Thermomix con precio visto, caracteristicas clave, pros, contras y recomendacion final para comprar mejor.',
  'https://m.media-amazon.com/images/I/51sB4hpk8OL._AC_SX425_.jpg',
  'Robot de cocina Cecotec Mambo 11090',
  'warm',
  'cocina',
  'Cocina',
  'comparativa',
  array['robot de cocina', 'alternativas a thermomix', 'comparativa', 'guia de compra', 'cocina'],
  14,
  315,
  array['cocina', 'electrodomesticos'],
  array[]::text[],
  '2026-04-19T20:20:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 5',
      'body',
      'La comparativa cruza precio visto, valoraciones reales y experiencia de uso para identificar alternativas a Thermomix con mejor relacion calidad-precio.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Define uso real, capacidad util y ecosistema de recetas. En robots de cocina, esos tres puntos marcan la diferencia en satisfaccion tras la compra.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Mambo 11090 destaca en equilibrio global, Mambo Touch y RK7 en experiencia guiada, y NEWLUX V50 en precio minimo para cocina diaria basica.'
    )
  )
)
on conflict do nothing;

update public.editorial_articles
set
  path = '/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026',
  title = 'Mejores robots de cocina baratos: 5 alternativas a Thermomix con muy buena relacion calidad-precio',
  excerpt = 'Comparativa editorial de 5 alternativas a Thermomix con precio visto, caracteristicas clave, pros, contras y recomendacion final para comprar mejor.',
  cover_image = 'https://m.media-amazon.com/images/I/51sB4hpk8OL._AC_SX425_.jpg',
  cover_image_alt = 'Robot de cocina Cecotec Mambo 11090',
  cover_tone = 'warm',
  category_slug = 'cocina',
  category_name = 'Cocina',
  intent = 'comparativa',
  tags = array['robot de cocina', 'alternativas a thermomix', 'comparativa', 'guia de compra', 'cocina'],
  read_minutes = 14,
  average_budget = 315,
  related_category_slugs = array['cocina', 'electrodomesticos'],
  related_product_slugs = array[]::text[],
  published_at = '2026-04-19T20:20:00.000Z'::timestamptz,
  status = 'published',
  is_featured = true,
  sections = jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 5',
      'body',
      'La comparativa cruza precio visto, valoraciones reales y experiencia de uso para identificar alternativas a Thermomix con mejor relacion calidad-precio.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Define uso real, capacidad util y ecosistema de recetas. En robots de cocina, esos tres puntos marcan la diferencia en satisfaccion tras la compra.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Mambo 11090 destaca en equilibrio global, Mambo Touch y RK7 en experiencia guiada, y NEWLUX V50 en precio minimo para cocina diaria basica.'
    )
  ),
  updated_at = now()
where lower(slug) = lower('mejores-robots-de-cocina-baratos-alternativas-thermomix-2026')
   or lower(path) = lower('/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026');

commit;
