import { buildAssistantRecommendations } from "@/domain/assistant/recommendation";
import { computeHomeCollections, type HomeCollections } from "@/domain/catalog/home-ranking";
import {
  filterProducts,
  getRelatedProducts,
  sortProducts,
} from "@/domain/catalog/product-logic";
import type {
  AssistantQuery,
  AssistantResult,
  Product,
  ProductFilterMetadata,
  ProductFilters,
  ProductSortBy,
} from "@/domain/catalog/types";
import type { CatalogRankingSignals } from "@/data/sources/catalogSource.types";
import { mockCatalogSource } from "@/data/sources/mockCatalogSource";

export interface ProductSearchOptions {
  limit?: number;
  categoryId?: string;
  subcategoryId?: string;
  sortBy?: ProductSortBy;
}

export interface ProductService {
  getAllProducts(): Product[];
  getProductBySlug(slug: string): Product | undefined;
  getProductsByCategory(categoryId?: string, subcategoryId?: string): Product[];
  getFilterMetadata(products: Product[]): ProductFilterMetadata;
  getFilteredProducts(filters: ProductFilters, sortBy: ProductSortBy): Product[];
  getTopProducts(limit?: number): Product[];
  getTrendingProducts(limit?: number): Product[];
  getDealProducts(limit?: number): Product[];
  getTopRatedProducts(limit?: number): Product[];
  getFeaturedProducts(limit?: number): Product[];
  getBestSellers(limit?: number): Product[];
  getFavoriteProducts(limit?: number): Product[];
  getRelatedProducts(product: Product, limit?: number): Product[];
  searchProducts(query: string, options?: ProductSearchOptions): Promise<Product[]>;
  getAssistantRecommendations(query: AssistantQuery, limit?: number): AssistantResult[];
}

interface HomeCollectionsCacheEntry {
  key: string;
  expiresAt: number;
  value: HomeCollections;
}

const HOME_COLLECTIONS_CACHE_TTL_MS = 60_000;

const EMPTY_SIGNALS: CatalogRankingSignals = {
  clicksByProductId: {},
  outboundClicksByProductId: {},
  viewsByProductId: {},
  favoritesByProductId: {},
  hasViewSignals: false,
  hasFavoriteSignals: false,
  updatedAt: "",
};

function sortedUnique(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
}

interface SearchLookup {
  categoryNameById: Map<string, string>;
  categorySlugById: Map<string, string>;
  subcategoryNameById: Map<string, string>;
  subcategorySlugById: Map<string, string>;
  merchantNamesByProductId: Map<string, string>;
}

function buildSearchLookup(products: Product[]): SearchLookup {
  const categoryNameById = new Map<string, string>();
  const categorySlugById = new Map<string, string>();
  const subcategoryNameById = new Map<string, string>();
  const subcategorySlugById = new Map<string, string>();
  const merchantNamesByProductId = new Map<string, string>();

  mockCatalogSource.getCategories().forEach((category) => {
    categoryNameById.set(category.id, category.name);
    categorySlugById.set(category.id, category.slug);

    category.subcategories.forEach((subcategory) => {
      subcategoryNameById.set(subcategory.id, subcategory.name);
      subcategorySlugById.set(subcategory.id, subcategory.slug);

      // Fallback when product.categoryId points to a subcategory id.
      if (!categoryNameById.has(subcategory.id)) {
        categoryNameById.set(subcategory.id, category.name);
      }

      if (!categorySlugById.has(subcategory.id)) {
        categorySlugById.set(subcategory.id, category.slug);
      }
    });
  });

  products.forEach((product) => {
    const merchantNames = [...new Set(
      mockCatalogSource
        .getOffersForProduct(product.id)
        .map((offer) => offer.merchant.name)
        .filter(Boolean),
    )];

    merchantNamesByProductId.set(product.id, merchantNames.join(" "));
  });

  return {
    categoryNameById,
    categorySlugById,
    subcategoryNameById,
    subcategorySlugById,
    merchantNamesByProductId,
  };
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildSearchTokens(value: string): string[] {
  return normalizeSearchValue(value)
    .split(/[\s-]+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ""))
    .filter((token) => token.length >= 2)
    .slice(0, 8);
}

