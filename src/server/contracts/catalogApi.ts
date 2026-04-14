import type {
  Category,
  Offer,
  PriceHistory,
  Product,
} from "@/domain/catalog/types";

export interface ApiSuccess<T> {
  data: T;
  requestId: string;
}

export interface ApiError {
  code: string;
  message: string;
  requestId: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface CatalogApiContract {
  listCategories(): Promise<ApiResponse<Category[]>>;
  listProductsByCategory(categorySlug: string, subcategorySlug?: string): Promise<ApiResponse<Product[]>>;
  getProductBySlug(slug: string): Promise<ApiResponse<Product>>;
  getProductOffers(productId: string): Promise<ApiResponse<Offer[]>>;
  getPriceHistory(productId: string): Promise<ApiResponse<PriceHistory[]>>;
}
