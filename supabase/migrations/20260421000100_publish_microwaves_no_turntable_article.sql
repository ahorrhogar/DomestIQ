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
  'mejores-microondas-sin-plato-giratorio-2026',
  '/blog/mejores-microondas-sin-plato-giratorio-2026',
  'Los 8 mejores microondas sin plato giratorio de 2026: comparativa real para comprar mejor',
  'Comparativa editorial de 8 microondas sin plato giratorio con precio visto, capacidad, potencia y recomendacion final por tipo de uso.',
  null,
  null,
  'fresh',
  'electrodomesticos',
  'Electrodomesticos',
  'comparativa',
  array['microondas sin plato giratorio', 'microondas flatbed', 'comparativa', 'cocina', 'guia de compra'],
  16,
  154,
  array['electrodomesticos', 'cocina', 'hogar'],
  array[]::text[],
  '2026-04-21T10:30:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 8',
      'body',
      'La comparativa cruza precio visible, capacidad, potencia de microondas y utilidad real por perfil de compra para reducir riesgo antes de pagar.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar un microondas sin plato giratorio',
      'body',
      'Prioriza capacidad util, potencia real y tipo de programas. En modelos flatbed tambien conviene revisar reparto de calor, facilidad de limpieza y coste total final con envio.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Para presupuesto ajustado destacan Severin y Cecotec. Para mas capacidad y grill, los modelos CASO suben el nivel. Toshiba y Samsung equilibran muy bien para uso familiar diario.'
    )
  )
)
on conflict do nothing;

update public.editorial_articles
set
  path = '/blog/mejores-microondas-sin-plato-giratorio-2026',
  title = 'Los 8 mejores microondas sin plato giratorio de 2026: comparativa real para comprar mejor',
  excerpt = 'Comparativa editorial de 8 microondas sin plato giratorio con precio visto, capacidad, potencia y recomendacion final por tipo de uso.',
  cover_image = null,
  cover_image_alt = null,
  cover_tone = 'fresh',
  category_slug = 'electrodomesticos',
  category_name = 'Electrodomesticos',
  intent = 'comparativa',
  tags = array['microondas sin plato giratorio', 'microondas flatbed', 'comparativa', 'cocina', 'guia de compra'],
  read_minutes = 16,
  average_budget = 154,
  related_category_slugs = array['electrodomesticos', 'cocina', 'hogar'],
  related_product_slugs = array[]::text[],
  published_at = '2026-04-21T10:30:00.000Z'::timestamptz,
  status = 'published',
  is_featured = true,
  sections = jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Como se ha construido este top 8',
      'body',
      'La comparativa cruza precio visible, capacidad, potencia de microondas y utilidad real por perfil de compra para reducir riesgo antes de pagar.'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar un microondas sin plato giratorio',
      'body',
      'Prioriza capacidad util, potencia real y tipo de programas. En modelos flatbed tambien conviene revisar reparto de calor, facilidad de limpieza y coste total final con envio.'
    ),
    jsonb_build_object(
      'heading',
      'Resumen editorial',
      'body',
      'Para presupuesto ajustado destacan Severin y Cecotec. Para mas capacidad y grill, los modelos CASO suben el nivel. Toshiba y Samsung equilibran muy bien para uso familiar diario.'
    )
  ),
  updated_at = now()
where lower(slug) = lower('mejores-microondas-sin-plato-giratorio-2026')
   or lower(path) = lower('/blog/mejores-microondas-sin-plato-giratorio-2026');

commit;
