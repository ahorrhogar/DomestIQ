import { computeDiscountPercent } from "@/domain/catalog/product-logic";
import type { Offer, Product } from "@/domain/catalog/types";

export interface RankingSignals {
  clicksByProductId?: Record<string, number>;
  outboundClicksByProductId?: Record<string, number>;
  viewsByProductId?: Record<string, number>;
  favoritesByProductId?: Record<string, number>;
}

export interface HomeRankingInput {
  products: Product[];
  offersByProductId: Map<string, Offer[]>;
  signals?: RankingSignals;
}

export interface HomeRankingLimits {
  topProducts: number;
  bestDeals: number;
  topRatedProducts: number;
  bestSellers: number;
  favoriteProducts: number;
  featuredProducts: number;
}

export interface HomeCollections {
  topProducts: Product[];
  bestDeals: Product[];
  topRatedProducts: Product[];
  bestSellers: Product[];
  favoriteProducts: Product[];
  featuredProducts: Product[];
}

const DEFAULT_LIMITS: HomeRankingLimits = {
  topProducts: 12,
  bestDeals: 12,
  topRatedProducts: 12,
  bestSellers: 12,
  favoriteProducts: 12,
  featuredProducts: 12,
};

const MIN_DEAL_DISCOUNT_PERCENT = 5;
const MAX_DEAL_DISCOUNT_PERCENT = 75;
const MIN_REVIEW_COUNT_FOR_TOP_RATED = 5;

interface DealCandidate {
  product: Product;
  discountPercent: number;
}

interface DealScore {
  discountPercent: number;
}

