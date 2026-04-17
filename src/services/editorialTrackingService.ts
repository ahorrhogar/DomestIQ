import { getSupabaseClient } from "@/integrations/supabase/client";
import { canUseAnalytics } from "@/services/cookieConsentService";
import { getAnalyticsSessionId } from "@/services/analyticsSession";

interface TrackArticleViewInput {
  slug: string;
  path?: string;
  referrer?: string;
}

const ARTICLE_VIEW_DEDUPE_WINDOW_MS = 30 * 60 * 1000;

class EditorialTrackingService {
  private lastTrackedAtBySlug = new Map<string, number>();

  shouldTrack(slug: string, now = Date.now()): boolean {
    if (!canUseAnalytics()) {
      return false;
    }

    const safeSlug = String(slug || "").trim().toLowerCase();
    if (!safeSlug) {
      return false;
    }

    const lastTrackedAt = this.lastTrackedAtBySlug.get(safeSlug) || 0;
    if (now - lastTrackedAt < ARTICLE_VIEW_DEDUPE_WINDOW_MS) {
      return false;
    }

    this.lastTrackedAtBySlug.set(safeSlug, now);
    return true;
  }

  async trackArticleView(input: TrackArticleViewInput): Promise<void> {
    const safeSlug = String(input.slug || "").trim();
    if (!this.shouldTrack(safeSlug)) {
      return;
    }

    try {
      const supabase = getSupabaseClient();
      await supabase.rpc("track_article_view_secure", {
        p_article_slug: safeSlug,
        p_session_id: getAnalyticsSessionId(),
        p_path: input.path || (typeof window !== "undefined" ? window.location.pathname : null),
        p_referrer: input.referrer || (typeof document !== "undefined" ? document.referrer : null),
      });
    } catch {
      // Tracking must never block editorial rendering.
    }
  }
}

export const editorialTrackingService = new EditorialTrackingService();
