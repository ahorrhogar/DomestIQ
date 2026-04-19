import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ExternalLink, Leaf, Search, Snowflake, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type FridgeModel = {
  rank: number;
  name: string;
  brand: string;
  strongPoint: string;
  idealFor: string;
  priceSeen: string;
  rating: string;
  energyClass: string;
  capacity: string;
  size: string;
  miniReview: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  verdict: string;
  affiliateUrl: string;
  imageUrl: string;
};

const products: FridgeModel[] = [
  {
    rank: 1,
    name: "Whirlpool WHK 26404 XP5E",
    brand: "Whirlpool",
    strongPoint: "Clase energetica A con precio de entrada competitivo",
    idealFor: "quien quiere empezar a ahorrar en consumo sin irse a gama alta",
    priceSeen: "599,00 EUR",
    rating: "4,1/5 (18 valoraciones)",
    energyClass: "A",
    capacity: "355 L",
    size: "203,5 x 59,5 x 66,3 cm",
    miniReview:
      "Es la opcion de entrada mas agresiva para quien busca un combi clase A sin pagar precio premium. Va al grano: eficiencia, capacidad correcta y tecnologia util para el dia a dia.",
    keyFeatures: [
      "Dual No Frost",
      "Compresor Inverter",
      "Tecnologia 6th SENSE",
      "Sistema Multiflow",
      "Fresh Box+ con control de humedad",
      "Libre instalacion",
    ],
    pros: [
      "Precio de entrada muy competitivo para clase A",
      "Paquete tecnico equilibrado para uso diario",
      "Formato estandar facil de integrar en cocina",
    ],
    cons: [
      "Base de reseñas menor que otras opciones de la lista",
      "Menos enfoque smart que modelos con WiFi",
    ],
    verdict:
      "Si tu objetivo principal es eficiencia energetica alta con una inversion razonable, es de las compras mas logicas de esta comparativa.",
    affiliateUrl:
      "https://www.amazon.es/Whirlpool-Frigor%C3%ADfico-libre-instalaci%C3%B3n-26404/dp/B0DXFMCB2G?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.8GqEeGgiMch4RrhcZi3h0ktV5EwJbjpYH03WGLKxyMLWYKj_LC44WwxHa-lDxe7UXCdLmnYRQ_X8-TgL9mWpxffW0vdSDvIM4Zuss8BBueZA0WpsU6oJhLKAfGFJ56VoTArRueDIVM8rajCZ_LQgQXT4Q0ZCsKrYHNW6iMfT20jr51HdvFkXyOzizahT7K0k-tLbJihEFJ8gxPVqjJieEU3VI9tovec6UPMBZulyCRUePzYtFUHexxr3k4OmuHV_7d2fng6vGJybMKbdYQUWVdzMvQXiFnzbhbtGc2ZXUu0.ZeskJvCAoCmC4Z3w_zIBpkxnxGchB4oU3Uf-GiYxClo&dib_tag=se&keywords=frigorifico+combi+bajo+consumo&qid=1776613215&sprefix=frigorifico+combi+bajo+consumo%2Caps%2C198&sr=8-18-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&aref=IsUzp1cUt9&sp_csd=d2lkZ2V0TmFtZT1zcF9tdGY&psc=1&linkCode=ll2&tag=ahorrhogar-21&linkId=d355e46b42dfb18ac7b971db547c0ed6&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51ntIU8zQGL._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "Hisense RB440N4CCB",
    brand: "Hisense",
    strongPoint: "Equilibrio muy bueno entre precio, capacidad y prestaciones",
    idealFor: "quien busca un combi eficiente y sin complicaciones",
    priceSeen: "619,00 EUR",
    rating: "4,3/5 (220 valoraciones)",
    energyClass: "B",
    capacity: "336 L",
    size: "202 x 59,5 x 57,9 cm",
    miniReview:
      "Es de esos modelos que encajan en muchos hogares: no es el mas sofisticado, pero si uno de los mas coherentes por lo que cuesta frente a lo que ofrece.",
    keyFeatures: [
      "Clase energetica B",
      "Total No Frost",
      "Multi-air Flow",
      "Micro Vents Cooling",
      "Fast Freezing",
      "Puerta reversible",
    ],
    pros: [
      "Buena nota media con volumen de reseñas alto",
      "Precio contenido para su capacidad",
      "Tecnologia de frio completa para su segmento",
    ],
    cons: [
      "No alcanza clase A",
      "Capacidad mas ajustada que opciones de 380-400 L",
    ],
    verdict:
      "Si valoras una compra equilibrada y probada por usuarios, es una de las opciones mas recomendables del top.",
    affiliateUrl:
      "https://www.amazon.es/Hisense-RB440N4CCB-Frigor%C3%ADfico-Congelamiento-Reversible/dp/B0CW35LJL6?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.8GqEeGgiMch4RrhcZi3h0ktV5EwJbjpYH03WGLKxyMLWYKj_LC44WwxHa-lDxe7UXCdLmnYRQ_X8-TgL9mWpxffW0vdSDvIM4Zuss8BBueZA0WpsU6oJhLKAfGFJ56VoTArRueDIVM8rajCZ_LQgQXT4Q0ZCsKrYHNW6iMfT20jr51HdvFkXyOzizahT7K0k-tLbJihEFJ8gxPVqjJieEU3VI9tovec6UPMBZulyCRUePzYtFUHexxr3k4OmuHV_7d2fng6vGJybMKbdYQUWVdzMvQXiFnzbhbtGc2ZXUu0.ZeskJvCAoCmC4Z3w_zIBpkxnxGchB4oU3Uf-GiYxClo&dib_tag=se&keywords=frigorifico%2Bcombi%2Bbajo%2Bconsumo&qid=1776613215&sprefix=frigorifico%2Bcombi%2Bbajo%2Bconsumo%2Caps%2C198&sr=8-44&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=cc0526e19f21924766e495ea6b3fb728&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61vKSabOZJL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "Haier 2D 60 Series 5 Pro HDPW5620ANPK",
    brand: "Haier",
    strongPoint: "Gran capacidad y funciones de conservacion avanzadas",
    idealFor: "familias que hacen compra grande semanal",
    priceSeen: "759,00 EUR",
    rating: "4,2/5 (149 valoraciones)",
    energyClass: "A",
    capacity: "409 L",
    size: "205 x 59,5 x 66,7 cm",
    miniReview:
      "Sube de nivel en espacio y gestion de alimentos. Si sueles llenar la nevera a fondo, se nota en organizacion y comodidad de uso.",
    keyFeatures: [
      "Clase energetica A",
      "Conectividad WiFi con app hOn",
      "Total No Frost Air Surround",
      "My Zone Pro ajustable",
      "Humidity Zone para frutas y verduras",
      "Motor Inverter y botellero",
    ],
    pros: [
      "Capacidad muy generosa sin pasarse de ancho",
      "Muy buen equilibrio entre eficiencia y funciones",
      "Tecnologia util para conservar mejor segun tipo de alimento",
    ],
    cons: [
      "Precio claramente por encima de los modelos de entrada",
      "Conviene revisar bien accesos por volumen y peso",
    ],
    verdict:
      "Si quieres un combi grande, eficiente y con extras utiles de verdad, es una de las elecciones mas completas.",
    affiliateUrl:
      "https://www.amazon.es/Haier-HDPW5620ANPK-Frigor%C3%ADfico-Botellero-Inteligentes/dp/B0F66PXHXY?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DP1U8GWHLUWF&dib=eyJ2IjoiMSJ9.F3MijT8ARSUcKMWk-6V8NyaugpDVYCgRrAMrKsRZmlTAyc7hfB7vPmYDGwLM4nJ1qOg88YT4Seh-zxWgZvqIN3fklHJlEQImpjh_9Nn_Kc4.R2M6Wb0jR1xsiRjGwL_FO_SUWnQwbSFjc1eWVtq6T0M&dib_tag=se&keywords=frigorifico%2Bcombi%2Bbajo%2Bconsumo&qid=1776613334&sprefix=frigorifico%2Bcombi%2Bbajo%2Bconsumo%2Caps%2C198&sr=8-49-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&xpid=k6yzZ0F0ljfkj&aref=kOlQGLhD94&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGZfbmV4dA&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=91fa8d37805d7d0c4fc6d49c1c2bdb35&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51TO56qLqzL._AC_SY550_.jpg",
  },
  {
    rank: 4,
    name: "Samsung Bespoke AI RB38C607AS9/EF",
    brand: "Samsung",
    strongPoint: "Clase A con ecosistema smart y consumo anual muy ajustado",
    idealFor: "quien quiere integrar eficiencia y control desde app",
    priceSeen: "899,00 EUR",
    rating: "3,9/5 (20 valoraciones)",
    energyClass: "A",
    capacity: "387 L",
    size: "203 x 59,5 x 65,8 cm",
    miniReview:
      "Es una apuesta orientada a tecnologia y confort de uso conectado. No es el mas barato, pero ofrece un pack muy completo para un hogar que ya usa ecosistema smart.",
    keyFeatures: [
      "Clase energetica A",
      "Consumo indicado: 108 kWh/anio",
      "Twin Cooling Plus",
      "SpaceMax Technology",
      "SmartThings AI Energy Mode",
      "Cajon Optimal Fresh+",
    ],
    pros: [
      "Ficha energetica muy competitiva",
      "Buena combinacion de eficiencia y tecnologia",
      "Capacidad amplia con formato estandar de 60 cm",
    ],
    cons: [
      "Menor historial de reseñas que otros modelos",
      "Precio alto frente a opciones menos conectadas",
    ],
    verdict:
      "Muy buena opcion si valoras control inteligente y funciones de conservacion de gama media-alta.",
    affiliateUrl:
      "https://www.amazon.es/Samsung-Frigor%C3%ADfico-Bespoke-Cooling-RB38C607AS9/dp/B0C668JDL5?__mk_es_ES=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2DXS9WL0C3JXR&dib=eyJ2IjoiMSJ9.8FcUT1mxjy-JZS3SZzN7KMs_DjDWR-fqHTjlmnAPmeNBVKMbMCeZQOWbQmGXoCSfZcgSIrQ4JGvfP3rrYVD6SFBrdPlLEoJj4meXMAEik2qRKg8BLkTvKBUJ1q-hh-Awgzrig0OEsbOvza9SsehKa5C2XRrldzJxdGufdcTj_GnSNZuGrQlRsMDvleDYd559JzOD3aUgWfnNCoSa_joVGtaNECa0atzEEAsnlj0XNvKSYtlSqf95B_M8SnrMtvNUPs2fQ46fT19N5ua_eGbGVhEv6UkxMmmMpFPcGFxQOcQ.KKvdM5Z5iSlDfHk32Zs7bshQJ6zN70KC8640ZCh-TW0&dib_tag=se&keywords=frigorifico+combi+clase+a&qid=1776613465&sprefix=frigorifico+combi+clase+a+%2Caps%2C126&sr=8-10&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&linkCode=ll2&tag=ahorrhogar-21&linkId=c4093e3d4f4fd64177f7ad287f24eda5&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/41+l9M-Oo7L._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Siemens KG39NAIAT",
    brand: "Siemens",
    strongPoint: "Conservacion premium con hyperFresh y valoracion muy alta",
    idealFor: "quien prioriza calidad de acabado y experiencia a largo plazo",
    priceSeen: "1.759,00 EUR",
    rating: "4,5/5 (263 valoraciones)",
    energyClass: "A",
    capacity: "363 L",
    size: "203 x 60 x 66,5 cm",
    miniReview:
      "Es una compra de perfil premium: gran valoracion acumulada, buen foco en conservacion real y una experiencia muy cuidada para quien pasa muchas horas en cocina.",
    keyFeatures: [
      "Clase energetica A",
      "NoFrost",
      "hyperFresh con control de humedad",
      "Zona de baja temperatura para carne y pescado",
      "Acabado anti-huellas",
      "Iluminacion LED con softStart",
    ],
    pros: [
      "Nota media alta con muchas reseñas",
      "Muy buen enfoque en conservacion de alimentos frescos",
      "Construccion y acabados orientados a gama alta",
    ],
    cons: [
      "Precio muy por encima del resto de opciones",
      "No es la opcion mas rentable si el presupuesto es limitado",
    ],
    verdict:
      "Si buscas un combi de alto nivel para muchos anos y priorizas experiencia premium, es una referencia clara.",
    affiliateUrl:
      "https://www.amazon.es/Siemens-Frigor%C3%ADfico-instalaci%C3%B3n-hyperFresh-Antihuellas/dp/B0BC963P5C?crid=2LE9K0DJK82UB&dib=eyJ2IjoiMSJ9.pRo_1w6llNEvjgX2FAxYDJlVTgk1RuN-OvMFgmW4LMEkK7HdwXnnuyO2pM0T3gjHVjuriW5-N5LLzlYUAECEuzgpKXj7UoTGaKez9YMGfUQk1rBwCzCt-iq9cPuKjYIc11FplFTkFaN0r6dS8HWk-md-QnAToFsuwQ75KZ0QQhqRUZCUE0O85B7q2CyOa5g6NjGbV92113XlEWlGUT8dcWI9oZrNJDet4Cpvj231y0jf8m39-M5CJI0M4fQ2fzN65PQDAveNgubTxYxAaohK8w9v6gdPPA5ltdJGoGJXzQk.HjAnhDtk-8c4KPqLCHcFUgmi4lVsYf9zbQisKlRVEiU&dib_tag=se&keywords=frigorifico+combi+clase+a%2B%2B&qid=1776613394&sprefix=frigorifico+combi+clase+%2Caps%2C260&sr=8-47&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&linkCode=ll2&tag=ahorrhogar-21&linkId=81cf1deec9ba3c720bf254989382dd2e&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61x6BM197OL._AC_SY879_.jpg",
  },
];

const faqs = [
  {
    q: "Cual es el mejor frigorifico combi de bajo consumo para ahorrar luz?",
    a: "Si tu prioridad es entrar en clase A con presupuesto contenido, Whirlpool WHK 26404 XP5E es de los perfiles mas atractivos de la comparativa.",
  },
  {
    q: "Que diferencia hay entre clase A y clase B en frigorificos combi?",
    a: "La clase A suele aportar menor consumo anual, pero conviene valorar tambien precio de compra y uso real para calcular la amortizacion.",
  },
  {
    q: "Cuantos litros necesito en un combi para una familia de 3-4 personas?",
    a: "Como referencia practica, suele ser comodo moverse entre 350 y 410 litros segun frecuencia de compra y habitos de cocina.",
  },
  {
    q: "Merece la pena pagar mas por WiFi y control desde app?",
    a: "Si vas a usar alertas y ajustes remotos puede aportar valor. Si no, suele compensar priorizar clase energetica, capacidad y organizacion interior.",
  },
  {
    q: "Los precios de Amazon de esta guia son fijos?",
    a: "No. Son precios vistos en el momento de la revision y pueden cambiar por stock, cupones o promociones.",
  },
];

const BestLowConsumptionFridgeFreezers2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Los 5 mejores frigorificos combi de bajo consumo en 2026 | Homara";

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
      "Comparativa editorial de 5 frigorificos combi de bajo consumo con clase energetica, capacidad, pros, contras y recomendacion final para ahorrar en la factura.",
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
              { label: "Frigorificos combi de bajo consumo" },
            ]}
          />
        </div>

        <article className="container mx-auto px-4 pb-16">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-accent/15 via-secondary/50 to-card p-6 md:p-10">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" aria-hidden="true" />
            <div className="absolute -left-12 bottom-0 h-24 w-24 rounded-full bg-primary/15 blur-xl" aria-hidden="true" />

            <div className="relative max-w-4xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                <Leaf className="h-3.5 w-3.5" />
                Guia editorial Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Los 5 mejores frigorificos combi de bajo consumo en 2026 para ahorrar en la factura de la luz
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si estas buscando un frigorifico combi de bajo consumo con intencion real de compra, esta comparativa
                te ayuda a decidir rapido: eficiencia energetica, capacidad, funciones utiles y coste de entrada.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: compra</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 5 modelos</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir
              una comision sin coste extra para ti. Precio y disponibilidad pueden variar por stock o promociones.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Bloque resumen / top picks</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tabla rapida para comparar de un vistazo clase energetica, capacidad y precio visto.
            </p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1160px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Punto fuerte</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Ideal para</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Clase</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Capacidad</th>
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
                      <td className="px-4 py-3 text-foreground">{product.strongPoint}</td>
                      <td className="px-4 py-3 text-foreground">{product.idealFor}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                          {product.energyClass}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{product.capacity}</td>
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Comparativa rapida</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {products.map((product) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                  <h3 className="mt-1 text-base font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{product.miniReview}</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">Precio: {product.priceSeen}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">{product.rating}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">Clase: {product.energyClass}</p>
                    <p className="rounded-md bg-secondary px-2 py-1 text-foreground">Capacidad: {product.capacity}</p>
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
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">Precio: {product.priceSeen}</p>
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">Tamano: {product.size}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-border bg-background p-4">
                    <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Snowflake className="h-4 w-4 text-accent" /> Caracteristicas clave
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
                    <span className="font-semibold">Para quien es:</span> {product.idealFor}
                  </p>
                  <p className="mt-2 text-sm text-foreground">
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Que tener en cuenta antes de comprar</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">1) Clase energetica y consumo anual</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Revisa etiqueta energetica y, cuando este disponible, el dato de kWh/anio para comparar con criterio.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">2) Capacidad adaptada a tu hogar</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Para 1-2 personas suele bastar 300-360 L. Para familias, moverse entre 370 y 410 L da mas margen.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">3) Tipo de tecnologia de frio</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No Frost y buena distribucion de aire ayudan a conservar mejor y evitan problemas de escarcha.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">4) Logistica de entrega e instalacion</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Comprueba accesos, medidas de puerta y condiciones de subida para evitar incidencias en la entrega.
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Recomendaciones internas de Homara</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link
                to="/guias"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Guias de compra</p>
                <p className="mt-1 text-sm text-muted-foreground">Mas comparativas editoriales para decidir mejor.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ver guias <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/categoria/electrodomesticos-y-cocina"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Electrodomesticos y Cocina</p>
                <p className="mt-1 text-sm text-muted-foreground">Categorias para seguir comparando productos de hogar.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ir a categoria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Comparativa de cafeteras superautomaticas</p>
                <p className="mt-1 text-sm text-muted-foreground">Otra guia premium para compras de electrodomesticos.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ver articulo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Alternativas a Thermomix</p>
                <p className="mt-1 text-sm text-muted-foreground">Comparativa editorial para seguir navegando en Homara.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ver articulo <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/35 bg-accent/10 p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Conclusion editorial</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              Si quieres eficiencia alta con gasto contenido, Whirlpool WHK 26404 XP5E es la opcion mas directa.
              Si prefieres equilibrio global y precio razonable, Hisense RB440N4CCB sigue siendo muy consistente.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              Para familias que necesitan mas capacidad y gestion avanzada de alimentos, Haier HDPW5620ANPK es una
              opcion especialmente completa.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">CTA final</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si todavia tienes dudas entre dos modelos, sigue comparando por presupuesto y uso real dentro de Homara.
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
                Buscar productos <Search className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestLowConsumptionFridgeFreezers2026Page;
