import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type AffiliateProduct = {
  rank: number;
  name: string;
  brand: string;
  capacity: string;
  power: string;
  temperature: string;
  programs: string;
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

const affiliateProducts: AffiliateProduct[] = [
  {
    rank: 1,
    name: "Cecofry Fantastik Window 4000",
    brand: "Cecotec",
    capacity: "4 L",
    power: "1400 W",
    temperature: "80-200 C",
    programs: "9 menus",
    rating: "4,4/5 (1322 valoraciones)",
    priceSeen: "39,90 EUR",
    bestFor: "Cocinas pequenas y uso diario para 1-2 personas",
    notes: [
      "Ventana frontal para seguir la coccion sin abrir la cubeta",
      "Tiempo ajustable hasta 60 minutos",
      "Formato compacto",
    ],
    pros: [
      "Muy buen precio de entrada",
      "Interfaz tactil sencilla",
      "Buena relacion tamano-precio",
    ],
    cons: [
      "Capacidad justa para familias",
      "Menos margen para tandas grandes",
    ],
    miniReview:
      "Si quieres empezar sin gastar mucho, esta es de las que mejor sensacion deja. Es simple, calienta rapido para su gama y la ventana ayuda mucho cuando aun estas aprendiendo tiempos.",
    affiliateUrl: "https://amzn.to/4ezmAMG",
    imageUrl: "https://m.media-amazon.com/images/I/51SmikZCEcL._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "Cecofry Supreme 8000",
    brand: "Cecotec",
    capacity: "8 L",
    power: "1800 W",
    temperature: "30-200 C",
    programs: "10 menus",
    rating: "4,5/5 (1613 valoraciones)",
    priceSeen: "59,90 EUR",
    bestFor: "Hogares de 3-5 personas y lotes grandes",
    notes: [
      "Cesta de 8 litros",
      "Rango de temperatura amplio",
      "Control tactil",
    ],
    pros: [
      "Capacidad superior dentro de precio contenido",
      "Buena para meal prep",
      "Excelente equilibrio capacidad-coste",
    ],
    cons: [
      "Ocupa mas encimera",
      "Puede ser sobredimensionada para uso individual",
    ],
    miniReview:
      "Para familia o batch cooking, esta destaca por comodidad pura: menos tandas y menos esperas. Si tienes espacio en cocina, es de las compras que se notan en el dia a dia.",
    affiliateUrl: "https://amzn.to/4tjXWVa",
    imageUrl: "https://m.media-amazon.com/images/I/5177g+9MCDL._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Cecofry Full InoxBlack 5500 Pro",
    brand: "Cecotec",
    capacity: "5,5 L",
    power: "1700 W",
    temperature: "80-200 C",
    programs: "8 modos",
    rating: "4,4/5 (4736 valoraciones)",
    priceSeen: "43,90 EUR",
    bestFor: "Usuarios que buscan opcion equilibrada para 2-4 personas",
    notes: [
      "Acabado InoxBlack",
      "Tecnologia PerfectCook en ficha",
      "Panel tactil",
    ],
    pros: [
      "Precio competitivo en su capacidad",
      "Buena potencia para uso frecuente",
      "Producto muy consolidado en volumen de valoraciones",
    ],
    cons: [
      "No llega a la capacidad de modelos de 8 L",
      "Menos funciones avanzadas que lineas grill",
    ],
    miniReview:
      "Es la opcion equilibrada de esta lista: buen tamano, potencia suficiente y precio contenido. Muy recomendable si cocinas casi a diario para 2-4 personas.",
    affiliateUrl: "https://amzn.to/4mCSWbE",
    imageUrl: "https://m.media-amazon.com/images/I/519AN1zQmbL._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "COSORI Air Fryer Real Metallic Interior 5.7L",
    brand: "COSORI",
    capacity: "5,7 L",
    power: "1700 W",
    temperature: "No visible de forma explicita en extracto",
    programs: "Programas automaticos (incluye presets visibles en ficha)",
    rating: "4,7/5 (103765 valoraciones)",
    priceSeen: "99,99 EUR",
    bestFor: "Quien prioriza marca, construccion y robustez",
    notes: [
      "Estructura interior metalica destacada en la ficha",
      "Cesta 5,7 L",
      "Sistema de 1700 W",
    ],
    pros: [
      "Volumen de valoraciones muy alto",
      "Perfil de producto maduro",
      "Acabado orientado a durabilidad",
    ],
    cons: [
      "Va al limite de 100 EUR",
      "Menos agresiva en precio por litro",
    ],
    miniReview:
      "Se nota que es un producto maduro: construccion cuidada y mucha validacion de usuarios. Si valoras fiabilidad de marca por encima del precio minimo, tiene mucho sentido.",
    affiliateUrl: "https://amzn.to/4cv0gBv",
    imageUrl: "https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Cecofry&Grill Duoheat 6500 Plus",
    brand: "Cecotec",
    capacity: "6,5 L",
    power: "2200 W",
    temperature: "40-200 C",
    programs: "12 menus",
    rating: "4,3/5 (591 valoraciones)",
    priceSeen: "57,90 EUR",
    bestFor: "Quien quiere freidora + grill con mayor potencia",
    notes: [
      "Doble resistencia en ficha",
      "Ventana de visualizacion",
      "Perfil multifuncion (freidora y grill)",
    ],
    pros: [
      "Potencia muy alta para su precio",
      "Muy versatil para diferentes recetas",
      "Capacidad equilibrada para hogar familiar",
    ],
    cons: [
      "Curva de uso mayor que un modelo basico",
      "Interfaz mas completa para quien busca simplicidad",
    ],
    miniReview:
      "Si te gusta variar recetas y buscas un plus de dorado, esta ofrece un perfil mas completo por muy buen precio. Es menos plug-and-play, pero devuelve versatilidad real.",
    affiliateUrl: "https://amzn.to/4dPJC1G",
    imageUrl: "https://m.media-amazon.com/images/I/71qEef7KxUL._AC_SX425_.jpg",
  },
];

const faqs = [
  {
    q: "Cual es la mejor freidora de aire por menos de 100 EUR para 2 personas?",
    a: "Si cocinas para una o dos personas y quieres contener gasto, el formato de 4 L como Fantastik Window 4000 suele ser suficiente. Si quieres algo mas flexible para invitados puntuales, 5,5 L es un buen salto.",
  },
  {
    q: "Merece la pena subir a 8 litros sin pasar de 100 EUR?",
    a: "Si cocinas por tandas grandes o para 3-5 personas, si. La ganancia principal no es solo cantidad, tambien comodidad para no ir cocinando en varias rondas.",
  },
  {
    q: "Se nota la diferencia entre 1700 W y 2200 W?",
    a: "Normalmente si en velocidad de calentamiento y dorado, especialmente en recetas con proteina o cuando quieres acabado tipo grill.",
  },
  {
    q: "Que es mas importante: potencia o capacidad?",
    a: "Para la mayoria de usuarios, la capacidad adecuada a su hogar es la clave. La potencia suma, pero elegir una cuba demasiado pequena suele ser el error mas caro.",
  },
  {
    q: "Los precios se mantienen siempre por debajo de 100 EUR?",
    a: "No necesariamente. Esta guia se basa en precios visibles al revisar los enlaces en abril de 2026. En Amazon pueden variar por stock, cupones o promociones.",
  },
];

const AirFryersUnder100GuidePage = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Las 5 mejores freidoras de aire por menos de 100 EUR en 2026 | Homara";

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
      "Comparativa de las mejores freidoras de aire por menos de 100 EUR en 2026: 5 modelos, pros y contras, tabla resumen y recomendacion editorial de Homara.",
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
              { label: "Mejores freidoras de aire por menos de 100 EUR" },
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
                Las 5 mejores freidoras de aire por menos de 100 EUR en 2026 (Amazon)
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si buscas las mejores freidoras de aire por menos de 100 EUR, esta comparativa esta pensada para ayudarte a decidir en minutos:
                datos verificables, diferencias reales y recomendacion final segun tu tipo de uso.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Rango: hasta 100 EUR</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una comision sin coste extra para ti.
              Precios y valoraciones pueden cambiar segun stock y promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Resumen rapido: comparativa de freidoras de aire</h2>
            <p className="mt-2 text-sm text-muted-foreground">Tabla visual para comparar capacidad, potencia y precio visto de un vistazo.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1040px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Capacidad</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Potencia</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Temperatura</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Programas</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio visto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateProducts.map((product) => (
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
                      <td className="px-4 py-3 text-foreground">{product.temperature}</td>
                      <td className="px-4 py-3 text-foreground">{product.programs}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Las 5 mejores freidoras de aire de 2026 por debajo de 100 EUR</h2>
            <p className="mt-2 text-sm text-muted-foreground">Seleccion orientada a conversion con enfoque practico: para quien es cada modelo y por que puede encajar contigo.</p>

            <div className="mt-6 space-y-6">
              {affiliateProducts.map((product) => (
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
                          <p className="text-xs text-muted-foreground">Potencia</p>
                          <p className="font-semibold text-foreground">{product.power}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Temperatura</p>
                          <p className="font-semibold text-foreground">{product.temperature}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Programas</p>
                          <p className="font-semibold text-foreground">{product.programs}</p>
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
                          to={`/buscar?q=${encodeURIComponent(`${product.brand} freidora aire`)}`}
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
            <h2 className="font-display text-2xl font-bold text-foreground">Que tener en cuenta antes de comprar una air fryer</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Capacidad segun tu hogar</h3>
                <p className="mt-1 text-sm text-muted-foreground">1-2 personas: 4-5,5 L. 3-4 personas: 5,5-6,5 L. 4+ personas: 8 L o mas.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Potencia y rendimiento</h3>
                <p className="mt-1 text-sm text-muted-foreground">1700 W suele ser el punto medio. Si quieres dorado mas agresivo o uso intensivo, 2200 W ofrece margen extra.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Funciones realmente utiles</h3>
                <p className="mt-1 text-sm text-muted-foreground">Ventana, recordatorio de volteo, preheat y grill son interesantes solo si los vas a usar de verdad en tu cocina diaria.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Espacio en encimera</h3>
                <p className="mt-1 text-sm text-muted-foreground">Antes de comprar, revisa medidas y hueco real. Una buena compra tambien es la que puedes usar comoda todos los dias.</p>
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
              Si quieres una decision rapida: Fantastik 4000 para empezar gastando poco, InoxBlack 5500 Pro para equilibrio diario,
              Supreme 8000 si priorizas capacidad y Duoheat 6500 Plus si quieres versatilidad con extra de potencia.
              COSORI 5.7L encaja cuando prefieres una opcion consolidada y al limite de presupuesto.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <a href="https://amzn.to/4ezmAMG" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Cecofry Fantastik 4000</a>
              <a href="https://amzn.to/4mCSWbE" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Cecofry InoxBlack 5500 Pro</a>
              <a href="https://amzn.to/4tjXWVa" target="_blank" rel="sponsored nofollow noopener noreferrer" className="rounded-lg border border-border bg-background p-3 text-sm font-semibold text-foreground hover:bg-secondary">Cecofry Supreme 8000</a>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue comparando en Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Te dejamos enlaces internos utiles para continuar la decision sin salir del ecosistema Homara.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Cocina</Link>
              <Link to="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Electrodomesticos</Link>
              <Link to="/buscar?q=freidora%20aire" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar freidoras de aire en Homara</Link>
              <Link to="/buscar?q=cecotec" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar modelos Cecotec</Link>
              <Link to="/buscar?q=cosori" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Comparar modelos COSORI</Link>
              <Link to="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendacion al Asistente de Compras</Link>
            </div>

            <div className="mt-6 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Contenidos sugeridos para enlazado interno cuando esten publicados:
              <ul className="mt-2 space-y-1 text-foreground">
                <li>Guia de tiempos y temperaturas para freidora de aire.</li>
                <li>Como limpiar una freidora de aire y alargar su vida util.</li>
                <li>Recetas faciles para air fryer en menos de 20 minutos.</li>
              </ul>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default AirFryersUnder100GuidePage;
