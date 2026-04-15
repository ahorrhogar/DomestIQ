export interface AdminListQuery {
  page: number;
  pageSize: number;
  search?: string;
}

export interface AdminProductRecord {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  subcategoryName?: string;
  shortDescription: string;
  longDescription: string;
  technicalSpecs: Array<{ label: string; value: string }>;
  tags: string[];
  attributes: Record<string, unknown>;
  isActive: boolean;
  featured: boolean;
  teamRecommended: boolean;
  editorialPriority: number;
  sku?: string;
  ean?: string;
  createdAt: string;
  updatedAt: string;
  primaryImageUrl?: string;
  offerCount: number;
  minPrice: number;
}

export interface AdminOfferRecord {
  id: string;
  productId: string;
  productName: string;
  categoryId?: string;
  categoryName?: string;
  merchantId: string;
  merchantName: string;
  sourceType: OfferSourceType;
  updateMode: OfferUpdateMode;
  syncStatus: OfferSyncStatus;
  currentPrice: number;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  url: string;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  lastCheckedAt?: string;
  lastUpdatedBy?: string;
  lastSyncError?: string;
  nextCheckAt?: string;
  priorityScore?: number;
  freshnessScore?: number;
  updatedAt: string;
}

export type OfferSourceType = "manual" | "api" | "feed" | "future_auto";
export type OfferUpdateMode = "manual" | "auto" | "hybrid";
export type OfferSyncStatus = "ok" | "stale" | "error" | "pending";

export interface AdminOfferPriceHistoryRecord {
  id: string;
  offerId: string;
  productId: string;
  merchantId: string;
  price: number;
  oldPrice?: number;
  sourceType: OfferSourceType;
  updateMode: OfferUpdateMode;
  syncStatus: OfferSyncStatus;
  changedBy?: string;
  changeReason?: string;
  checkedAt: string;
  createdAt: string;
}

export interface AdminBrandRecord {
  id: string;
  name: string;
  logoUrl?: string;
  isActive: boolean;
  updatedAt: string;
  productCount?: number;
}

export interface AdminMerchantRecord {
  id: string;
  name: string;
  logoUrl?: string;
  domain?: string;
  country: string;
  isActive: boolean;
  brandColor?: string;
  updatedAt: string;
  offerCount?: number;
  clicks?: number;
}

export interface AdminCategoryRecord {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  parentName?: string;
  icon?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
  productCount?: number;
  updatedAt: string;
}

export interface AdminProductImageRecord {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface AdminClickRecord {
  id: string;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  createdAt: string;
}

export interface AdminActionRecord {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AdminImportJobRecord {
  id: string;
  userId: string;
  source: string;
  status: "pending" | "running" | "completed" | "failed";
  rowCount: number;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
  metadata: Record<string, unknown>;
  startedAt?: string;
  finishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminImportJobLogRecord {
  id: string;
  jobId: string;
  level: "info" | "warning" | "error";
  message: string;
  rowIndex?: number;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface SyncStatusRecord {
  id: string;
  source: string;
  status: "healthy" | "warning" | "error";
  lastSuccessAt?: string;
  lastErrorAt?: string;
  message?: string;
  metadata: Record<string, unknown>;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalProducts: number;
  activeOffers: number;
  activeMerchants: number;
  totalClicks: number;
  clicksLast30Days: number;
  topClickedProducts: Array<{ productId: string; productName: string; clicks: number }>;
  topClickedMerchants: Array<{ merchantId: string; merchantName: string; clicks: number }>;
  topOfferPairs: Array<{
    productId: string;
    productName: string;
    merchantId: string;
    merchantName: string;
    clicks: number;
  }>;
  topSearchTerms: Array<{ term: string; count: number }>;
  noResultSearchTerms: Array<{ term: string; count: number }>;
  topViewedProducts: Array<{ productId: string; productName: string; views: number }>;
  topSearchedProducts: Array<{ productId: string; productName: string; searchCount: number }>;
  topCategoriesByClicks: Array<{ categoryId: string; categoryName: string; clicks: number }>;
  topCategoriesByPerformance: Array<{
    categoryId: string;
    categoryName: string;
    clicks: number;
    views: number;
    ctr: number;
  }>;
  searchesWithoutResults: number;
  failedImportJobs: number;
  productsWithoutActiveOffers: number;
  staleActiveOffers: number;
  highClicksLowViews: Array<{ productId: string; productName: string; clicks: number; views: number }>;
  highViewsLowClicks: Array<{ productId: string; productName: string; clicks: number; views: number }>;
  underFeaturedTopPerformers: Array<{ productId: string; productName: string; clicks: number; views: number }>;
  featuredTopPerformers: Array<{ productId: string; productName: string; clicks: number; views: number }>;
  favoritesTotal: number | null;
  recentAdminActions: AdminActionRecord[];
  freshness: {
    lastClickAt?: string;
    lastSearchAt?: string;
    lastImportAt?: string;
    lastSyncAt?: string;
    stale: boolean;
    staleSources: number;
  };
  dailyClicks: Array<{ day: string; clicks: number }>;
  incompleteProducts: number;
  syncStatus: SyncStatusRecord[];
}

export interface ImportColumnMapping {
  productName: string;
  brandName: string;
  categoryName: string;
  subcategoryName: string;
  description: string;
  longDescription: string;
  price: string;
  oldPrice: string;
  merchantName: string;
  offerUrl: string;
  stock: string;
  imageUrl: string;
  sku: string;
  ean: string;
  tags: string;
}
