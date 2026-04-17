import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

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
    name: "Orbegozo SF 0147",
    brand: "Orbegozo",
    fanType: "Ventilador de pie",
    speedModes: "3 velocidades",
    keySpecs: "40 cm, 5 aspas",
    rating: "4,3/5 (14.909 valoraciones)",
    priceSeen: "20,65 EUR",
    bestFor: "presupuesto muy ajustado y uso diario sencillo",
    notes: [
      "uno de los precios mas bajos de la comparativa",
      "gran volumen historico de valoraciones",
      "formato clasico facil de montar",
    ],
    pros: [
      "precio de entrada muy competitivo",
      "producto muy probado por usuarios",
      "ideal para habitaciones pequenas y medianas",
    ],
    cons: [
      "sin extras de mando o temporizador avanzado",
      "menos refinado en ruido que modelos premium",
    ],
    miniReview:
      "Si quieres gastar poco y acertar con una opcion conocida, este Orbegozo es un punto de partida muy dificil de batir.",
    affiliateUrl: "https://amzn.to/4mEnAS3",
    imageUrl: "https://m.media-amazon.com/images/I/61n+-Yq1j7L._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "Cecotec EnergySilence 890 Skyline",
    brand: "Cecotec",
    fanType: "Ventilador de torre",
    speedModes: "3 velocidades, 3 modos",
    keySpecs: "50 W, 76 cm, temporizador",
    rating: "4,3/5 (4.259 valoraciones)",
    priceSeen: "37,90 EUR",
    bestFor: "quien prioriza diseno vertical y poco espacio",
    notes: [
      "huella estrecha para pisos pequenos",
      "buen equilibrio entre precio y prestaciones",
      "incluye modo noche en su gama",
    ],
    pros: [
      "ocupa poco en el salon o dormitorio",
      "estetica mas limpia que un ventilador de aspas",
      "buen precio para ser torre",
    ],
    cons: [
      "caudal mas direccional que un pie grande",
      "menos facil de limpiar que una rejilla abierta",
    ],
    miniReview:
      "Muy buena compra si quieres una opcion de torre asequible que no robe espacio y mantenga buen rendimiento en verano.",
    affiliateUrl: "https://amzn.to/4erjkmy",
    imageUrl: "https://m.media-amazon.com/images/I/51TVMEm0DqL._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Amazon Basics Ventilador de pie 40 cm",
    brand: "Amazon Basics",
    fanType: "Ventilador de pie DC",
    speedModes: "12 velocidades, 3 modos",
    keySpecs: "motor DC, mando a distancia",
    rating: "4,6/5 (313 valoraciones)",
    priceSeen: "31,40 EUR",
    bestFor: "quien quiere control fino de velocidad",
    notes: [
      "12 niveles para ajustar mejor el flujo",
      "motor DC mas eficiente que AC basico",
      "incluye mando remoto",
    ],
    pros: [
      "muy buena nota media en su segmento",
      "control de potencia mas preciso",
      "precio competitivo para un DC",
    ],
    cons: [
      "menos valoraciones que modelos super consolidados",
      "diseno funcional sin extras esteticos",
    ],
    miniReview:
      "Para dormir mejor o ajustar caudal al milimetro, este modelo destaca por su control de velocidades y eficiencia.",
    affiliateUrl: "https://amzn.to/4cngH2s",
    imageUrl: "https://m.media-amazon.com/images/I/61kV75O1C9L._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "Orbegozo SF 0149",
    brand: "Orbegozo",
    fanType: "Ventilador de pie",
    speedModes: "3 velocidades",
    keySpecs: "40 cm, oscilacion automatica",
    rating: "4,2/5 (3.891 valoraciones)",
    priceSeen: "28,08 EUR",
    bestFor: "compra equilibrada por menos de 30 EUR",
    notes: [
      "modelo muy conocido en ventas estacionales",
      "precio medio-bajo y facil reposicion",
      "configuracion clasica sin curva de aprendizaje",
    ],
    pros: [
      "equilibrio entre coste y confianza",
      "suficiente para uso cotidiano en hogar",
      "recambio y soporte de marca conocida",
    ],
    cons: [
      "sin funciones smart o timer largo",
      "acabado mas basico que gamas superiores",
    ],
    miniReview:
      "Si el objetivo es comprar bien sin subir presupuesto, este Orbegozo suele ser una opcion segura y estable.",
    affiliateUrl: "https://amzn.to/4cPz3KW",
    imageUrl: "https://m.media-amazon.com/images/I/713Cf0YK-2L._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Dreo Quiet Standing Fan [Upgraded]",
    brand: "Dreo",
    fanType: "Ventilador de pie premium",
    speedModes: "8 velocidades, 3 modos",
    keySpecs: "20 dB, motor DC, 90 grados",
    rating: "4,6/5 (3.422 valoraciones)",
    priceSeen: "76,49 EUR",
    bestFor: "dormitorio y usuarios sensibles al ruido",
    notes: [
      "enfoque claro en bajo ruido",
      "motor DC con mayor rango de ajuste",
      "perfil premium dentro de ventiladores de pie",
    ],
    pros: [
      "muy buena nota y volumen de resenas",
      "bajo ruido para uso nocturno",
      "caudal fuerte con consumo contenido",
    ],
    cons: [
      "precio por encima del promedio de la lista",
      "menos orientado a compra low cost",
    ],
    miniReview:
      "Uno de los mejores candidatos para quien quiere invertir una vez y ganar confort real en noches de calor.",
    affiliateUrl: "https://amzn.to/4sZQAoV",
    imageUrl: "https://m.media-amazon.com/images/I/71TVVOPK1JL._AC_SY550_.jpg",
  },
  {
    rank: 6,
    name: "Dreo Nomad One 20dB",
    brand: "Dreo",
    fanType: "Ventilador de torre",
    speedModes: "4 velocidades, 4 modos",
    keySpecs: "20 dB, 7,6 m/s, 8h timer",
    rating: "4,5/5 (43.629 valoraciones)",
    priceSeen: "89,99 EUR",
    bestFor: "quien quiere torre premium con prueba social alta",
    notes: [
      "es el producto con mas valoraciones de la comparativa",
      "foco en silencio y control remoto",
      "rendimiento fuerte para formato torre",
    ],
    pros: [
      "altisima confianza por volumen de usuarios",
      "muy buena nota media",
      "excelente para dormitorio moderno",
    ],
    cons: [
      "precio alto frente a torres de entrada",
      "menos recomendable si solo buscas coste minimo",
    ],
    miniReview:
      "Cuando buscas una torre de gama alta con historial contrastado, este Dreo es de las apuestas mas solidas.",
    affiliateUrl: "https://amzn.to/484czU2",
    imageUrl: "https://m.media-amazon.com/images/I/71G7qy9UDpL._AC_SY550_.jpg",
  },
  {
    rank: 7,
    name: "Cecotec EnergySilence 5000 Pro",
    brand: "Cecotec",
    fanType: "Ventilador industrial de suelo",
    speedModes: "3 velocidades",
    keySpecs: "120 W, 20 pulgadas, metal",
    rating: "4,4/5 (452 valoraciones)",
    priceSeen: "52,90 EUR",
    bestFor: "garaje, gimnasio o estancias muy calurosas",
    notes: [
      "caudal potente con enfoque industrial",
      "aspas metalicas de gran diametro",
      "angulo de inclinacion ajustable",
    ],
    pros: [
      "mueve mucho aire por euro invertido",
      "ideal para espacios amplios",
      "construccion robusta",
    ],
    cons: [
      "mas ruido que modelos de dormitorio",
      "estetica menos domestica",
    ],
    miniReview:
      "Si tu prioridad es potencia bruta antes que silencio, este Cecotec industrial ofrece mucho rendimiento por precio.",
    affiliateUrl: "https://amzn.to/4sCdodR",
    imageUrl: "https://m.media-amazon.com/images/I/61HxmO64y4L._AC_SX425_.jpg",
  },
  {
    rank: 8,
    name: "Cecotec EnergySilence 510",
    brand: "Cecotec",
    fanType: "Ventilador de pie",
    speedModes: "3 velocidades",
    keySpecs: "40 W, 40 cm, altura regulable",
    rating: "3,9/5 (4.982 valoraciones)",
    priceSeen: "29,90 EUR",
    bestFor: "uso basico diario en presupuesto contenido",
    notes: [
      "referencia popular de gama economica",
      "ajuste de altura y oscilacion",
      "buen encaje para segundo ventilador de casa",
    ],
    pros: [
      "precio accesible",
      "facil de encontrar y reemplazar",
      "suficiente para calor moderado",
    ],
    cons: [
      "nota media inferior a otras alternativas",
      "ruido percibido variable segun usuario",
    ],
    miniReview:
      "Compra practica cuando buscas resolver calor sin gastar mucho, aunque hay opciones mas silenciosas en escalon superior.",
    affiliateUrl: "https://amzn.to/4cV5SFt",
    imageUrl: "https://m.media-amazon.com/images/I/51YFqHbQJnL._AC_SX425_.jpg",
  },
  {
    rank: 9,
    name: "Cecotec EnergySilence 1020 ExtremeConnected",
    brand: "Cecotec",
    fanType: "Ventilador de pie con mando",
    speedModes: "6 velocidades, 3 modos",
    keySpecs: "60 W, 10 aspas, timer 15 h",
    rating: "4,6/5 (994 valoraciones)",
    priceSeen: "57,90 EUR",
    bestFor: "quien quiere mas control sin irse a gama muy alta",
    notes: [
      "incluye mando a distancia y temporizador largo",
      "10 aspas para flujo mas uniforme",
      "muy buena nota media en su rango",
    ],
    pros: [
      "gran balance entre prestaciones y precio",
      "ideal para uso diario y nocturno",
      "configuracion completa",
    ],
    cons: [
      "mas caro que ventiladores basicos de 3 velocidades",
      "ocupa algo mas que modelos compactos",
    ],
    miniReview:
      "De los mejores puntos medios de la lista: potente, configurable y con funciones utiles para verano intenso.",
    affiliateUrl: "https://amzn.to/4vCEVie",
    imageUrl: "https://m.media-amazon.com/images/I/51ociv32PYS._AC_SX425_.jpg",
  },
  {
    rank: 10,
    name: "Orbegozo PW 1240 Power Fan",
    brand: "Orbegozo",
    fanType: "Ventilador industrial de suelo",
    speedModes: "3 velocidades",
    keySpecs: "70 W, aspas metalicas 40 cm",
    rating: "4,5/5 (158 valoraciones)",
    priceSeen: "38,50 EUR",
    bestFor: "espacios amplios que necesitan impacto rapido",
    notes: [
      "diseno industrial con gran caudal",
      "asa para moverlo entre estancias",
      "precio atractivo para potencia de suelo",
    ],
    pros: [
      "caudal potente para salon grande o taller",
      "construccion metalica robusta",
      "muy buena nota media",
    ],
    cons: [
      "menos indicado para uso nocturno silencioso",
      "sin mando ni programacion avanzada",
    ],
    miniReview:
      "Cierra el top como opcion de alto impacto en flujo de aire para quien quiere potencia sin subir demasiado el gasto.",
    affiliateUrl: "https://amzn.to/4myFl50",
    imageUrl: "https://m.media-amazon.com/images/I/91hmr+6PBqL._AC_SX425_.jpg",
  },
];

const faqs = [
  {
    q: "Que ventilador de pie conviene mas para dormir?",
    a: "Si eres sensible al ruido, prioriza motor DC y modo noche. En esta comparativa, los modelos Dreo y el Amazon Basics DC destacan por control fino y mejor comportamiento nocturno.",
  },
  {
    q: "Ventilador de torre o ventilador de pie clasico?",
    a: "La torre ocupa menos espacio y suele quedar mejor en decoracion. El de pie clasico o industrial suele mover mas aire por euro en estancias grandes.",
  },
  {
    q: "Cuanta potencia necesito en verano?",
    a: "Para dormitorio estandar, 40-60 W bien gestionados suelen bastar. Para salon grande o uso industrial, conviene subir a 70-120 W y mayor diametro de aspas.",
  },
  {
    q: "Que mirar antes de comprar con enlace de afiliado?",
    a: "Valida precio final, cupon activo, stock y politica de devolucion. La recomendacion se basa en datos vistos en abril de 2026, pero Amazon puede cambiar precios en horas.",
  },
  {
    q: "Merece pagar mas por un modelo premium?",
    a: "Si lo usas muchas horas al dia, si. Suele mejorar ruido, control de velocidades y sensacion de confort real, sobre todo por la noche.",
  },
];

const BestStandingFansSummer2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Los mejores ventiladores de pie para este verano (Top 10 2026) | Homara";

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
      "Comparativa de los mejores ventiladores de pie para este verano: 10 opciones con precio, estrellas, valoraciones y mini review para comprar con criterio en 2026.",
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
              { label: "Los mejores ventiladores de pie para este verano" },
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
                Los mejores ventiladores de pie para este verano: top 10 Amazon 2026
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Hemos cruzado precio visible, valoraciones reales, formato y utilidad en casa para construir una lista
                que te ayude a decidir rapido. Si quieres compra inteligente para olas de calor, empieza por la tabla
                comparativa y baja despues al ranking completo.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: comparativa</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 10 ventiladores</span>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rapido: comparativa de ventiladores</h2>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Los 10 mejores ventiladores de pie para este verano</h2>
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
            <h2 className="font-display text-2xl font-bold text-foreground">Como elegir ventilador de pie sin equivocarte</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Prioriza silencio o potencia</h3>
                <p className="mt-1 text-sm text-muted-foreground">Dormitorio: busca bajo ruido y mas niveles de velocidad. Salon grande: sube potencia y diametro.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Revisa el tipo de ventilador</h3>
                <p className="mt-1 text-sm text-muted-foreground">Torre para espacio y estetica. Pie clasico para versatilidad. Industrial para gran caudal.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Mira funciones que realmente usaras</h3>
                <p className="mt-1 text-sm text-muted-foreground">Mando, timer, modo noche y oscilacion marcan diferencia real cuando lo usas muchas horas.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Comprueba coste total antes de pagar</h3>
                <p className="mt-1 text-sm text-muted-foreground">Valida precio final, envio, cupon activo y devolucion. Ese dato decide la compra inteligente.</p>
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
              Si quieres resolver rapido: Orbegozo SF 0147 para minimo coste, Amazon Basics DC para control de velocidades,
              Dreo Quiet [Upgraded] para dormitorio exigente y Cecotec 1020 para equilibrio de funciones sin disparar presupuesto.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <a href="https://amzn.to/4mEnAS3" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Orbegozo SF 0147</a>
              <a href="https://amzn.to/4cngH2s" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Amazon Basics DC</a>
              <a href="https://amzn.to/4sZQAoV" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Dreo Quiet Upgraded</a>
              <a href="https://amzn.to/4vCEVie" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Cecotec 1020 ExtremeConnected</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enlaces internos para continuar tu decision con contexto de uso real.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/buscar?q=ventilador%20de%20pie" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar ventiladores de pie</Link>
              <Link to="/buscar?q=ventilador%20torre" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar ventiladores de torre</Link>
              <Link to="/buscar?q=ventilador%20silencioso" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver ventiladores silenciosos</Link>
              <Link to="/buscar?q=ventilador%20industrial" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver ventiladores industriales</Link>
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

export default BestStandingFansSummer2026Page;
