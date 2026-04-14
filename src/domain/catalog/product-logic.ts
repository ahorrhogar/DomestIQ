import type {
  PriceAnalysis,
  PriceHistory,
  Product,
  ProductFilters,
  ProductSortBy,
} from "@/domain/catalog/types";

const MAX_VALID_DISCOUNT_PERCENT = 60;

export function computeDiscountPercent(product: Pick<Product, "minPrice" | "originalPrice">): number | null {
  if (!product.originalPrice || product.originalPrice <= product.minPrice) {
    return null;
  }

  const percent = Math.round(((product.originalPrice - product.minPrice) / product.originalPrice) * 100);
  return percent > 0 && percent <= MAX_VALID_DISCOUNT_PERCENT ? percent : null;
}

export function sortProducts(products: Product[], sortBy: ProductSortBy): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "price-asc":
      return sorted.sort((a, b) => a.minPrice - b.minPrice);
    case "price-desc":
      return sorted.sort((a, b) => b.minPrice - a.minPrice);
    case "discount":
      return sorted.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
    case "popular":
    default:
      return sorted.sort((a, b) => b.reviewCount - a.reviewCount);
  }
}

function withinRange(value: number, min?: number, max?: number): boolean {
  if (min !== undefined && value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  return true;
}

function hasMatch(value: string | undefined, selected?: string[]): boolean {
  if (!selected || selected.length === 0) {
    return true;
  }

  if (!value) {
    return false;
  }

  return selected.includes(value);
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false;
    }

    if (filters.subcategoryId && product.subcategoryId !== filters.subcategoryId) {
      return false;
    }

    if (!withinRange(product.minPrice, filters.minPrice, filters.maxPrice)) {
      return false;
    }

    if (!hasMatch(product.brand, filters.brands)) {
      return false;
    }

    if (!hasMatch(product.material, filters.materials)) {
      return false;
    }

    if (!hasMatch(product.color, filters.colors)) {
      return false;
    }

    if (!hasMatch(product.style, filters.styles)) {
      return false;
    }

    if (filters.minRating && product.rating < filters.minRating) {
      return false;
    }

    if (filters.onlyDiscounted && !(product.discountPercent && product.discountPercent > 0)) {
      return false;
    }

    if (filters.onlyBestSellers && !product.bestSeller) {
      return false;
    }

    if (filters.onlyNew && !product.isNew) {
      return false;
    }

    return true;
  });
}

export function getTrendingProducts(products: Product[], limit = 6): Product[] {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
}

export function getTopRatedProducts(products: Product[], limit = 4): Product[] {
  return [...products]
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}

export function getDealProducts(products: Product[], limit = 4): Product[] {
  return [...products]
    .filter((product) => (product.discountPercent || 0) > 0)
    .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
    .slice(0, limit);
}

export function getRelatedProducts(products: Product[], product: Product, limit = 4): Product[] {
  return products
    .filter((candidate) => candidate.categoryId === product.categoryId && candidate.id !== product.id)
    .slice(0, limit);
}

export function buildPriceAnalysis(history: PriceHistory[]): PriceAnalysis {
  if (history.length < 2) {
    return { label: "Sin datos suficientes", type: "stable" };
  }

  const current = history[history.length - 1].price;
  const min = Math.min(...history.map((entry) => entry.price));
  const avg = history.reduce((sum, entry) => sum + entry.price, 0) / history.length;
  const maxDeviation = Math.max(...history.map((entry) => Math.abs(entry.price - avg))) / avg;

  if (current <= min * 1.02) {
    return { label: "Precio mas bajo en 3 meses", type: "low" };
  }

  if (maxDeviation < 0.05) {
    return { label: "Precio estable", type: "stable" };
  }

  if (current > avg) {
    return { label: "Por encima de la media", type: "high" };
  }

  return { label: "Buen precio actual", type: "low" };
}
