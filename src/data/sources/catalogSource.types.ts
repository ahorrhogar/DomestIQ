import type {
  Category,
  Merchant,
  Offer,
  PriceAnalysis,
  PriceHistory,
  Product,
} from "@/domain/catalog/types";

export interface CatalogRankingSignals {
  clicksByProductId: Record<string, number>;
  outboundClicksByProductId: Record<string, number>;
  viewsByProductId: Record<string, number>;
  favoritesByProductId: Record<string, number>;
  hasViewSignals: boolean;
  hasFavoriteSignals: boolean;
  updatedAt: string;
}

export interface CatalogDataSource {
  getProducts(): Product[];
  getCategories(): Category[];
  getMerchants(): Merchant[];
  getBestSellers(): Product[];
  getFeaturedProducts(): Product[];
  getOffersForProduct(productId: string): Offer[];
  getPriceHistory(productId: string): PriceHistory[];
  getPriceAnalysis(productId: string): PriceAnalysis;
}

export interface ExtendedCatalogDataSource extends CatalogDataSource {
  initialize?(): Promise<void>;
  getProductById?(productId: string): Product | undefined;
  getProductsByCategory?(categoryId: string): Product[];
  searchProducts?(query: string, limit?: number): Promise<Product[]>;
  getOffersByProduct?(productId: string): Offer[];
  trackClick?(productId: string, merchantId: string): Promise<void>;
  getOfferRedirectPayload?(
    offerId: string,
  ): Promise<{ id: string; product_id: string; merchant_id: string; url: string } | null>;
  getRankingSignals?(): CatalogRankingSignals;
}
