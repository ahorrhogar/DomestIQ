import { editorialStaticSource } from "@/data/sources/editorialStaticSource";
import { filterArticles, sortArticles } from "@/domain/editorial/article-logic";
import type {
  ArticleFilterOptions,
  ArticleFilters,
  ArticleSortBy,
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

class StaticEditorialService implements EditorialService {
  private getSourceArticles(): EditorialArticle[] {
    return editorialStaticSource.getArticles();
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
}

export const editorialService: EditorialService = new StaticEditorialService();
