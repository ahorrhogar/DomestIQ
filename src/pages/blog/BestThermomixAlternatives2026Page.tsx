import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BadgeEuro, ChefHat, ExternalLink, Scale, Sparkles, Star } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { applyProductImageFallback, PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

type KitchenRobot = {
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

const robots: KitchenRobot[] = [
  {
    rank: 1,
    name: "Cecotec Mambo 11090",
    brand: "Cecotec",
    strongPoint: "37 funciones con app, bascula y jarra de 3,3 L",
    idealFor: "quien quiere equilibrio calidad-precio para cocinar casi todo",
    priceSeen: "219,00 EUR",
    rating: "4,1/5 (346 valoraciones)",
    keyFeatures: [
      "37 funciones de cocina",
      "1600 W",
      "jarra de acero inoxidable de 3,3 L",
      "apta para lavavajillas",
      "app Mambo con recetas guiadas",
      "bascula integrada y funcion AutoCleaning",
    ],
    pros: [
      "muy completo para su rango de precio",
      "equilibrio muy bueno entre funciones y coste",
      "marca con alta presencia en esta categoria",
    ],
    cons: [
      "en algunas reseñas se reportan incidencias de conectividad",
      "menos enfoque premium que modelos tactiles mas caros",
    ],
    miniReview:
      "Es la opcion mas redonda para quien quiere una alternativa real a Thermomix sin pagar una fortuna. No deslumbra en todo, pero falla poco en lo importante.",
    affiliateUrl:
      "https://www.amazon.es/Cecotec-Multifunci%C3%B3n-inoxidable-Lavavajillas-Accesorios/dp/B0BJQQ78BY?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot%2Bde%2Bcocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=y3WD7Mfc1I&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=e51abc2d9c020551da432a290d775932&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51sB4hpk8OL._AC_SX425_.jpg",
  },
  {
    rank: 2,
    name: "Cecotec Mambo Touch Habana",
    brand: "Cecotec",
    strongPoint: "pantalla tactil de 5 pulgadas y doble jarra",
    idealFor: "quien prioriza experiencia guiada y acabados mas premium",
    priceSeen: "403,90 EUR",
    rating: "4,5/5 (36 valoraciones)",
    keyFeatures: [
      "37 funciones",
      "pantalla TFT Soft Touch de 5 pulgadas",
      "1600 W",
      "jarra inoxidable de 3,3 L",
      "jarra Habana ceramica antiadherente",
      "sistema OneClick para cambio rapido de accesorios",
    ],
    pros: [
      "uso muy intuitivo por pantalla",
      "muy versatil para recetas delicadas con la jarra ceramica",
      "buena sensacion de producto de gama media-alta",
    ],
    cons: [
      "precio claramente superior al Mambo 11090",
      "menos reseñas acumuladas que otros modelos populares",
    ],
    miniReview:
      "Si te gusta cocinar con interfaz visual y quieres una experiencia mas cuidada, este modelo da ese salto. Pagas mas, pero se nota en el uso diario.",
    affiliateUrl:
      "https://www.amazon.es/Cecotec-Multifunci%C3%B3n-Funciones-Revestimiento-Antiadherencia/dp/B0BMLJF3XC?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot+de+cocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-2-spons&aref=1EgGftmZqa&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=ahorrhogar-21&linkId=61a86667de6dd5951e4c03cb5acf6493&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/619fmVfB89L._AC_SX425_.jpg",
  },
  {
    rank: 3,
    name: "Ufesa TotalChef RK7",
    brand: "Ufesa",
    strongPoint: "pantalla de 7 pulgadas, WiFi y 30 funciones",
    idealFor: "quien quiere recetas guiadas y cocina muy asistida",
    priceSeen: "339,99 EUR",
    rating: "4,1/5 (641 valoraciones)",
    keyFeatures: [
      "30 funciones",
      "pantalla tactil digital de 7 pulgadas",
      "WiFi con recetas guiadas",
      "jarra de 4,5 L",
      "2000 W",
      "8 programas automaticos y bascula integrada",
    ],
    pros: [
      "interfaz comoda para cocinar paso a paso",
      "capacidad amplia para cocina semanal",
      "buen numero de reseñas para validar experiencia",
    ],
    cons: [
      "en reseñas se repite la critica al recetario en algunos casos",
      "precio por encima de las opciones mas economicas",
    ],
    miniReview:
      "Es una alternativa interesante para quien busca una Thermomix low-cost con enfoque digital. El punto a vigilar es la parte de recetas y soporte.",
    affiliateUrl:
      "https://www.amazon.es/Ufesa-TotalChef-Inteligente-Multifunci%C3%B3n-Interactivo/dp/B09MWMJG76?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=1628EY8EP9YAC&cv_ct_cx=robot%2Bde%2Bcocina&keywords=robot%2Bde%2Bcocina&pd_rd_i=B09MWMJG76&pd_rd_r=9cbb59a2-6669-447d-8bd8-afb943da2e04&pd_rd_w=OsPTI&pd_rd_wg=4drJh&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=WE0EG0AWQ7R4VYNNYXFJ&qid=1776613042&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=robo%2Caps%2C145&sr=1-2-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&aref=XZStHP0nwc&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=64d13dde18f3b79495a12fa208f914d5&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/71TQd4oQH-L._AC_SX425_.jpg",
  },
  {
    rank: 4,
    name: "NEWLUX SmartChef V50",
    brand: "NEWLUX",
    strongPoint: "precio de entrada muy bajo para cocina diaria",
    idealFor: "quien quiere gastar lo minimo y cocinar sin complicarse",
    priceSeen: "59,90 EUR",
    rating: "4,1/5 (2.787 valoraciones)",
    keyFeatures: [
      "5 L de capacidad",
      "700 W",
      "9 funciones y 8 menus automaticos",
      "programable 24 horas",
      "mantener caliente 24 horas",
      "cubeta antiadherente y accesorios incluidos",
    ],
    pros: [
      "imposible ignorar por precio",
      "muy util para guisos, arroces y cocina base",
      "gran volumen de reseñas",
    ],
    cons: [
      "menos potencia y funciones inteligentes",
      "no compite en experiencia frente a modelos tactiles",
    ],
    miniReview:
      "Para presupuesto ajustado es una compra logica. No busca competir en lujo: busca ayudarte a cocinar mas en casa con coste minimo.",
    affiliateUrl:
      "https://www.amazon.es/NEWLUX-Robot-Multifunci%C3%B3n-Mod-Newcook-Antiadherente-autom%C3%A1ticos/dp/B00SBCZDDI?content-id=amzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76%3Aamzn1.sym.bf7fd619-13de-4d86-8675-08fc9f414f76&crid=1628EY8EP9YAC&cv_ct_cx=robot%2Bde%2Bcocina&keywords=robot%2Bde%2Bcocina&pd_rd_i=B00SBCZDDI&pd_rd_r=9cbb59a2-6669-447d-8bd8-afb943da2e04&pd_rd_w=OsPTI&pd_rd_wg=4drJh&pf_rd_p=bf7fd619-13de-4d86-8675-08fc9f414f76&pf_rd_r=WE0EG0AWQ7R4VYNNYXFJ&qid=1776613042&sbo=RZvfv%2F%2FHxDF%2BO5021pAnSA%3D%3D&sprefix=robo%2Caps%2C145&sr=1-5-9ac51240-4b88-4e0c-aad1-ad3578b6cab1-spons&aref=3PfPJN051s&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=22e809224b4630893a3177cee8ba5c3c&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/51b1NhImcIL._AC_SX425_.jpg",
  },
  {
    rank: 5,
    name: "Ufesa TotalChef RK10",
    brand: "Ufesa",
    strongPoint: "pantalla Full Touch de 10 pulgadas y modo muy visual",
    idealFor: "quien prioriza experiencia de uso sobre precio final",
    priceSeen: "549,99 EUR",
    rating: "4,1/5 (641 valoraciones)",
    keyFeatures: [
      "pantalla tactil de 10 pulgadas",
      "30 funciones",
      "WiFi y recetas guiadas",
      "15 programas automaticos",
      "jarra de 4,5 L (3 L utiles)",
      "bascula integrada",
    ],
    pros: [
      "interfaz grande y muy comoda",
      "planteamiento premium para cocina guiada",
      "buena propuesta para quien cocina con receta",
    ],
    cons: [
      "es el mas caro de la comparativa",
      "queda fuera de un enfoque de ahorro estricto",
    ],
    miniReview:
      "Es una buena maquina para quien quiere experiencia de pantalla grande y control visual, pero no es la opcion natural si tu objetivo principal es pagar menos.",
    affiliateUrl:
      "https://www.amazon.es/Ufesa-Multifunci%C3%B3n-Inteligente-Interactiva-Accesorios/dp/B0FKT6CZPN?crid=1628EY8EP9YAC&dib=eyJ2IjoiMSJ9.13pWktvSSVlyu6AH2h6cRIytR1GDMKCNihFzPMOGOYaGQgrPoCKQ-KaFsWzw4ZiwZ96jGr0pU43Ujp5ZczbdIXJMQpOh5l4-IlQRPJwVutwDRDmAYebg3ZHy-UNTdD3fqDnp9K_fOujAEjU44C0mc3uPQXT-Pkbzr30ATN3bxmiGpsaULxn9lmKbxkJdHYnWBPcRDpQm5qg43eB-uIA71Rz3PPvunxoAhEGeg0gHOKWSXUHtOBxe1lZoD7aTG1P93MRdLDR9Zp78ENWNAnyinkMBj8pJ0DnYEtatNPzdks0.JUoAiRJzDUYwASpE53V25T-vNWHLdPAHRWEPbWlAVnk&dib_tag=se&keywords=robot%2Bde%2Bcocina&qid=1776613042&sprefix=robo%2Caps%2C145&sr=8-23&ufe=app_do%3Aamzn1.fos.4c3f56c3-e485-4a35-9abc-6532b61c3b62&th=1&linkCode=ll2&tag=ahorrhogar-21&linkId=f479fd1f974233e7934782cd471b7a1a&ref_=as_li_ss_tl",
    imageUrl: "https://m.media-amazon.com/images/I/61Z3mCCETKL._AC_SX425_.jpg",
  },
];

const faqs = [
  {
    q: "Cual es la mejor alternativa a Thermomix calidad-precio?",
    a: "Por equilibrio global de funciones y coste, el Cecotec Mambo 11090 es de las opciones mas solidas de esta comparativa.",
  },
  {
    q: "Hay alternativas a Thermomix por menos de 100 EUR?",
    a: "En esta seleccion aparece NEWLUX SmartChef V50, una opcion muy economica para cocina diaria basica.",
  },
  {
    q: "Que modelo es mejor si quiero pantalla grande?",
    a: "Entre estos cinco, Ufesa RK10 destaca por pantalla de 10 pulgadas; RK7 tambien ofrece una buena experiencia tactil con 7 pulgadas.",
  },
  {
    q: "Merece la pena pagar mas por WiFi y recetas guiadas?",
    a: "Si te apoyas en recetas paso a paso, si suele marcar diferencia. Si cocinas de memoria, puede no ser imprescindible.",
  },
];

const BestThermomixAlternatives2026Page = () => {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDescriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = previousDescriptionTag?.getAttribute("content") || "";

    document.title = "Mejores robots de cocina baratos: 5 alternativas a Thermomix | Homara";

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
      "Comparativa editorial de 5 alternativas a Thermomix con precio visto, caracteristicas clave, pros, contras y recomendacion final para comprar mejor.",
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
              { label: "Alternativas a Thermomix" },
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
                Mejores robots de cocina baratos: 5 alternativas a Thermomix con muy buena relacion calidad-precio
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Si estas buscando alternativas a Thermomix con intencion de compra real, esta comparativa te ahorra
                tiempo: que ofrece cada robot, para quien encaja y que compromisos tiene antes de pagar.
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
            <p className="mt-2 text-sm text-muted-foreground">
              Tabla rapida para comparar en minutos antes de entrar al analisis de cada modelo.
            </p>

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
                  {robots.map((product) => (
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
              {robots.map((product) => (
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

            {robots.map((product) => (
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
                      <p className="rounded-lg bg-secondary px-3 py-2 text-xs text-foreground">Ideal: {product.idealFor}</p>
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
                    <span className="font-semibold">Veredicto Homara:</span> {product.strongPoint}. Es una compra que
                    encaja especialmente para {product.idealFor}.
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
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
              Que tener en cuenta antes de comprar
            </h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">1) Define tu uso real</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  No necesita lo mismo quien quiere preparar menu diario que quien solo hace guisos de fin de semana.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">2) Mira capacidad util, no solo maxima</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  La capacidad comercial no siempre equivale a la cantidad real que podras cocinar en cada receta.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">3) Revisa ecosistema de recetas</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  En robots conectados, el valor no esta solo en el hardware, tambien en la calidad del recetario.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">
                <p className="text-sm font-semibold text-foreground">4) Piensa en limpieza y mantenimiento</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Accesorios aptos para lavavajillas y cambio rapido de piezas ahorran mucho tiempo semana tras semana.
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
                to="/categoria/electrodomesticos-y-cocina"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Electrodomesticos y Cocina</p>
                <p className="mt-1 text-sm text-muted-foreground">Mas comparativas y productos de cocina para seguir decidiendo.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ir a categoria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/categoria/electrodomesticos-pequenos"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Electrodomesticos Pequenos</p>
                <p className="mt-1 text-sm text-muted-foreground">Explora robots, cafeteras y pequeno electrodomestico para hogar.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ir a categoria <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/articulos/mejores-cafeteras-superautomaticas-2026"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Comparativa de cafeteras superautomaticas</p>
                <p className="mt-1 text-sm text-muted-foreground">Si ademas de cocinar quieres mejorar tu cafe, esta guia te interesa.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Ver guia <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <Link
                to="/asistente"
                className="group rounded-xl border border-border bg-background p-4 hover:border-accent/40"
              >
                <p className="text-sm font-semibold text-foreground">Asistente de compra Homara</p>
                <p className="mt-1 text-sm text-muted-foreground">Recibe recomendacion personalizada segun presupuesto y tipo de cocina.</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  Abrir asistente <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-2xl border border-accent/35 bg-accent/10 p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">Conclusion editorial</h2>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              Si quieres ir a tiro seguro en calidad-precio, Mambo 11090 es la apuesta mas equilibrada. Si prefieres
              experiencia de pantalla y cocina guiada, RK7 o Mambo Touch tienen sentido. Y si el presupuesto manda, NEWLUX
              V50 es una puerta de entrada muy clara.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground md:text-base">
              En resumen: la mejor alternativa a Thermomix no es la mas cara ni la mas barata, sino la que encaja con tu
              rutina real de cocina.
            </p>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">CTA final</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Si aun dudas entre dos modelos, continua comparando por tipo de uso y presupuesto dentro de Homara.
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
            </div>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BestThermomixAlternatives2026Page;
