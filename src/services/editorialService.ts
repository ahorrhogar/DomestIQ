import { editorialStaticSource } from "@/data/sources/editorialStaticSource";
import { filterArticles, sortArticles } from "@/domain/editorial/article-logic";
import { getSupabaseClient } from "@/integrations/supabase/client";
import type {
  ArticleFilterOptions,
  ArticleFilters,
  ArticleSortBy,
  ArticleStatus,
  EditorialArticle,
} from "@/domain/editorial/types";

export interface EditorialFeedOptions {
  filters?: ArticleFilters;
  sortBy?: ArticleSortBy;
  limit?: number;
}

export interface EditorialService {
  getPublishedArticles(): EditorialArticle[];
  getArticleBySlug(slug: string): EditorialArticle | undefined;
  getFeaturedArticles(limit?: number): EditorialArticle[];
  getMostReadArticles(limit?: number): EditorialArticle[];
  getLatestArticles(limit?: number): EditorialArticle[];
  getArticlesFeed(options?: EditorialFeedOptions): EditorialArticle[];
  getFilterOptions(): ArticleFilterOptions;
  getPublishedArticlesLive(): Promise<EditorialArticle[]>;
  getArticleBySlugLive(slug: string): Promise<EditorialArticle | undefined>;
  getFeaturedArticlesLive(limit?: number): Promise<EditorialArticle[]>;
  getMostReadArticlesLive(limit?: number): Promise<EditorialArticle[]>;
  getLatestArticlesLive(limit?: number): Promise<EditorialArticle[]>;
  getArticlesFeedLive(options?: EditorialFeedOptions): Promise<EditorialArticle[]>;
  getFilterOptionsLive(): Promise<ArticleFilterOptions>;
}

interface EditorialArticleRow {
  id: string;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  cover_tone: "warm" | "fresh" | "calm" | "contrast";
  category_slug: string;
  category_name: string;
  intent: EditorialArticle["intent"];
  tags: string[] | null;
  read_minutes: number;
  average_budget: number | null;
  related_category_slugs: string[] | null;
  related_product_slugs: string[] | null;
  published_at: string | null;
  updated_at: string;
  views_count: number | null;
  is_featured: boolean;
  status: ArticleStatus;
  sections: Array<{ heading?: string; body?: string }> | null;
}

const INTENT_LABELS: ArticleFilterOptions["intents"] = [
  { value: "comparativa", label: "Comparativa" },
  { value: "calidad-precio", label: "Mejor calidad-precio" },
  { value: "ahorro", label: "Ahorro" },
  { value: "premium", label: "Gama alta" },
  { value: "guia-practica", label: "Guia practica" },
];

const BUDGET_LABELS: ArticleFilterOptions["budgetRanges"] = [
  { value: "all", label: "Todos los presupuestos" },
  { value: "under-100", label: "Menos de 100 EUR" },
  { value: "100-300", label: "Entre 100 y 300 EUR" },
  { value: "300-plus", label: "Mas de 300 EUR" },
];

const EDITORIAL_LIVE_CACHE_TTL_MS = 10 * 60 * 1000;

interface EditorialLiveCacheEntry {
  articles: EditorialArticle[];
  fetchedAt: number;
}

let editorialLiveCacheEntry: EditorialLiveCacheEntry | null = null;
let editorialLiveCacheRefreshPromise: Promise<EditorialArticle[]> | null = null;

function getEditorialLiveCacheSnapshot(): EditorialLiveCacheEntry | null {
  return editorialLiveCacheEntry;
}

function setEditorialLiveCache(articles: EditorialArticle[]): EditorialArticle[] {
  editorialLiveCacheEntry = {
    articles,
    fetchedAt: Date.now(),
  };

  return articles;
}

function isEditorialLiveCacheFresh(entry: EditorialLiveCacheEntry): boolean {
  return Date.now() - entry.fetchedAt < EDITORIAL_LIVE_CACHE_TTL_MS;
}

export function invalidateEditorialLiveCache(): void {
  editorialLiveCacheEntry = null;
}

class StaticEditorialService implements EditorialService {
  private getSourceArticles(): EditorialArticle[] {
    return editorialStaticSource.getArticles();
  }

  private mapRowToArticle(row: EditorialArticleRow): EditorialArticle {
    const sectionsRaw = Array.isArray(row.sections) ? row.sections : [];

    return {
      id: String(row.id),
      slug: String(row.slug),
      path: String(row.path),
      title: String(row.title),
      excerpt: String(row.excerpt),
      coverImage: row.cover_image || undefined,
      coverImageAlt: row.cover_image_alt || undefined,
      coverTone: row.cover_tone || "fresh",
      categorySlug: String(row.category_slug),
      categoryName: String(row.category_name),
      intent: row.intent,
      tags: Array.isArray(row.tags) ? row.tags.filter(Boolean).map(String) : [],
      readMinutes: Math.max(1, Number(row.read_minutes || 1)),
      averageBudget: typeof row.average_budget === "number" ? row.average_budget : undefined,
      relatedCategorySlugs: Array.isArray(row.related_category_slugs)
        ? row.related_category_slugs.filter(Boolean).map(String)
        : [],
      relatedProductSlugs: Array.isArray(row.related_product_slugs)
        ? row.related_product_slugs.filter(Boolean).map(String)
        : [],
      publishedAt: row.published_at || row.updated_at,
      updatedAt: row.updated_at,
      views: Math.max(0, Number(row.views_count || 0)),
      isFeatured: Boolean(row.is_featured),
      status: row.status,
      sections: sectionsRaw
        .map((section) => ({
          heading: String(section.heading || "").trim(),
          body: String(section.body || "").trim(),
        }))
        .filter((section) => Boolean(section.heading) && Boolean(section.body)),
    };
  }

  private async getRemoteArticles(): Promise<EditorialArticle[] | null> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from("editorial_articles")
        .select(
          "id,slug,path,title,excerpt,cover_image,cover_image_alt,cover_tone,category_slug,category_name,intent,tags,read_minutes,average_budget,related_category_slugs,related_product_slugs,published_at,updated_at,views_count,is_featured,status,sections",
        )
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false });

      if (error) {
        return null;
      }

      return (data || []).map((row) => this.mapRowToArticle(row as EditorialArticleRow));
    } catch {
      return null;
    }
  }

  private async refreshLiveCache(): Promise<EditorialArticle[]> {
    if (editorialLiveCacheRefreshPromise) {
      return editorialLiveCacheRefreshPromise;
    }

    editorialLiveCacheRefreshPromise = (async () => {
      const remote = await this.getRemoteArticles();
      if (remote && remote.length > 0) {
        return setEditorialLiveCache(remote);
      }

      return setEditorialLiveCache(this.getSourceArticles());
    })();

    try {
      return await editorialLiveCacheRefreshPromise;
    } finally {
      editorialLiveCacheRefreshPromise = null;
    }
  }

  private async getLiveSourceArticles(): Promise<EditorialArticle[]> {
    const cacheSnapshot = getEditorialLiveCacheSnapshot();

    if (cacheSnapshot) {
      if (!isEditorialLiveCacheFresh(cacheSnapshot)) {
        void this.refreshLiveCache();
      }

      return cacheSnapshot.articles;
    }

    return this.refreshLiveCache();
  }

  getPublishedArticles(): EditorialArticle[] {
    return this.getSourceArticles()
      .filter((article) => article.status === "published")
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
  }

  getArticleBySlug(slug: string): EditorialArticle | undefined {
    return this.getPublishedArticles().find((article) => article.slug === slug);
  }

  getFeaturedArticles(limit = 6): EditorialArticle[] {
    return this.getPublishedArticles()
      .filter((article) => article.isFeatured)
      .sort((left, right) => right.views - left.views)
      .slice(0, limit);
  }

  getMostReadArticles(limit = 6): EditorialArticle[] {
    return [...this.getPublishedArticles()]
      .sort((left, right) => right.views - left.views)
      .slice(0, limit);
  }

  getLatestArticles(limit = 6): EditorialArticle[] {
    return [...this.getPublishedArticles()]
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
      .slice(0, limit);
  }

  getArticlesFeed(options: EditorialFeedOptions = {}): EditorialArticle[] {
    const { filters = {}, sortBy = "recent", limit } = options;
    const filtered = filterArticles(this.getPublishedArticles(), filters);
    const sorted = sortArticles(filtered, sortBy);
    if (typeof limit === "number") {
      return sorted.slice(0, limit);
    }
    return sorted;
  }

  getFilterOptions(): ArticleFilterOptions {
    const categoriesBySlug = new Map<string, { slug: string; label: string; count: number }>();

    this.getPublishedArticles().forEach((article) => {
      const existing = categoriesBySlug.get(article.categorySlug);
      if (existing) {
        existing.count += 1;
      } else {
        categoriesBySlug.set(article.categorySlug, {
          slug: article.categorySlug,
          label: article.categoryName,
          count: 1,
        });
      }
    });

    const categories = [...categoriesBySlug.values()].sort((left, right) => right.count - left.count);

    return {
      categories,
      intents: INTENT_LABELS,
      budgetRanges: BUDGET_LABELS,
    };
  }

  async getPublishedArticlesLive(): Promise<EditorialArticle[]> {
    return (await this.getLiveSourceArticles())
      .filter((article) => article.status === "published")
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
  }

  async getArticleBySlugLive(slug: string): Promise<EditorialArticle | undefined> {
    return (await this.getPublishedArticlesLive()).find((article) => article.slug === slug);
  }

  async getFeaturedArticlesLive(limit = 6): Promise<EditorialArticle[]> {
    return (await this.getPublishedArticlesLive())
      .filter((article) => article.isFeatured)
      .sort((left, right) => right.views - left.views)
      .slice(0, limit);
  }

  async getMostReadArticlesLive(limit = 6): Promise<EditorialArticle[]> {
    return [...(await this.getPublishedArticlesLive())]
      .sort((left, right) => right.views - left.views)
      .slice(0, limit);
  }

  async getLatestArticlesLive(limit = 6): Promise<EditorialArticle[]> {
    return [...(await this.getPublishedArticlesLive())]
      .sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt))
      .slice(0, limit);
  }

  async getArticlesFeedLive(options: EditorialFeedOptions = {}): Promise<EditorialArticle[]> {
    const { filters = {}, sortBy = "recent", limit } = options;
    const filtered = filterArticles(await this.getPublishedArticlesLive(), filters);
    const sorted = sortArticles(filtered, sortBy);
    if (typeof limit === "number") {
      return sorted.slice(0, limit);
    }
    return sorted;
  }

  async getFilterOptionsLive(): Promise<ArticleFilterOptions> {
    const categoriesBySlug = new Map<string, { slug: string; label: string; count: number }>();

    (await this.getPublishedArticlesLive()).forEach((article) => {
      const existing = categoriesBySlug.get(article.categorySlug);
      if (existing) {
        existing.count += 1;
      } else {
        categoriesBySlug.set(article.categorySlug, {
          slug: article.categorySlug,
          label: article.categoryName,
          count: 1,
        });
      }
    });

    const categories = [...categoriesBySlug.values()].sort((left, right) => right.count - left.count);

    return {
      categories,
      intents: INTENT_LABELS,
      budgetRanges: BUDGET_LABELS,
    };
  }
}

export const editorialService: EditorialService = new StaticEditorialService();
