import type { Category, Product, Subcategory } from "@/domain/catalog/types";

export interface SeoInternalLink {
  label: string;
  href: string;
  type: "category" | "subcategory" | "guide" | "product";
}

export interface SeoSection {
  heading: string;
  paragraphs: string[];
}

export interface CategorySeoDocument {
  title: string;
  metaDescription: string;
  h1: string;
  introHeading: string;
  introParagraphs: string[];
  sections: SeoSection[];
  closingParagraphs: string[];
  relatedLinks: SeoInternalLink[];
  canonicalPath: string;
  schemaDescription: string;
}

interface BuildCategorySeoDocumentParams {
  category: Category;
  subcategory?: Subcategory;
  categories: Category[];
  products: Product[];
  allProducts: Product[];
}

type CategoryTheme = "muebles" | "electro" | "jardin" | "climatizacion" | "cocina" | "hogar";

const GUIDE_LINKS_BY_THEME: Record<CategoryTheme, SeoInternalLink[]> = {
  muebles: [
    { label: "Guia de sofas con mejor calidad-precio", href: "/blog/mejores-sofas-calidad-precio-2026", type: "guide" },
    { label: "Todas las guias para amueblar tu casa", href: "/guias", type: "guide" },
  ],
  electro: [
    { label: "Comparativa de frigorificos combi de bajo consumo", href: "/blog/mejores-frigorificos-combi-bajo-consumo-2026", type: "guide" },
    { label: "Microondas sin plato giratorio: seleccion actualizada", href: "/blog/mejores-microondas-sin-plato-giratorio-2026", type: "guide" },
  ],
  jardin: [
    { label: "Mesas de exterior baratas y bonitas", href: "/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026", type: "guide" },
    { label: "Todas las guias para jardin y exterior", href: "/guias", type: "guide" },
  ],
  climatizacion: [
    { label: "Ventiladores recomendados para verano", href: "/blog/mejores-ventiladores-de-pie-para-este-verano-2026", type: "guide" },
    { label: "Ventiladores de Amazon con mejor rendimiento", href: "/blog/los-7-mejores-ventiladores-amazon-calor-verano-2026", type: "guide" },
  ],
  cocina: [
    { label: "Freidoras de aire por menos de 100 euros", href: "/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros", type: "guide" },
    { label: "Cafeteras superautomaticas para amantes del cafe", href: "/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026", type: "guide" },
  ],
  hogar: [{ label: "Explorar guias de compra para el hogar", href: "/guias", type: "guide" }],
};

function detectTheme(category: Category, subcategory?: Subcategory): CategoryTheme {
  const haystack = `${category.name} ${category.slug} ${subcategory?.name || ""} ${subcategory?.slug || ""}`.toLowerCase();

  if (haystack.includes("climat") || haystack.includes("ventil") || haystack.includes("estufa") || haystack.includes("aire")) {
    return "climatizacion";
  }

  if (haystack.includes("jard") || haystack.includes("exterior") || haystack.includes("terraza") || haystack.includes("barbacoa")) {
    return "jardin";
  }

  if (haystack.includes("mueble") || haystack.includes("sofa") || haystack.includes("colchon") || haystack.includes("oficina")) {
    return "muebles";
  }

  if (haystack.includes("cocina") || haystack.includes("utensilio") || haystack.includes("freidora") || haystack.includes("cafetera")) {
    return "cocina";
  }

  if (haystack.includes("electro") || haystack.includes("lavadora") || haystack.includes("nevera") || haystack.includes("microondas") || haystack.includes("aspiradora")) {
    return "electro";
  }

  return "hogar";
}

function formatMoney(value: number): string {
  return `${value.toFixed(0)} EUR`;
}

