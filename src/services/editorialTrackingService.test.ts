import { beforeEach, describe, expect, it, vi } from "vitest";
import { editorialTrackingService } from "@/services/editorialTrackingService";
import { canUseAnalytics } from "@/services/cookieConsentService";
import { getSupabaseClient } from "@/integrations/supabase/client";

vi.mock("@/services/cookieConsentService", () => ({
  canUseAnalytics: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: vi.fn(),
}));

describe("editorialTrackingService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not track without analytics consent", async () => {
    vi.mocked(canUseAnalytics).mockReturnValue(false);

    const rpc = vi.fn().mockResolvedValue({ data: { accepted: true }, error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await editorialTrackingService.trackArticleView({ slug: "articulo-test" });

    expect(rpc).not.toHaveBeenCalled();
  });

  it("deduplicates repeated article views in local window", async () => {
    vi.mocked(canUseAnalytics).mockReturnValue(true);

    const rpc = vi.fn().mockResolvedValue({ data: { accepted: true }, error: null });
    vi.mocked(getSupabaseClient).mockReturnValue({ rpc } as never);

    await editorialTrackingService.trackArticleView({ slug: "articulo-unico-test" });
    await editorialTrackingService.trackArticleView({ slug: "articulo-unico-test" });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith(
      "track_article_view_secure",
      expect.objectContaining({ p_article_slug: "articulo-unico-test" }),
    );
  });
});
