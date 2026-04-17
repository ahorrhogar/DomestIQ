import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchTrackingService } from "@/services/searchTrackingService";
import { canUseAnalytics } from "@/services/cookieConsentService";
import { mockCatalogSource } from "@/data/sources/mockCatalogSource";

vi.mock("@/services/cookieConsentService", () => ({
  canUseAnalytics: vi.fn(),
}));

vi.mock("@/data/sources/mockCatalogSource", () => ({
  mockCatalogSource: {
    trackSearchTerm: vi.fn(),
  },
}));

describe("searchTrackingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not track when analytics consent is disabled", async () => {
    vi.mocked(canUseAnalytics).mockReturnValue(false);

    await searchTrackingService.track({
      term: "ventilador",
      resultCount: 4,
      path: "/buscar",
    });

    expect(mockCatalogSource.trackSearchTerm).not.toHaveBeenCalled();
  });

  it("deduplicates repeated searches in window", async () => {
    vi.mocked(canUseAnalytics).mockReturnValue(true);

    await searchTrackingService.track({
      term: "freidora aire",
      resultCount: 5,
      path: "/buscar",
    });

    await searchTrackingService.track({
      term: "freidora aire",
      resultCount: 5,
      path: "/buscar",
    });

    expect(mockCatalogSource.trackSearchTerm).toHaveBeenCalledTimes(1);
  });
});
