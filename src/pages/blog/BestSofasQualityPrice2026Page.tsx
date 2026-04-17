import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type SofaProduct = {
  rank: number;
  name: string;
  brand: string;
  capacity: string;
  format: string;
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

const sofaProducts: SofaProduct[] = [
  {
    rank: 1,
    name: "Yaheetech Loveseat 2 plazas",
    brand: "Yaheetech",
    capacity: "2 plazas",
    format: "2 plazas compacto",
    dimensions: "Aprox. 145 x 77 x 77 cm",
    rating: "4,4/5 (157 valoraciones)",
    priceSeen: "128,74 EUR",
    bestFor: "pisos pequenos y primera compra",
    notes: [
      "precio de entrada competitivo",
      "huella compacta para salones pequenos",
      "montaje sencillo",
    ],
    pros: [
      "coste bajo para iniciar",
      "tacto visual moderno",
      "medidas faciles de encajar",
    ],
    cons: [
      "no es ideal para 3 personas diarias",
      "menos opciones de configuracion",
    ],
    miniReview:
      "Muy buena puerta de entrada si priorizas coste total bajo y necesitas un sofa funcional sin ocupar demasiado.",
    affiliateUrl: "https://amzn.to/4dTBjC7",
    imageUrl: "https://m.media-amazon.com/images/I/61MNGyTX5FL._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "SHIITO Versailles",
    brand: "SHIITO",
    capacity: "3 plazas",
    format: "3 plazas click-clack",
    dimensions: "Aprox. 189 x 88 x 89 cm",
    rating: "4,0/5 (179 valoraciones)",
    priceSeen: "170,99 EUR",
    bestFor: "quien quiere estetica y precio medio",
    notes: [
      "diseno con buen equilibrio estetica/precio",
      "suele entrar en promociones",
      "perfil versatil para salon principal",
    ],
    pros: [
      "buena presencia en salon",
      "coste intermedio controlado",
      "formato conocido y facil de usar",
    ],
    cons: [
      "firmeza a validar segun gusto",
      "sin extras avanzados",
    ],
    miniReview:
      "En rango medio es de los que mejor encajan cuando buscas presencia visual sin saltar a gamas premium.",
    affiliateUrl: "https://amzn.to/4crrybS",
    imageUrl: "https://m.media-amazon.com/images/I/41L0EF+7mmL._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Xbro 3 en 1 convertible",
    brand: "Xbro",
    capacity: "2-3 plazas",
    format: "Convertible 3 en 1",
    dimensions: "Aprox. 147 x 196 x 87 cm abierto",
    rating: "5,0/5 (1 valoracion)",
    priceSeen: "209,99 EUR",
    bestFor: "estudios y uso dual salon-dormitorio",
    notes: [
      "formato flexible para visitas",
      "incluye soluciones de almacenaje lateral",
      "buena relacion funciones/precio",
    ],
    pros: [
      "muy util en espacios mixtos",
      "ahorra comprar cama auxiliar",
      "versatilidad alta",
    ],
    cons: [
      "pocas valoraciones aun",
      "precio superior a un fijo basico",
    ],
    miniReview:
      "Muy interesante para espacios pequenos donde el mismo mueble debe cubrir estar y descanso ocasional.",
    affiliateUrl: "https://amzn.to/4edkfqX",
    imageUrl: "https://m.media-amazon.com/images/I/81erPad-L8L._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "Nalui Haven chaise bed",
    brand: "Nalui",
    capacity: "3 plazas",
    format: "Chaise longue convertible",
    dimensions: "Aprox. 203 x 82 x 78 cm",
    rating: "3,2/5 (46 valoraciones)",
    priceSeen: "549,00 EUR",
    bestFor: "quien prioriza chaise y cama en una pieza",
    notes: [
      "formato completo para uso polivalente",
      "presencia de salon grande",
      "cama de apoyo para invitados",
    ],
    pros: [
      "pieza unica muy funcional",
      "buena para invitados",
      "estetica de chaise",
    ],
    cons: [
      "precio elevado frente a otros",
      "demanda salon con espacio real",
    ],
    miniReview:
      "Aporta mucha funcionalidad en una sola pieza, aunque su relacion calidad-precio depende mucho de oferta puntual.",
    affiliateUrl: "https://amzn.to/4sZTM3T",
    imageUrl: "https://m.media-amazon.com/images/I/51ss8eHW98L._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Litbird Cloud modular",
    brand: "Litbird",
    capacity: "3 plazas",
    format: "Modular cloud",
    dimensions: "Variable segun configuracion",
    rating: "Datos de rating no visibles en extracto",
    priceSeen: "Consultar en ficha",
    bestFor: "quien quiere modularidad real",
    notes: [
      "enfoque modular y personalizable",
      "diseno tipo cloud con asiento profundo",
      "configurable por colores",
    ],
    pros: [
      "mucha flexibilidad de uso",
      "visual muy actual",
      "permite evolucionar distribucion",
    ],
    cons: [
      "hay que validar medidas finales",
      "precio variable por configuracion",
    ],
    miniReview:
      "Buena opcion para salones cambiantes o viviendas en las que se prioriza redistribucion frecuente.",
    affiliateUrl: "https://amzn.to/4sBIMt3",
    imageUrl: "https://m.media-amazon.com/images/I/71cKS77+S+L._AC_SX425_.jpg",
  },
  {
    rank: 6,
    name: "Devoko Chaise longue con arcon",
    brand: "Devoko",
    capacity: "3 plazas",
    format: "L-shape con almacenaje",
    dimensions: "Aprox. 186 x 130 x 84 cm",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    bestFor: "hogares que necesitan almacenaje integrado",
    notes: [
      "incluye espacio de almacenaje",
      "posicion chaise para uso diario",
      "orientado a funcionalidad",
    ],
    pros: [
      "muy practico para hogar familiar",
      "soluciona orden y descanso",
      "perfil funcional completo",
    ],
    cons: [
      "entrega mas exigente por tamano",
      "montaje a planificar",
    ],
    miniReview:
      "Una de las opciones mas practicas cuando quieres chaise y almacenaje sin ir a soluciones separadas.",
    affiliateUrl: "https://amzn.to/4myyuIG",
    imageUrl: PRODUCT_IMAGE_FALLBACK,
  },
  {
    rank: 7,
    name: "MUEBLIX.COM Juan 3 seater",
    brand: "MUEBLIX.COM",
    capacity: "3 plazas",
    format: "Sofa clasico",
    dimensions: "Aprox. 185-190 cm de largo",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    bestFor: "salon principal con presupuesto contenido",
    notes: [
      "perfil clasico para uso cotidiano",
      "acabado de tapizado neutro",
      "marca recurrente en gama media",
    ],
    pros: [
      "configuracion simple y clara",
      "coste habitualmente competitivo",
      "valido para salon principal",
    ],
    cons: [
      "menos diferencial estetico",
      "conviene revisar garantia",
    ],
    miniReview:
      "Alternativa razonable para quien busca un 3 plazas convencional sin extras que encarezcan.",
    affiliateUrl: "https://amzn.to/4dOBTB0",
    imageUrl: PRODUCT_IMAGE_FALLBACK,
  },
  {
    rank: 8,
    name: "Welzona 211 cm 3 seater",
    brand: "Welzona",
    capacity: "3 plazas amplias",
    format: "3 plazas amplio",
    dimensions: "211 cm de largo",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    bestFor: "salones medianos con foco en comodidad",
    notes: [
      "ancho generoso en gama de precio media",
      "incluye cojines en variantes",
      "orientado a confort de uso diario",
    ],
    pros: [
      "ancho util real",
      "muy comodo para uso continuo",
      "buena opcion familiar",
    ],
    cons: [
      "puede saturar salones pequenos",
      "medicion previa obligatoria",
    ],
    miniReview:
      "Interesante si priorizas ancho util real y quieres evitar sensacion de sofa corto en salon familiar.",
    affiliateUrl: "https://amzn.to/4tdnkf2",
    imageUrl: PRODUCT_IMAGE_FALLBACK,
  },
  {
    rank: 9,
    name: "Don Rest Sofa cama click-clack",
    brand: "Don Rest",
    capacity: "3 plazas",
    format: "Sofa cama click-clack",
    dimensions: "Sofa 206 x 73 x 80 cm",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    bestFor: "pisos de alquiler y estancias multiproposito",
    notes: [
      "conversion rapida a cama",
      "disponible en varios colores",
      "enfoque practico y directo",
    ],
    pros: [
      "versatil para visitas",
      "facil de operar",
      "suele entrar en oferta",
    ],
    cons: [
      "comodidad de cama variable",
      "acabados mas funcionales que premium",
    ],
    miniReview:
      "Un clasico funcional para quien necesita versatilidad sin complicarse con modulos.",
    affiliateUrl: "https://amzn.to/4vs7gaO",
    imageUrl: PRODUCT_IMAGE_FALLBACK,
  },
  {
    rank: 10,
    name: "SHIITO Kingston",
    brand: "SHIITO",
    capacity: "3 plazas",
    format: "3 plazas confort",
    dimensions: "185 x 100 x 95 cm",
    rating: "Consultar valoraciones en ficha",
    priceSeen: "Consultar en ficha",
    bestFor: "salones donde prima asiento amplio",
    notes: [
      "foco en confort y relajacion",
      "medidas de respaldo generosas",
      "acabado sobrio para salon moderno",
    ],
    pros: [
      "asiento comodo para uso diario",
      "perfil estable para salon principal",
      "marca con varias lineas",
    ],
    cons: [
      "precio variable por acabado",
      "sin funcion cama",
    ],
    miniReview:
      "Cierra el top por equilibrio entre presencia, comodidad y posibilidad de comprar en oferta.",
    affiliateUrl: "https://amzn.to/4cyATi0",
    imageUrl: PRODUCT_IMAGE_FALLBACK,
  },
];

const faqs = [
  {
    q: "Que sofa calidad precio conviene mas para piso pequeno?",
    a: "Normalmente un 2 plazas compacto o un 3 plazas corto. Prioriza profundidad contenida y longitud total por debajo de 190 cm para no saturar el salon.",
  },
  {
    q: "Es mejor sofa fijo o sofa cama en 2026?",
    a: "Si no recibes visitas, sofa fijo suele ganar en confort continuo. Si necesitas cama auxiliar cada mes, el formato click-clack o convertible compensa.",
  },
  {
    q: "Como comparar precios correctamente en Amazon?",
    a: "Mira precio final con envio, cupon activo, variacion por color y politica de devolucion. En sofas, esos cuatro puntos cambian mucho el coste real.",
  },
  {
    q: "Cada cuanto cambian precio y valoraciones?",
    a: "Pueden cambiar a diario. Esta pagina toma como referencia revisiones de abril de 2026 y recomienda validar el dato final antes de compra.",
  },
];

const BestSofasQualityPrice2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Los 10 mejores sofas calidad precio de 2026 | Homara";

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
      "Comparativa de los 10 mejores sofas calidad precio de 2026: modelos recomendados, pros y contras, tabla resumen y recomendacion editorial de Homara.",
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
              { label: "Los 10 mejores sofas calidad precio de 2026" },
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
                Los 10 mejores sofas calidad precio de 2026 (Amazon)
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Esta seleccion prioriza lo que realmente mueve una buena compra: precio final, utilidad en el dia a dia,
                formato del salon y margen de error bajo. Si quieres decidir rapido, empieza por la tabla comparativa y
                baja al ranking detallado.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: calidad-precio</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 10 sofas</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una
              comision sin coste extra para ti. Precios, resenas y disponibilidad pueden variar segun stock o promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rapido: comparativa de sofas</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar capacidad, formato, dimensiones y precio visto de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Capacidad</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Formato</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Dimensiones</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Rating</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {sofaProducts.map((product) => (
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
                      <td className="px-4 py-3 text-foreground">{product.capacity}</td>
                      <td className="px-4 py-3 text-foreground">{product.format}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Los 10 mejores sofas calidad precio de 2026</h2>
            <p className="mt-2 text-sm text-muted-foreground">Seleccion orientada a conversion con enfoque practico: para quien es cada modelo y por que puede encajar contigo.</p>

            <div className="mt-6 space-y-6">
              {sofaProducts.map((product) => (
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
                      <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Capacidad</p>
                          <p className="font-semibold text-foreground">{product.capacity}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Formato</p>
                          <p className="font-semibold text-foreground">{product.format}</p>
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
                          to={`/buscar?q=${encodeURIComponent(`${product.brand} sofa`)}`}
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
            <h2 className="font-display text-2xl font-bold text-foreground">Que tener en cuenta antes de comprar un sofa</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Capacidad segun tu hogar</h3>
                <p className="mt-1 text-sm text-muted-foreground">1-2 personas: 2 plazas. 3-4 personas: 3 plazas. Si recibes visitas, valora opcion convertible.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Formato y uso real</h3>
                <p className="mt-1 text-sm text-muted-foreground">Si necesitas cama auxiliar, click-clack o 3 en 1. Si buscas confort diario, mejor un fijo con buen asiento.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Medidas de salon y acceso</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mide hueco real, puertas y pasillos. En sofas grandes, una mala medicion es el error de compra mas frecuente.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Precio total y devolucion</h3>
                <p className="mt-1 text-sm text-muted-foreground">Compara precio final, envio, cupon y politica de devolucion. El coste real no es solo el precio visible.</p>
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
              Si quieres una decision rapida: Yaheetech para empezar gastando poco, SHIITO Versailles para equilibrio general,
              y Xbro 3 en 1 si necesitas convertir espacio en zona de descanso. Si priorizas modularidad, Litbird es una opcion muy interesante.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/4dTBjC7" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Yaheetech Loveseat 2 plazas</a>
              <a href="https://amzn.to/4crrybS" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">SHIITO Versailles</a>
              <a href="https://amzn.to/4edkfqX" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Xbro 3 en 1 convertible</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Te dejamos enlaces internos utiles para continuar la decision sin salir del ecosistema Homara.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/buscar?q=sofa" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar sofas en Homara</Link>
              <Link to="/buscar?q=sofa%20chaise%20longue" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver sofas chaise longue</Link>
              <Link to="/buscar?q=sofa%20cama" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar sofas cama</Link>
              <Link to="/buscar?q=sofa%203%20plazas" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar sofas de 3 plazas</Link>
              <Link to="/guias" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mas guias de compra</Link>
              <Link to="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendacion al Asistente de Compras</Link>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Contenidos sugeridos para enlazado interno cuando esten publicados:
              <ul className="mt-2 space-y-1 text-foreground">
                <li>Guia de medidas para elegir sofa segun salon.</li>
                <li>Sofa fijo vs sofa cama: cual conviene en cada caso.</li>
                <li>Como limpiar y mantener tapizados de sofa en casa.</li>
              </ul>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestSofasQualityPrice2026Page;
