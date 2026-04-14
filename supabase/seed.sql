begin;

insert into public.brands (id, name) values
  ('11111111-1111-4111-8111-111111111111', 'Nordic Living'),
  ('22222222-2222-4222-8222-222222222222', 'WoodArt'),
  ('33333333-3333-4333-8333-333333333333', 'LuxLight'),
  ('44444444-4444-4444-8444-444444444444', 'Chef Master'),
  ('55555555-5555-4555-8555-555555555555', 'Samsung'),
  ('66666666-6666-4666-8666-666666666666', 'SmartClean'),
  ('77777777-7777-4777-8777-777777777777', 'HomeTech'),
  ('88888888-8888-4888-8888-888888888888', 'WMF')
on conflict (id) do update
set name = excluded.name;

insert into public.categories (id, name, parent_id) values
  ('10000000-0000-4000-8000-000000000001', 'Muebles', null),
  ('10000000-0000-4000-8000-000000000002', 'Cocina', null),
  ('10000000-0000-4000-8000-000000000003', 'Electrodomesticos', null),
  ('10000000-0000-4000-8000-000000000101', 'Sofas', '10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000102', 'Mesas', '10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000103', 'Iluminacion interior', '10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000201', 'Sartenes', '10000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000202', 'Ollas', '10000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000203', 'Menaje de mesa', '10000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000301', 'Lavadoras', '10000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000302', 'Aspiradoras', '10000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000303', 'Pequeno electrodomestico', '10000000-0000-4000-8000-000000000003')
on conflict (id) do update
set
  name = excluded.name,
  parent_id = excluded.parent_id;

insert into public.merchants (id, name, logo_url) values
  ('70000000-0000-4000-8000-000000000001', 'Amazon', 'https://logo.clearbit.com/amazon.es'),
  ('70000000-0000-4000-8000-000000000002', 'IKEA', 'https://logo.clearbit.com/ikea.com'),
  ('70000000-0000-4000-8000-000000000003', 'Leroy Merlin', 'https://logo.clearbit.com/leroymerlin.es'),
  ('70000000-0000-4000-8000-000000000004', 'MediaMarkt', 'https://logo.clearbit.com/mediamarkt.es'),
  ('70000000-0000-4000-8000-000000000005', 'Carrefour', 'https://logo.clearbit.com/carrefour.es')
on conflict (id) do update
set
  name = excluded.name,
  logo_url = excluded.logo_url;

