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
  '10-mesas-de-terraza-baratas-y-bonitas-2026',
  '/blog/10-mesas-de-terraza-baratas-y-bonitas-2026',
  '10 mesas de terraza baratas y bonitas en 2026 (comparativa real)',
  'Comparativa de 10 mesas de terraza baratas y bonitas con valoraciones reales, reseñas verificables y enlace directo para decidir rapido.',
  'https://m.media-amazon.com/images/I/419US7PB00L._AC_.jpg',
  'Mesa de terraza extensible Devoko en color gris',
  'calm',
  'jardin',
  'Jardin',
  'comparativa',
  array['mesa de terraza', 'jardin', 'muebles exterior', 'comparativa', 'calidad precio'],
  14,
  120,
  array['jardin', 'muebles'],
  array[]::text[],
  '2026-04-18T18:00:00.000Z'::timestamptz,
  'published',
  true,
  0,
  jsonb_build_array(
    jsonb_build_object(
      'heading',
      'Respuesta rapida',
      'body',
      'Si buscas una mesa de terraza barata y bonita, prioriza tamano real, estabilidad y material para exterior. En esta guia tienes 10 opciones con nota y numero de reseñas para comparar en minutos y comprar con menos riesgo.'
    ),
    jsonb_build_object(
      'heading',
      'Comparativa express (valoracion y reseñas)',
      'body',
      'Devoko Extendable Garden Table (4.6, 313) | Keter Quartet 95 (4.6, 411) | CASARIA Side Table Acacia (4.3, 2,190) | CASARIA Garden Table 46x46 (4.6, 4,542) | IPAE SATURNIA 90 cm (4.3, 460) | PHI VILLA Round Folding Side Table (4.4, 1,405) | CASARIA Set mesa + 4 sillas (3.5, 1,126) | HollyHOME Round Side Table (4.6, 617) | YOEVU Folding Table 180 cm (4.5, 100) | CASARIA Folding Table 160x85 (4.1, 774).'
    ),
    jsonb_build_object(
      'heading',
      'Enlaces de compra (afiliado)',
      'body',
      '1) https://amzn.to/4dQppc9 2) https://amzn.to/4tdA3OQ 3) https://amzn.to/4tVWAQd 4) https://amzn.to/3Oo5BT9 5) https://amzn.to/3Qs29r5 6) https://amzn.to/42eiNx3 7) https://amzn.to/4tl9qYs 8) https://amzn.to/3QgdvP6 9) https://amzn.to/4vH9d3q 10) https://amzn.to/4chjjjN'
    ),
    jsonb_build_object(
      'heading',
      'Que mirar antes de comprar',
      'body',
      'Mide espacio con sillas abiertas, define si necesitas mesa auxiliar o de comedor exterior, revisa facilidad de limpieza y si vas a guardarla en invierno valora formato plegable o extensible.'
    ),
    jsonb_build_object(
      'heading',
      'Recomendacion editorial',
      'body',
      'Para uso mixto diario + invitados, la Devoko extensible destaca por equilibrio entre funcionalidad y nota media. Si priorizas apoyo rapido y poco mantenimiento, los formatos auxiliares de resina y metal son una apuesta simple y efectiva.'
    ),
    jsonb_build_object(
      'heading',
      'FAQ rapida',
      'body',
      'Que material conviene para exterior? Resina si quieres mantenimiento bajo; madera si priorizas estetica y aceptas cuidado periodico. Mesa fija o plegable? Plegable para espacios pequenos; fija para uso diario continuo.'
    )
  )
)
on conflict do nothing;

commit;
