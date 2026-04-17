import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Compass,
  Filter,
  Flame,
  Layers,
  ListOrdered,
  Search,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/layout/Breadcrumb";
import EditorialArticleCard from "@/components/editorial/EditorialArticleCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { ArticleIntent, ArticleSortBy, BudgetRangeFilter } from "@/domain/editorial/types";
import { categoryService, editorialService, productService } from "@/services";

const PAGE_TITLE = "Guias de compra para hogar | Homara";
const PAGE_DESCRIPTION =
  "Indice editorial de Homara con comparativas, guias de compra y seleccion de productos para hogar. Filtra por categoria, intencion y presupuesto.";
const PAGE_CANONICAL = "https://homara.es/guias";

const sortOptions: Array<{ value: ArticleSortBy; label: string }> = [
  { value: "recent", label: "Mas recientes" },
  { value: "popular", label: "Mas leidos" },
  { value: "reading-time", label: "Lectura mas corta" },
  { value: "budget-asc", label: "Presupuesto mas bajo" },
  { value: "budget-desc", label: "Presupuesto mas alto" },
];

function formatCompactDate(value: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function ensureMetaTag(selector: string, create: () => HTMLElement): HTMLElement {
  const existing = document.head.querySelector(selector);
  if (existing) {
    return existing as HTMLElement;
  }

  const created = create();
  document.head.appendChild(created);
  return created;
}

const ArticlesHubPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState<string>("all");
  const [intent, setIntent] = useState<ArticleIntent | "all">("all");
  const [budgetRange, setBudgetRange] = useState<BudgetRangeFilter>("all");
  const [sortBy, setSortBy] = useState<ArticleSortBy>("recent");
  const [visibleCount, setVisibleCount] = useState(9);

  const filterOptions = useMemo(() => editorialService.getFilterOptions(), []);
  const featuredBase = useMemo(() => editorialService.getFeaturedArticles(6), []);
  const mostRead = useMemo(() => editorialService.getMostReadArticles(6), []);
  const latest = useMemo(() => editorialService.getLatestArticles(6), []);
  const allPublished = useMemo(() => editorialService.getPublishedArticles(), []);
  const trendingCategories = useMemo(() => categoryService.getTrendingCategories().slice(0, 4), []);
  const quickDealProducts = useMemo(() => productService.getDealProducts(3), []);

  const featuredArticles = useMemo(() => {
    if (featuredBase.length >= 3) {
      return featuredBase;
    }

    const fallback = mostRead.filter((candidate) => !featuredBase.some((entry) => entry.id === candidate.id));
    return [...featuredBase, ...fallback].slice(0, 6);
  }, [featuredBase, mostRead]);

  useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, categorySlug, intent, budgetRange, sortBy]);

  useEffect(() => {
    const previousTitle = document.title;

    const descriptionTag = ensureMetaTag('meta[name="description"]', () => {
      const node = document.createElement("meta");
      node.setAttribute("name", "description");
      return node;
    }) as HTMLMetaElement;

    const ogTitleTag = ensureMetaTag('meta[property="og:title"]', () => {
      const node = document.createElement("meta");
      node.setAttribute("property", "og:title");
      return node;
    }) as HTMLMetaElement;

    const ogDescriptionTag = ensureMetaTag('meta[property="og:description"]', () => {
      const node = document.createElement("meta");
      node.setAttribute("property", "og:description");
      return node;
    }) as HTMLMetaElement;

    const canonicalTag = ensureMetaTag('link[rel="canonical"]', () => {
      const node = document.createElement("link");
      node.setAttribute("rel", "canonical");
      return node;
    }) as HTMLLinkElement;

    const previousDescription = descriptionTag.getAttribute("content") || "";
    const previousOgTitle = ogTitleTag.getAttribute("content") || "";
    const previousOgDescription = ogDescriptionTag.getAttribute("content") || "";
    const previousCanonical = canonicalTag.getAttribute("href") || "";

    document.title = PAGE_TITLE;
    descriptionTag.setAttribute("content", PAGE_DESCRIPTION);
    ogTitleTag.setAttribute("content", PAGE_TITLE);
    ogDescriptionTag.setAttribute("content", PAGE_DESCRIPTION);
    canonicalTag.setAttribute("href", PAGE_CANONICAL);

    const scriptId = "homara-guides-index-schema";
    const previousScript = document.getElementById(scriptId);
    if (previousScript) {
      previousScript.remove();
    }

    const schemaNode = document.createElement("script");
    schemaNode.id = scriptId;
    schemaNode.type = "application/ld+json";
    schemaNode.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      url: PAGE_CANONICAL,
      mainEntity: {
        "@type": "ItemList",
        itemListElement: allPublished.slice(0, 20).map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `https://homara.es${article.path}`,
          name: article.title,
        })),
      },
    });
    document.head.appendChild(schemaNode);

    return () => {
      document.title = previousTitle;
      descriptionTag.setAttribute("content", previousDescription);
      ogTitleTag.setAttribute("content", previousOgTitle);
      ogDescriptionTag.setAttribute("content", previousOgDescription);
      canonicalTag.setAttribute("href", previousCanonical);
      schemaNode.remove();
    };
  }, [allPublished]);

  const feedQuery = useQuery({
    queryKey: ["editorial-feed", searchQuery, categorySlug, intent, budgetRange, sortBy],
    queryFn: () =>
      editorialService.getArticlesFeed({
        filters: {
          query: searchQuery,
          categorySlug,
          intent,
          budgetRange,
        },
        sortBy,
      }),
    staleTime: 60_000,
  });

  const filteredArticles = feedQuery.data || [];
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="flex-1 pb-16">
        <div className="container mx-auto px-4 py-2">
          <Breadcrumb items={[{ label: "Guias de compra" }]} />
        </div>

        <section className="relative overflow-hidden border-y border-border bg-gradient-to-b from-emerald-50/65 via-background to-background">
          <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-emerald-200/30 blur-3xl" aria-hidden="true" />
          <div className="absolute -right-20 bottom-4 h-64 w-64 rounded-full bg-sky-200/25 blur-3xl" aria-hidden="true" />

          <div className="container relative mx-auto px-4 py-10 md:py-14">
            <div className="max-w-4xl">
              <Badge className="mb-4 bg-primary text-primary-foreground">Indice editorial Homara</Badge>
              <h1 className="font-display text-3xl font-bold leading-tight md:text-5xl">
                Guias de compra para elegir mejor, comparar rapido y convertir con confianza
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Encuentra comparativas, guias practicas y contenidos de intencion transaccional para hogar.
                Filtra por categoria, objetivo de compra y presupuesto medio para ir directo al articulo correcto.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <div className="rounded-xl border border-border bg-card px-4 py-2">
                  <span className="font-semibold">{allPublished.length}</span> articulos publicados
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-2">
                  <span className="font-semibold">{filterOptions.categories.length}</span> categorias activas
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-2">
                  Actualizacion editorial semanal
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pt-10">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-display text-2xl font-bold md:text-3xl">Articulos destacados</h2>
            </div>
            <Link to="/buscar?q=guia+de+compra" className="text-sm font-semibold text-accent hover:underline">
              Explorar mas tendencias
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredArticles.slice(0, 6).map((article) => (
              <EditorialArticleCard key={article.id} article={article} compact />
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pt-10">
          <div className="rounded-2xl border border-border bg-card p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Afinar resultados editoriales
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Busca por tema, marca o necesidad"
                  className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none ring-accent/30 transition focus:ring-2"
                />
              </label>

              <select
                value={categorySlug}
                onChange={(event) => setCategorySlug(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent/30 transition focus:ring-2"
              >
                <option value="all">Todas las categorias</option>
                {filterOptions.categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.label} ({category.count})
                  </option>
                ))}
              </select>

              <select
                value={intent}
                onChange={(event) => setIntent(event.target.value as ArticleIntent | "all")}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent/30 transition focus:ring-2"
              >
                <option value="all">Toda intencion</option>
                {filterOptions.intents.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={budgetRange}
                onChange={(event) => setBudgetRange(event.target.value as BudgetRangeFilter)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent/30 transition focus:ring-2"
              >
                {filterOptions.budgetRanges.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as ArticleSortBy)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none ring-accent/30 transition focus:ring-2"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {feedQuery.isLoading ? "Cargando articulos..." : `${filteredArticles.length} articulos encontrados`}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setCategorySlug("all");
                  setIntent("all");
                  setBudgetRange("all");
                  setSortBy("recent");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto grid gap-8 px-4 pt-8 lg:grid-cols-[1fr_320px]">
          <div>
            {feedQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl border border-border bg-card p-4">
                    <Skeleton className="h-36 w-full" />
                    <Skeleton className="mt-4 h-5 w-5/6" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-4/5" />
                    <Skeleton className="mt-4 h-9 w-32" />
                  </div>
                ))}
              </div>
            ) : null}

            {!feedQuery.isLoading && filteredArticles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
                <Compass className="mx-auto h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-display text-xl font-bold">No encontramos articulos con esos filtros</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Prueba otra categoria, elimina filtros o busca por una necesidad concreta como "ahorro" o "comparativa".
                </p>
                <Button
                  type="button"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setCategorySlug("all");
                    setIntent("all");
                    setBudgetRange("all");
                    setSortBy("recent");
                  }}
                >
                  Ver todos los articulos
                </Button>
              </div>
            ) : null}

            {!feedQuery.isLoading && visibleArticles.length > 0 ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {visibleArticles.map((article) => (
                    <EditorialArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {hasMore ? (
                  <div className="mt-6 flex justify-center">
                    <Button type="button" variant="outline" onClick={() => setVisibleCount((current) => current + 6)}>
                      Cargar mas articulos
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Flame className="h-4 w-4 text-accent" />
                Mas leidos
              </h3>
              <div className="space-y-3">
                {mostRead.slice(0, 4).map((article, index) => (
                  <Link key={article.id} to={article.path} className="block rounded-lg border border-transparent p-2 hover:border-border hover:bg-secondary/60">
                    <p className="text-xs font-semibold text-accent">#{index + 1}</p>
                    <p className="text-sm font-medium leading-snug">{article.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatCompactDate(article.publishedAt)}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <ListOrdered className="h-4 w-4 text-accent" />
                Recien publicados
              </h3>
              <div className="space-y-3">
                {latest.slice(0, 4).map((article) => (
                  <Link key={article.id} to={article.path} className="block rounded-lg border border-transparent p-2 hover:border-border hover:bg-secondary/60">
                    <p className="text-sm font-medium leading-snug">{article.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{article.readMinutes} min de lectura</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <SlidersHorizontal className="h-4 w-4 text-accent" />
                Accesos rapidos
              </h3>
              <div className="flex flex-wrap gap-2">
                {filterOptions.intents.slice(0, 4).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setIntent(option.value)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-semibold hover:bg-secondary"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="container mx-auto grid gap-4 px-4 pt-10 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <Layers className="h-5 w-5 text-accent" />
              Colecciones por categoria
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {trendingCategories.map((entry) => (
                <Link
                  key={entry.category.id}
                  to={`/categoria/${entry.category.slug}`}
                  className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-secondary/60"
                >
                  <p className="font-semibold">{entry.category.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{entry.totalReviews.toLocaleString("es-ES")} valoraciones acumuladas</p>
                  <p className="mt-2 text-xs text-accent">Ver productos destacados</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
              <TrendingUp className="h-5 w-5 text-accent" />
              Oportunidades de compra
            </h3>
            <div className="space-y-3">
              {quickDealProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/producto/${product.slug}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-background p-3 hover:bg-secondary/60"
                >
                  <div>
                    <p className="text-sm font-semibold">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Desde {product.minPrice.toLocaleString("es-ES")} EUR</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-accent" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pt-10">
          <div className="rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-emerald-200/25 to-sky-200/25 p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Sigue descubriendo productos con enfoque editorial</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Si ya tienes una necesidad concreta, usa el asistente de compra para afinar presupuesto y prioridades.
              Si prefieres explorar, visita el buscador para comparar precios entre tiendas.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/asistente"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                Ir al asistente
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
              >
                Buscar productos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ArticlesHubPage;