insert into public.products (id, name, brand_id, category_id, description, specs, created_at) values
  (
    '80000000-0000-4000-8000-000000000001',
    'Sofa Modular Nordic 3 plazas',
    '11111111-1111-4111-8111-111111111111',
    '10000000-0000-4000-8000-000000000101',
    'Sofa modular con acabado textil, ideal para salon moderno.',
    '{"slug":"sofa-modular-nordic-3-plazas","longDescription":"Sofa de tres plazas con respaldo ergonomico y tejido antimanchas.","rating":4.6,"reviewCount":342,"tags":["sofa","salon","nordico"],"material":"Tela","color":"Gris","style":"Nordico","dimensions":"220x90x85 cm","weight":"62 kg","featured":true,"bestSeller":true,"isNew":false,"attributes":[{"label":"Plazas","value":"3"},{"label":"Material","value":"Tela antimanchas"},{"label":"Estructura","value":"Madera maciza"}]}'::jsonb,
    now() - interval '80 days'
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    'Mesa Comedor Oak extensible',
    '22222222-2222-4222-8222-222222222222',
    '10000000-0000-4000-8000-000000000102',
    'Mesa extensible de roble para 6 a 10 comensales.',
    '{"slug":"mesa-comedor-oak-extensible","longDescription":"Mesa de comedor extensible con guias metalicas y acabado natural.","rating":4.4,"reviewCount":215,"tags":["mesa","comedor","roble"],"material":"Madera","color":"Natural","style":"Nordico","dimensions":"140-200x90x75 cm","weight":"45 kg","featured":true,"bestSeller":false,"isNew":false,"attributes":[{"label":"Largo cerrada","value":"140 cm"},{"label":"Largo abierta","value":"200 cm"},{"label":"Ancho","value":"90 cm"}]}'::jsonb,
    now() - interval '76 days'
  ),
  (
    '80000000-0000-4000-8000-000000000003',
    'Lampara Techo LED Circular 36W',
    '33333333-3333-4333-8333-333333333333',
    '10000000-0000-4000-8000-000000000103',
    'Lampara LED regulable para estancias de 20-25m2.',
    '{"slug":"lampara-techo-led-circular-36w","longDescription":"Lampara circular con temperatura de color regulable y mando remoto.","rating":4.3,"reviewCount":512,"tags":["lampara","led","techo"],"material":"Metal y acrilico","color":"Blanco","style":"Minimalista","dimensions":"50x50x8 cm","weight":"2.1 kg","featured":true,"bestSeller":false,"isNew":true,"attributes":[{"label":"Potencia","value":"36W"},{"label":"Temperatura","value":"3000-6000K"},{"label":"Diametro","value":"50 cm"}]}'::jsonb,
    now() - interval '61 days'
  ),
  (
    '80000000-0000-4000-8000-000000000004',
    'Sarten Chef Master 28cm',
    '44444444-4444-4444-8444-444444444444',
    '10000000-0000-4000-8000-000000000201',
    'Sarten antiadherente apta para induccion.',
    '{"slug":"sarten-chef-master-28cm","longDescription":"Sarten profesional con recubrimiento ceramico y base reforzada.","rating":4.5,"reviewCount":1288,"tags":["sarten","cocina","induccion"],"material":"Aluminio","color":"Negro","style":"Profesional","dimensions":"28 cm","weight":"0.9 kg","featured":false,"bestSeller":true,"isNew":false,"attributes":[{"label":"Diametro","value":"28 cm"},{"label":"Recubrimiento","value":"Ceramico"},{"label":"Induccion","value":"Si"}]}'::jsonb,
    now() - interval '54 days'
  ),
  (
    '80000000-0000-4000-8000-000000000005',
    'Set Ollas Inox Premium 5 piezas',
    '88888888-8888-4888-8888-888888888888',
    '10000000-0000-4000-8000-000000000202',
    'Juego de ollas inox apto para todo tipo de cocinas.',
    '{"slug":"set-ollas-inox-premium-5-piezas","longDescription":"Set de 5 ollas en acero inoxidable con tapas de cristal templado.","rating":4.7,"reviewCount":942,"tags":["ollas","inox","cocina"],"material":"Acero inoxidable","color":"Plata","style":"Profesional","dimensions":"16-24 cm","weight":"6.4 kg","featured":true,"bestSeller":true,"isNew":false,"attributes":[{"label":"Piezas","value":"5"},{"label":"Material","value":"Acero inoxidable"},{"label":"Lavavajillas","value":"Si"}]}'::jsonb,
    now() - interval '47 days'
  ),
  (
    '80000000-0000-4000-8000-000000000006',
    'Vajilla Stone 18 piezas',
    '44444444-4444-4444-8444-444444444444',
    '10000000-0000-4000-8000-000000000203',
    'Vajilla de gres de 18 piezas apta para microondas.',
    '{"slug":"vajilla-stone-18-piezas","longDescription":"Coleccion completa de vajilla para 6 personas en acabado mate.","rating":4.4,"reviewCount":398,"tags":["vajilla","mesa","gres"],"material":"Gres","color":"Beige","style":"Moderno","dimensions":"18 piezas","weight":"7.1 kg","featured":false,"bestSeller":false,"isNew":true,"attributes":[{"label":"Piezas","value":"18"},{"label":"Servicio","value":"6 personas"},{"label":"Microondas","value":"Si"}]}'::jsonb,
    now() - interval '42 days'
  ),
  (
    '80000000-0000-4000-8000-000000000007',
    'Lavadora EcoBubble 9kg',
    '55555555-5555-4555-8555-555555555555',
    '10000000-0000-4000-8000-000000000301',
    'Lavadora de 9kg con motor inverter y eficiencia energetica A.',
    '{"slug":"lavadora-ecobubble-9kg","longDescription":"Lavadora de carga frontal con programas rapidos y conectividad inteligente.","rating":4.5,"reviewCount":725,"tags":["lavadora","ecobubble","hogar"],"material":"Acero","color":"Blanco","style":"Moderno","dimensions":"60x55x85 cm","weight":"70 kg","featured":true,"bestSeller":true,"isNew":true,"attributes":[{"label":"Capacidad","value":"9 kg"},{"label":"RPM","value":"1400"},{"label":"Eficiencia","value":"A"}]}'::jsonb,
    now() - interval '35 days'
  ),
  (
    '80000000-0000-4000-8000-000000000008',
    'Robot Aspirador SmartClean Pro',
    '66666666-6666-4666-8666-666666666666',
    '10000000-0000-4000-8000-000000000302',
    'Robot aspirador con mapeo laser y app movil.',
    '{"slug":"robot-aspirador-smartclean-pro","longDescription":"Robot aspirador con 4000Pa de succion y autonomia de 180 minutos.","rating":4.7,"reviewCount":901,"tags":["aspirador","robot","smart-home"],"material":"Plastico ABS","color":"Negro","style":"Moderno","dimensions":"35x35x9.5 cm","weight":"3.8 kg","featured":true,"bestSeller":true,"isNew":true,"attributes":[{"label":"Succion","value":"4000 Pa"},{"label":"Autonomia","value":"180 min"},{"label":"Deposito","value":"600 ml"}]}'::jsonb,
    now() - interval '29 days'
  ),
  (
    '80000000-0000-4000-8000-000000000009',
    'Aspiradora Escoba Flex 220W',
    '66666666-6666-4666-8666-666666666666',
    '10000000-0000-4000-8000-000000000302',
    'Aspiradora escoba sin cable con bateria de larga duracion.',
    '{"slug":"aspiradora-escoba-flex-220w","longDescription":"Aspiradora vertical con accesorios para suelos duros y alfombras.","rating":4.3,"reviewCount":544,"tags":["aspiradora","escoba","sin-cable"],"material":"ABS y aluminio","color":"Gris","style":"Moderno","dimensions":"115x26x24 cm","weight":"2.7 kg","featured":false,"bestSeller":false,"isNew":false,"attributes":[{"label":"Potencia","value":"220W"},{"label":"Autonomia","value":"55 min"},{"label":"Deposito","value":"0.8 L"}]}'::jsonb,
    now() - interval '24 days'
  ),
  (
    '80000000-0000-4000-8000-000000000010',
    'Freidora de Aire Crisp 6L',
    '77777777-7777-4777-8777-777777777777',
    '10000000-0000-4000-8000-000000000303',
    'Freidora de aire de 6 litros con panel digital.',
    '{"slug":"freidora-aire-crisp-6l","longDescription":"Freidora de aire con 8 programas y rango de temperatura ajustable.","rating":4.6,"reviewCount":1102,"tags":["freidora","aire","cocina"],"material":"ABS","color":"Negro","style":"Moderno","dimensions":"38x30x31 cm","weight":"5.9 kg","featured":true,"bestSeller":true,"isNew":false,"attributes":[{"label":"Capacidad","value":"6 L"},{"label":"Programas","value":"8"},{"label":"Potencia","value":"1700W"}]}'::jsonb,
    now() - interval '18 days'
  ),
  (
    '80000000-0000-4000-8000-000000000011',
    'Cafetera Espresso Barista 15bar',
    '77777777-7777-4777-8777-777777777777',
    '10000000-0000-4000-8000-000000000303',
    'Cafetera espresso con vaporizador y deposito de 1.5L.',
    '{"slug":"cafetera-espresso-barista-15bar","longDescription":"Cafetera compacta para espresso y cappuccino con control manual.","rating":4.2,"reviewCount":308,"tags":["cafetera","espresso","barista"],"material":"Acero y plastico","color":"Negro","style":"Profesional","dimensions":"32x24x30 cm","weight":"4.3 kg","featured":false,"bestSeller":false,"isNew":true,"attributes":[{"label":"Presion","value":"15 bar"},{"label":"Deposito","value":"1.5 L"},{"label":"Vaporizador","value":"Si"}]}'::jsonb,
    now() - interval '12 days'
  ),
  (
    '80000000-0000-4000-8000-000000000012',
    'Microondas Digital Home 25L',
    '77777777-7777-4777-8777-777777777777',
    '10000000-0000-4000-8000-000000000303',
    'Microondas de 25 litros con grill y descongelado rapido.',
    '{"slug":"microondas-digital-home-25l","longDescription":"Microondas digital con 10 niveles de potencia y funcion grill.","rating":4.1,"reviewCount":267,"tags":["microondas","grill","cocina"],"material":"Acero","color":"Plata","style":"Moderno","dimensions":"48x39x28 cm","weight":"13.2 kg","featured":false,"bestSeller":false,"isNew":false,"attributes":[{"label":"Capacidad","value":"25 L"},{"label":"Potencia","value":"900W"},{"label":"Grill","value":"Si"}]}'::jsonb,
    now() - interval '9 days'
  )
