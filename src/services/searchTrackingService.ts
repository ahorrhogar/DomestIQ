import { mockCatalogSource } from "@/data/sources/mockCatalogSource";
import { canUseAnalytics } from "@/services/cookieConsentService";
import { getAnalyticsSessionId } from "@/services/analyticsSession";

interface SearchTrackInput {
  term: string;
  resultCount: number;
  topProductId?: string;
  path?: string;
}

const SEARCH_DEDUPE_WINDOW_MS = 90 * 1000;

function normalizeTerm(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

class SearchTrackingService {
  private lastTrackedByKey = new Map<string, number>();

  shouldTrack(input: SearchTrackInput, now = Date.now()): boolean {
    if (!canUseAnalytics()) {
      return false;
    }

    const normalizedTerm = normalizeTerm(input.term);
    if (normalizedTerm.length < 2) {
      return false;
    }

    const path = input.path || "/buscar";
    const dedupeKey = `${normalizedTerm}:${path}`;
    const lastTrackedAt = this.lastTrackedByKey.get(dedupeKey) || 0;

    if (now - lastTrackedAt < SEARCH_DEDUPE_WINDOW_MS) {
      return false;
    }

    this.lastTrackedByKey.set(dedupeKey, now);
    return true;
  }

  async track(input: SearchTrackInput): Promise<void> {
    if (!this.shouldTrack(input)) {
      return;
    }

    if (!mockCatalogSource.trackSearchTerm) {
      return;
    }

    await mockCatalogSource.trackSearchTerm(input.term, {
      sessionId: getAnalyticsSessionId(),
      resultCount: Math.max(0, Math.floor(input.resultCount || 0)),
      topProductId: input.topProductId,
      path: input.path || "/buscar",
    });
  }
}

export const searchTrackingService = new SearchTrackingService();
