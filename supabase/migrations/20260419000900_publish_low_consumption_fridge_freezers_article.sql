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
  'mejores-frigorificos-combi-bajo-consumo-2026',
  '/blog/mejores-frigorificos-combi-bajo-consumo-2026',
  'Los 5 mejores frigorificos combi de bajo consumo en 2026 para ahorrar en la factura de la luz',
  'Comparativa editorial de 5 frigorificos combi de bajo consumo con clase energetica, capacidad, pros, contras y recomendacion final para ahorrar en la factura.',
  'https://m.media-amazon.com/images/I/51ntIU8zQGL._AC_SX522_.jpg',
  'Frigorifico combi Whirlpool WHK 26404 XP5E',
  'fresh',
  'electrodomesticos',
  'Electrodomesticos',
  'comparativa',
  array['frigorifico combi', 'bajo consumo', 'comparativa', 'eficiencia energetica', 'guia de compra'],
  15,
  927,
  array['electrodomesticos', 'cocina', 'hogar'],
  array[]::text[],
  '2026-04-19T22:00:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 5',
      'body',
      'La comparativa cruza clase energetica, precio visto, capacidad util y experiencia real de compra para priorizar ahorro en consumo y buena relacion valor-precio.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Revisa consumo anual, litros utiles, medidas reales de instalacion y tecnologia de frio para evitar sobrecostes y elegir el combi que mejor encaja en tu uso diario.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Whirlpool y Hisense destacan en equilibrio de entrada, Haier y Samsung aportan extras y eficiencia alta, y Siemens queda como opcion premium para conservacion avanzada.'
    )
  )
)
on conflict do nothing;

update public.editorial_articles
set
  path = '/blog/mejores-frigorificos-combi-bajo-consumo-2026',
  title = 'Los 5 mejores frigorificos combi de bajo consumo en 2026 para ahorrar en la factura de la luz',
  excerpt = 'Comparativa editorial de 5 frigorificos combi de bajo consumo con clase energetica, capacidad, pros, contras y recomendacion final para ahorrar en la factura.',
  cover_image = 'https://m.media-amazon.com/images/I/51ntIU8zQGL._AC_SX522_.jpg',
  cover_image_alt = 'Frigorifico combi Whirlpool WHK 26404 XP5E',
  cover_tone = 'fresh',
  category_slug = 'electrodomesticos',
  category_name = 'Electrodomesticos',
  intent = 'comparativa',
  tags = array['frigorifico combi', 'bajo consumo', 'comparativa', 'eficiencia energetica', 'guia de compra'],
  read_minutes = 15,
  average_budget = 927,
  related_category_slugs = array['electrodomesticos', 'cocina', 'hogar'],
  related_product_slugs = array[]::text[],
  published_at = '2026-04-19T22:00:00.000Z'::timestamptz,
  status = 'published',
  is_featured = true,
  sections = jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 5',
      'body',
      'La comparativa cruza clase energetica, precio visto, capacidad util y experiencia real de compra para priorizar ahorro en consumo y buena relacion valor-precio.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Revisa consumo anual, litros utiles, medidas reales de instalacion y tecnologia de frio para evitar sobrecostes y elegir el combi que mejor encaja en tu uso diario.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Whirlpool y Hisense destacan en equilibrio de entrada, Haier y Samsung aportan extras y eficiencia alta, y Siemens queda como opcion premium para conservacion avanzada.'
    )
  ),
  updated_at = now()
where lower(slug) = lower('mejores-frigorificos-combi-bajo-consumo-2026')
   or lower(path) = lower('/blog/mejores-frigorificos-combi-bajo-consumo-2026');

commit;
