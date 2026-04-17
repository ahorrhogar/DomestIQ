import { describe, expect, it, vi } from "vitest";
import { supabaseCatalogSource, trackClick, trackSearchTerm } from "@/data/sources/supabaseCatalogSource";

interface MockSupabaseClient {
  rpc: ReturnType<typeof vi.fn>;
}

function buildMockClient(response: { data: unknown; error: unknown }): MockSupabaseClient {
  return {
    rpc: vi.fn().mockResolvedValue(response),
  };
}

describe("supabaseCatalogSource.trackClick", () => {
  it("registra un click valido", async () => {
    const productId = "00000000-0000-0000-0000-000000000011";
    const merchantId = "00000000-0000-0000-0000-000000000021";
    const before = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    const client = buildMockClient({ data: { accepted: true, reason: "accepted" }, error: null });

    await trackClick(productId, merchantId, client as never, {
      offerId: "00000000-0000-0000-0000-000000000031",
      ipAddress: "203.0.113.10",
      userAgent: "Mozilla/5.0",
    });

    const after = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;

    expect(after).toBe(before + 1);
    expect(client.rpc).toHaveBeenCalledWith(
      "track_click_secure",
      expect.objectContaining({
        p_product_id: productId,
        p_merchant_id: merchantId,
        p_offer_id: "00000000-0000-0000-0000-000000000031",
      }),
    );
  });

  it("bloquea click duplicado", async () => {
    const productId = "00000000-0000-0000-0000-000000000012";
    const merchantId = "00000000-0000-0000-0000-000000000022";
    const before = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    const client = buildMockClient({ data: { accepted: false, reason: "duplicate_click" }, error: null });

    await trackClick(productId, merchantId, client as never, {
      ipAddress: "203.0.113.11",
      userAgent: "Mozilla/5.0",
    });

    const after = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    expect(after).toBe(before);
  });

  it("bloquea click excesivo por ip", async () => {
    const productId = "00000000-0000-0000-0000-000000000013";
    const merchantId = "00000000-0000-0000-0000-000000000023";
    const before = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    const client = buildMockClient({ data: { accepted: false, reason: "rate_limited" }, error: null });

    await trackClick(productId, merchantId, client as never, {
      ipAddress: "203.0.113.12",
      userAgent: "Mozilla/5.0",
    });

    const after = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    expect(after).toBe(before);
  });

  it("bloquea click con datos invalidos", async () => {
    const productId = "00000000-0000-0000-0000-000000000014";
    const merchantId = "00000000-0000-0000-0000-000000000024";
    const before = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    const client = buildMockClient({ data: { accepted: false, reason: "invalid_reference" }, error: null });

    await trackClick(productId, merchantId, client as never, {
      ipAddress: "203.0.113.13",
      userAgent: "Mozilla/5.0",
    });

    const after = supabaseCatalogSource.getRankingSignals().clicksByProductId[productId] || 0;
    expect(after).toBe(before);
  });
});

describe("supabaseCatalogSource.trackSearchTerm", () => {
  it("registra busqueda valida y suma vista al top product", async () => {
    const productId = "00000000-0000-0000-0000-000000000099";
    const before = supabaseCatalogSource.getRankingSignals().viewsByProductId[productId] || 0;
    const client = buildMockClient({ data: { accepted: true, reason: "accepted" }, error: null });

    await trackSearchTerm(
      "ventilador silencioso",
      {
        sessionId: "session-test",
        resultCount: 8,
        topProductId: productId,
        path: "/buscar",
      },
      client as never,
    );

    const after = supabaseCatalogSource.getRankingSignals().viewsByProductId[productId] || 0;
    expect(after).toBe(before + 1);
    expect(client.rpc).toHaveBeenCalledWith(
      "track_search_term_secure",
      expect.objectContaining({
        p_term: "ventilador silencioso",
        p_top_product_id: productId,
      }),
    );
  });

  it("no suma vista cuando dedupe de servidor rechaza", async () => {
    const productId = "00000000-0000-0000-0000-000000000100";
    const before = supabaseCatalogSource.getRankingSignals().viewsByProductId[productId] || 0;
    const client = buildMockClient({ data: { accepted: false, reason: "duplicate_search" }, error: null });

    await trackSearchTerm(
      "ventilador silencioso",
      {
        sessionId: "session-test",
        resultCount: 8,
        topProductId: productId,
        path: "/buscar",
      },
      client as never,
    );

    const after = supabaseCatalogSource.getRankingSignals().viewsByProductId[productId] || 0;
    expect(after).toBe(before);
  });
});
