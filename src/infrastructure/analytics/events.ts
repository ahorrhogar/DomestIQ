export type AnalyticsEventName =
  | "page_view"
  | "category_view"
  | "product_view"
  | "offer_click"
  | "assistant_search";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  timestamp: string;
  payload: Record<string, string | number | boolean | null | undefined>;
}

const allowedEventNames: AnalyticsEventName[] = [
  "page_view",
  "category_view",
  "product_view",
  "offer_click",
  "assistant_search",
];

export function isKnownAnalyticsEvent(value: string): value is AnalyticsEventName {
  return allowedEventNames.includes(value as AnalyticsEventName);
}
