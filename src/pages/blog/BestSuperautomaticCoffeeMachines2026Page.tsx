import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, Coffee, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type CoffeeMachine = {
  rank: number;
  name: string;
  brand: string;
  strongPoint: string;
  idealFor: string;
  priceSeen: string;
  rating: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  miniReview: string;
  affiliateUrl: string;
  imageUrl: string;
};

const coffeeMachines: CoffeeMachine[] = [
  {
    rank: 1,
    name: "Philips Serie 5500 EP5544/50",
    brand: "Philips",
    strongPoint: "20 bebidas calientes y frias + LatteGo + SilentBrew",
    idealFor: "quien quiere variedad maxima y rutina sin friccion",
    priceSeen: "589,00 EUR",
    rating: "4,4/5 (1.651 valoraciones)",
    keyFeatures: [
      "20 recetas de cafe caliente y frio",
      "LatteGo con limpieza rapida",
      "Tecnologia SilentBrew (menos ruido)",
      "QuickStart para preparar cafe al encender",
    ],
    pros: [
      "muy completa para hogares con gustos distintos",
      "excelente experiencia en bebidas con leche",
      "perfil premium de uso diario",
    ],
    cons: [
      "es la mas cara de la lista",
      "puede ser excesiva si solo tomas espresso simple",
    ],
    miniReview:
      "Es una cafetera para quien no quiere negociar: mucha variedad, boton directo y rutina comoda todos los dias. Se paga, pero se nota.",
    affiliateUrl:
      "https://www.amazon.es/Totalmente-Autom%C3%A1tica-Silenciosa-SilentBrew-EP5544/dp/B0CTCQKJ1B?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=983c4bNxKw&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=79f3f1bf85fc66ffa04ca5e16adefdce&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61wUUgUQYoL._AC_SX522_.jpg",
  },
  {
    rank: 2,
    name: "Philips Serie 2300 EP2330/10",
    brand: "Philips",
    strongPoint: "LatteGo + pantalla tactil + molinillo ceramico",
    idealFor: "quien quiere cappuccino facil y una maquina intuitiva",
    priceSeen: "359,99 EUR",
    rating: "4,2/5 (3.795 valoraciones)",
    keyFeatures: [
      "sistema LatteGo para espuma automatica",
      "pantalla tactil con iconos",
      "My Coffee Choice para personalizacion",
      "molinillo ceramico con 12 niveles",
    ],
    pros: [
      "muy buena relacion funciones/precio en Philips",
      "uso muy facil sin curva larga",
      "equilibrada para hogar de uso frecuente",
    ],
    cons: [
      "menos variedad de recetas que la Serie 5500",
      "no es la opcion mas barata del mercado",
    ],
    miniReview:
      "Si quieres subir de nivel sin disparar presupuesto, esta 2300 es de las decisiones mas logicas: sencilla, consistente y comoda para el dia a dia.",
    affiliateUrl:
      "https://www.amazon.es/Philips-Serie-2300-Cafetera-Superautom%C3%A1tica/dp/B0CDCCZ9K8?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-2-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=wG3hAlinPE&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=abae5f8b63d1ff93e1a897072827e8c4&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71qbGYx5YDL._AC_SX522_.jpg",
  },
  {
    rank: 3,
    name: "DeLonghi Magnifica S ECAM11.112.B",
    brand: "DeLonghi",
    strongPoint: "fiabilidad muy contrastada y gran volumen de reseñas",
    idealFor: "quien prioriza espresso diario y compra segura",
    priceSeen: "299,99 EUR",
    rating: "4,2/5 (57.419 valoraciones)",
    keyFeatures: [
      "molinillo integrado con 13 niveles",
      "vaporizador manual para cappuccino",
      "preparacion de 1 o 2 tazas",
      "programas de enjuague y descalcificacion",
    ],
    pros: [
      "producto muy consolidado en mercado",
      "muy buena relacion precio/fiabilidad",
      "ideal para quienes toman espresso a diario",
    ],
    cons: [
      "menos automatizacion de leche que LatteGo",
      "interfaz mas clasica que otros modelos recientes",
    ],
    miniReview:
      "No es la mas vistosa, pero es de esas maquinas que la gente compra, usa durante anos y vuelve a recomendar. Para perfil practico, pesa mucho.",
    affiliateUrl:
      "https://www.amazon.es/DeLonghi-Magnifica-ECAM11-112-B-Superautom%C3%A1tica-Soft-Touch/dp/B0BWSFGQ49?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-8&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=b6a1bce24c01b94a7a558b596e93b3fc&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/617bJwLkEhL._AC_SX522_.jpg",
  },
  {
    rank: 4,
    name: "Cecotec Cremmaet Cube Compact",
    brand: "Cecotec",
    strongPoint: "entrada economica al segmento superautomatico",
    idealFor: "quien quiere empezar con presupuesto mas contenido",
    priceSeen: "179,00 EUR",
    rating: "4,0/5 (403 valoraciones)",
    keyFeatures: [
      "1350 W y 19 bares",
      "sistema de pre-infusion",
      "Thermoblock para temperatura",
      "5 niveles de molienda",
    ],
    pros: [
      "precio muy competitivo para su categoria",
      "ficha tecnica solida en presion y extraccion",
      "compacta para cocinas medias",
    ],
    cons: [
      "menor historial de reseñas que modelos veteranos",
      "menos ecosistema y trayectoria que marcas top",
    ],
    miniReview:
      "Si vienes de capsulas y quieres pasar a cafe en grano gastando lo justo, esta Cecotec puede ser un salto muy razonable.",
    affiliateUrl:
      "https://www.amazon.es/Cecotec-Cafetera-Superautom%C3%A1tica-Pre-Infusi%C3%B3n-Thermoblock/dp/B0FP2HTVYR?crid=B4EMS01J3LXT&dib=eyJ2IjoiMSJ9.SgI8yF0EUeQiXOy0lfRX-JkxWXiL3YlSZNdd-xQZolctRQn3mJ3p41pK9cufSyLT2DBQgG6llEiSZzyuqHTRTaip2nfsZGtoz7KWujlmNn-Qyy3LV7HZatQlnq76pkhE6VOOfwhX8EmIDJ13yASpmI2V2w0EvjvyBXMqRWt-lWMUNy8e_uckRVPvHw59TpBsOPv_FAWr0m3Sx5kS5j2t8fKTXdWLi5nnCGpX9N41s2rqvziKdJ2ld2LEDA2ri4McLAofodX16gv7wXqx1Ux8vpp293RxslreIf-yB-sZL-k.9UnHCVbDYl8Wxyl9NDHVMA1ehgOQwdeemoregwdW6EA&dib_tag=se&keywords=cafetera%2Bsuperautom%C3%A1tica&qid=1776612843&sprefix=cafetera%2Caps%2C221&sr=8-4-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=NsR0KzN3VZ&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=aa0591bd75841817a886dde6fb503413&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71UAkdsAiwL._AC_SX522_.jpg",
  },
  {
    rank: 5,
    name: "Melitta Solo E950-222",
    brand: "Melitta",
    strongPoint: "20 cm de ancho y enfoque espresso clasico",
    idealFor: "cocinas pequenas y usuarios de cafe en grano sin extras",
    priceSeen: "249,99 EUR",
    rating: "4,2/5 (2.807 valoraciones)",
    keyFeatures: [
      "15 bares de presion",
      "3 intensidades, 3 molidos y 3 temperaturas",
      "preparacion de 1 o 2 tazas",
      "diseno estrecho de solo 20 cm",
    ],
    pros: [
      "muy compacta para su segmento",
      "configuracion clara y directa",
      "buena opcion para espresso diario",
    ],
    cons: [
      "menos orientada a bebidas lacteas automaticas",
      "perfil mas clasico en funcionalidades",
    ],
    miniReview:
      "Si valoras tener buen espresso en casa y no quieres una maquina ancha, la Solo sigue siendo una opcion inteligente y muy practica.",
    affiliateUrl:
      "https://www.amazon.es/Melitta-950-222-automatic%C3%A1-molinillo-integrado/dp/B00I3YL5T0?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=B4EMS01J3LXT&cv_ct_cx=cafetera%2Bsuperautom%C3%A1tica&keywords=cafetera%2Bsuperautom%C3%A1tica&pd_rd_i=B00I3YL5T0&pd_rd_r=03a85da9-6254-4aa4-b386-c6fcd50200f2&pd_rd_w=z6ura&pd_rd_wg=C3qFX&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=SCYK852R67968J644PR1&qid=1776612843&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=cafetera%2Caps%2C221&sr=1-5-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&ufe=app_do%3Aamzn1.fos.6c35d95a-ceb8-4cab-b2da-8669f70f4878&aref=hKrTslJjTe&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=2e6abdbf5e03c354b7414446d0c6d9c2&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51DTj6lXb5L._AC_SX522_.jpg",
  },
];

