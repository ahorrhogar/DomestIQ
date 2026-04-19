import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Flame, Sparkles, Star, ThumbsUp } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

const REVIEW_PATH = "/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros";
const AFFILIATE_URL = "https://amzn.to/41DW3q9";

const product = {
  name: "COSORI Air Fryer Real Metallic Interior 5.7L",
  priceSeen: "84,99 EUR",
  rating: "4,7/5",
  reviews: "103.776 valoraciones",
  capacity: "5,7 L",
  power: "1700 W",
  programs: "13 programas de un toque",
  recipes: "40 recetas",
  warranty: "3 anos",
  mainImage: "https://m.media-amazon.com/images/I/81HDt6NDs7L._AC_SX522_.jpg",
  extraImages: [
    "https://m.media-amazon.com/images/I/51Hz0BEs8-L._AC_US100_.jpg",
    "https://m.media-amazon.com/images/I/519eb9UfuxL._AC_US100_.jpg",
    "https://m.media-amazon.com/images/I/514hF8Z02sL._AC_US100_.jpg",
  ],
};

const faqs = [
  {
    q: "La COSORI 5,7 L entra de verdad en menos de 100 EUR?",
    a: "En la revision de abril de 2026 se vio a 84,99 EUR. El precio puede variar por promociones y stock.",
  },
  {
    q: "Es una buena freidora de aire para 3 o 4 personas?",
    a: "Si. Por capacidad, 5,7 L encaja bien para uso diario en hogares de 2 a 4 personas sin tantas tandas.",
  },
  {
    q: "Merece la pena frente a una air fryer mas barata?",
    a: "Si priorizas fiabilidad, acabados y una compra de menor riesgo, suele compensar frente a modelos de entrada.",
  },
  {
    q: "Es dificil de limpiar en el dia a dia?",
    a: "Segun la ficha del producto, las piezas son antiadherentes y aptas para lavavajillas, lo que ayuda mucho en rutina.",
  },
];

const CosoriAirFryerSingleReview2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "COSORI 5,7 L por menos de 100 EUR: review honesta de calidad precio (2026) | Homara";

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
      "Review honesta de la COSORI 5,7 L por menos de 100 EUR: opinion real, ficha tecnica, pros, contras, veredicto y enlace de compra.",
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
              { label: "Review COSORI 5,7 L" },
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
                Review Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                COSORI 5,7 L por menos de 100 EUR: review honesta de la mejor freidora de aire calidad precio
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si estas buscando una freidora de aire calidad precio por menos de 100 EUR, esta review va al grano:
                que ofrece de verdad, para quien compensa y si la compraria hoy sin rodeos.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Producto: 1 review</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlace de afiliado. Si compras desde el enlace, Homara puede
              recibir una comision sin coste extra para ti. Precio y disponibilidad pueden cambiar en Amazon.
            </p>
          </section>

          <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Mi opinion: que me transmite esta air fryer tras analizarla
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Esta COSORI no es la mas barata de su categoria, pero da una sensacion clara de compra segura.
                Combina capacidad util (5,7 L), potencia suficiente para uso real (1700 W) y un volumen de
                valoraciones muy alto, que reduce bastante el riesgo de equivocarte.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Si cocinas varias veces por semana, aqui se nota mas la consistencia que rascar 10 o 15 euros en un
                modelo mas basico. Para mi, ese es el punto que marca la diferencia en calidad precio.
              </p>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">Lo que mas me gusta</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />Capacidad 5,7 L muy equilibrada para 2-4 personas.</li>
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />Valoracion 4,7/5 con mas de 100.000 reseñas.</li>
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />13 programas para simplificar la cocina diaria.</li>
                  <li className="flex items-start gap-2"><ThumbsUp className="mt-0.5 h-4 w-4 text-deal" />Piezas aptas para lavavajillas segun ficha.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">Lo que menos me convence</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Hay opciones mas baratas si solo buscas precio minimo.</li>
                  <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Para una persona puede ser mas capacidad de la necesaria.</li>
                  <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />No toda la ficha publica tiene detalle tecnico avanzado.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-display text-xl font-bold text-foreground">Para quien lo recomiendo</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Para quien quiere una freidora de aire calidad precio por menos de 100 EUR con uso frecuente,
                  sin experimentar con modelos demasiado basicos y con enfoque practico de cocina diaria.
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <a
                href={AFFILIATE_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="group block overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img
                  src={product.mainImage || PRODUCT_IMAGE_FALLBACK}
                  alt={product.name}
                  loading="lazy"
                  className="h-64 w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(event) => applyProductImageFallback(event.currentTarget)}
                />
              </a>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Precio visto</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{product.priceSeen}</p>
                <p className="mt-2 text-xs text-muted-foreground">Rating {product.rating} · {product.reviews}</p>
                <a
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
                >
                  Ver oferta en Amazon <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Caracteristicas y especificaciones</h2>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[760px] text-sm">
                <tbody>
                  <tr className="border-b border-border"><th className="w-1/3 bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Modelo</th><td className="px-4 py-3 text-foreground">{product.name}</td></tr>
                  <tr className="border-b border-border"><th className="bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Capacidad</th><td className="px-4 py-3 text-foreground">{product.capacity}</td></tr>
                  <tr className="border-b border-border"><th className="bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Potencia</th><td className="px-4 py-3 text-foreground">{product.power}</td></tr>
                  <tr className="border-b border-border"><th className="bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Programas</th><td className="px-4 py-3 text-foreground">{product.programs}</td></tr>
                  <tr className="border-b border-border"><th className="bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Recetas incluidas</th><td className="px-4 py-3 text-foreground">{product.recipes}</td></tr>
                  <tr className="border-b border-border"><th className="bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Garantia</th><td className="px-4 py-3 text-foreground">{product.warranty}</td></tr>
                  <tr><th className="bg-secondary/50 px-4 py-3 text-left font-semibold text-foreground">Precio visto</th><td className="px-4 py-3 text-foreground">{product.priceSeen}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Imagenes del producto</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {product.extraImages.map((imageUrl) => (
                <a
                  key={imageUrl}
                  href={AFFILIATE_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="overflow-hidden rounded-xl border border-border bg-card p-3"
                >
                  <img
                    src={imageUrl}
                    alt="Detalle de la COSORI 5,7 L"
                    loading="lazy"
                    className="h-24 w-full object-contain"
                    onError={(event) => applyProductImageFallback(event.currentTarget)}
                  />
                </a>
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">Pros</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />Muy buen equilibrio entre precio y sensacion de producto robusto.</li>
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />Capacidad comoda para uso familiar medio.</li>
                <li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 text-accent" />Volumen de valoraciones altisimo para comprar con mas confianza.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-display text-2xl font-bold text-foreground">Contras</h2>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />No es la opcion mas low cost del mercado.</li>
                <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Puede ocupar demasiado si tienes encimera muy limitada.</li>
                <li className="flex items-start gap-2"><span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-muted-foreground" />Parte de sus claims dependen del tipo de receta y uso real.</li>
              </ul>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Que me parece tras analizarlo</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              La COSORI 5,7 L es una de esas compras que no prometen magia, pero si mucha tranquilidad. Si quieres
              mejorar tu cocina diaria con menos aceite y sin complicarte, es de las opciones mas solidas por debajo
              de 100 EUR en 2026.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              Si mi objetivo fuese comprar hoy una freidora unica para casa, esta entraria en mi shortlist final sin dudas.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground">Preguntas frecuentes</h2>
            <div className="mt-4 space-y-3">
              {faqs.map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer list-none font-semibold text-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Flame className="h-4 w-4 text-accent" />
                      {item.q}
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/20 bg-gradient-to-br from-card via-card to-accent/10 p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Veredicto final</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Si buscas la mejor freidora de aire calidad precio por menos de 100 EUR con enfoque de compra segura,
              la COSORI 5,7 L merece la pena. No es la mas barata, pero si una de las opciones mas consistentes para uso real.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={AFFILIATE_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Ver oferta de COSORI en Amazon <ExternalLink className="h-4 w-4" />
              </a>
              <Link
                to="/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
              >
                Comparar con otras air fryers <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Sigue navegando por Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Si quieres afinar aun mas la compra, aqui tienes enlaces internos utiles.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Cocina</Link>
              <Link to="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Electrodomesticos</Link>
              <Link to="/buscar?q=freidora%20aire" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar freidoras de aire</Link>
              <Link to="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendacion al Asistente</Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default CosoriAirFryerSingleReview2026Page;
