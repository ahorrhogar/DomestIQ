import { describe, expect, it } from "vitest";
import {
  computeHomeCollections,
  getBestDeals,
  getFeaturedProducts,
  getTopRatedProducts,
} from "@/domain/catalog/home-ranking";
import type { Offer, Product } from "@/domain/catalog/types";

function buildProduct(overrides: Partial<Product>): Product {
  return {
    id: overrides.id || "p-1",
    name: overrides.name || "Producto",
    slug: overrides.slug || "producto",
    categoryId: overrides.categoryId || "cat-1",
    subcategoryId: overrides.subcategoryId || "sub-1",
    brand: overrides.brand || "Marca",
    description: overrides.description || "Descripcion",
    longDescription: overrides.longDescription || "Descripcion larga",
    images: overrides.images || ["https://example.com/image.jpg"],
    minPrice: overrides.minPrice ?? 100,
    maxPrice: overrides.maxPrice ?? 120,
    originalPrice: overrides.originalPrice,
    discountPercent: overrides.discountPercent,
    rating: overrides.rating ?? 0,
    reviewCount: overrides.reviewCount ?? 0,
    offerCount: overrides.offerCount ?? 1,
    specs: overrides.specs || [],
    tags: overrides.tags || [],
    featured: overrides.featured,
    bestSeller: overrides.bestSeller,
    isNew: overrides.isNew,
    teamRecommended: overrides.teamRecommended,
    editorialPriority: overrides.editorialPriority,
  };
}

function buildOffer(productId: string, price: number, originalPrice?: number): Offer {
  return {
    id: `offer-${productId}`,
    productId,
    merchantId: "m-1",
    merchant: {
      id: "m-1",
      name: "Tienda",
      rating: 4,
      reviewCount: 10,
      url: "https://example.com",
      shippingInfo: "Envio",
      returnPolicy: "30 dias",
      paymentMethods: ["Tarjeta"],
      trusted: true,
    },
    price,
    originalPrice,
    shippingCost: 0,
    freeShipping: true,
    fastShipping: true,
    inStock: true,
    url: "https://example.com/offer",
    lastUpdated: new Date().toISOString(),
  };
}

describe("home ranking", () => {
  it("only includes real discounted products in deals", () => {
    const discounted = buildProduct({ id: "p-discount", minPrice: 80, rating: 4.5, reviewCount: 20 });
    const noDiscount = buildProduct({ id: "p-no-discount", minPrice: 90, rating: 4.4, reviewCount: 20 });

    const offersByProductId = new Map<string, Offer[]>([
      [discounted.id, [buildOffer(discounted.id, 80, 120)]],
      [noDiscount.id, [buildOffer(noDiscount.id, 90)]],
    ]);

    const deals = getBestDeals({ products: [discounted, noDiscount], offersByProductId }, 4);
    expect(deals.map((item) => item.id)).toEqual([discounted.id]);
  });

  it("does not invent top rated products without ratings or manual override", () => {
    const unrated = buildProduct({ id: "p-unrated", rating: 0, reviewCount: 0 });

    const topRated = getTopRatedProducts({
      products: [unrated],
      offersByProductId: new Map([[unrated.id, [buildOffer(unrated.id, 100, 120)]]]),
    }, 4);

    expect(topRated).toHaveLength(0);
  });

  it("prioritizes manual featured/editorial products", () => {
    const editorial = buildProduct({ id: "p-editorial", featured: true, editorialPriority: 90, rating: 0, reviewCount: 0 });
    const normal = buildProduct({ id: "p-normal", rating: 4.6, reviewCount: 120 });

    const offersByProductId = new Map<string, Offer[]>([
      [editorial.id, [buildOffer(editorial.id, 100, 130)]],
      [normal.id, [buildOffer(normal.id, 95, 125)]],
    ]);

    const featured = getFeaturedProducts({ products: [normal, editorial], offersByProductId }, 2);
    expect(featured[0]?.id).toBe(editorial.id);

    const collections = computeHomeCollections(
      {
        products: [normal, editorial],
        offersByProductId,
        signals: {
          clicksByProductId: { [normal.id]: 20, [editorial.id]: 2 },
          viewsByProductId: { [normal.id]: 30, [editorial.id]: 3 },
          favoritesByProductId: {},
          outboundClicksByProductId: {},
        },
      },
      { topProducts: 2, featuredProducts: 2 },
    );

    expect(collections.featuredProducts[0]?.id).toBe(editorial.id);
  });
});
