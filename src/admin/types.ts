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
  merchantId: string;
  merchantName: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  url: string;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  updatedAt: string;
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
  topClickedProducts: Array<{ productId: string; productName: string; clicks: number }>;
  topClickedMerchants: Array<{ merchantId: string; merchantName: string; clicks: number }>;
  topSearchTerms: Array<{ term: string; count: number }>;
  topViewedProducts: Array<{ productId: string; productName: string; views: number }>;
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
