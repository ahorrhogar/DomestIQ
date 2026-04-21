import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Microwave, Scale, Sparkles, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type MicrowaveProduct = {
  rank: number;
  name: string;
  brand: string;
  strongPoint: string;
  idealFor: string;
  priceSeen: string;
  rating: string;
  capacity: string;
  power: string;
  miniReview: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  verdict: string;
  affiliateUrl: string;
  imageUrl: string;
};

const products: MicrowaveProduct[] = [
  {
    rank: 1,
    name: "Severin MW 7770",
    brand: "Severin",
    strongPoint: "Base plana y funcionamiento muy sencillo para uso diario",
    idealFor: "quien quiere un microondas sin plato giratorio practico y facil de limpiar",
    priceSeen: "87,43 EUR",
    rating: "4,3/5 (2.000+ valoraciones)",
    capacity: "20 L",
    power: "800 W",
    miniReview:
      "Uno de los modelos mas consistentes para quien prioriza limpieza rapida y fiabilidad basica. Encaja muy bien como microondas principal en piso pequeno o mediano.",
    keyFeatures: [
      "Tecnologia flatbed sin plato giratorio",
      "5 niveles de potencia",
      "funcion descongelar",
      "interior facil de limpiar",
      "controles claros para uso diario",
    ],
    pros: [
      "muy facil de limpiar",
      "experiencia de uso simple",
      "buena relacion calidad-precio",
    ],
    cons: [
      "sin extras avanzados de conectividad",
      "capacidad justa para recipientes grandes",
    ],
    verdict:
      "Compra muy recomendable si buscas un microondas flatbed de entrada que no de problemas.",
    affiliateUrl: "https://www.amazon.es/dp/B0B756WF4X?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61H0pyEDpZL._AC_SL1000_.jpg",
  },
  {
    rank: 2,
    name: "Cecotec ProClean 4010 Flatbed",
    brand: "Cecotec",
    strongPoint: "Precio competitivo con formato sin plato",
    idealFor: "presupuesto ajustado sin renunciar a base plana",
    priceSeen: "63,90 EUR",
    rating: "4,1/5 (1.000+ valoraciones)",
    capacity: "20 L",
    power: "700 W",
    miniReview:
      "Muy buena puerta de entrada al formato sin plato giratorio. No es el mas potente de la lista, pero cumple de sobra para recalentar, descongelar y uso diario ligero.",
    keyFeatures: [
      "Base plana flatbed",
      "interior Ready2Clean",
      "controles mecanicos sencillos",
      "temporizador y avisador acustico",
      "tamano compacto",
    ],
    pros: [
      "de los mas economicos en flatbed",
      "limpieza comoda",
      "ocupa poco espacio",
    ],
    cons: [
      "potencia mas contenida",
      "menos programas automaticos",
    ],
    verdict:
      "Muy buena opcion calidad-precio para cocinas donde prima simplicidad y coste bajo.",
    affiliateUrl: "https://www.amazon.es/dp/B0DLLH4GCW?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61oUsEjtgAL._AC_SL1500_.jpg",
  },
  {
    rank: 3,
    name: "CASO MG20 Ecostyle Ceramic",
    brand: "CASO",
    strongPoint: "Buena potencia con base ceramica sin plato",
    idealFor: "quien quiere mejor reparto de espacio interior para fuentes anchas",
    priceSeen: "137,58 EUR",
    rating: "4,2/5 (700+ valoraciones)",
    capacity: "20 L",
    power: "800 W",
    miniReview:
      "Es una alternativa equilibrada para quien valora el formato ceramico flatbed y necesita un rendimiento algo mas robusto que la gama de entrada.",
    keyFeatures: [
      "Tecnologia ceramic base",
      "grill integrado",
      "programas de calentado y descongelado",
      "display digital",
      "aprovecha mejor el espacio util",
    ],
    pros: [
      "reparto interior muy practico",
      "acabado solido",
      "buen equilibrio general",
    ],
    cons: [
      "precio por encima de opciones basicas",
      "curva de uso algo mayor que modelos simples",
    ],
    verdict:
      "Una compra muy redonda para quien quiere subir un escalon en calidad sin irse a gama alta.",
    affiliateUrl: "https://www.amazon.es/dp/B07KLT25G3?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71LBVgSD58L._AC_SL1500_.jpg",
  },
  {
    rank: 4,
    name: "Toshiba MW2-AG23PF(BK)",
    brand: "Toshiba",
    strongPoint: "Capacidad amplia con uso familiar diario",
    idealFor: "familias que recalientan mucho y buscan interior aprovechable",
    priceSeen: "154,69 EUR",
    rating: "4,3/5 (500+ valoraciones)",
    capacity: "23 L",
    power: "900 W",
    miniReview:
      "Destaca por capacidad y sensacion de producto completo para el dia a dia. Es de los perfiles que mejor encajan cuando el microondas se usa varias veces al dia.",
    keyFeatures: [
      "interior amplio",
      "programas automaticos",
      "panel digital",
      "descongelado por peso o tiempo",
      "buena potencia para uso familiar",
    ],
    pros: [
      "capacidad superior",
      "flujo de uso comodo",
      "buena versatilidad",
    ],
    cons: [
      "precio medio-alto",
      "ocupa mas fondo en encimera",
    ],
    verdict:
      "Muy recomendable para hogares de 3-4 personas que usan microondas de forma intensiva.",
    affiliateUrl: "https://www.amazon.es/dp/B08CCF68C7?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/81gnnuwFv6L._AC_SL1500_.jpg",
  },
  {
    rank: 5,
    name: "Samsung MG23T5018CG/EC",
    brand: "Samsung",
    strongPoint: "Muy buen equilibrio entre estetica, potencia y grill",
    idealFor: "quien quiere un modelo fiable de marca grande con acabados cuidados",
    priceSeen: "135,15 EUR",
    rating: "4,5/5 (1.000+ valoraciones)",
    capacity: "23 L",
    power: "800 W",
    miniReview:
      "Opcion solida para uso diario con una interfaz intuitiva y buena reputacion de marca. Es una compra comoda para quien busca tranquilidad a largo plazo.",
    keyFeatures: [
      "programa grill",
      "modo eco",
      "interior ceramico facil de limpiar",
      "varios menus rapidos",
      "buen equilibrio de acabados",
    ],
    pros: [
      "marca con buen historial",
      "acabado premium",
      "muy polivalente",
    ],
    cons: [
      "no suele ser el mas barato",
      "controles mas completos que pueden requerir ajuste inicial",
    ],
    verdict:
      "Si quieres un microondas para muchos anos con buena experiencia general, es apuesta segura.",
    affiliateUrl: "https://www.amazon.es/dp/B08986KR5J?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51HIR2oKxuL._AC_QL10_SX980_SY55_FMwebp_.jpg",
  },
  {
    rank: 6,
    name: "CASO MCG 30 Ceramic Chef",
    brand: "CASO",
    strongPoint: "Combina microondas, grill y conveccion con base sin plato",
    idealFor: "quien quiere un microondas muy completo para cocinar mas cosas",
    priceSeen: "211,90 EUR",
    rating: "4,2/5 (300+ valoraciones)",
    capacity: "30 L",
    power: "900 W",
    miniReview:
      "Es la alternativa mas completa de la lista para quien necesita algo mas que recalentar. Muy util si quieres concentrar funciones en un solo electrodomestico.",
    keyFeatures: [
      "flatbed sin plato giratorio",
      "grill + conveccion",
      "gran capacidad",
      "programas combinados",
      "panel digital completo",
    ],
    pros: [
      "muy versatil",
      "capacidad amplia para bandejas grandes",
      "ideal para cocina intensiva",
    ],
    cons: [
      "precio alto",
      "tamano notable en encimera",
    ],
    verdict:
      "La opcion premium si buscas un microondas sin plato realmente multifuncion.",
    affiliateUrl: "https://www.amazon.es/dp/B01N63P2JK?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61kcyMe3ecL._AC_SL1500_.jpg",
  },
  {
    rank: 7,
    name: "Cecotec ProClean 5110 Inox",
    brand: "Cecotec",
    strongPoint: "Diseno compacto con buen nivel de potencia",
    idealFor: "quien quiere formato moderno para cocina pequena",
    priceSeen: "69,90 EUR",
    rating: "4,0/5 (2.000+ valoraciones)",
    capacity: "20 L",
    power: "800 W",
    miniReview:
      "Un modelo que encaja bien por tamano y coste en pisos de ciudad. Cumple con un uso recurrente y destaca por lo facil que resulta mantenerlo limpio.",
    keyFeatures: [
      "acabado inox",
      "5 niveles de potencia",
      "funcion descongelado",
      "control de tiempo sencillo",
      "perfil compacto",
    ],
    pros: [
      "buena relacion potencia-precio",
      "compacto",
      "limpieza rapida",
    ],
    cons: [
      "sin funciones avanzadas",
      "menor capacidad para recipientes voluminosos",
    ],
    verdict:
      "Buena compra para cocinas pequenas donde cada centimetro cuenta.",
    affiliateUrl: "https://www.amazon.es/dp/B07HC8YWFX?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61Oo+QqzBiL._AC_SL1500_.jpg",
  },
  {
    rank: 8,
    name: "Orbegozo MIG 2525",
    brand: "Orbegozo",
    strongPoint: "Capacidad correcta con precio muy competitivo",
    idealFor: "quien quiere gastar poco y resolver uso diario basico",
    priceSeen: "153,76 EUR",
    rating: "4,1/5 (1.500+ valoraciones)",
    capacity: "25 L",
    power: "900 W",
    miniReview:
      "Es una opcion practica para presupuestos ajustados que priorizan litros y potencia por euro invertido. Muy interesante como compra funcional.",
    keyFeatures: [
      "25 L de capacidad",
      "900 W",
      "varios niveles de potencia",
      "funcion descongelar",
      "controles directos",
    ],
    pros: [
      "precio ajustado",
      "capacidad generosa por su coste",
      "uso muy simple",
    ],
    cons: [
      "acabados mas basicos",
      "menos extras de confort",
    ],
    verdict:
      "Excelente opcion de entrada si tu prioridad es pagar poco y cubrir necesidades basicas.",
    affiliateUrl: "https://www.amazon.es/dp/B005G7L3PS?tag=ahorrhogar-21&linkCode=ll2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61rtdXWxjoL._AC_SL1417_.jpg",
  },
];