function scoreProductSearchMatch(product: Product, tokens: string[], lookup: SearchLookup): number {
  const normalizedName = normalizeSearchValue(product.name);
  const normalizedBrand = normalizeSearchValue(product.brand);
  const normalizedDescription = normalizeSearchValue(product.description);
  const normalizedTags = product.tags.map((tag) => normalizeSearchValue(tag)).join(" ");
  const normalizedMerchant = normalizeSearchValue(lookup.merchantNamesByProductId.get(product.id) || "");
  const normalizedCategory = normalizeSearchValue(
    [
      lookup.categoryNameById.get(product.categoryId) || "",
      lookup.categorySlugById.get(product.categoryId) || "",
      lookup.subcategoryNameById.get(product.subcategoryId) || "",
      lookup.subcategorySlugById.get(product.subcategoryId) || "",
    ].join(" "),
  );

  let score = 0;

  tokens.forEach((token) => {
    if (normalizedName === token) {
      score += 250;
    } else if (normalizedName.startsWith(token)) {
      score += 120;
    } else if (normalizedName.includes(token)) {
      score += 80;
    }

    if (normalizedBrand === token) {
      score += 90;
    } else if (normalizedBrand.includes(token)) {
      score += 45;
    }

    if (normalizedMerchant === token) {
      score += 120;
    } else if (normalizedMerchant.startsWith(token)) {
      score += 70;
    } else if (normalizedMerchant.includes(token)) {
      score += 55;
    }

    if (normalizedCategory === token) {
      score += 110;
    } else if (normalizedCategory.startsWith(token)) {
      score += 55;
    } else if (normalizedCategory.includes(token)) {
      score += 35;
    }

    if (normalizedTags.includes(token)) {
      score += 30;
    }

    if (normalizedDescription.includes(token)) {
      score += 15;
    }
  });

  return score;
}

