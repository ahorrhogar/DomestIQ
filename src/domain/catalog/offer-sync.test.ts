import { describe, expect, it } from "vitest";
import {
  computeOfferFreshnessScore,
  computeOfferPriorityScore,
  defaultOfferUpdatePolicy,
} from "@/domain/catalog/offer-sync";

describe("offer sync domain helpers", () => {
  it("calculates freshness from last check age", () => {
    const now = new Date("2026-04-14T12:00:00.000Z");
    const fresh = computeOfferFreshnessScore({ lastCheckedAt: "2026-04-14T11:00:00.000Z", now, staleAfterHours: 72 });
    const stale = computeOfferFreshnessScore({ lastCheckedAt: "2026-04-10T11:00:00.000Z", now, staleAfterHours: 48 });

    expect(fresh).toBeGreaterThan(90);
    expect(stale).toBeLessThan(10);
  });

  it("prioritizes stale and high-traffic offers", () => {
    const staleHighTraffic = computeOfferPriorityScore({
      syncStatus: "stale",
      clicks: 50,
      views: 500,
      merchantWeight: 4,
      categoryRevenueWeight: 15,
      isFeatured: true,
    });

    const okLowTraffic = computeOfferPriorityScore({
      syncStatus: "ok",
      clicks: 2,
      views: 10,
      merchantWeight: 1,
      categoryRevenueWeight: 0,
      isFeatured: false,
    });

    expect(staleHighTraffic).toBeGreaterThan(okLowTraffic);
  });

  it("marks as stale when check age exceeds threshold", () => {
    const now = new Date("2026-04-14T12:00:00.000Z");

    expect(
      defaultOfferUpdatePolicy.shouldMarkStale({
        lastCheckedAt: "2026-04-11T11:00:00.000Z",
        now,
        staleAfterHours: 24,
      }),
    ).toBe(true);

    expect(
      defaultOfferUpdatePolicy.shouldMarkStale({
        lastCheckedAt: "2026-04-14T08:00:00.000Z",
        now,
        staleAfterHours: 24,
      }),
    ).toBe(false);
  });
});