on conflict (id) do update
set
  name = excluded.name,
  brand_id = excluded.brand_id,
  category_id = excluded.category_id,
  description = excluded.description,
  specs = excluded.specs,
  created_at = excluded.created_at;

insert into public.product_images (id, product_id, url, is_primary) values
  ('81000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000002', 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000003', 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000004', '80000000-0000-4000-8000-000000000004', 'https://images.unsplash.com/photo-1592154395799-40a95e908e42?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000005', '80000000-0000-4000-8000-000000000005', 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000006', '80000000-0000-4000-8000-000000000006', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000007', '80000000-0000-4000-8000-000000000007', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000008', '80000000-0000-4000-8000-000000000008', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000009', '80000000-0000-4000-8000-000000000009', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000010', '80000000-0000-4000-8000-000000000010', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000011', '80000000-0000-4000-8000-000000000011', 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=800&fit=crop', true),
  ('81000000-0000-4000-8000-000000000012', '80000000-0000-4000-8000-000000000012', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&h=800&fit=crop', true)
on conflict (id) do update
set
  product_id = excluded.product_id,
  url = excluded.url,
  is_primary = excluded.is_primary;

insert into public.offers (id, product_id, merchant_id, price, old_price, url, stock, updated_at) values
  ('90000000-0000-4000-8000-000000000001', '80000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000001', 449.00, 599.00, 'https://amazon.es/dp/domestiq-sofa-001', true, now() - interval '4 hours'),
  ('90000000-0000-4000-8000-000000000002', '80000000-0000-4000-8000-000000000001', '70000000-0000-4000-8000-000000000002', 469.00, 619.00, 'https://ikea.com/es/p/domestiq-sofa-001', true, now() - interval '8 hours'),
  ('90000000-0000-4000-8000-000000000003', '80000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000002', 389.00, 489.00, 'https://ikea.com/es/p/domestiq-mesa-002', true, now() - interval '5 hours'),
  ('90000000-0000-4000-8000-000000000004', '80000000-0000-4000-8000-000000000002', '70000000-0000-4000-8000-000000000003', 405.00, 499.00, 'https://leroymerlin.es/domestiq-mesa-002', true, now() - interval '7 hours'),
  ('90000000-0000-4000-8000-000000000005', '80000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000001', 59.90, 89.90, 'https://amazon.es/dp/domestiq-lampara-003', true, now() - interval '3 hours'),
  ('90000000-0000-4000-8000-000000000006', '80000000-0000-4000-8000-000000000003', '70000000-0000-4000-8000-000000000005', 64.90, 99.90, 'https://carrefour.es/domestiq-lampara-003', true, now() - interval '11 hours'),
  ('90000000-0000-4000-8000-000000000007', '80000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000001', 24.90, 39.90, 'https://amazon.es/dp/domestiq-sarten-004', true, now() - interval '6 hours'),
  ('90000000-0000-4000-8000-000000000008', '80000000-0000-4000-8000-000000000004', '70000000-0000-4000-8000-000000000005', 27.50, 39.90, 'https://carrefour.es/domestiq-sarten-004', true, now() - interval '12 hours'),
  ('90000000-0000-4000-8000-000000000009', '80000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000001', 149.00, 229.00, 'https://amazon.es/dp/domestiq-ollas-005', true, now() - interval '5 hours'),
  ('90000000-0000-4000-8000-000000000010', '80000000-0000-4000-8000-000000000005', '70000000-0000-4000-8000-000000000004', 155.00, 239.00, 'https://mediamarkt.es/domestiq-ollas-005', true, now() - interval '9 hours'),
  ('90000000-0000-4000-8000-000000000011', '80000000-0000-4000-8000-000000000006', '70000000-0000-4000-8000-000000000002', 79.00, 109.00, 'https://ikea.com/es/p/domestiq-vajilla-006', true, now() - interval '8 hours'),
  ('90000000-0000-4000-8000-000000000012', '80000000-0000-4000-8000-000000000006', '70000000-0000-4000-8000-000000000005', 82.00, 119.00, 'https://carrefour.es/domestiq-vajilla-006', true, now() - interval '15 hours'),
  ('90000000-0000-4000-8000-000000000013', '80000000-0000-4000-8000-000000000007', '70000000-0000-4000-8000-000000000004', 399.00, 549.00, 'https://mediamarkt.es/domestiq-lavadora-007', true, now() - interval '4 hours'),
  ('90000000-0000-4000-8000-000000000014', '80000000-0000-4000-8000-000000000007', '70000000-0000-4000-8000-000000000001', 415.00, 569.00, 'https://amazon.es/dp/domestiq-lavadora-007', true, now() - interval '6 hours'),
  ('90000000-0000-4000-8000-000000000015', '80000000-0000-4000-8000-000000000008', '70000000-0000-4000-8000-000000000001', 279.00, 399.00, 'https://amazon.es/dp/domestiq-robot-008', true, now() - interval '3 hours'),
  ('90000000-0000-4000-8000-000000000016', '80000000-0000-4000-8000-000000000008', '70000000-0000-4000-8000-000000000004', 289.00, 429.00, 'https://mediamarkt.es/domestiq-robot-008', true, now() - interval '9 hours'),
  ('90000000-0000-4000-8000-000000000017', '80000000-0000-4000-8000-000000000009', '70000000-0000-4000-8000-000000000001', 169.00, 229.00, 'https://amazon.es/dp/domestiq-escoba-009', true, now() - interval '4 hours'),
  ('90000000-0000-4000-8000-000000000018', '80000000-0000-4000-8000-000000000009', '70000000-0000-4000-8000-000000000005', 174.00, 239.00, 'https://carrefour.es/domestiq-escoba-009', true, now() - interval '10 hours'),
  ('90000000-0000-4000-8000-000000000019', '80000000-0000-4000-8000-000000000010', '70000000-0000-4000-8000-000000000001', 129.00, 179.00, 'https://amazon.es/dp/domestiq-freidora-010', true, now() - interval '2 hours'),
  ('90000000-0000-4000-8000-000000000020', '80000000-0000-4000-8000-000000000010', '70000000-0000-4000-8000-000000000004', 134.00, 189.00, 'https://mediamarkt.es/domestiq-freidora-010', true, now() - interval '7 hours'),
  ('90000000-0000-4000-8000-000000000021', '80000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000001', 189.00, 259.00, 'https://amazon.es/dp/domestiq-cafetera-011', true, now() - interval '6 hours'),
  ('90000000-0000-4000-8000-000000000022', '80000000-0000-4000-8000-000000000011', '70000000-0000-4000-8000-000000000003', 194.00, 269.00, 'https://leroymerlin.es/domestiq-cafetera-011', true, now() - interval '14 hours'),
  ('90000000-0000-4000-8000-000000000023', '80000000-0000-4000-8000-000000000012', '70000000-0000-4000-8000-000000000001', 99.00, 139.00, 'https://amazon.es/dp/domestiq-microondas-012', true, now() - interval '5 hours'),
  ('90000000-0000-4000-8000-000000000024', '80000000-0000-4000-8000-000000000012', '70000000-0000-4000-8000-000000000005', 104.00, 149.00, 'https://carrefour.es/domestiq-microondas-012', true, now() - interval '11 hours')
on conflict (id) do update
set
  product_id = excluded.product_id,
  merchant_id = excluded.merchant_id,
  price = excluded.price,
  old_price = excluded.old_price,
  url = excluded.url,
  stock = excluded.stock,
  updated_at = excluded.updated_at;

with base_prices(product_id, base_price) as (
  values
    ('80000000-0000-4000-8000-000000000001', 449.00::numeric),
    ('80000000-0000-4000-8000-000000000002', 389.00::numeric),
    ('80000000-0000-4000-8000-000000000003', 59.90::numeric),
    ('80000000-0000-4000-8000-000000000004', 24.90::numeric),
    ('80000000-0000-4000-8000-000000000005', 149.00::numeric),
    ('80000000-0000-4000-8000-000000000006', 79.00::numeric),
    ('80000000-0000-4000-8000-000000000007', 399.00::numeric),
    ('80000000-0000-4000-8000-000000000008', 279.00::numeric),
    ('80000000-0000-4000-8000-000000000009', 169.00::numeric),
    ('80000000-0000-4000-8000-000000000010', 129.00::numeric),
    ('80000000-0000-4000-8000-000000000011', 189.00::numeric),
    ('80000000-0000-4000-8000-000000000012', 99.00::numeric)
)
insert into public.price_history (id, product_id, price, created_at)
select
  gen_random_uuid(),
  base_prices.product_id::uuid,
  round((base_prices.base_price * (1 + ((3 - step.n) * 0.035)))::numeric, 2),
  now() - ((30 - (step.n * 10))::text || ' days')::interval
from base_prices
cross join generate_series(0, 3) as step(n);

commit;