function searchProductsLocally(products: Product[], query: string, lookup: SearchLookup): Product[] {
  const tokens = buildSearchTokens(query);
  if (!tokens.length) {
    return [];
  }

  return products
    .map((product) => ({
      product,
      score: scoreProductSearchMatch(product, tokens, lookup),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || right.product.reviewCount - left.product.reviewCount)
    .map((entry) => entry.product);
}

class MockProductService implements ProductService {
  private homeCollectionsCache: HomeCollectionsCacheEntry | null = null;

  private getRankingSignals(): CatalogRankingSignals {
    if (!mockCatalogSource.getRankingSignals) {
      return EMPTY_SIGNALS;
    }

    return mockCatalogSource.getRankingSignals();
  }

  private getHomeCollections(): HomeCollections {
    const products = this.getAllProducts();
    const rankingSignals = this.getRankingSignals();
    const cacheKey = `${products.length}:${rankingSignals.updatedAt}`;
    const now = Date.now();

    if (
      this.homeCollectionsCache &&
      this.homeCollectionsCache.key === cacheKey &&
      this.homeCollectionsCache.expiresAt > now
    ) {
      return this.homeCollectionsCache.value;
    }

    const offersByProductId = new Map(products.map((product) => [product.id, mockCatalogSource.getOffersForProduct(product.id)]));

    const value = computeHomeCollections(
      {
        products,
        offersByProductId,
        signals: {
          clicksByProductId: rankingSignals.clicksByProductId,
          outboundClicksByProductId: rankingSignals.outboundClicksByProductId,
          viewsByProductId: rankingSignals.viewsByProductId,
          favoritesByProductId: rankingSignals.favoritesByProductId,
        },
      },
      {
        topProducts: 18,
        bestDeals: 12,
        topRatedProducts: 12,
        bestSellers: 12,
        favoriteProducts: 12,
        featuredProducts: 12,
      },
    );

    this.homeCollectionsCache = {
      key: cacheKey,
      expiresAt: now + HOME_COLLECTIONS_CACHE_TTL_MS,
      value,
    };

    return value;
  }

  getAllProducts(): Product[] {
    return mockCatalogSource.getProducts();
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.getAllProducts().find((product) => product.slug === slug);
  }

  getProductsByCategory(categoryId?: string, subcategoryId?: string): Product[] {
    return this.getAllProducts().filter((product) => {
      if (categoryId && product.categoryId !== categoryId) {
        return false;
      }

      if (subcategoryId && product.subcategoryId !== subcategoryId) {
        return false;
      }

      return true;
    });
  }

  getFilterMetadata(products: Product[]): ProductFilterMetadata {
    const minPrice = products.length > 0 ? Math.floor(Math.min(...products.map((product) => product.minPrice))) : 0;
    const maxPrice = products.length > 0 ? Math.ceil(Math.max(...products.map((product) => product.minPrice))) : 0;

    return {
      brands: sortedUnique(products.map((product) => product.brand)),
      materials: sortedUnique(products.map((product) => product.material)),
      colors: sortedUnique(products.map((product) => product.color)),
      styles: sortedUnique(products.map((product) => product.style)),
      minPrice,
      maxPrice,
    };
  }

  getFilteredProducts(filters: ProductFilters, sortBy: ProductSortBy): Product[] {
    const candidates = filterProducts(this.getAllProducts(), filters);

    if (!filters.merchantIds || filters.merchantIds.length === 0) {
      return sortProducts(candidates, sortBy);
    }

    const merchantFiltered = candidates.filter((product) => {
      const offers = mockCatalogSource.getOffersForProduct(product.id);
      return offers.some((offer) => filters.merchantIds?.includes(offer.merchantId));
    });

    return sortProducts(merchantFiltered, sortBy);
  }

  getTopProducts(limit = 6): Product[] {
    return this.getHomeCollections().topProducts.slice(0, limit);
  }

  getTrendingProducts(limit = 6): Product[] {
    return this.getTopProducts(limit);
  }

  getDealProducts(limit = 4): Product[] {
    return this.getHomeCollections().bestDeals.slice(0, limit);
  }

  getTopRatedProducts(limit = 4): Product[] {
    return this.getHomeCollections().topRatedProducts.slice(0, limit);
  }

  getFeaturedProducts(limit = 4): Product[] {
    return this.getHomeCollections().featuredProducts.slice(0, limit);
  }

  getBestSellers(limit = 4): Product[] {
    return this.getHomeCollections().bestSellers.slice(0, limit);
  }

  getFavoriteProducts(limit = 4): Product[] {
    return this.getHomeCollections().favoriteProducts.slice(0, limit);
  }

  getRelatedProducts(product: Product, limit = 4): Product[] {
    return getRelatedProducts(this.getAllProducts(), product, limit);
  }

  async searchProducts(query: string, options: ProductSearchOptions = {}): Promise<Product[]> {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return [];
    }

    const limit = Math.max(1, Math.min(options.limit || 48, 200));
    const sortBy = options.sortBy || "popular";

    const inScope = (product: Product): boolean => {
      if (options.categoryId && product.categoryId !== options.categoryId) {
        return false;
      }

      if (options.subcategoryId && product.subcategoryId !== options.subcategoryId) {
        return false;
      }

      return true;
    };

    const scopedProducts = this.getAllProducts().filter(inScope);
    const searchLookup = buildSearchLookup(scopedProducts);
    const localResults = searchProductsLocally(scopedProducts, trimmedQuery, searchLookup);

    let remoteResults: Product[] = [];
    if (mockCatalogSource.searchProducts) {
      try {
        remoteResults = (await mockCatalogSource.searchProducts(trimmedQuery, Math.max(limit * 2, 24))).filter(inScope);
      } catch {
        remoteResults = [];
      }
    }

    const merged = new Map<string, Product>();

    remoteResults.forEach((product) => {
      merged.set(product.id, product);
    });

    localResults.forEach((product) => {
      if (!merged.has(product.id)) {
        merged.set(product.id, product);
      }
    });

    let output = Array.from(merged.values());
    if (sortBy === "popular") {
      const tokens = buildSearchTokens(trimmedQuery);
      output = output.sort(
        (left, right) =>
          scoreProductSearchMatch(right, tokens, searchLookup) - scoreProductSearchMatch(left, tokens, searchLookup) ||
          right.reviewCount - left.reviewCount,
      );
    } else {
      output = sortProducts(output, sortBy);
    }

    return output.slice(0, limit);
  }

  getAssistantRecommendations(query: AssistantQuery, limit = 10): AssistantResult[] {
    return buildAssistantRecommendations(this.getAllProducts(), query, limit);
  }
}

export const productService: ProductService = new MockProductService();
