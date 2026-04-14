export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image?: string;
  productCount: number;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  description: string;
  longDescription: string;
  images: string[];
  minPrice: number;
  maxPrice: number;
  originalPrice?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  offerCount: number;
  specs: ProductSpec[];
  tags: string[];
  material?: string;
  color?: string;
  style?: string;
  dimensions?: string;
  weight?: string;
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  teamRecommended?: boolean;
  editorialPriority?: number;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Merchant {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  reviewCount: number;
  url: string;
  shippingInfo: string;
  returnPolicy: string;
  paymentMethods: string[];
  trusted: boolean;
}

export interface Offer {
  id: string;
  productId: string;
  merchantId: string;
  merchant: Merchant;
  price: number;
  originalPrice?: number;
  shippingCost: number;
  freeShipping: boolean;
  fastShipping: boolean;
  inStock: boolean;
  url: string;
  lastUpdated: string;
}

export interface PriceHistory {
  date: string;
  price: number;
  merchantId?: string;
}

export interface PriceAnalysis {
  label: string;
  type: "low" | "stable" | "high";
}

export type ProductSortBy =
  | "popular"
  | "price-asc"
  | "price-desc"
  | "discount"
  | "rating"
  | "newest";

export interface ProductFilters {
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  materials?: string[];
  colors?: string[];
  styles?: string[];
  merchantIds?: string[];
  minRating?: number;
  onlyDiscounted?: boolean;
  onlyBestSellers?: boolean;
  onlyNew?: boolean;
}

export type AssistantPriority = "price" | "quality" | "design" | "balanced";
export type AssistantTag = "best-value" | "cheapest" | "premium" | "recommended";

export interface AssistantQuery {
  budget: number;
  categoryId?: string;
  subcategoryId?: string;
  style?: string;
  priority: AssistantPriority;
  preferredMerchant?: string;
  maxDimensions?: string;
}

export interface AssistantResult {
  product: Product;
  offers: Offer[];
  score: number;
  reason: string;
  tag?: AssistantTag;
}

export interface ProductFilterMetadata {
  brands: string[];
  materials: string[];
  colors: string[];
  styles: string[];
  minPrice: number;
  maxPrice: number;
}

export interface TrendingCategory {
  category: Category;
  totalReviews: number;
  topProduct: Product;
}
