import { isKnownAnalyticsEvent, type AnalyticsEvent } from "@/infrastructure/analytics/events";
import { logger } from "@/infrastructure/logging/logger";
import { checkRateLimit } from "@/infrastructure/rate-limit/rateLimiter";
import { sanitizeAnalyticsEvent } from "@/infrastructure/security/sanitize";
import { canUseAnalytics } from "@/services/cookieConsentService";

export interface AnalyticsService {
  track(event: AnalyticsEvent): void;
  flush(): AnalyticsEvent[];
}

class InMemoryAnalyticsService implements AnalyticsService {
  private queue: AnalyticsEvent[] = [];

  track(event: AnalyticsEvent): void {
    if (!canUseAnalytics()) {
      return;
    }

    if (!isKnownAnalyticsEvent(event.name)) {
      logger.log({
        level: "warn",
        message: "Analytics event rejected: unknown event name",
        timestamp: new Date().toISOString(),
        context: { eventName: event.name },
      });
      return;
    }

    const rateLimitResult = checkRateLimit({
      key: `analytics:${event.name}`,
      windowMs: 60_000,
      maxRequests: 250,
    });

    if (!rateLimitResult.allowed) {
      logger.log({
        level: "warn",
        message: "Analytics event dropped by rate limit",
        timestamp: new Date().toISOString(),
        context: {
          eventName: event.name,
          resetAt: rateLimitResult.resetAt,
        },
      });
      return;
    }

    this.queue.push(sanitizeAnalyticsEvent(event));
  }

  flush(): AnalyticsEvent[] {
    const snapshot = [...this.queue];
    this.queue = [];
    return snapshot;
  }
}

export const analyticsService: AnalyticsService = new InMemoryAnalyticsService();
