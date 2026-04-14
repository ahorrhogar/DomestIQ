export type OfferSourceType = "manual" | "api" | "feed" | "future_auto";
export type OfferUpdateMode = "manual" | "auto" | "hybrid";
export type OfferSyncStatus = "ok" | "stale" | "error" | "pending";

export interface OfferSyncState {
  offerId: string;
  sourceType: OfferSourceType;
  updateMode: OfferUpdateMode;
  syncStatus: OfferSyncStatus;
  currentPrice: number;
  oldPrice?: number;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  lastCheckedAt?: string;
  nextCheckAt?: string;
  priorityScore?: number;
  freshnessScore?: number;
}

export interface OfferSyncResult {
  offerId: string;
  status: OfferSyncStatus;
  checkedAt: string;
  changed: boolean;
  reason?: string;
}

export interface OfferSyncBatchResult {
  syncedOfferIds: string[];
  pendingOfferIds: string[];
  failedOfferIds: string[];
}

export interface OfferSourceSnapshot {
  price: number;
  oldPrice?: number;
  stock: boolean;
  url: string;
  checkedAt: string;
  raw?: Record<string, unknown>;
}

export interface OfferSourceAdapter {
  sourceType: OfferSourceType;
  canHandle(offer: OfferSyncState): boolean;
  fetchLatestSnapshot(offer: OfferSyncState): Promise<OfferSourceSnapshot | null>;
}

export interface OfferUpdatePolicy {
  shouldTrackHistory(previousPrice: number, nextPrice: number): boolean;
  shouldMarkStale(params: { lastCheckedAt?: string; now: Date; staleAfterHours: number }): boolean;
  resolveStatus(params: {
    existingStatus: OfferSyncStatus;
    lastCheckedAt?: string;
    now: Date;
    staleAfterHours: number;
  }): OfferSyncStatus;
}

export interface OfferFreshnessService {
  computeFreshnessScore(params: { lastCheckedAt?: string; now: Date; staleAfterHours: number }): number;
  computePriorityScore(params: {
    syncStatus: OfferSyncStatus;
    clicks: number;
    views: number;
    categoryRevenueWeight?: number;
    merchantWeight?: number;
    isFeatured?: boolean;
  }): number;
}

export interface OfferSyncService {
  sync_price_for_offer(offerId: string): Promise<OfferSyncResult>;
  sync_offers_batch(limit?: number): Promise<OfferSyncBatchResult>;
  mark_offer_stale(offerId: string, reason?: string): Promise<boolean>;
  mark_offer_fresh(offerId: string): Promise<boolean>;
  update_price_history_on_change(offerId: string, reason?: string, metadata?: Record<string, unknown>): Promise<boolean>;
}

function toFinite(value: number | undefined, fallback = 0): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
}

export function hoursSince(lastCheckedAt: string | undefined, now: Date): number {
  if (!lastCheckedAt) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(lastCheckedAt);
  if (Number.isNaN(parsed.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  const diffMs = Math.max(0, now.getTime() - parsed.getTime());
  return diffMs / 3_600_000;
}

export function computeOfferFreshnessScore(params: {
  lastCheckedAt?: string;
  now?: Date;
  staleAfterHours?: number;
}): number {
  const staleAfterHours = Math.max(1, Math.floor(toFinite(params.staleAfterHours, 72)));
  const now = params.now || new Date();
  const ageHours = hoursSince(params.lastCheckedAt, now);

  if (!Number.isFinite(ageHours)) {
    return 0;
  }

  const ratio = Math.min(1, Math.max(0, ageHours / staleAfterHours));
  return Math.round((1 - ratio) * 10000) / 100;
}

export function computeOfferPriorityScore(params: {
  syncStatus: OfferSyncStatus;
  clicks: number;
  views: number;
  categoryRevenueWeight?: number;
  merchantWeight?: number;
  isFeatured?: boolean;
}): number {
  const staleBoost = params.syncStatus === "stale" ? 55 : params.syncStatus === "error" ? 45 : 0;
  const pendingPenalty = params.syncStatus === "pending" ? -10 : 0;
  const clickWeight = Math.min(Math.max(0, toFinite(params.clicks)) * 3, 180);
  const viewWeight = Math.min(Math.max(0, toFinite(params.views)) * 0.12, 90);
  const categoryWeight = Math.min(Math.max(0, toFinite(params.categoryRevenueWeight)), 120);
  const merchantWeight = Math.min(Math.max(0, toFinite(params.merchantWeight)) * 1.5, 35);
  const featuredBoost = params.isFeatured ? 10 : 0;

  return Math.round((staleBoost + pendingPenalty + clickWeight + viewWeight + categoryWeight + merchantWeight + featuredBoost) * 100) / 100;
}

export const defaultOfferUpdatePolicy: OfferUpdatePolicy = {
  shouldTrackHistory(previousPrice, nextPrice) {
    return Number.isFinite(previousPrice) && Number.isFinite(nextPrice) && previousPrice > 0 && nextPrice > 0 && previousPrice !== nextPrice;
  },
  shouldMarkStale({ lastCheckedAt, now, staleAfterHours }) {
    return hoursSince(lastCheckedAt, now) >= Math.max(1, staleAfterHours);
  },
  resolveStatus({ existingStatus, lastCheckedAt, now, staleAfterHours }) {
    if (existingStatus === "error") {
      return "error";
    }

    if (existingStatus === "pending") {
      return "pending";
    }

    return hoursSince(lastCheckedAt, now) >= Math.max(1, staleAfterHours) ? "stale" : "ok";
  },
};

export const defaultOfferFreshnessService: OfferFreshnessService = {
  computeFreshnessScore({ lastCheckedAt, now, staleAfterHours }) {
    return computeOfferFreshnessScore({ lastCheckedAt, now, staleAfterHours });
  },
  computePriorityScore({ syncStatus, clicks, views, categoryRevenueWeight, merchantWeight, isFeatured }) {
    return computeOfferPriorityScore({ syncStatus, clicks, views, categoryRevenueWeight, merchantWeight, isFeatured });
  },
};