function getPriceInsights(products: Product[]): { min: number; max: number; avg: number } {
  if (!products.length) {
    return { min: 0, max: 0, avg: 0 };
  }

  const prices = products.map((product) => Math.max(0, product.minPrice || 0)).filter((value) => value > 0);
  if (!prices.length) {
    return { min: 0, max: 0, avg: 0 };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((sum, value) => sum + value, 0) / prices.length;

  return { min, max, avg };
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
}

function buildContextLabel(category: Category, subcategory?: Subcategory): string {
  return subcategory ? `${subcategory.name} de ${category.name}` : category.name;
}

function buildTitle(category: Category, subcategory: Subcategory | undefined, productCount: number): string {
  const pageLabel = buildContextLabel(category, subcategory);
  const countChunk = productCount > 0 ? ` (${productCount} productos)` : "";
  return `Comparador de precios de ${pageLabel}${countChunk} | Homara`;
}

function buildMetaDescription(
  category: Category,
  subcategory: Subcategory | undefined,
  productCount: number,
  minPrice: number,
  maxPrice: number,
): string {
  const pageLabel = buildContextLabel(category, subcategory);
  const countChunk = productCount > 0 ? `${productCount} opciones` : "seleccion actualizada";
  const priceChunk = minPrice > 0 && maxPrice > 0
    ? `Rango aproximado: ${formatMoney(minPrice)} - ${formatMoney(maxPrice)}.`
    : "Filtra por precio, valoraciones y marcas en segundos.";

  return `Compara precios de ${pageLabel} en Homara con ${countChunk}. ${priceChunk} Encuentra ofertas reales, analiza caracteristicas y compra con criterio.`;
}

function buildThemeCopy(theme: CategoryTheme, pageLabel: string): { intro: string; factors: string; recommendation: string } {
  if (theme === "muebles") {
    return {
      intro: `En ${pageLabel} conviven decisiones de estilo y funcionalidad. No solo importa la estetica: tambien el uso diario, la resistencia de los materiales y el encaje con el espacio disponible en casa.`,
      factors: "Para comparar muebles con criterio conviene revisar medidas reales, estructura, materiales de tapizado o tablero, facilidad de mantenimiento y coste total de envio.",
      recommendation: "Si compras por presupuesto, prioriza primero la pieza principal y despues completa el conjunto. Si buscas durabilidad, compara acabados, garantia y opiniones verificadas antes de decidir.",
    };
  }

  if (theme === "jardin") {
    return {
      intro: `La categoria de ${pageLabel} suele combinar mantenimiento, ocio y confort exterior. Elegir bien implica pensar en clima, exposicion solar, materiales resistentes y facilidad de guardado fuera de temporada.`,
      factors: "En exterior es clave comparar resistencia a la intemperie, facilidad de limpieza, peso, almacenamiento y compatibilidad con terrazas, patios o jardines pequenos.",
      recommendation: "Para compras inteligentes en jardin, combina productos base de larga vida util con accesorios estacionales. Asi equilibras coste inicial, utilidad real y renovacion futura.",
    };
  }

  if (theme === "climatizacion") {
    return {
      intro: `En ${pageLabel} la prioridad es mejorar el confort termico sin disparar consumo ni ruido. La comparativa correcta debe unir rendimiento, eficiencia energetica y adaptacion al tamano de la estancia.`,
      factors: "Los factores mas importantes son potencia util, nivel de ruido, modos de funcionamiento, mantenimiento y coste anual de uso en periodos de calor o frio intenso.",
      recommendation: "Si buscas ahorro a medio plazo, prioriza equipos eficientes y de uso frecuente. Para usos ocasionales, valora modelos sencillos pero con buena relacion calidad-precio.",
    };
  }

  if (theme === "cocina") {
    return {
      intro: `La seleccion de ${pageLabel} debe facilitar la rutina diaria: preparar mas rapido, limpiar mejor y aprovechar cada euro invertido en productos de uso constante.`,
      factors: "Al comparar productos de cocina, revisa capacidad real, materiales en contacto con alimentos, facilidad de limpieza, versatilidad de uso y consumo energetico cuando aplica.",
      recommendation: "Si cocinas a diario, compensa invertir en prestaciones y materiales. Si el uso es puntual, prioriza soluciones compactas, faciles de guardar y con mantenimiento minimo.",
    };
  }

  if (theme === "electro") {
    return {
      intro: `En ${pageLabel} la compra ideal combina practicidad, ahorro de tiempo y eficiencia. Una buena comparativa evita pagar de mas por funciones que luego no usas.`,
      factors: "Conviene comparar consumo, capacidad, programas utiles, ruido, conectividad cuando aporta valor y coste de reparacion o mantenimiento.",
      recommendation: "Para compras con retorno real, da prioridad a electrodomesticos que se usan cada semana y evalua el coste total de propiedad, no solo el precio inicial.",
    };
  }

  return {
    intro: `Esta seleccion de ${pageLabel} esta orientada a resolver necesidades reales del hogar con equilibrio entre precio, calidad y uso diario.`,
    factors: "La comparativa mas util combina precio final, caracteristicas clave, valoraciones de usuarios y reputacion de tienda.",
    recommendation: "Define primero tu uso principal, luego filtra por presupuesto y por ultimo compara prestaciones diferenciales para elegir con seguridad.",
  };
}

function pickRelatedCategories(category: Category, categories: Category[]): SeoInternalLink[] {
  const topLevel = categories.filter((entry) => !entry.subcategories.some((sub) => sub.id === category.id));
  const siblings = topLevel.filter((entry) => entry.id !== category.id).slice(0, 3);

  return siblings.map((entry) => ({
    label: entry.name,
    href: `/categoria/${entry.slug}`,
    type: "category",
  }));
}

function pickRelatedSubcategories(category: Category, subcategory?: Subcategory): SeoInternalLink[] {
  const pool = category.subcategories.filter((entry) => entry.id !== subcategory?.id).slice(0, 4);
  return pool.map((entry) => ({
    label: entry.name,
    href: `/categoria/${category.slug}/${entry.slug}`,
    type: "subcategory",
  }));
}

function pickHighlightedProducts(products: Product[]): SeoInternalLink[] {
  return products
    .slice()
    .sort((left, right) => {
      const rightScore = (right.reviewCount || 0) * (right.rating || 0);
      const leftScore = (left.reviewCount || 0) * (left.rating || 0);
      return rightScore - leftScore;
    })
    .slice(0, 3)
    .map((product) => ({
      label: product.name,
      href: `/producto/${product.slug}`,
      type: "product",
    }));
}

function buildWordyIntro(pageLabel: string, productCount: number, brands: string[], themeIntro: string): string[] {
  const brandsSnippet = brands.length
    ? `Entre las marcas con presencia en esta pagina destacan ${brands.slice(0, 5).join(", ")}${brands.length > 5 ? " y otras referencias" : ""}.`
    : "La oferta se actualiza de forma continua con nuevas referencias y precios de distintas tiendas.";

  return [
    `Si estas comparando ${pageLabel.toLowerCase()}, esta pagina esta pensada para ayudarte a pasar de una busqueda amplia a una decision concreta. En Homara reunimos catalogo, filtros y señales de valor para que puedas entender rapidamente que productos encajan mejor con tu presupuesto y con tu uso real en casa.`,
    `Actualmente puedes revisar ${productCount || "varios"} productos en esta seccion, con informacion util para evaluar precio, valoraciones y caracteristicas relevantes. ${brandsSnippet}`,
    themeIntro,
  ];
}

export function buildCategorySeoDocument(params: BuildCategorySeoDocumentParams): CategorySeoDocument {
  const { category, subcategory, categories, products, allProducts } = params;
  const pageLabel = buildContextLabel(category, subcategory);
  const theme = detectTheme(category, subcategory);
  const priceInsights = getPriceInsights(products);
  const brands = uniqueSorted(products.map((product) => product.brand)).slice(0, 8);
  const materials = uniqueSorted(products.map((product) => product.material)).slice(0, 6);
  const styles = uniqueSorted(products.map((product) => product.style)).slice(0, 6);
  const relatedSubcategoryLinks = pickRelatedSubcategories(category, subcategory);
  const relatedCategoryLinks = pickRelatedCategories(category, categories);
  const guideLinks = GUIDE_LINKS_BY_THEME[theme];
  const productLinks = pickHighlightedProducts(products);
  const themeCopy = buildThemeCopy(theme, pageLabel);

  const canonicalPath = subcategory
    ? `/categoria/${category.slug}/${subcategory.slug}`
    : `/categoria/${category.slug}`;

  const h1 = subcategory
    ? `${subcategory.name}: comparador de precios y guia de compra`
    : `${category.name}: comparador de precios para el hogar`;

  const introHeading = subcategory
    ? `Compara ${subcategory.name.toLowerCase()} con contexto real de compra`
    : `Guia para comparar ${category.name.toLowerCase()} al mejor precio`;

  const introParagraphs = buildWordyIntro(pageLabel, products.length, brands, themeCopy.intro);

  const productTypePool = uniqueSorted(
    allProducts
      .filter((product) => product.categoryId === category.id || category.subcategories.some((sub) => sub.id === product.subcategoryId))
      .map((product) => product.name.split(" ").slice(0, 3).join(" ")),
  ).slice(0, subcategory ? 4 : 6);

  const sectionTypes = productTypePool.length
    ? `Dentro de esta pagina encontraras opciones como ${productTypePool.join(", ")}, entre otras variantes de la categoria.`
    : "La categoria combina productos de entrada, gama media y propuestas con mas prestaciones para necesidades concretas.";

  const sectionBudget = priceInsights.min > 0 && priceInsights.max > 0
    ? `El rango de precios observado se mueve aproximadamente entre ${formatMoney(priceInsights.min)} y ${formatMoney(priceInsights.max)}, con una media en torno a ${formatMoney(priceInsights.avg)}. Esto te permite planificar compra rapida si buscas ahorro, o comparar por prestaciones cuando el presupuesto es mas flexible.`
    : "Puedes plantear la compra por tramos de presupuesto: entrada para cubrir lo esencial, gama media para equilibrar rendimiento y precio, y gama superior para usos intensivos o necesidades especificas.";

  const materialStyleSnippet = [
    materials.length ? `En materiales hay presencia de ${materials.join(", ")}.` : "",
    styles.length ? `En estilos, destacan ${styles.join(", ")}.` : "",
  ].filter(Boolean).join(" ");

  const sections: SeoSection[] = [
    {
      heading: `Que tener en cuenta al comprar ${pageLabel.toLowerCase()}`,
      paragraphs: [
        "Antes de comparar modelos concretos, define la necesidad principal: frecuencia de uso, espacio disponible y limite de gasto real. Esta base evita comprar por impulso y mejora la relacion calidad-precio final.",
        themeCopy.factors,
      ],
    },
    {
      heading: "Tipos de productos y subtipos disponibles",
      paragraphs: [
        sectionTypes,
        materialStyleSnippet || "La variedad de formatos y configuraciones permite adaptar la compra a viviendas pequenas, familias grandes o necesidades estacionales.",
      ],
    },
    {
      heading: "Factores clave para comparar ofertas de forma inteligente",
      paragraphs: [
        "No todo depende del precio minimo: revisa disponibilidad, condiciones de envio, devolucion, reputacion de la tienda y antiguedad de la oferta. Una diferencia pequena de precio puede compensar por garantia o servicio.",
        "Tambien conviene mirar opiniones verificadas y comparativas de uso real para detectar puntos fuertes y limitaciones. En compras para el hogar, el rendimiento sostenido importa mas que una promocion puntual.",
      ],
    },
    {
      heading: "Recomendaciones segun uso y presupuesto",
      paragraphs: [
        sectionBudget,
        themeCopy.recommendation,
      ],
    },
    {
      heading: "Siguiente paso para comprar con criterio en Homara",
      paragraphs: [
        "Aprovecha los filtros de esta pagina para acotar por precio, marcas, valoracion y promociones. Despues compara varias opciones finalistas y revisa su historial de precio antes de cerrar la compra.",
        "Si todavia estas explorando alternativas, visita categorias relacionadas y guias comparativas para reforzar tu decision con contexto adicional.",
      ],
    },
  ];

  const closingParagraphs = [
    `En resumen, ${pageLabel.toLowerCase()} es una categoria donde una comparativa bien hecha marca mucha diferencia en precio final y satisfaccion de uso.`,
    "Homara te ayuda a decidir mejor combinando informacion transaccional y contenido editorial util para que compres con confianza.",
  ];

  const relatedLinks = [
    ...(subcategory
      ? [{ label: `Ver toda la categoria ${category.name}`, href: `/categoria/${category.slug}`, type: "category" as const }]
      : []),
    ...relatedSubcategoryLinks,
    ...relatedCategoryLinks,
    ...guideLinks,
    ...productLinks,
  ].slice(0, 12);

  return {
    title: buildTitle(category, subcategory, products.length),
    metaDescription: buildMetaDescription(category, subcategory, products.length, priceInsights.min, priceInsights.max),
    h1,
    introHeading,
    introParagraphs,
    sections,
    closingParagraphs,
    relatedLinks,
    canonicalPath,
    schemaDescription: `${pageLabel}. Comparador de precios, filtros y recomendaciones de compra en Homara.`,
  };
}