function signalValue(source: Record<string, number> | undefined, productId: string): number {
  const value = source?.[productId];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function maxSignal(source: Record<string, number> | undefined, products: Product[]): number {
  let maxValue = 0;
  for (const product of products) {
    maxValue = Math.max(maxValue, signalValue(source, product.id));
  }
  return maxValue;
}

function normalizeSignal(source: Record<string, number> | undefined, productId: string, maxValue: number): number {
  if (maxValue <= 0) {
    return 0;
  }

  return signalValue(source, productId) / maxValue;
}

function isProductAvailable(product: Product, offersByProductId: Map<string, Offer[]>): boolean {
  const offers = offersByProductId.get(product.id) || [];
  return offers.some((offer) => offer.inStock);
}

function editorialPriorityOf(product: Product): number {
  const value = typeof product.editorialPriority === "number" ? product.editorialPriority : 0;
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function hasManualOverride(product: Product): boolean {
  return Boolean(product.featured || product.teamRecommended || editorialPriorityOf(product) > 0);
}

function sortManualOverride(products: Product[], clicksByProductId?: Record<string, number>): Product[] {
  return [...products].sort((left, right) => {
    const editorialDelta = editorialPriorityOf(right) - editorialPriorityOf(left);
    if (editorialDelta !== 0) {
      return editorialDelta;
    }

    if (Boolean(right.teamRecommended) !== Boolean(left.teamRecommended)) {
      return Number(Boolean(right.teamRecommended)) - Number(Boolean(left.teamRecommended));
    }

    if (Boolean(right.featured) !== Boolean(left.featured)) {
      return Number(Boolean(right.featured)) - Number(Boolean(left.featured));
    }

    const clickDelta = signalValue(clicksByProductId, right.id) - signalValue(clicksByProductId, left.id);
    if (clickDelta !== 0) {
      return clickDelta;
    }

    return right.reviewCount - left.reviewCount;
  });
}

function mergeManualAndAutomatic(manual: Product[], automatic: Product[], limit: number): Product[] {
  const merged: Product[] = [];
  const seen = new Set<string>();

  for (const candidate of [...manual, ...automatic]) {
    if (seen.has(candidate.id)) {
      continue;
    }

    seen.add(candidate.id);
    merged.push(candidate);

    if (merged.length >= limit) {
      break;
    }
  }

  return merged;
}

function getBestDealCandidate(offers: Offer[]): DealScore | null {
  let best: DealScore | null = null;

  for (const offer of offers) {
    if (!offer.inStock) {
      continue;
    }

    const discountPercent = computeDiscountPercent({
      minPrice: offer.price,
      originalPrice: offer.originalPrice,
    });

    if (!discountPercent) {
      continue;
    }

    if (discountPercent < MIN_DEAL_DISCOUNT_PERCENT || discountPercent > MAX_DEAL_DISCOUNT_PERCENT) {
      continue;
    }

    if (!best || discountPercent > best.discountPercent) {
      best = {
        discountPercent,
      };
    }
  }

  return best;
}

function buildCategoryClickTotals(
  products: Product[],
  clicksByProductId?: Record<string, number>,
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const product of products) {
    const clickCount = signalValue(clicksByProductId, product.id);
    totals.set(product.categoryId, (totals.get(product.categoryId) || 0) + clickCount);
  }

  return totals;
}

function categoryRelevanceScore(
  product: Product,
  categoryClickTotals: Map<string, number>,
  clicksByProductId?: Record<string, number>,
): number {
  const categoryClicks = categoryClickTotals.get(product.categoryId) || 0;
  const productClicks = signalValue(clicksByProductId, product.id);

  if (categoryClicks > 0 && productClicks > 0) {
    return Math.min(1, productClicks / categoryClicks);
  }

  return Math.min(1, product.reviewCount / 500);
}

export function getTopProducts(input: HomeRankingInput, limit = 6): Product[] {
  const { products, offersByProductId, signals } = input;
  const eligible = products.filter((product) => isProductAvailable(product, offersByProductId));

  if (!eligible.length) {
    return [];
  }

  const clicksByProductId = signals?.clicksByProductId;
  const viewsByProductId = signals?.viewsByProductId;
  const favoritesByProductId = signals?.favoritesByProductId;

  const totalClicks = eligible.reduce((sum, product) => sum + signalValue(clicksByProductId, product.id), 0);
  const totalViews = eligible.reduce((sum, product) => sum + signalValue(viewsByProductId, product.id), 0);
  const hasTopSignals = totalClicks > 0 && totalViews > 0;

  const maxClicks = maxSignal(clicksByProductId, eligible);
  const maxViews = maxSignal(viewsByProductId, eligible);
  const maxFavorites = maxSignal(favoritesByProductId, eligible);
  const categoryClickTotals = buildCategoryClickTotals(eligible, clicksByProductId);

  const manual = sortManualOverride(eligible.filter(hasManualOverride), clicksByProductId);

  const automatic = [...eligible].sort((left, right) => {
    const leftClicks = normalizeSignal(clicksByProductId, left.id, maxClicks);
    const rightClicks = normalizeSignal(clicksByProductId, right.id, maxClicks);

    if (!hasTopSignals) {
      const fallbackDelta = rightClicks - leftClicks;
      if (fallbackDelta !== 0) {
        return fallbackDelta;
      }

      return right.reviewCount - left.reviewCount;
    }

    const leftViews = normalizeSignal(viewsByProductId, left.id, maxViews);
    const rightViews = normalizeSignal(viewsByProductId, right.id, maxViews);
    const leftFavorites = normalizeSignal(favoritesByProductId, left.id, maxFavorites);
    const rightFavorites = normalizeSignal(favoritesByProductId, right.id, maxFavorites);

    const leftScore =
      leftClicks * 0.5 +
      leftViews * 0.25 +
      leftFavorites * 0.25 +
      categoryRelevanceScore(left, categoryClickTotals, clicksByProductId) * 0.1;
    const rightScore =
      rightClicks * 0.5 +
      rightViews * 0.25 +
      rightFavorites * 0.25 +
      categoryRelevanceScore(right, categoryClickTotals, clicksByProductId) * 0.1;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return right.reviewCount - left.reviewCount;
  });

  return mergeManualAndAutomatic(manual, automatic, limit);
}

export function getBestDeals(input: HomeRankingInput, limit = 4): Product[] {
  const { products, offersByProductId, signals } = input;
  const clicksByProductId = signals?.clicksByProductId;

  const dealCandidates = products
    .map((product) => {
      const bestDeal = getBestDealCandidate(offersByProductId.get(product.id) || []);
      if (!bestDeal) {
        return null;
      }

      return {
        product,
        discountPercent: bestDeal.discountPercent,
      };
    })
    .filter((entry): entry is DealCandidate => Boolean(entry));

  if (!dealCandidates.length) {
    return [];
  }

  const manual = sortManualOverride(
    dealCandidates.filter((entry) => hasManualOverride(entry.product)).map((entry) => entry.product),
    clicksByProductId,
  );

  const automatic = [...dealCandidates]
    .sort((left, right) => {
      if (right.discountPercent !== left.discountPercent) {
        return right.discountPercent - left.discountPercent;
      }

      const clickDelta = signalValue(clicksByProductId, right.product.id) - signalValue(clicksByProductId, left.product.id);
      if (clickDelta !== 0) {
        return clickDelta;
      }

      return right.product.reviewCount - left.product.reviewCount;
    })
    .map((entry) => entry.product);

  return mergeManualAndAutomatic(manual, automatic, limit);
}

export function getTopRatedProducts(input: HomeRankingInput, limit = 4): Product[] {
  const { products, offersByProductId, signals } = input;
  const clicksByProductId = signals?.clicksByProductId;

  const ratedCandidates = products.filter((product) => {
    if (!isProductAvailable(product, offersByProductId)) {
      return false;
    }

    return product.rating > 0 && product.reviewCount >= MIN_REVIEW_COUNT_FOR_TOP_RATED;
  });

  const manualFallback = sortManualOverride(
    products.filter((product) => hasManualOverride(product) && product.rating > 0),
    clicksByProductId,
  );

  if (!ratedCandidates.length) {
    return manualFallback.slice(0, limit);
  }

  const automatic = [...ratedCandidates].sort((left, right) => {
    const leftScore = left.rating * Math.log10(left.reviewCount + 1);
    const rightScore = right.rating * Math.log10(right.reviewCount + 1);

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    const clickDelta = signalValue(clicksByProductId, right.id) - signalValue(clicksByProductId, left.id);
    if (clickDelta !== 0) {
      return clickDelta;
    }

    return right.reviewCount - left.reviewCount;
  });

  return mergeManualAndAutomatic(manualFallback, automatic, limit);
}

export function getBestSellers(input: HomeRankingInput, limit = 4): Product[] {
  const { products, offersByProductId, signals } = input;
  const outboundClicksByProductId = signals?.outboundClicksByProductId || signals?.clicksByProductId;
  const favoritesByProductId = signals?.favoritesByProductId;

  const eligible = products.filter((product) => isProductAvailable(product, offersByProductId));
  if (!eligible.length) {
    return [];
  }

  const hasProxySignals =
    eligible.reduce((sum, product) => sum + signalValue(outboundClicksByProductId, product.id), 0) > 0 ||
    eligible.reduce((sum, product) => sum + signalValue(favoritesByProductId, product.id), 0) > 0;

  const manual = sortManualOverride(
    eligible.filter((product) => product.bestSeller || hasManualOverride(product)),
    outboundClicksByProductId,
  );

  if (!hasProxySignals) {
    return mergeManualAndAutomatic(manual, getTopProducts(input, limit * 2), limit);
  }

  const maxOutbound = maxSignal(outboundClicksByProductId, eligible);
  const maxFavorites = maxSignal(favoritesByProductId, eligible);

  const automatic = [...eligible].sort((left, right) => {
    const leftScore =
      normalizeSignal(outboundClicksByProductId, left.id, maxOutbound) * 0.7 +
      normalizeSignal(favoritesByProductId, left.id, maxFavorites) * 0.3;
    const rightScore =
      normalizeSignal(outboundClicksByProductId, right.id, maxOutbound) * 0.7 +
      normalizeSignal(favoritesByProductId, right.id, maxFavorites) * 0.3;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return right.reviewCount - left.reviewCount;
  });

  return mergeManualAndAutomatic(manual, automatic, limit);
}

export function getFavoriteProducts(input: HomeRankingInput, limit = 4): Product[] {
  const { products, offersByProductId, signals } = input;
  const favoritesByProductId = signals?.favoritesByProductId;
  const clicksByProductId = signals?.clicksByProductId;

  const eligible = products.filter((product) => isProductAvailable(product, offersByProductId));
  if (!eligible.length) {
    return [];
  }

  const totalFavorites = eligible.reduce((sum, product) => sum + signalValue(favoritesByProductId, product.id), 0);
  const manual = sortManualOverride(
    eligible.filter((product) => product.teamRecommended || product.featured),
    clicksByProductId,
  );

  if (totalFavorites <= 0) {
    return mergeManualAndAutomatic(manual, getTopProducts(input, limit * 2), limit);
  }

  const maxFavorites = maxSignal(favoritesByProductId, eligible);

  const automatic = [...eligible].sort((left, right) => {
    const leftFavorites = normalizeSignal(favoritesByProductId, left.id, maxFavorites);
    const rightFavorites = normalizeSignal(favoritesByProductId, right.id, maxFavorites);

    if (rightFavorites !== leftFavorites) {
      return rightFavorites - leftFavorites;
    }

    const clickDelta = signalValue(clicksByProductId, right.id) - signalValue(clicksByProductId, left.id);
    if (clickDelta !== 0) {
      return clickDelta;
    }

    return right.reviewCount - left.reviewCount;
  });

  return mergeManualAndAutomatic(manual, automatic, limit);
}

export function getFeaturedProducts(input: HomeRankingInput, limit = 4): Product[] {
  const { products, offersByProductId, signals } = input;
  const clicksByProductId = signals?.clicksByProductId;

  const eligible = products.filter((product) => isProductAvailable(product, offersByProductId));
  if (!eligible.length) {
    return [];
  }

  const manualFeatured = sortManualOverride(
    eligible.filter((product) => hasManualOverride(product)),
    clicksByProductId,
  );

  if (manualFeatured.length >= limit) {
    return manualFeatured.slice(0, limit);
  }

  return mergeManualAndAutomatic(manualFeatured, getTopProducts(input, limit * 2), limit);
}

export function computeHomeCollections(
  input: HomeRankingInput,
  limits: Partial<HomeRankingLimits> = {},
): HomeCollections {
  const resolved: HomeRankingLimits = {
    ...DEFAULT_LIMITS,
    ...limits,
  };

  return {
    topProducts: getTopProducts(input, resolved.topProducts),
    bestDeals: getBestDeals(input, resolved.bestDeals),
    topRatedProducts: getTopRatedProducts(input, resolved.topRatedProducts),
    bestSellers: getBestSellers(input, resolved.bestSellers),
    favoriteProducts: getFavoriteProducts(input, resolved.favoriteProducts),
    featuredProducts: getFeaturedProducts(input, resolved.featuredProducts),
  };
}
