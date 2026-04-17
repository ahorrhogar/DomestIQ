import type {
  ArticleFilters,
  ArticleSortBy,
  BudgetRangeFilter,
  EditorialArticle,
} from "@/domain/editorial/types";

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesBudgetRange(averageBudget: number | undefined, budgetRange: BudgetRangeFilter): boolean {
  if (budgetRange === "all") {
    return true;
  }

  if (typeof averageBudget !== "number") {
    return false;
  }

  if (budgetRange === "under-100") {
    return averageBudget < 100;
  }

  if (budgetRange === "100-300") {
    return averageBudget >= 100 && averageBudget <= 300;
  }

  return averageBudget > 300;
}

export function filterArticles(articles: EditorialArticle[], filters: ArticleFilters): EditorialArticle[] {
  const normalizedQuery = normalizeSearchValue(filters.query || "");
  const categoryFilter = (filters.categorySlug || "all").toLowerCase();
  const intentFilter = filters.intent || "all";
  const budgetRange = filters.budgetRange || "all";

  return articles.filter((article) => {
    if (categoryFilter !== "all" && article.categorySlug.toLowerCase() !== categoryFilter) {
      return false;
    }

    if (intentFilter !== "all" && article.intent !== intentFilter) {
      return false;
    }

    if (!matchesBudgetRange(article.averageBudget, budgetRange)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchable = normalizeSearchValue(
      [article.title, article.excerpt, article.categoryName, article.tags.join(" "), article.intent].join(" "),
    );

    return searchable.includes(normalizedQuery);
  });
}

export function sortArticles(articles: EditorialArticle[], sortBy: ArticleSortBy): EditorialArticle[] {
  const sorted = [...articles];

  sorted.sort((left, right) => {
    if (sortBy === "popular") {
      return right.views - left.views || right.readMinutes - left.readMinutes;
    }

    if (sortBy === "reading-time") {
      return left.readMinutes - right.readMinutes || right.views - left.views;
    }

    if (sortBy === "budget-asc") {
      const leftBudget = left.averageBudget ?? Number.POSITIVE_INFINITY;
      const rightBudget = right.averageBudget ?? Number.POSITIVE_INFINITY;
      return leftBudget - rightBudget || right.views - left.views;
    }

    if (sortBy === "budget-desc") {
      const leftBudget = left.averageBudget ?? Number.NEGATIVE_INFINITY;
      const rightBudget = right.averageBudget ?? Number.NEGATIVE_INFINITY;
      return rightBudget - leftBudget || right.views - left.views;
    }

    return Date.parse(right.publishedAt) - Date.parse(left.publishedAt);
  });

  return sorted;
}
