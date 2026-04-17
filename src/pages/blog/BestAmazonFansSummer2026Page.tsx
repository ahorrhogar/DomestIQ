import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback } from "@/lib/productImage";

type FanProduct = {
  rank: number;
  name: string;
  brand: string;
  fanType: string;
  speedModes: string;
  keySpecs: string;
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

const fanProducts: FanProduct[] = [
  {
    rank: 1,
    name: "Orbegozo SF 0149",
    brand: "Orbegozo",
    fanType: "Ventilador de pie",
    speedModes: "3 velocidades",
    keySpecs: "60 W, oscilante, altura regulable hasta 128 cm",
    rating: "4,2/5 (3.891 valoraciones)",
    priceSeen: "28,08 EUR",
    bestFor: "presupuesto contenido y uso diario",
    notes: [
      "buen punto de entrada para hogar",
      "formato clasico facil de usar",
      "equilibrio coste-rendimiento",
    ],
    pros: [
      "precio competitivo",
      "oscilacion y altura regulable",
      "ideal para ventilacion basica diaria",
    ],
    cons: [
      "sin funciones avanzadas",
      "perfil sonoro mas convencional",
    ],
    miniReview:
      "Si quieres resolver calor sin complicarte, es una de las compras mas sensatas en gama economica.",
    affiliateUrl: "https://amzn.to/4cPz3KW",
    imageUrl: "https://m.media-amazon.com/images/I/713Cf0YK-2L._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "Dreo Quiet Standing Fan [Upgraded]",
    brand: "Dreo",
    fanType: "Ventilador de pie premium",
    speedModes: "8 velocidades, 3 modos",
    keySpecs: "20 dB, motor DC, oscilacion 90 grados",
    rating: "4,6/5 (3.423 valoraciones)",
    priceSeen: "76,49 EUR",
    bestFor: "dormitorio y uso nocturno",
    notes: [
      "foco en bajo ruido",
      "motor DC con ajuste fino",
      "rendimiento premium en confort",
    ],
    pros: [
      "muy silencioso",
      "control de flujo mas preciso",
      "nota media alta",
    ],
    cons: [
      "precio por encima de gama basica",
      "menos orientado a compra low cost",
    ],
    miniReview:
      "Opcion fuerte para quien prioriza dormir mejor en olas de calor y quiere un ventilador de largo recorrido.",
    affiliateUrl: "https://amzn.to/4sZQAoV",
    imageUrl: "https://m.media-amazon.com/images/I/71TVVOPK1JL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "Dreo Nomad One 20dB",
    brand: "Dreo",
    fanType: "Ventilador de torre",
    speedModes: "4 velocidades",
    keySpecs: "7,6 m/s, giro 90 grados, temporizador 8 h",
    rating: "4,5/5 (43.629 valoraciones)",
    priceSeen: "89,99 EUR",
    bestFor: "quien quiere torre premium con gran prueba social",
    notes: [
      "volumen de valoraciones muy alto",
      "diseno limpio para salon o dormitorio",
      "mando y display para control rapido",
    ],
    pros: [
      "mucha confianza de usuarios",
      "compacto para su rendimiento",
      "buena nota media",
    ],
    cons: [
      "precio mas alto que torres de entrada",
      "caudal mas direccional que un industrial",
    ],
    miniReview:
      "Si prefieres formato torre y no quieres arriesgar, es uno de los modelos mas contrastados del mercado.",
    affiliateUrl: "https://amzn.to/484czU2",
    imageUrl: "https://m.media-amazon.com/images/I/71G7qy9UDpL._AC_SX522_.jpg",
  },
  {
    rank: 4,
    name: "Cecotec EnergySilence 5000 Pro",
    brand: "Cecotec",
    fanType: "Ventilador industrial de suelo",
    speedModes: "3 velocidades",
    keySpecs: "120 W, 20 pulgadas, aspas metalicas",
    rating: "4,4/5 (452 valoraciones)",
    priceSeen: "52,90 EUR",
    bestFor: "espacios amplios con calor intenso",
    notes: [
      "caudal potente para garaje o salon grande",
      "perfil robusto de uso exigente",
      "inclinacion ajustable",
    ],
    pros: [
      "mueve mucho aire",
      "construccion metalica",
      "precio competitivo para su potencia",
    ],
    cons: [
      "menos silencioso",
      "estetica industrial",
    ],
    miniReview:
      "Cuando lo importante es bajar sensacion termica rapido, este Cecotec destaca por impacto inmediato.",
    affiliateUrl: "https://amzn.to/4sCdodR",
    imageUrl: "https://m.media-amazon.com/images/I/61HxmO64y4L._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Cecotec EnergySilence 510",
    brand: "Cecotec",
    fanType: "Ventilador de pie",
    speedModes: "3 velocidades",
    keySpecs: "40 W, 5 aspas, altura regulable 110-130 cm",
    rating: "3,9/5 (4.982 valoraciones)",
    priceSeen: "29,90 EUR",
    bestFor: "presupuesto bajo y uso puntual",
    notes: [
      "referencia muy conocida en gama economica",
      "oscilacion y altura ajustable",
      "facil de integrar en casa",
    ],
    pros: [
      "muy accesible en precio",
      "sencillo de usar",
      "buena opcion como segundo ventilador",
    ],
    cons: [
      "valoracion media inferior a otras opciones",
      "menos funciones de confort",
    ],
    miniReview:
      "Una alternativa practica para combatir calor moderado gastando poco y sin complicaciones.",
    affiliateUrl: "https://amzn.to/4cV5SFt",
    imageUrl: "https://m.media-amazon.com/images/I/51YFqHbQJnL._AC_SX522_.jpg",
  },
  {
    rank: 6,
    name: "Cecotec EnergySilence 1020 ExtremeConnected",
    brand: "Cecotec",
    fanType: "Ventilador de pie con mando",
    speedModes: "6 velocidades, 3 modos",
    keySpecs: "60 W, 10 aspas, temporizador",
    rating: "4,6/5 (994 valoraciones)",
    priceSeen: "57,90 EUR",
    bestFor: "equilibrio entre funciones y precio",
    notes: [
      "10 aspas para flujo mas uniforme",
      "temporizador y mando incluidos",
      "configuracion completa para verano",
    ],
    pros: [
      "muy buen balance calidad-precio",
      "ajuste de velocidad amplio",
      "ideal para uso diario continuado",
    ],
    cons: [
      "mas caro que un basico de 3 velocidades",
      "ocupa algo mas que modelos compactos",
    ],
    miniReview:
      "De los mejores puntos medios de la comparativa para quien quiere confort extra sin saltar a gama premium.",
    affiliateUrl: "https://amzn.to/4vCEVie",
    imageUrl: "https://m.media-amazon.com/images/I/51ociv32PYS._AC_SX522_.jpg",
  },
  {
    rank: 7,
    name: "Orbegozo PW 1240 Power Fan",
    brand: "Orbegozo",
    fanType: "Ventilador industrial de suelo",
    speedModes: "3 velocidades",
    keySpecs: "70 W, aspas metalicas 40 cm, inclinacion ajustable",
    rating: "4,5/5 (158 valoraciones)",
    priceSeen: "38,50 EUR",
    bestFor: "salones grandes y espacios de trabajo",
    notes: [
      "caudal fuerte con precio contenido",
      "asa para mover entre estancias",
      "estructura robusta",
    ],
    pros: [
      "gran impacto de aire",
      "muy buena valoracion media",
      "buena compra para calor severo",
    ],
    cons: [
      "no es la opcion mas silenciosa",
      "sin funciones smart",
    ],
    miniReview:
      "Si necesitas potencia real para espacios abiertos o muy calurosos, sigue siendo una opcion muy competitiva.",
    affiliateUrl: "https://amzn.to/4myFl50",
    imageUrl: "https://m.media-amazon.com/images/I/91hmr+6PBqL._AC_SX522_.jpg",
  },
];

const faqs = [
  {
    q: "Cual es el mejor ventilador para dormir en verano?",
    a: "Si priorizas silencio, los modelos Dreo de esta comparativa son especialmente interesantes por su enfoque en bajo ruido y ajuste fino.",
  },
  {
    q: "Ventilador de torre o ventilador de pie?",
    a: "La torre suele ocupar menos y encajar mejor visualmente. El de pie clasico o industrial suele ofrecer mas caudal directo por euro.",
  },
  {
    q: "Que potencia necesito para un salon grande?",
    a: "Para estancias amplias, los modelos industriales de 70 W a 120 W suelen dar mejor resultado que opciones compactas de dormitorio.",
  },
  {
    q: "Compensa pagar mas por un ventilador premium?",
    a: "Si lo usas muchas horas al dia, normalmente si: se nota en confort, ruido y control de velocidades.",
  },
  {
    q: "Los precios de Amazon se mantienen?",
    a: "No siempre. Pueden cambiar por stock, cupones y promociones, asi que conviene revisar el precio final antes de comprar.",
  },
];

const BestAmazonFansSummer2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Los 7 mejores ventiladores de Amazon para sobrevivir al calor este verano (2026) | Homara";

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
      "Comparativa real de 7 ventiladores de Amazon para sobrevivir al calor este verano: precios vistos, estrellas, valoraciones y recomendacion editorial.",
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
              { label: "Los 7 mejores ventiladores de Amazon para sobrevivir al calor este verano" },
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
                Los 7 mejores ventiladores de Amazon para sobrevivir al calor este verano
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si estas buscando una compra util para olas de calor, esta guia te ayuda a decidir en minutos. Hemos
                seleccionado 7 modelos con perfiles distintos: ahorro, bajo ruido, torre premium e industrial.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 7 ventiladores</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una
              comision sin coste extra para ti. Precios y valoraciones pueden cambiar segun stock, cupones y promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rapido: los 7 mejores ventiladores de Amazon</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar tipo, velocidades, rating y precio visto de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Tipo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Velocidades</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Especificaciones</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Rating</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {fanProducts.map((product) => (
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
                      <td className="px-4 py-3 text-foreground">{product.fanType}</td>
                      <td className="px-4 py-3 text-foreground">{product.speedModes}</td>
                      <td className="px-4 py-3 text-foreground">{product.keySpecs}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Review: los 7 ventiladores recomendados para este verano</h2>
            <p className="mt-2 text-sm text-muted-foreground">Seleccion orientada a conversion: para quien encaja cada modelo y por que puede compensar la compra.</p>

            <div className="mt-6 space-y-6">
              {fanProducts.map((product) => (
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
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(event) => applyProductImageFallback(event.currentTarget)}
                      />
                    </a>

                    <div>
                      <div className="grid gap-3 text-sm md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Tipo</p>
                          <p className="font-semibold text-foreground">{product.fanType}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Velocidades</p>
                          <p className="font-semibold text-foreground">{product.speedModes}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Especificaciones</p>
                          <p className="font-semibold text-foreground">{product.keySpecs}</p>
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
                          to={`/buscar?q=${encodeURIComponent(`${product.brand} ventilador`)}`}
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
            <h2 className="font-display text-2xl font-bold text-foreground">Que tener en cuenta antes de comprar un ventilador</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Tipo de ventilador segun estancia</h3>
                <p className="mt-1 text-sm text-muted-foreground">Torre para espacio y diseno. Pie clasico para versatilidad. Industrial para flujo de aire potente.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Ruido real en uso nocturno</h3>
                <p className="mt-1 text-sm text-muted-foreground">Si va para dormitorio, prioriza modelos silenciosos y con varios niveles de velocidad.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Potencia y diametro de aspas</h3>
                <p className="mt-1 text-sm text-muted-foreground">Para salones grandes conviene subir potencia y elegir modelos con mayor diametro de ventilacion.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Precio final y devolucion</h3>
                <p className="mt-1 text-sm text-muted-foreground">Antes de comprar, revisa envio, cupones activos y condiciones de devolucion para evitar sorpresas.</p>
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
              Si quieres decidir rapido: Orbegozo SF 0149 para presupuesto bajo, Dreo Quiet para dormitorio exigente,
              Dreo Nomad One si prefieres torre premium y Cecotec 1020 si buscas funciones completas con precio contenido.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <a href="https://amzn.to/4cPz3KW" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Orbegozo SF 0149</a>
              <a href="https://amzn.to/4sZQAoV" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Dreo Quiet Standing Fan</a>
              <a href="https://amzn.to/484czU2" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Dreo Nomad One</a>
              <a href="https://amzn.to/4vCEVie" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Cecotec 1020</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enlaces internos para continuar tu decision con contexto de uso real.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/blog/mejores-ventiladores-de-pie-para-este-verano-2026" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver guia completa de ventiladores de pie</Link>
              <Link to="/buscar?q=ventilador%20de%20pie" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar ventiladores de pie</Link>
              <Link to="/buscar?q=ventilador%20torre" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar ventiladores de torre</Link>
              <Link to="/buscar?q=ventilador%20silencioso" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver ventiladores silenciosos</Link>
              <Link to="/buscar?q=ventilador%20industrial" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver ventiladores industriales</Link>
              <Link to="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Electrodomesticos</Link>
              <Link to="/guias" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver mas guias de compra</Link>
              <Link to="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendacion al Asistente de Compras</Link>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Contenidos sugeridos para enlazado interno cuando esten publicados:
              <ul className="mt-2 space-y-1 text-foreground">
                <li>Como refrescar una habitacion sin aire acondicionado.</li>
                <li>Ventilador de pie vs torre: diferencias reales en consumo y ruido.</li>
                <li>Guia de mantenimiento para alargar la vida util del ventilador.</li>
              </ul>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestAmazonFansSummer2026Page;