const faqs = [
  {
    q: "Cual es la mejor cafetera superautomatica calidad precio de esta lista?",
    a: "Si buscas equilibrio entre prestaciones y presupuesto, Philips Serie 2300 y DeLonghi Magnifica S son dos de las opciones mas solidas.",
  },
  {
    q: "Merece la pena pagar mas por una superautomatica premium?",
    a: "Suele compensar si en casa se consumen varias bebidas al dia y se valora comodidad en recetas con leche y menos ruido.",
  },
  {
    q: "Que marca es mas segura para una primera compra?",
    a: "Philips y DeLonghi tienen un historial muy amplio. Cecotec encaja mejor si el foco principal es reducir coste de entrada.",
  },
  {
    q: "Que modelo ocupa menos espacio en cocina?",
    a: "Por los datos visibles, Melitta Solo destaca por formato estrecho de 20 cm de ancho.",
  },
];

const BestSuperautomaticCoffeeMachines2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Las 5 mejores cafeteras superautomaticas de 2026 para amantes del cafe | Homara";

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
      "Comparativa editorial premium de 5 cafeteras superautomaticas: precios vistos, claves, pros y contras, y recomendacion final para comprar con criterio.",
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
              { label: "Mejores cafeteras superautomaticas" },
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
                Guia editorial Homara 2026
              </p>

              <h1 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Las 5 mejores cafeteras superautomaticas de 2026 para verdaderos amantes del cafe
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si estas comparando las mejores cafeteras superautomaticas, esta guia esta pensada para compra real:
                diferencias claras, datos verificables y recomendacion editorial para decidir con seguridad.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Actualizado: abril 2026</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Intencion: comparativa</span>
                <span className="rounded-full bg-card px-3 py-1 font-medium text-foreground">Top: 5 modelos</span>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-2xl border border-deal/30 bg-deal/5 p-4 text-sm text-muted-foreground">
            <p>
              Transparencia: este contenido incluye enlaces de afiliado. Si compras desde ellos, Homara puede recibir una
              comision sin coste extra para ti. Precio y disponibilidad pueden variar segun promociones y stock.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Bloque resumen: top picks</h2>
            <p className="mt-2 text-sm text-muted-foreground">Resumen visual de las 5 cafeteras superautomaticas para decidir rapido.</p>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1080px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-left">
                    <th className="px-4 py-3 font-semibold text-foreground">Foto</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Modelo</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Punto fuerte</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Ideal para</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Precio aprox.</th>
                    <th className="px-4 py-3 font-semibold text-foreground">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {coffeeMachines.map((product) => (
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
              {coffeeMachines.map((product) => (
                <div key={`quick-${product.rank}`} className="rounded-xl border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                  <h3 className="mt-1 font-semibold text-foreground">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{product.rating}</p>
                  <p className="mt-1 text-sm text-foreground">Mejor para: {product.idealFor}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Precio aprox.: {product.priceSeen}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Analisis producto por producto</h2>
            <p className="mt-2 text-sm text-muted-foreground">Mini review humana + caracteristicas + pros/contras + veredicto rapido.</p>

            <div className="mt-6 space-y-6">
              {coffeeMachines.map((product) => (
                <section key={`full-${product.rank}`} className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Top {product.rank}</p>
                      <h3 className="mt-1 font-display text-xl font-bold text-foreground md:text-2xl">{product.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Mejor para: {product.idealFor}</p>
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
                          <p className="text-xs text-muted-foreground">Rating</p>
                          <p className="font-semibold text-foreground">{product.rating}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Punto fuerte</p>
                          <p className="font-semibold text-foreground">{product.strongPoint}</p>
                        </div>
                        <div className="rounded-lg bg-secondary/50 p-3">
                          <p className="text-xs text-muted-foreground">Ideal para</p>
                          <p className="font-semibold text-foreground">{product.idealFor}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-border bg-background p-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Caracteristicas clave</p>
                          <ul className="space-y-1.5 text-sm text-foreground">
                            {product.keyFeatures.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
                                <Star className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-accent" />
                                <span>{feature}</span>
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

                      <div className="mt-3 rounded-lg border border-border bg-background p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Veredicto rapido</p>
                        <p className="mt-1 text-sm text-foreground">
                          {product.rank <= 2
                            ? "Opcion muy recomendada si valoras comodidad y experiencia de uso completa."
                            : product.rank === 3
                              ? "Compra segura para quien prioriza fiabilidad y espresso diario."
                              : product.rank === 4
                                ? "Muy interesante para entrar en superautomaticas con presupuesto contenido."
                                : "Excelente alternativa si necesitas formato estrecho y uso directo sin extras."}
                        </p>
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
                          to={`/buscar?q=${encodeURIComponent(`${product.brand} cafetera superautomatica`)}`}
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
            <h2 className="font-display text-2xl font-bold text-foreground">Que tener en cuenta antes de comprar</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">1) Tipo de cafe que tomas</h3>
                <p className="mt-1 text-sm text-muted-foreground">Si tomas mucha leche, prioriza sistema automatico. Si eres de espresso, busca molienda y temperatura ajustables.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">2) Espacio real en cocina</h3>
                <p className="mt-1 text-sm text-muted-foreground">No todas las superautomaticas ocupan igual. Valida fondo, altura y zona de uso antes de decidir.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">3) Mantenimiento</h3>
                <p className="mt-1 text-sm text-muted-foreground">Limpieza de leche, descalcificacion y acceso a piezas marcan la experiencia a medio plazo.</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-4">
                <h3 className="font-semibold text-foreground">4) Presupuesto total</h3>
                <p className="mt-1 text-sm text-muted-foreground">No mires solo precio inicial: tambien filtros, consumibles y uso diario previsto.</p>
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
                      <Coffee className="h-4 w-4 text-accent" />
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
              Si quieres experiencia premium completa, Philips 5500 es la mas ambiciosa. Si buscas equilibrio de compra,
              Philips 2300 y DeLonghi Magnifica S son dos candidatos muy fuertes. Si vas con presupuesto ajustado,
              Cecotec entra con una propuesta muy competitiva. Para cocinas pequenas y espresso clasico, Melitta Solo es muy sensata.
            </p>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Recomendaciones internas de Homara</h2>
            <p className="mt-2 text-sm text-muted-foreground">Sigue comparando sin salir del ecosistema Homara.</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Link to="/guias" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver todas las guias</Link>
              <Link to="/categoria/cocina" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Cocina</Link>
              <Link to="/categoria/electrodomesticos" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Ver categoria Electrodomesticos</Link>
              <Link to="/buscar?q=cafetera%20superautomatica" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Buscar cafeteras superautomaticas</Link>
              <Link to="/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros" className="rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground hover:bg-secondary">Leer otra comparativa editorial</Link>
              <Link to="/asistente" className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-sm font-semibold text-accent hover:bg-accent/20">Pedir recomendacion al Asistente</Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl font-bold text-foreground">Conclusion editorial</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
              No hay una cafetera superautomatica perfecta para todo el mundo. La mejor compra depende de tu rutina,
              de cuanto valoras bebidas con leche y del espacio que tienes en cocina. Esta comparativa esta pensada para
              que compres con criterio y con menos riesgo de arrepentirte.
            </p>

            <div className="mt-5">
              <Link
                to="/buscar?q=cafetera%20superautomatica"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
              >
                Seguir comparando cafeteras en Homara <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestSuperautomaticCoffeeMachines2026Page;
