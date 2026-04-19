import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type TerraceTableProduct = {
  rank: number;
  name: string;
  brand: string;
  tableType: string;
  dimensions: string;
  rating: string;
  priceSeen: string;
  bestFor: string;
  notes: string[];
  pros: string[];
  cons: string[];
  miniReview: string;
  affiliateUrl: string;
  imageUrl: string;
};

const terraceTableProducts: TerraceTableProduct[] = [
  {
    rank: 1,
    name: "Casaria mesa plegable acacia 46 x 46",
    brand: "Casaria",
    tableType: "Mesa auxiliar plegable",
    dimensions: "46 x 46 cm",
    rating: "4,6/5 (4.542 valoraciones)",
    priceSeen: "35,99 EUR",
    bestFor: "balcones pequenos y compras de bajo riesgo",
    notes: [
      "precio visible muy competitivo",
      "mesa compacta y facil de guardar",
      "volumen de valoraciones alto para su rango",
    ],
    pros: [
      "entra en casi cualquier terraza",
      "buena prueba social para su precio",
      "ficha clara y facil de comparar",
    ],
    cons: [
      "superficie limitada para comer dos personas",
      "no es mesa principal para reuniones",
    ],
    miniReview:
      "Una opcion de entrada muy facil de recomendar cuando quieres mesa bonita, barata y sin complicarte con montajes grandes.",
    affiliateUrl: "https://amzn.to/3Oo5BT9",
    imageUrl: "https://m.media-amazon.com/images/I/81mysC2tsNL._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "IPAE Saturnia redonda 90 cm",
    brand: "IPAE",
    tableType: "Mesa redonda de resina",
    dimensions: "90 cm diametro",
    rating: "4,3/5 (460 valoraciones)",
    priceSeen: "39,99 EUR",
    bestFor: "comidas rapidas en terraza sin gastar mucho",
    notes: [
      "formato redondo practico para balcon",
      "precio visible bajo para 90 cm",
      "estructura simple para uso diario",
    ],
    pros: [
      "buena relacion tamano/precio",
      "facil de limpiar",
      "encaje sencillo en exteriores",
    ],
    cons: [
      "acabado funcional mas que premium",
      "menos presencia decorativa que madera o metal",
    ],
    miniReview:
      "Si buscas mesa redonda barata y funcional para terraza, esta Saturnia cumple bien en coste y practicidad.",
    affiliateUrl: "https://amzn.to/3Qs29r5",
    imageUrl: "https://m.media-amazon.com/images/I/31fAo7fasEL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "Casaria mesa auxiliar acacia 45 x 45",
    brand: "Casaria",
    tableType: "Mesa auxiliar de madera",
    dimensions: "45 x 45 x 45 cm",
    rating: "4,3/5 (2.190 valoraciones)",
    priceSeen: "44,95 EUR",
    bestFor: "terrazas pequenas con look madera",
    notes: [
      "acabado madera acacia muy buscado",
      "ficha con miles de valoraciones",
      "tamano mini para balcon urbano",
    ],
    pros: [
      "estetica calida para exterior",
      "consumo de espacio muy bajo",
      "buen historial de compra",
    ],
    cons: [
      "capacidad de apoyo limitada",
      "no sustituye una mesa de comedor exterior",
    ],
    miniReview:
      "Buena compra para quien prioriza estetica de madera y necesita una mesa pequena para cafe, desayuno o apoyo lateral.",
    affiliateUrl: "https://amzn.to/4tVWAQd",
    imageUrl: "https://m.media-amazon.com/images/I/81egF+veYAL._AC_SX522_.jpg",
  },
  {
    rank: 4,
    name: "Devoko mesa extensible aluminio",
    brand: "Devoko",
    tableType: "Mesa exterior extensible",
    dimensions: "80 x 80 x 75 cm (hasta 160 cm)",
    rating: "4,6/5 (313 valoraciones)",
    priceSeen: "199,00 EUR",
    bestFor: "quien recibe visitas y necesita mesa adaptable",
    notes: [
      "sistema extensible para pasar de 2-4 a mas comensales",
      "acabado aluminio para exterior",
      "muy buena nota media para su segmento",
    ],
    pros: [
      "versatil para uso diario y reuniones",
      "mejor proyeccion a largo plazo",
      "ficha de producto clara",
    ],
    cons: [
      "precio superior al resto del top ahorro",
      "ocupa mas que una auxiliar compacta",
    ],
    miniReview:
      "No es la mas barata, pero si de las mas completas para quien quiere una sola mesa de terraza que resuelva todo el ano.",
    affiliateUrl: "https://amzn.to/4dQppc9",
    imageUrl: "https://m.media-amazon.com/images/I/61I8vG8-fDL._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Keter Quartet 95",
    brand: "Keter",
    tableType: "Mesa cuadrada resina efecto ratan",
    dimensions: "95 x 74,5 x 95 cm",
    rating: "4,6/5 (411 valoraciones)",
    priceSeen: "76,95 EUR",
    bestFor: "terraza media con foco en equilibrio calidad-precio",
    notes: [
      "tamano cuadrado muy versatil",
      "acabado resina facil de mantener",
      "nota alta con suficientes valoraciones",
    ],
    pros: [
      "equilibrio entre coste y presencia",
      "buena para uso frecuente",
      "solucion intermedia muy estable",
    ],
    cons: [
      "mas cara que opciones mini",
      "menos flexible que una mesa extensible",
    ],
    miniReview:
      "Una de las mesas mas equilibradas del ranking si quieres subir calidad sin disparar presupuesto.",
    affiliateUrl: "https://amzn.to/4tdA3OQ",
    imageUrl: "https://m.media-amazon.com/images/I/71U-SaOmJjL._AC_SX522_.jpg",
  },
  {
    rank: 6,
    name: "YOEVU mesa plegable 180 cm",
    brand: "YOEVU",
    tableType: "Mesa plegable tipo maleta",
    dimensions: "180 cm de largo",
    rating: "4,5/5 (100 valoraciones)",
    priceSeen: "41,90 EUR",
    bestFor: "comidas grandes o eventos en patio",
    notes: [
      "capacidad para mas comensales",
      "diseño plegable y portable",
      "precio agresivo para 180 cm",
    ],
    pros: [
      "mucho espacio util por euro",
      "facil de guardar cuando no se usa",
      "ideal para reuniones puntuales",
    ],
    cons: [
      "estetica mas funcional",
      "menos decorativa para terraza permanente",
    ],
    miniReview:
      "Perfecta cuando necesitas metros de mesa reales de forma puntual y quieres mantener bajo control el presupuesto.",
    affiliateUrl: "https://amzn.to/4vH9d3q",
    imageUrl: "https://m.media-amazon.com/images/I/61RTpaKMh9L._AC_SX522_.jpg",
  },
  {
    rank: 7,
    name: "CASARIA mesa plegable acacia 160 x 85",
    brand: "CASARIA",
    tableType: "Mesa de comedor exterior plegable",
    dimensions: "160 x 85 cm",
    rating: "4,1/5 (774 valoraciones)",
    priceSeen: "101,95 EUR",
    bestFor: "familias que comen fuera de forma habitual",
    notes: [
      "superficie amplia para uso diario",
      "mesa plegable con agujero para sombrilla",
      "precio visible competitivo para su tamano",
    ],
    pros: [
      "mesa principal para terraza familiar",
      "madera acacia con buena presencia",
      "facil de priorizar en compras de temporada",
    ],
    cons: [
      "requiere espacio de almacenaje",
      "menos practica en balcones pequenos",
    ],
    miniReview:
      "Una alternativa muy fuerte para quien necesita mesa grande de terraza sin saltar a precios premium.",
    affiliateUrl: "https://amzn.to/4chjjjN",
    imageUrl: "https://m.media-amazon.com/images/I/51YhAf07OUL._AC_SX522_.jpg",
  },
  {
    rank: 8,
    name: "HollyHOME mesa auxiliar redonda metal",
    brand: "HollyHOME",
    tableType: "Mesa auxiliar redonda",
    dimensions: "Formato pequeno redondo",
    rating: "4,6/5 (617 valoraciones)",
    priceSeen: "36,99 EUR",
    bestFor: "rincones chill out y balcon de poco fondo",
    notes: [
      "buenas valoraciones para su precio",
      "diseño ligero y facil de mover",
      "perfil decorativo agradable",
    ],
    pros: [
      "buena nota media",
      "precio de entrada bajo",
      "encaja bien como mesa de apoyo",
    ],
    cons: [
      "no sirve como mesa principal",
      "superficie reducida",
    ],
    miniReview:
      "Una compra de bajo riesgo para rematar un balcon bonito con poco gasto y buena valoracion media.",
    affiliateUrl: "https://amzn.to/3QgdvP6",
    imageUrl: "https://m.media-amazon.com/images/I/61T3YQY7H6L._AC_SX522_.jpg",
  },
  {
    rank: 9,
    name: "PHI VILLA mesa plegable cristal",
    brand: "PHI VILLA",
    tableType: "Mesa redonda plegable metal y cristal",
    dimensions: "Formato redondo compacto",
    rating: "4,4/5 (1.405 valoraciones)",
    priceSeen: "39,99 EUR",
    bestFor: "quien quiere mesa ligera y facil de plegar",
    notes: [
      "ficha con muchas valoraciones",
      "estructura plegable para balcones versatiles",
      "precio ajustado en su categoria",
    ],
    pros: [
      "buena prueba social",
      "facil de mover y guardar",
      "aspecto visual cuidado",
    ],
    cons: [
      "menos superficie que una rectangular",
      "conviene revisar estabilidad en suelo irregular",
    ],
    miniReview:
      "Gran candidata para balcon urbano cuando quieres una mesa bonita, plegable y con historial de compra consistente.",
    affiliateUrl: "https://amzn.to/42eiNx3",
    imageUrl: "https://m.media-amazon.com/images/I/71F9aghIMWL._AC_SX522_.jpg",
  },
  {
    rank: 10,
    name: "CASARIA set terraza mesa + 4 sillas",
    brand: "CASARIA",
    tableType: "Set exterior de 5 piezas",
    dimensions: "Mesa 120 x 70 cm",
    rating: "3,5/5 (1.126 valoraciones)",
    priceSeen: "218,99 EUR",
    bestFor: "quien quiere resolver mesa y sillas en un solo pack",
    notes: [
      "solucion completa para montar terraza rapido",
      "incluye 4 sillas plegables",
      "interesante para segunda residencia",
    ],
    pros: [
      "ahorra tiempo de compra",
      "pack cerrado listo para usar",
      "opcion practica para jardines medianos",
    ],
    cons: [
      "inversion inicial alta",
      "valoracion media mas ajustada que otros del top",
    ],
    miniReview:
      "Es la opcion menos minimalista del ranking, pero puede compensar mucho si quieres cerrar toda la zona de comer de una vez.",
    affiliateUrl: "https://amzn.to/4tl9qYs",
    imageUrl: "https://m.media-amazon.com/images/I/81WQpAkvukL._AC_SX522_.jpg",
  },
];

const faqs = [
  {
    q: "Cual es la mejor mesa de terraza barata para balcon pequeno?",
    a: "Si tu prioridad es gastar poco y ocupar minimo espacio, las mesas auxiliares de 45-46 cm son las mas seguras para balcon urbano.",
  },
  {
    q: "Que es mejor: mesa auxiliar o mesa grande plegable?",
    a: "Depende del uso real. Auxiliar para cafe y apoyo diario. Grande plegable para comidas de 4-8 personas o reuniones puntuales.",
  },
  {
    q: "Cada cuanto cambian precios y valoraciones en Amazon?",
    a: "Pueden cambiar en horas. Esta comparativa usa datos observados en abril de 2026 y conviene validar precio final justo antes de comprar.",
  },
  {
    q: "Merece la pena un set con sillas incluidas?",
    a: "Compensa si quieres resolver terraza completa rapido. Si ya tienes sillas, suele salir mejor comprar solo mesa.",
  },
  {
    q: "Como evitar errores al comprar mesa de exterior?",
    a: "Mide espacio util real, revisa numero de comensales y comprueba si necesitas formato plegable o extensible. Esa decision evita la mayoria de devoluciones.",
  },
];

const BestTerraceTablesCheapPretty2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "10 mesas de terraza baratas y bonitas en Amazon (2026) | Homara";

    let descriptionTag = previousDescriptionTag;
    let createdTag = false;

    if (!descriptionTag) {
      descriptionTag = document.createElement("meta");
      descriptionTag.setAttribute("name", "description");
      document.head.appendChild(descriptionTag);
      createdTag = true;
    }

    descriptionTag.setAttribute(
      "content",
      "Comparativa real de 10 mesas de terraza baratas y bonitas con precio visto, estrellas y recomendaciones para balcon y jardin. Encuentra rapido la opcion que mejor encaja y revisa ofertas en Amazon.",
    );

    return () => {
      document.title = previousTitle;
      if (descriptionTag) {
        if (createdTag) {
          descriptionTag.remove();
        } else {
          descriptionTag.setAttribute("content", previousDescription);
        }
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumb
            items={[
              { label: "Guias", href: "/guias" },
              { label: "10 mesas de terraza baratas y bonitas en Amazon" },
            ]}
          />
        </div>

        <article className="container mx-auto px-4 pb-16">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden="true" />

            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Sparkles className="h-3.5 w-3.5" />
                Guia de compra Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                10 mesas de terraza baratas y bonitas en Amazon para comprar en 2026
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si buscas mesas de terraza baratas y bonitas en Amazon, estas 10 opciones concentran la mejor relacion
                entre precio visible, valoraciones y utilidad real para balcon o jardin. Para acertar rapido: empieza
                por el resumen comparativo y despues revisa el top segun tu espacio.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 10 mesas</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una
              comision sin coste extra para ti. Precios, valoraciones y disponibilidad pueden cambiar por stock o promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rapido: comparativa de mesas</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar formato, medidas, rating y precio visto de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Dimensiones</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Rating</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {terraceTableProducts.map((product) => (
                    <tr key={product.rank} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-background">
                          <img
                            src={product.imageUrl || PRODUCT_IMAGE_FALLBACK}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-contain p-1"
                            onError={(event) => applyProductImageFallback(event.currentTarget)}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">{product.tableType}</td>
                      <td className="px-4 py-3 text-foreground">{product.dimensions}</td>
                      <td className="px-4 py-3 text-foreground">{product.rating}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-1 font-semibold text-accent">
                          <BadgeEuro className="h-3.5 w-3.5" />
                          {product.priceSeen}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/20"
                        >
                          Ver en Amazon <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Top 10 mesas de terraza baratas y bonitas</h2>
            <p className="mt-2 text-sm text-muted-foreground">Seleccion orientada a conversion: para quien encaja cada mesa y por que puede compensar la compra.</p>

            <div className="mt-6 space-y-6">
              {terraceTableProducts.map((product) => (
                <section key={product.rank} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Mejor para: {product.bestFor}</p>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 text-right text-sm">
                      <p className="font-semibold text-foreground">{product.priceSeen}</p>
                      <p className="text-xs text-muted-foreground">Precio visto</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-5 lg:grid-cols-[220px_1fr]">
                    <a
                      href={product.affiliateUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="group block overflow-hidden rounded-xl border border-border bg-background"
                    >
                      <img
                        src={product.imageUrl || PRODUCT_IMAGE_FALLBACK}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(event) => applyProductImageFallback(event.currentTarget)}
                      />
                    </a>

                    <div>
                      <div className="grid gap-3 text-sm md:grid-cols-3">
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="font-semibold text-foreground">{product.tableType}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Dimensiones</p>
                          <p className="font-semibold text-foreground">{product.dimensions}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Por que destaca</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {product.notes.map((note) => (
                              <li key={note} className="flex items-start gap-2">
                                <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                                <span>{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pros</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {product.pros.map((pro) => (
                              <li key={pro} className="flex items-start gap-2">
                                <Zap className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-deal" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contras</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {product.cons.map((con) => (
                              <li key={con} className="flex items-start gap-2">
                                <span className="mt-[8px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Mini review Homara</p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground">{product.miniReview}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="sponsored nofollow noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                        >
                          Ver oferta en Amazon <ExternalLink className="h-4 w-4" />
                        </a>
                        <Link
                          to={`/buscar?q=${encodeURIComponent(`${product.brand} mesa terraza`)}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                        >
                          Comparar alternativas en Homara <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Guia de compra rapida para mesa de terraza</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Define uso real</h3>
                <p className="mt-1 text-sm text-muted-foreground">Cafe y apoyo diario: auxiliar compacta. Comidas de 4-8 personas: plegable grande o extensible.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Mide antes de comprar</h3>
                <p className="mt-1 text-sm text-muted-foreground">Comprueba ancho util de terraza, paso de puerta y espacio libre alrededor para sillas y circulacion.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Prioriza material segun clima</h3>
                <p className="mt-1 text-sm text-muted-foreground">Resina y metal para mantenimiento simple. Madera acacia para look calido con algo mas de cuidado.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Revisa coste total</h3>
                <p className="mt-1 text-sm text-muted-foreground">Valida precio final, envio, cupon y devolucion. Ese bloque define la compra inteligente real.</p>
              </div>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-accent" />
                      {item.q}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/10 p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Recomendacion editorial Homara</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Si quieres decidir rapido: Casaria 46 x 46 para balcon pequeno y bajo coste, Keter Quartet 95 para equilibrio
              general y Devoko extensible para quien necesita mas capacidad sin comprar dos mesas.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/3Oo5BT9" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Casaria 46 x 46</a>
              <a href="https://amzn.to/4tdA3OQ" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Keter Quartet 95</a>
              <a href="https://amzn.to/4dQppc9" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Devoko extensible</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enlaces internos para continuar la decision segun presupuesto, estilo y uso real.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/buscar?q=mesa%20de%20terraza" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar mesas de terraza</Link>
              <Link to="/buscar?q=mesa%20de%20jardin" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar mesas de jardin</Link>
              <Link to="/buscar?q=mesa%20plegable%20exterior" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mesas plegables de exterior</Link>
              <Link to="/buscar?q=set%20mesa%20sillas%20terraza" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver sets mesa y sillas</Link>
              <Link to="/guias" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mas guias de compra</Link>
              <Link to="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendacion al Asistente de Compras</Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestTerraceTablesCheapPretty2026Page;
