export type ArticleStatus = "published" | "draft" | "inactive";

export type ArticleIntent =
  | "comparativa"
  | "calidad-precio"
  | "ahorro"
  | "premium"
  | "guia-practica";

export type ArticleSortBy = "recent" | "popular" | "reading-time" | "budget-asc" | "budget-desc";

export type BudgetRangeFilter = "all" | "under-100" | "100-300" | "300-plus";

export interface ArticleSection {
  heading: string;
  body: string;
}

export interface EditorialArticle {
  id: string;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverTone: "warm" | "fresh" | "calm" | "contrast";
  categorySlug: string;
  categoryName: string;
  intent: ArticleIntent;
  tags: string[];
  readMinutes: number;
  averageBudget?: number;
  relatedCategorySlugs: string[];
  relatedProductSlugs: string[];
  publishedAt: string;
  updatedAt?: string;
  views: number;
  isFeatured: boolean;
  status: ArticleStatus;
  sections: ArticleSection[];
}

export interface ArticleFilters {
  query?: string;
  categorySlug?: string;
  intent?: ArticleIntent | "all";
  budgetRange?: BudgetRangeFilter;
}

export interface ArticleCategoryFilterOption {
  slug: string;
  label: string;
  count: number;
}

export interface ArticleFilterOptions {
  categories: ArticleCategoryFilterOption[];
  intents: Array<{ value: ArticleIntent; label: string }>;
  budgetRanges: Array<{ value: BudgetRangeFilter; label: string }>;
}
