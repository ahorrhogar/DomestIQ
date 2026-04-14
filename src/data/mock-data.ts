import { Category, Product, Merchant, Offer, PriceHistory as PriceHistoryEntry } from '@/domain/catalog/types';

export const merchants: Merchant[] = [
  { id: 'm1', name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.es', rating: 4.5, reviewCount: 125000, url: 'https://amazon.es', shippingInfo: 'Envío gratis desde 29€', returnPolicy: '30 días devolución gratuita', paymentMethods: ['Tarjeta', 'Bizum', 'Transferencia'], trusted: true },
  { id: 'm2', name: 'IKEA', logo: 'https://logo.clearbit.com/ikea.com', rating: 4.3, reviewCount: 89000, url: 'https://ikea.com/es', shippingInfo: 'Desde 4,99€', returnPolicy: '365 días', paymentMethods: ['Tarjeta', 'PayPal'], trusted: true },
  { id: 'm3', name: 'Leroy Merlin', logo: 'https://logo.clearbit.com/leroymerlin.es', rating: 4.2, reviewCount: 67000, url: 'https://leroymerlin.es', shippingInfo: 'Gratis en tienda', returnPolicy: '14 días', paymentMethods: ['Tarjeta', 'PayPal', 'Bizum'], trusted: true },
  { id: 'm4', name: 'El Corte Inglés', logo: 'https://logo.clearbit.com/elcorteingles.es', rating: 4.4, reviewCount: 95000, url: 'https://elcorteingles.es', shippingInfo: 'Gratis desde 50€', returnPolicy: '30 días', paymentMethods: ['Tarjeta', 'PayPal'], trusted: true },
  { id: 'm5', name: 'Maisons du Monde', logo: 'https://logo.clearbit.com/maisonsdumonde.com', rating: 4.1, reviewCount: 34000, url: 'https://maisonsdumonde.com/es', shippingInfo: 'Desde 5,90€', returnPolicy: '30 días', paymentMethods: ['Tarjeta', 'PayPal'], trusted: true },
  { id: 'm6', name: 'Conforama', logo: 'https://logo.clearbit.com/conforama.es', rating: 3.9, reviewCount: 28000, url: 'https://conforama.es', shippingInfo: 'Desde 9,90€', returnPolicy: '14 días', paymentMethods: ['Tarjeta'], trusted: true },
  { id: 'm7', name: 'MediaMarkt', logo: 'https://logo.clearbit.com/mediamarkt.es', rating: 4.2, reviewCount: 72000, url: 'https://mediamarkt.es', shippingInfo: 'Gratis desde 49€', returnPolicy: '30 días', paymentMethods: ['Tarjeta', 'PayPal', 'Bizum'], trusted: true },
  { id: 'm8', name: 'Carrefour', logo: 'https://logo.clearbit.com/carrefour.es', rating: 4.0, reviewCount: 55000, url: 'https://carrefour.es', shippingInfo: 'Desde 3,99€', returnPolicy: '14 días', paymentMethods: ['Tarjeta', 'PayPal'], trusted: true },
];

// Product image URLs - realistic Unsplash photos for each product
const productImages: Record<string, string[]> = {
  p1: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop'],
  p2: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&h=600&fit=crop'],
  p3: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop'],
  p4: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=600&fit=crop'],
  p5: ['https://images.unsplash.com/photo-1592154395799-40a95e908e42?w=600&h=600&fit=crop'],
  p6: ['https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop'],
  p7: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=600&fit=crop'],
  p8: ['https://images.unsplash.com/photo-1529690840038-f5da41aba50b?w=600&h=600&fit=crop'],
  p9: ['https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&h=600&fit=crop'],
  p10: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&h=600&fit=crop'],
  p11: ['https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600&h=600&fit=crop'],
  p12: ['https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=600&h=600&fit=crop'],
};

const rawCategories: Omit<Category, 'productCount' | 'subcategories'>[] = [
  { id: 'c1', name: 'Muebles', slug: 'muebles', icon: 'Sofa', description: 'Sofás, mesas, estanterías y más para tu hogar', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
  { id: 'c2', name: 'Cocina', slug: 'cocina', icon: 'ChefHat', description: 'Todo para tu cocina: sartenes, ollas, electrodomésticos', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop' },
  { id: 'c3', name: 'Electrodomésticos', slug: 'electrodomesticos', icon: 'Zap', description: 'Lavadoras, frigoríficos, aspiradoras y más', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop' },
  { id: 'c4', name: 'Jardín', slug: 'jardin', icon: 'TreePine', description: 'Muebles de exterior, barbacoas, casetas', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop' },
  { id: 'c5', name: 'Iluminación', slug: 'iluminacion', icon: 'Lightbulb', description: 'Lámparas de techo, pie, sobremesa, LED', image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=300&fit=crop' },
  { id: 'c6', name: 'Decoración', slug: 'decoracion', icon: 'Palette', description: 'Cuadros, espejos, jarrones y accesorios decorativos', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop' },
  { id: 'c7', name: 'Baño', slug: 'bano', icon: 'Bath', description: 'Muebles de baño, grifería, accesorios', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop' },
  { id: 'c8', name: 'Textil Hogar', slug: 'textil-hogar', icon: 'Shirt', description: 'Ropa de cama, cortinas, cojines, toallas', image: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=400&h=300&fit=crop' },
  { id: 'c9', name: 'Organización', slug: 'organizacion', icon: 'Archive', description: 'Almacenaje, cajoneras, organizadores', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop' },
  { id: 'c10', name: 'Menaje', slug: 'menaje', icon: 'UtensilsCrossed', description: 'Platos, vasos, utensilios de cocina', image: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?w=400&h=300&fit=crop' },
];

const rawSubcategories: { id: string; categoryId: string; name: string; slug: string }[] = [
  { id: 's1', categoryId: 'c1', name: 'Sofás', slug: 'sofas' },
  { id: 's2', categoryId: 'c1', name: 'Mesas', slug: 'mesas' },
  { id: 's3', categoryId: 'c1', name: 'Muebles TV', slug: 'muebles-tv' },
  { id: 's4', categoryId: 'c1', name: 'Estanterías', slug: 'estanterias' },
  { id: 's5', categoryId: 'c1', name: 'Sillas', slug: 'sillas' },
  { id: 's6', categoryId: 'c1', name: 'Escritorios', slug: 'escritorios' },
  { id: 's7', categoryId: 'c2', name: 'Sartenes', slug: 'sartenes' },
  { id: 's8', categoryId: 'c2', name: 'Ollas', slug: 'ollas' },
  { id: 's9', categoryId: 'c2', name: 'Vajilla', slug: 'vajilla' },
  { id: 's10', categoryId: 'c2', name: 'Cubertería', slug: 'cuberteria' },
  { id: 's11', categoryId: 'c2', name: 'Pequeños electrodomésticos', slug: 'pequenos-electrodomesticos' },
  { id: 's12', categoryId: 'c3', name: 'Lavadoras', slug: 'lavadoras' },
  { id: 's13', categoryId: 'c3', name: 'Frigoríficos', slug: 'frigorificos' },
  { id: 's14', categoryId: 'c3', name: 'Aspiradoras', slug: 'aspiradoras' },
  { id: 's15', categoryId: 'c3', name: 'Climatización', slug: 'climatizacion' },
  { id: 's16', categoryId: 'c4', name: 'Muebles de exterior', slug: 'muebles-exterior' },
  { id: 's17', categoryId: 'c4', name: 'Barbacoas', slug: 'barbacoas' },
  { id: 's18', categoryId: 'c4', name: 'Casetas', slug: 'casetas' },
  { id: 's19', categoryId: 'c4', name: 'Herramientas de jardín', slug: 'herramientas-jardin' },
  { id: 's20', categoryId: 'c5', name: 'Lámparas de techo', slug: 'lamparas-techo' },
  { id: 's21', categoryId: 'c5', name: 'Lámparas de pie', slug: 'lamparas-pie' },
  { id: 's22', categoryId: 'c5', name: 'Sobremesa', slug: 'sobremesa' },
  { id: 's23', categoryId: 'c5', name: 'LED', slug: 'led' },
  { id: 's24', categoryId: 'c6', name: 'Cuadros', slug: 'cuadros' },
  { id: 's25', categoryId: 'c6', name: 'Espejos', slug: 'espejos' },
  { id: 's26', categoryId: 'c6', name: 'Jarrones', slug: 'jarrones' },
  { id: 's27', categoryId: 'c6', name: 'Alfombras', slug: 'alfombras' },
  { id: 's28', categoryId: 'c7', name: 'Muebles de baño', slug: 'muebles-bano' },
  { id: 's29', categoryId: 'c7', name: 'Grifería', slug: 'griferia' },
  { id: 's30', categoryId: 'c7', name: 'Accesorios', slug: 'accesorios-bano' },
  { id: 's31', categoryId: 'c8', name: 'Ropa de cama', slug: 'ropa-de-cama' },
  { id: 's32', categoryId: 'c8', name: 'Cortinas', slug: 'cortinas' },
  { id: 's33', categoryId: 'c8', name: 'Cojines', slug: 'cojines' },
  { id: 's34', categoryId: 'c8', name: 'Toallas', slug: 'toallas' },
  { id: 's35', categoryId: 'c9', name: 'Cajoneras', slug: 'cajoneras' },
  { id: 's36', categoryId: 'c9', name: 'Estanterías auxiliares', slug: 'estanterias-auxiliares' },
  { id: 's37', categoryId: 'c9', name: 'Organizadores', slug: 'organizadores' },
  { id: 's38', categoryId: 'c10', name: 'Platos', slug: 'platos' },
  { id: 's39', categoryId: 'c10', name: 'Vasos y copas', slug: 'vasos-copas' },
  { id: 's40', categoryId: 'c10', name: 'Utensilios', slug: 'utensilios' },
];

export const products: Product[] = [
  {
    id: 'p1', name: 'Sofá 3 Plazas Nordic', slug: 'sofa-3-plazas-nordic',
    categoryId: 'c1', subcategoryId: 's1', brand: 'Nordic Living',
    description: 'Sofá de 3 plazas con diseño escandinavo, tapizado en tela antimanchas.',
    longDescription: 'El sofá Nordic de 3 plazas combina elegancia escandinava con la máxima comodidad. Su estructura de madera maciza y espuma de alta densidad garantizan durabilidad. El tapizado antimanchas facilita su mantenimiento diario. Perfecto para salones modernos y acogedores.',
    images: productImages.p1, minPrice: 449, maxPrice: 699, originalPrice: 599,
    rating: 4.6, reviewCount: 234, offerCount: 6,
    specs: [{ label: 'Plazas', value: '3' }, { label: 'Ancho', value: '220 cm' }, { label: 'Profundidad', value: '90 cm' }, { label: 'Alto', value: '85 cm' }, { label: 'Material', value: 'Tela antimanchas' }, { label: 'Estructura', value: 'Madera maciza' }],
    tags: ['sofá', 'escandinavo', 'salón'], material: 'Tela', color: 'Gris', style: 'Nórdico', dimensions: '220x90x85 cm', weight: '65 kg', featured: true, bestSeller: true,
  },
  {
    id: 'p2', name: 'Mesa de Comedor Extensible Oak', slug: 'mesa-comedor-extensible-oak',
    categoryId: 'c1', subcategoryId: 's2', brand: 'WoodArt',
    description: 'Mesa extensible de roble macizo, de 140 a 200 cm. Ideal para reuniones familiares.',
    longDescription: 'Mesa de comedor extensible fabricada en roble macizo con acabado natural. Se extiende fácilmente de 140 a 200 cm gracias a su sistema de guías ocultas. Capacidad para 6 a 10 comensales.',
    images: productImages.p2, minPrice: 389, maxPrice: 649, originalPrice: 489,
    rating: 4.4, reviewCount: 156, offerCount: 5,
    specs: [{ label: 'Material', value: 'Roble macizo' }, { label: 'Largo cerrada', value: '140 cm' }, { label: 'Largo abierta', value: '200 cm' }, { label: 'Ancho', value: '90 cm' }, { label: 'Comensales', value: '6-10' }],
    tags: ['mesa', 'comedor', 'extensible'], material: 'Madera', color: 'Natural', style: 'Nórdico', dimensions: '140-200x90x75 cm', weight: '45 kg', featured: true,
  },
  {
    id: 'p3', name: 'Aspiradora Robot SmartClean Pro', slug: 'aspiradora-robot-smartclean-pro',
    categoryId: 'c3', subcategoryId: 's14', brand: 'SmartClean',
    description: 'Robot aspirador con mapeo láser, succión 4000Pa y control por app.',
    longDescription: 'El SmartClean Pro es un robot aspirador de última generación con navegación láser LiDAR, succión de 4000Pa y hasta 180 minutos de autonomía. Compatible con Alexa y Google Home. Incluye base de carga automática y depósito de 600ml.',
    images: productImages.p3, minPrice: 279, maxPrice: 449, originalPrice: 399,
    rating: 4.7, reviewCount: 892, offerCount: 8,
    specs: [{ label: 'Succión', value: '4000 Pa' }, { label: 'Autonomía', value: '180 min' }, { label: 'Navegación', value: 'Láser LiDAR' }, { label: 'Depósito', value: '600 ml' }, { label: 'Ruido', value: '65 dB' }],
    tags: ['aspiradora', 'robot', 'smart home'], material: 'Plástico ABS', color: 'Negro', style: 'Moderno', dimensions: '35x35x9.5 cm', weight: '3.8 kg', featured: true, bestSeller: true, isNew: true,
  },
  {
    id: 'p4', name: 'Mueble TV Industrial 160cm', slug: 'mueble-tv-industrial-160',
    categoryId: 'c1', subcategoryId: 's3', brand: 'LoftStyle',
    description: 'Mueble de TV de estilo industrial con estructura metálica y madera de mango.',
    longDescription: 'Mueble de TV de estilo industrial que combina metal negro mate con madera de mango maciza. Incluye 2 puertas, 1 cajón y estantes abiertos para organizar dispositivos multimedia. Soporte para TVs hasta 70 pulgadas.',
    images: productImages.p4, minPrice: 299, maxPrice: 459,
    rating: 4.3, reviewCount: 178, offerCount: 4,
    specs: [{ label: 'Ancho', value: '160 cm' }, { label: 'Alto', value: '55 cm' }, { label: 'Profundidad', value: '40 cm' }, { label: 'TV máx.', value: '70"' }],
    tags: ['mueble tv', 'industrial', 'salón'], material: 'Metal y madera', color: 'Negro/Natural', style: 'Industrial', dimensions: '160x55x40 cm', weight: '38 kg',
  },
  {
    id: 'p5', name: 'Sartén Antiadherente Chef Master 28cm', slug: 'sarten-antiadherente-chef-master',
    categoryId: 'c2', subcategoryId: 's7', brand: 'Chef Master',
    description: 'Sartén profesional con recubrimiento cerámico antiadherente, apta para inducción.',
    longDescription: 'Sartén Chef Master de 28cm con triple capa de recubrimiento cerámico antiadherente libre de PFOA. Base reforzada de aluminio forjado compatible con todo tipo de cocinas incluida inducción. Mango ergonómico de baquelita.',
    images: productImages.p5, minPrice: 24.90, maxPrice: 44.90, originalPrice: 39.90,
    rating: 4.5, reviewCount: 1245, offerCount: 7,
    specs: [{ label: 'Diámetro', value: '28 cm' }, { label: 'Material', value: 'Aluminio forjado' }, { label: 'Recubrimiento', value: 'Cerámico' }, { label: 'Inducción', value: 'Sí' }],
    tags: ['sartén', 'antiadherente', 'cocina'], material: 'Aluminio', color: 'Negro', style: 'Profesional', weight: '0.9 kg', bestSeller: true,
  },
  {
    id: 'p6', name: 'Lámpara de Techo LED Circular', slug: 'lampara-techo-led-circular',
    categoryId: 'c5', subcategoryId: 's20', brand: 'LuxLight',
    description: 'Lámpara de techo LED regulable, 36W, luz cálida/fría, diseño minimalista.',
    longDescription: 'Lámpara de techo LED de diseño circular minimalista con 36W de potencia. Temperatura de color regulable de 3000K a 6000K con mando a distancia incluido. Eficiencia energética A+. Instalación sencilla.',
    images: productImages.p6, minPrice: 59.90, maxPrice: 99.90, originalPrice: 89.90,
    rating: 4.4, reviewCount: 567, offerCount: 5,
    specs: [{ label: 'Potencia', value: '36W' }, { label: 'Temperatura', value: '3000-6000K' }, { label: 'Diámetro', value: '50 cm' }, { label: 'Eficiencia', value: 'A+' }],
    tags: ['lámpara', 'LED', 'techo'], material: 'Metal y acrílico', color: 'Blanco', style: 'Minimalista', dimensions: 'Ø50x8 cm', featured: true,
  },
  {
    id: 'p7', name: 'Juego de Sábanas 100% Algodón Egipcio', slug: 'juego-sabanas-algodon-egipcio',
    categoryId: 'c8', subcategoryId: 's31', brand: 'SleepLux',
    description: 'Juego de sábanas de algodón egipcio de 400 hilos. Tacto suave y duradero.',
    longDescription: 'Juego completo de sábanas fabricado en 100% algodón egipcio de 400 hilos. Incluye sábana encimera, bajera ajustable y 2 fundas de almohada. Tejido satinado de tacto ultra suave. Apto para lavadora a 40°C.',
    images: productImages.p7, minPrice: 49.90, maxPrice: 89.90,
    rating: 4.8, reviewCount: 2100, offerCount: 6,
    specs: [{ label: 'Material', value: '100% algodón egipcio' }, { label: 'Hilos', value: '400' }, { label: 'Piezas', value: '4' }, { label: 'Tamaño', value: '150x200 cm' }],
    tags: ['sábanas', 'algodón', 'dormitorio'], material: 'Algodón egipcio', color: 'Blanco', style: 'Clásico', bestSeller: true,
  },
  {
    id: 'p8', name: 'Barbacoa de Gas Weber Spirit 3 Quemadores', slug: 'barbacoa-gas-weber-spirit',
    categoryId: 'c4', subcategoryId: 's17', brand: 'Weber',
    description: 'Barbacoa de gas con 3 quemadores, encendido eléctrico y termómetro integrado.',
    longDescription: 'La Weber Spirit es la barbacoa de gas perfecta para el jardín. Con 3 quemadores de acero inoxidable, encendido eléctrico, termómetro integrado y amplia superficie de cocción. Estructura robusta con ruedas para fácil movilidad.',
    images: productImages.p8, minPrice: 449, maxPrice: 649, originalPrice: 549,
    rating: 4.6, reviewCount: 423, offerCount: 4,
    specs: [{ label: 'Quemadores', value: '3' }, { label: 'Superficie', value: '3.507 cm²' }, { label: 'Potencia', value: '9.38 kW' }, { label: 'Combustible', value: 'Gas propano/butano' }],
    tags: ['barbacoa', 'gas', 'jardín'], material: 'Acero inoxidable', color: 'Negro', style: 'Clásico', dimensions: '127x66x115 cm', weight: '52 kg', featured: true,
  },
  {
    id: 'p9', name: 'Espejo de Pared Redondo Dorado 80cm', slug: 'espejo-pared-redondo-dorado',
    categoryId: 'c6', subcategoryId: 's25', brand: 'DecoHome',
    description: 'Espejo redondo con marco de metal dorado mate. Diámetro 80 cm.',
    longDescription: 'Elegante espejo de pared con marco metálico en acabado dorado mate cepillado. Diámetro de 80 cm, perfecto para recibidor, salón o dormitorio. Incluye herrajes de fijación. Cristal de alta calidad con protección anti-vaho.',
    images: productImages.p9, minPrice: 79, maxPrice: 149,
    rating: 4.5, reviewCount: 312, offerCount: 5,
    specs: [{ label: 'Diámetro', value: '80 cm' }, { label: 'Marco', value: 'Metal dorado' }, { label: 'Peso', value: '8 kg' }],
    tags: ['espejo', 'decoración', 'dorado'], material: 'Cristal y metal', color: 'Dorado', style: 'Moderno', dimensions: 'Ø80 cm',
  },
  {
    id: 'p10', name: 'Lavadora Samsung 9kg EcoBubble', slug: 'lavadora-samsung-ecobubble',
    categoryId: 'c3', subcategoryId: 's12', brand: 'Samsung',
    description: 'Lavadora de 9kg con tecnología EcoBubble, motor Inverter y eficiencia A.',
    longDescription: 'La Samsung EcoBubble con 9kg de capacidad ofrece un lavado eficiente y silencioso gracias a su motor Digital Inverter. La tecnología EcoBubble genera burbujas que penetran mejor en los tejidos incluso con agua fría, ahorrando energía.',
    images: productImages.p10, minPrice: 399, maxPrice: 599, originalPrice: 549,
    rating: 4.5, reviewCount: 678, offerCount: 6,
    specs: [{ label: 'Capacidad', value: '9 kg' }, { label: 'RPM', value: '1400' }, { label: 'Eficiencia', value: 'A' }, { label: 'Ruido lavado', value: '52 dB' }, { label: 'Motor', value: 'Digital Inverter' }],
    tags: ['lavadora', 'samsung', 'eficiente'], material: 'Acero', color: 'Blanco', style: 'Moderno', dimensions: '60x55x85 cm', weight: '70 kg', featured: true, isNew: true,
  },
  {
    id: 'p11', name: 'Estantería Modular Kallax 4x4', slug: 'estanteria-modular-kallax',
    categoryId: 'c1', subcategoryId: 's4', brand: 'IKEA',
    description: 'Estantería modular versátil con 16 compartimentos. Ideal para salón u oficina.',
    longDescription: 'La estantería Kallax 4x4 es un mueble versátil que se adapta a cualquier espacio. Sus 16 compartimentos permiten organizar libros, cajas, cestas y objetos decorativos. Puede colocarse en vertical u horizontal.',
    images: productImages.p11, minPrice: 89, maxPrice: 129,
    rating: 4.3, reviewCount: 3500, offerCount: 3,
    specs: [{ label: 'Compartimentos', value: '16' }, { label: 'Ancho', value: '147 cm' }, { label: 'Alto', value: '147 cm' }, { label: 'Profundidad', value: '39 cm' }],
    tags: ['estantería', 'modular', 'organización'], material: 'Tablero de partículas', color: 'Blanco', style: 'Moderno', dimensions: '147x147x39 cm', bestSeller: true,
  },
  {
    id: 'p12', name: 'Set de Ollas WMF Premium 5 Piezas', slug: 'set-ollas-wmf-premium',
    categoryId: 'c2', subcategoryId: 's8', brand: 'WMF',
    description: 'Set de 5 ollas de acero inoxidable 18/10 con tapa de cristal. Apto inducción.',
    longDescription: 'Set profesional WMF de 5 ollas en acero inoxidable Cromargan 18/10. Incluye cazo de 16cm, 3 ollas de 16, 20 y 24cm y una olla alta de 24cm. Todas con tapa de cristal templado y asas frías.',
    images: productImages.p12, minPrice: 149, maxPrice: 259, originalPrice: 229,
    rating: 4.7, reviewCount: 890, offerCount: 5,
    specs: [{ label: 'Piezas', value: '5' }, { label: 'Material', value: 'Acero inoxidable 18/10' }, { label: 'Inducción', value: 'Sí' }, { label: 'Lavavajillas', value: 'Sí' }],
    tags: ['ollas', 'wmf', 'set'], material: 'Acero inoxidable', color: 'Plata', style: 'Profesional', featured: true,
  },
];

// Compute real discount percentages from price data
products.forEach(p => {
  if (p.originalPrice && p.originalPrice > p.minPrice) {
    p.discountPercent = Math.round(((p.originalPrice - p.minPrice) / p.originalPrice) * 100);
    // Cap unrealistic discounts
    if (p.discountPercent > 60) p.discountPercent = undefined;
  } else {
    p.discountPercent = undefined;
  }
});

// Build categories with REAL product counts
export const categories: Category[] = rawCategories.map(cat => {
  const catProducts = products.filter(p => p.categoryId === cat.id);
  return {
    ...cat,
    productCount: catProducts.length,
    subcategories: rawSubcategories
      .filter(s => s.categoryId === cat.id)
      .map(sub => ({
        ...sub,
        productCount: catProducts.filter(p => p.subcategoryId === sub.id).length,
      })),
  };
});

// Deterministic seed-based pseudo-random for stable offers
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 0x45d9f3b);
    hash = Math.imul(hash ^ (hash >>> 13), 0x45d9f3b);
    hash ^= hash >>> 16;
    return (hash >>> 0) / 4294967296;
  };
}

export function getOffersForProduct(productId: string): Offer[] {
  const product = products.find(p => p.id === productId);
  if (!product) return [];

  const rand = seededRandom(productId);
  const count = Math.min(product.offerCount, merchants.length);
  // Deterministic merchant selection
  const indices = Array.from({ length: merchants.length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const selectedMerchants = indices.slice(0, count).map(i => merchants[i]);
  const priceRange = product.maxPrice - product.minPrice;

  return selectedMerchants.map((merchant, i) => {
    const price = i === 0 ? product.minPrice : Math.round((product.minPrice + (priceRange * ((i + 0.3) / count))) * 100) / 100;
    const isFreeShipping = rand() > 0.35;
    return {
      id: `o-${productId}-${merchant.id}`,
      productId,
      merchantId: merchant.id,
      merchant,
      price,
      originalPrice: product.originalPrice && product.originalPrice > price ? product.originalPrice : undefined,
      shippingCost: isFreeShipping ? 0 : Math.round((3 + rand() * 7) * 100) / 100,
      freeShipping: isFreeShipping,
      fastShipping: rand() > 0.45,
      inStock: rand() > 0.1,
      url: merchant.url,
      lastUpdated: new Date(Date.now() - Math.floor(rand() * 86400000 * 2)).toISOString(),
    };
  }).sort((a, b) => (a.price + a.shippingCost) - (b.price + b.shippingCost));
}

// Realistic price history: smooth trends with gradual movements
export function getPriceHistory(productId: string): PriceHistoryEntry[] {
  const product = products.find(p => p.id === productId);
  if (!product) return [];

  const rand = seededRandom(`history-${productId}`);
  const entries: PriceHistoryEntry[] = [];
  const days = 90;
  const currentPrice = product.minPrice;
  const amplitude = (product.maxPrice - product.minPrice) * 0.25;

  // Start higher, trend down to current price
  let price = currentPrice + amplitude * (0.6 + rand() * 0.4);
  // If there's an original price, start near it
  if (product.originalPrice) price = product.originalPrice * (0.95 + rand() * 0.08);

  for (let i = days; i >= 0; i -= 3) {
    const date = new Date(Date.now() - i * 86400000);
    entries.push({
      date: date.toISOString().split('T')[0],
      price: Math.round(price * 100) / 100,
    });

    // Gradual random walk towards current price
    const targetDrift = (currentPrice - price) * 0.05; // Pull towards current
    const noise = (rand() - 0.5) * amplitude * 0.12;
    price += targetDrift + noise;
    // Clamp to reasonable range
    price = Math.max(currentPrice * 0.9, Math.min(product.maxPrice * 1.05, price));
  }

  // Ensure last entry is exactly current price
  entries[entries.length - 1].price = currentPrice;

  return entries;
}

// Helper to get price history analysis
export function getPriceAnalysis(productId: string): { label: string; type: 'low' | 'stable' | 'high' } {
  const history = getPriceHistory(productId);
  if (history.length < 2) return { label: 'Sin datos suficientes', type: 'stable' };

  const current = history[history.length - 1].price;
  const min = Math.min(...history.map(h => h.price));
  const avg = history.reduce((s, h) => s + h.price, 0) / history.length;
  const maxDeviation = Math.max(...history.map(h => Math.abs(h.price - avg))) / avg;

  if (current <= min * 1.02) {
    return { label: 'Precio más bajo en 3 meses', type: 'low' };
  } else if (maxDeviation < 0.05) {
    return { label: 'Precio estable', type: 'stable' };
  } else if (current > avg) {
    return { label: 'Por encima de la media', type: 'high' };
  }
  return { label: 'Buen precio actual', type: 'low' };
}

export const featuredDeals = products.filter(p => p.discountPercent && p.discountPercent >= 15);
export const bestSellers = products.filter(p => p.bestSeller);
export const newProducts = products.filter(p => p.isNew);
export const featuredProducts = products.filter(p => p.featured);
