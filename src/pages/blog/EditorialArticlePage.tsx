import { useEffect } from "react";
import { ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { editorialService } from "@/services";
import { editorialTrackingService } from "@/services/editorialTrackingService";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

const EditorialArticlePage = () => {
  const { slug = "" } = useParams();
  const articleQuery = useQuery({
    queryKey: ["editorial-article", slug],
    queryFn: () => editorialService.getArticleBySlugLive(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });

  const article = articleQuery.data;

  useEffect(() => {
    if (!article?.slug) {
      return;
    }

    void editorialTrackingService.trackArticleView({
      slug: article.slug,
      path: article.path,
    });
  }, [article?.slug, article?.path]);

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const previousDescription = descriptionTag?.getAttribute("content") || "";

    if (article) {
      document.title = `${article.title} | Homara`;

      if (descriptionTag) {
        descriptionTag.setAttribute("content", article.excerpt);
      }

      const scriptId = "homara-editorial-article-schema";
      const previousScript = document.getElementById(scriptId);
      if (previousScript) {
        previousScript.remove();
      }

      const schemaNode = document.createElement("script");
      schemaNode.id = scriptId;
      schemaNode.type = "application/ld+json";
      schemaNode.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        author: {
          "@type": "Organization",
          name: "Homara",
        },
        mainEntityOfPage: `https://homara.es${article.path}`,
      });

      document.head.appendChild(schemaNode);

      return () => {
        document.title = previousTitle;
        if (descriptionTag) {
          descriptionTag.setAttribute("content", previousDescription);
        }
        schemaNode.remove();
      };
    }

    document.title = "Articulo no encontrado | Homara";
    if (descriptionTag) {
      descriptionTag.setAttribute("content", "No encontramos el articulo solicitado. Descubre mas guias de compra en Homara.");
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag) {
        descriptionTag.setAttribute("content", previousDescription);
      }
    };
  }, [article]);

  if (articleQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Cargando articulo...</h1>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8 text-center">
            <h1 className="font-display text-2xl font-bold">Articulo no disponible</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Puede que el contenido se haya movido o aun no este publicado. Puedes volver al indice editorial.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/guias">Ir al indice de guias</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/buscar">Buscar productos</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pb-14">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumb
            items={[
              { label: "Guias", href: "/guias" },
              { label: article.title },
            ]}
          />
        </div>

        <article className="container mx-auto px-4">
          <header className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary to-card p-6 md:p-10">
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge>{article.categoryName}</Badge>
                <Badge variant="outline">{article.intent}</Badge>
              </div>

              <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">{article.title}</h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{article.excerpt}</p>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(article.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="h-4 w-4" />
                  {article.readMinutes} min de lectura
                </span>
              </div>
            </div>
          </header>

          <div className="mx-auto mt-8 grid max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
            <section className="space-y-4">
              {article.sections.map((section) => (
                <div key={section.heading} className="rounded-2xl border border-border bg-card p-5">
                  <h2 className="font-display text-xl font-bold">{section.heading}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{section.body}</p>
                </div>
              ))}
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-semibold">Relacionados</h3>
                <div className="mt-3 space-y-2">
                  {article.relatedCategorySlugs.slice(0, 3).map((categorySlug) => (
                    <Link
                      key={categorySlug}
                      to={`/categoria/${categorySlug}`}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
                    >
                      <span>Ver categoria {categorySlug}</span>
                      <ArrowRight className="h-4 w-4 text-accent" />
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <h3 className="font-semibold">Siguiente paso</h3>
                <p className="mt-2 text-sm text-muted-foreground">Compara precios y ofertas activas para aplicar esta guia en una compra real.</p>
                <Button asChild className="mt-3 w-full">
                  <Link to="/buscar">Comparar productos</Link>
                </Button>
              </div>
            </aside>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default EditorialArticlePage;
