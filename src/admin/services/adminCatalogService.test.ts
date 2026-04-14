import { describe, expect, it } from "vitest";
import { mapAdminErrorMessage } from "@/admin/services/adminCatalogService";

describe("adminCatalogService mapAdminErrorMessage", () => {
  it("maps duplicate product errors", () => {
    const message = mapAdminErrorMessage(
      { message: "duplicate key value violates unique constraint idx_products_slug_unique" },
      "fallback",
    );

    expect(message).toContain("Producto duplicado");
  });

  it("maps foreign key delete errors", () => {
    const message = mapAdminErrorMessage(
      { message: "update or delete on table products violates foreign key constraint offers_product_id_fkey" },
      "fallback",
    );

    expect(message).toContain("ofertas asociadas");
  });

  it("maps rate limit errors", () => {
    const message = mapAdminErrorMessage(
      { message: "rate limit exceeded for user_limit" },
      "fallback",
    );

    expect(message).toContain("limite temporal");
  });
});
