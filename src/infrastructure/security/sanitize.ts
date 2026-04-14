import type { AnalyticsEvent } from "@/infrastructure/analytics/events";

const TEXT_SANITIZE_PATTERN = /[^\p{L}\p{N}\s\-_.:/]/gu;

export function sanitizeText(input: string, maxLength = 200): string {
  return input.replace(TEXT_SANITIZE_PATTERN, "").trim().slice(0, maxLength);
}

export function sanitizeNumber(input: number, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isFinite(input)) {
    return min;
  }

  return Math.max(min, Math.min(max, input));
}

export function sanitizeAnalyticsEvent(event: AnalyticsEvent): AnalyticsEvent {
  const sanitizedPayload: AnalyticsEvent["payload"] = {};

  for (const [key, value] of Object.entries(event.payload)) {
    const safeKey = sanitizeText(key, 64);

    if (typeof value === "string") {
      sanitizedPayload[safeKey] = sanitizeText(value, 256);
      continue;
    }

    if (typeof value === "number") {
      sanitizedPayload[safeKey] = sanitizeNumber(value);
      continue;
    }

    if (typeof value === "boolean" || value === null || value === undefined) {
      sanitizedPayload[safeKey] = value;
    }
  }

  return {
    ...event,
    timestamp: new Date(event.timestamp).toISOString(),
    payload: sanitizedPayload,
  };
}
