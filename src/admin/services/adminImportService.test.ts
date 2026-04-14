import { describe, expect, it } from "vitest";
import { parseCsvPreview } from "@/admin/services/adminImportService";

describe("adminImportService parseCsvPreview", () => {
  it("parses headers and rows", () => {
    const csv = "product_name,brand_name,merchant_name,offer_url,price\nSilla,Marca X,Tienda Y,https://tienda.test/silla,19.99";
    const preview = parseCsvPreview(csv);

    expect(preview.totalRows).toBe(1);
    expect(preview.headers).toContain("product_name");
    expect(preview.mapping.productName).toBe("product_name");
  });

  it("enforces csv size limit", () => {
    const oversized = "a".repeat(2_000_001);
    expect(() => parseCsvPreview(oversized)).toThrow(/2MB/);
  });
});