const faqs = [
  {
    q: "Que ventaja real tiene un microondas sin plato giratorio?",
    a: "La principal ventaja es el espacio util interior y la limpieza: al no tener plato ni aro, puedes colocar recipientes mas grandes y limpiar mas rapido.",
  },
  {
    q: "Calienta igual de bien un modelo flatbed?",
    a: "En general si, siempre que el modelo tenga una buena distribucion de ondas y potencia suficiente para tu uso habitual.",
  },
  {
    q: "Que capacidad conviene para una familia?",
    a: "Para uso familiar diario, suele compensar partir de 23 L. Si cocinas mucho en microondas, 25-30 L da mas margen.",
  },
  {
    q: "Merece la pena pagar mas por grill y conveccion?",
    a: "Si quieres usar el microondas para algo mas que recalentar, si. Para uso basico, un modelo simple suele ser suficiente.",
  },
  {
    q: "Los precios de Amazon pueden cambiar?",
    a: "Si. Pueden variar por stock, cupones y promociones temporales.",
  },
];

const BestNoTurntableMicrowaves2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Los 8 mejores microondas sin plato giratorio de 2026: comparativa real para comprar mejor | Homara";

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
      "Comparativa editorial de 8 microondas sin plato giratorio con precio visto, capacidad, potencia, pros, contras y recomendacion final por tipo de uso.",
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
              { label: "Los 8 mejores microondas sin plato giratorio de 2026" },
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
                Comparativa editorial Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Los 8 mejores microondas sin plato giratorio de 2026: comparativa real para comprar mejor
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si quieres un microondas mas facil de limpiar y con mejor aprovechamiento interior, esta guia te ayuda a
                decidir rapido. Seleccionamos ocho modelos con perfiles distintos: ahorro, equilibrio y gama mas completa.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: comparativa</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 8 modelos</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una
              comision sin coste extra para ti. Precios y disponibilidad pueden cambiar segun stock o promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rapido: top 8 sin plato giratorio</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tabla visual para comparar modelo, capacidad, potencia, rating y precio visto de un vistazo.
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Capacidad</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Potencia</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Valoracion</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.rank} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3">
                        <div className="h-14 w-14 overflow-hidden rounded-lg border border-border bg-background">
                          <img
                            src={product.imageUrl}
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
                      <td className="px-4 py-3 text-foreground">{product.power}</td>
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

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Comparativa rapida por perfil</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {products.map((product) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{product.miniReview}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">Precio: {product.priceSeen}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{product.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 space-y-10">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Analisis producto por producto</h2>

            {products.map((product) => (
              <article key={product.rank} className="rounded-3xl border border-border bg-card p-5 md:p-7">
                <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                  <div className="rounded-2xl border border-border bg-background p-3">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="h-48 w-full object-contain"
                      onError={(event) => {
                        applyProductImageFallback(event.currentTarget);
                        event.currentTarget.src = PRODUCT_IMAGE_FALLBACK;
                      }}
                    />
                  </div>

                  <div>
                    <p className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                      <Star className="h-3.5 w-3.5" /> Top {product.rank}
                    </p>

                    <h3 className="mt-3 font-display text-2xl font-bold text-foreground">{product.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.miniReview}</p>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">Marca: {product.brand}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.rating}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.capacity}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">{product.power}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ChefHat className="h-4 w-4 text-accent" /> Caracteristicas clave
                    </h4>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                      {product.keyFeatures.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-xl border border-border bg-background p-4">
                      <h4 className="text-sm font-semibold text-foreground">Pros</h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {product.pros.map((pro) => (
                          <li key={pro}>{pro}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4">
                      <h4 className="text-sm font-semibold text-foreground">Contras</h4>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
                        {product.cons.map((con) => (
                          <li key={con}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-accent/35 bg-accent/10 p-4">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">Veredicto Homara:</span> {product.verdict}
                  </p>
                  <a
                    href={product.affiliateUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-background px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
                  >
                    Ver oferta en Amazon <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </article>
            ))}
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Que mirar antes de comprar</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">1) Capacidad util real</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Si usas recipientes grandes, subir a 23 L o mas suele compensar mucho en comodidad diaria.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">2) Potencia y reparto de calor</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No mires solo watts: revisa tambien la uniformidad de calentado y programas de apoyo.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">3) Limpieza real</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  En flatbed, una de las ventajas clave es limpiar sin desmontar plato ni aro cada pocos dias.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">4) Funciones extra</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Grill y conveccion aportan valor si realmente vas a cocinar, no solo recalentar.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">FAQs</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <div key={item.q} className="rounded-xl border border-border bg-background p-4">
                  <h3 className="text-sm font-semibold text-foreground">{item.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Recomendaciones internas Homara</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link
                to="/categoria/electrodomesticos"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Electrodomesticos</p>
                <p className="mt-1 text-sm text-muted-foreground">Mas comparativas y ofertas para cocina y hogar.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ir a categoria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/categoria/cocina"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Cocina</p>
                <p className="mt-1 text-sm text-muted-foreground">Guia de compra de pequenos y grandes electrodomesticos.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ir a categoria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/guias"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Mas guias de compra</p>
                <p className="mt-1 text-sm text-muted-foreground">Sigue comparando por presupuesto y tipo de uso.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ver guias <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/asistente"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Asistente de compra Homara</p>
                <p className="mt-1 text-sm text-muted-foreground">Recibe recomendacion personalizada segun presupuesto y uso.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Abrir asistente <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/35 bg-accent/10 p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Conclusion editorial</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              Si quieres gastar poco, Cecotec y Orbegozo son puntos de entrada solidos. Si buscas equilibrio global,
              Severin y Toshiba son perfiles muy recomendables. Y si quieres maximo nivel en funciones y capacidad,
              CASO MCG 30 Ceramic Chef es la opcion premium.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              La clave no es elegir el modelo mas caro, sino el que mejor encaja con tu uso diario real.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Siguiente paso</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si aun dudas entre dos modelos, compara mas productos activos en Homara por presupuesto y tipo de cocina.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/guias"
                className="inline-flex items-center gap-2 rounded-lg border border-accent/50 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/20"
              >
                Ver mas guias <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Buscar productos <Scale className="h-4 w-4" />
              </Link>
              <Link
                to="/categoria/electrodomesticos"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Ver electrodomesticos <Microwave className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestNoTurntableMicrowaves2026Page;
