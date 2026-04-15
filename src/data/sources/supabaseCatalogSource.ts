import { buildPriceAnalysis, computeDiscountPercent } from "@/domain/catalog/product-logic";
import type {
  Category,
  Merchant,
  Offer,
  PriceAnalysis,
  PriceHistory,
  Product,
  ProductSpec,
  Subcategory,
} from "@/domain/catalog/types";
import { logger } from "@/infrastructure/logging/logger";
import { getSupabaseClient, type SupabaseClientLike } from "@/integrations/supabase/client";
import type { CatalogRankingSignals, ExtendedCatalogDataSource } from "@/data/sources/catalogSource.types";
import { PRODUCT_IMAGE_FALLBACK } from "@/lib/productImage";

interface BrandRow {
  id: string;
  name: string;
}

interface CategoryRow {
  id: string;
  name: string;
  slug?: string | null;
  icon?: string | null;
  image_url?: string | null;
  parent_id: string | null;
}

interface ProductRow {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
  description: string;
  specs: unknown;
  attributes?: unknown;
  is_active?: boolean | null;
  created_at: string;
}

interface ProductSignalRow {
  product_id: string;
}

interface HomeClickSignalRow {
  product_id: string;
  clicks: number | string;
}

interface HomeFavoriteSignalRow {
  product_id: string;
  favorites: number | string;
}

interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  is_primary: boolean;
  sort_order?: number | null;
}

interface MerchantRow {
  id: string;
  name: string;
  logo_url: string | null;
}

interface OfferRow {
  id: string;
  product_id: string;
  merchant_id: string;
  price: number | string;
  old_price: number | string | null;
  url: string;
  stock: boolean;
  is_active?: boolean | null;
  updated_at: string;
}

interface PriceHistoryRow {
  id: string;
  product_id: string;
  price: number | string;
  created_at: string;
}

interface OfferRedirectRow {
  id: string;
  product_id: string;
  merchant_id: string;
  url: string;
  merchant_domain?: string | null;
}

export interface TrackClickOptions {
  offerId?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface TrackClickRpcResponse {
  accepted?: boolean;
  reason?: string;
}

interface CatalogSnapshot {
  products: Product[];
  categories: Category[];
  merchants: Merchant[];
  offersByProductId: Map<string, Offer[]>;
  priceHistoryByProductId: Map<string, PriceHistory[]>;
}

interface SnapshotCategoryLookup {
  categoryNameById: Map<string, string>;
  categorySlugById: Map<string, string>;
  subcategoryNameById: Map<string, string>;
  subcategorySlugById: Map<string, string>;
  merchantNamesByProductId: Map<string, string>;
}

const emptyRankingSignals: CatalogRankingSignals = {
  clicksByProductId: {},
  outboundClicksByProductId: {},
  viewsByProductId: {},
  favoritesByProductId: {},
  hasViewSignals: false,
  hasFavoriteSignals: false,
  updatedAt: new Date(0).toISOString(),
};

const SNAPSHOT_TTL_MS = 180000;
const RANKING_SIGNALS_TTL_MS = 120000;

const SPEC_META_KEYS = new Set([
  "slug",
  "longdescription",
  "rating",
  "reviewcount",
  "tags",
  "material",
  "color",
  "style",
  "dimensions",
  "weight",
  "featured",
  "teamrecommended",
  "editorialpriority",
  "bestseller",
  "isnew",
  "sku",
  "ean",
  "isactive",
  "attributes",
]);

const emptySnapshot: CatalogSnapshot = {
  products: [],
  categories: [],
  merchants: [],
  offersByProductId: new Map<string, Offer[]>(),
  priceHistoryByProductId: new Map<string, PriceHistory[]>(),
};

const categoryMetaBySlug: Record<string, { icon: string; description: string; image?: string }> = {
  muebles: {
    icon: "Sofa",
    description: "Sofas, mesas, estanterias y mas para tu hogar",
  },
  cocina: {
    icon: "ChefHat",
    description: "Todo para tu cocina: sartenes, ollas y pequenos electrodomesticos",
  },
  electrodomesticos: {
    icon: "Zap",
    description: "Lavadoras, aspiradoras y soluciones para el hogar",
  },
};

const merchantDefaultsByName: Record<
  string,
  {
    url: string;
    rating: number;
    reviewCount: number;
    shippingInfo: string;
    returnPolicy: string;
    paymentMethods: string[];
    trusted: boolean;
  }
> = {
  amazon: {
    url: "https://amazon.es",
    rating: 4.5,
    reviewCount: 125000,
    shippingInfo: "Envio gratis desde 29 EUR",
    returnPolicy: "30 dias de devolucion",
    paymentMethods: ["Tarjeta", "Bizum", "Transferencia"],
    trusted: true,
  },
  ikea: {
    url: "https://ikea.com/es",
    rating: 4.3,
    reviewCount: 89000,
    shippingInfo: "Desde 4,99 EUR",
    returnPolicy: "365 dias",
    paymentMethods: ["Tarjeta", "PayPal"],
    trusted: true,
  },
  "leroy-merlin": {
    url: "https://leroymerlin.es",
    rating: 4.2,
    reviewCount: 67000,
    shippingInfo: "Gratis en tienda",
    returnPolicy: "14 dias",
    paymentMethods: ["Tarjeta", "PayPal", "Bizum"],
    trusted: true,
  },
  mediamarkt: {
    url: "https://mediamarkt.es",
    rating: 4.2,
    reviewCount: 72000,
    shippingInfo: "Gratis desde 49 EUR",
    returnPolicy: "30 dias",
    paymentMethods: ["Tarjeta", "PayPal", "Bizum"],
    trusted: true,
  },
  carrefour: {
    url: "https://carrefour.es",
    rating: 4.0,
    reviewCount: 55000,
    shippingInfo: "Desde 3,99 EUR",
    returnPolicy: "14 dias",
    paymentMethods: ["Tarjeta", "PayPal"],
    trusted: true,
  },
};

let snapshot: CatalogSnapshot = emptySnapshot;
let initialized = false;
let initPromise: Promise<void> | null = null;
let snapshotRefreshPromise: Promise<void> | null = null;
let snapshotFetchedAt = 0;
let rankingSignals: CatalogRankingSignals = emptyRankingSignals;
let rankingRefreshPromise: Promise<void> | null = null;
let rankingSignalsFetchedAt = 0;

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildSearchTokens(value: string): string[] {
  return normalizeSearchValue(value)
    .split(/[\s-]+/)
    .map((token) => token.replace(/[^a-z0-9]/g, ""))
    .filter((token) => token.length >= 2)
    .slice(0, 8);
}

function buildSnapshotCategoryLookup(snapshotValue: CatalogSnapshot): SnapshotCategoryLookup {
  const categoryNameById = new Map<string, string>();
  const categorySlugById = new Map<string, string>();
  const subcategoryNameById = new Map<string, string>();
  const subcategorySlugById = new Map<string, string>();
  const merchantNamesByProductId = new Map<string, string>();

  snapshotValue.categories.forEach((category) => {
    categoryNameById.set(category.id, category.name);
    categorySlugById.set(category.id, category.slug);

    category.subcategories.forEach((subcategory) => {
      subcategoryNameById.set(subcategory.id, subcategory.name);
      subcategorySlugById.set(subcategory.id, subcategory.slug);

      // Fallback when product.categoryId points to subcategory rows.
      if (!categoryNameById.has(subcategory.id)) {
        categoryNameById.set(subcategory.id, category.name);
      }

      if (!categorySlugById.has(subcategory.id)) {
        categorySlugById.set(subcategory.id, category.slug);
      }
    });
  });

  snapshotValue.products.forEach((product) => {
    const merchantNames = [...new Set(
      (snapshotValue.offersByProductId.get(product.id) || [])
        .map((offer) => offer.merchant.name)
        .filter(Boolean),
    )];

    merchantNamesByProductId.set(product.id, merchantNames.join(" "));
  });

  return {
    categoryNameById,
    categorySlugById,
    subcategoryNameById,
    subcategorySlugById,
    merchantNamesByProductId,
  };
}

function scoreSearchMatch(product: Product, tokens: string[], lookup: SnapshotCategoryLookup): number {
  const normalizedName = normalizeSearchValue(product.name);
  const normalizedBrand = normalizeSearchValue(product.brand);
  const normalizedDescription = normalizeSearchValue(product.description);
  const normalizedTags = product.tags.map((tag) => normalizeSearchValue(tag)).join(" ");
  const normalizedMerchant = normalizeSearchValue(lookup.merchantNamesByProductId.get(product.id) || "");
  const normalizedCategory = normalizeSearchValue(
    [
      lookup.categoryNameById.get(product.categoryId) || "",
      lookup.categorySlugById.get(product.categoryId) || "",
      lookup.subcategoryNameById.get(product.subcategoryId) || "",
      lookup.subcategorySlugById.get(product.subcategoryId) || "",
    ].join(" "),
  );

  let score = 0;

  tokens.forEach((token) => {
    if (normalizedName === token) {
      score += 250;
    } else if (normalizedName.startsWith(token)) {
      score += 120;
    } else if (normalizedName.includes(token)) {
      score += 80;
    }

    if (normalizedBrand === token) {
      score += 90;
    } else if (normalizedBrand.includes(token)) {
      score += 45;
    }

    if (normalizedMerchant === token) {
      score += 120;
    } else if (normalizedMerchant.startsWith(token)) {
      score += 70;
    } else if (normalizedMerchant.includes(token)) {
      score += 55;
    }

    if (normalizedCategory === token) {
      score += 110;
    } else if (normalizedCategory.startsWith(token)) {
      score += 55;
    } else if (normalizedCategory.includes(token)) {
      score += 35;
    }

    if (normalizedTags.includes(token)) {
      score += 30;
    }

    if (normalizedDescription.includes(token)) {
      score += 15;
    }
  });

  return score;
}

function searchProductsInSnapshot(query: string, limit: number): Product[] {
  const tokens = buildSearchTokens(query);
  if (!tokens.length) {
    return [];
  }

  const snapshotValue = currentSnapshot();
  const lookup = buildSnapshotCategoryLookup(snapshotValue);

  return snapshotValue.products
    .map((product) => ({
      product,
      score: scoreSearchMatch(product, tokens, lookup),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || right.product.reviewCount - left.product.reviewCount)
    .slice(0, limit)
    .map((entry) => entry.product);
}

function buildSearchOrFilter(tokens: string[]): string {
  const expressions = tokens.flatMap((token) => [
    `name.ilike.%${token}%`,
    `description.ilike.%${token}%`,
    `slug.ilike.%${token}%`,
  ]);

  return [...new Set(expressions)].join(",");
}

function buildNameSearchFilter(tokens: string[]): string {
  const expressions = tokens.map((token) => `name.ilike.%${token}%`);
  return [...new Set(expressions)].join(",");
}

async function searchProductIdsByBrandAndCategory(
  tokens: string[],
  supabase: SupabaseClientLike,
  limit: number,
): Promise<string[]> {
  const nameSearchFilter = buildNameSearchFilter(tokens);
  if (!nameSearchFilter) {
    return [];
  }

  const [brandResult, categoryResult, merchantResult] = await Promise.all([
    supabase.from("brands").select("id").or(nameSearchFilter).limit(25),
    supabase.from("categories").select("id").or(nameSearchFilter).limit(50),
    supabase.from("merchants").select("id").or(nameSearchFilter).limit(25),
  ]);

  if (brandResult.error) {
    throw brandResult.error;
  }

  if (categoryResult.error) {
    throw categoryResult.error;
  }

  if (merchantResult.error) {
    throw merchantResult.error;
  }

  const brandIds = (brandResult.data || [])
    .map((row) => String((row as { id?: string }).id || ""))
    .filter(Boolean);

  const merchantIds = (merchantResult.data || [])
    .map((row) => String((row as { id?: string }).id || ""))
    .filter(Boolean);

  const categoryIds = new Set(
    (categoryResult.data || [])
      .map((row) => String((row as { id?: string }).id || ""))
      .filter(Boolean),
  );

  if (categoryIds.size > 0) {
    const { data: childCategories, error: childCategoriesError } = await supabase
      .from("categories")
      .select("id")
      .in("parent_id", Array.from(categoryIds));

    if (childCategoriesError) {
      throw childCategoriesError;
    }

    (childCategories || []).forEach((row) => {
      const categoryId = String((row as { id?: string }).id || "");
      if (categoryId) {
        categoryIds.add(categoryId);
      }
    });
  }

  const matchedProductIds = new Set<string>();

  if (brandIds.length > 0) {
    const { data: productsByBrand, error: productsByBrandError } = await supabase
      .from("products")
      .select("id")
      .in("brand_id", brandIds)
      .limit(limit);

    if (productsByBrandError) {
      throw productsByBrandError;
    }

    (productsByBrand || []).forEach((row) => {
      const productId = String((row as { id?: string }).id || "");
      if (productId) {
        matchedProductIds.add(productId);
      }
    });
  }

  if (categoryIds.size > 0) {
    const { data: productsByCategory, error: productsByCategoryError } = await supabase
      .from("products")
      .select("id")
      .in("category_id", Array.from(categoryIds))
      .limit(limit);

    if (productsByCategoryError) {
      throw productsByCategoryError;
    }

    (productsByCategory || []).forEach((row) => {
      const productId = String((row as { id?: string }).id || "");
      if (productId) {
        matchedProductIds.add(productId);
      }
    });
  }

  if (merchantIds.length > 0) {
    const { data: offersByMerchant, error: offersByMerchantError } = await supabase
      .from("offers")
      .select("product_id")
      .in("merchant_id", merchantIds)
      .limit(limit * 3);

    if (offersByMerchantError) {
      throw offersByMerchantError;
    }

    (offersByMerchant || []).forEach((row) => {
      const productId = String((row as { product_id?: string }).product_id || "");
      if (productId) {
        matchedProductIds.add(productId);
      }
    });
  }

  return Array.from(matchedProductIds);
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === "string");
}

function toSpecArray(value: unknown, filterMetaKeys = false): ProductSpec[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const record = entry as Record<string, unknown>;
        const label = typeof record.label === "string" ? record.label : "";
        const specValue = typeof record.value === "string" ? record.value : "";

        if (!label || !specValue) {
          return null;
        }

        return {
          label,
          value: specValue,
        };
      })
      .filter((entry): entry is ProductSpec => Boolean(entry));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([label, specValue]) => {
      const normalizedLabel = label.trim();
      const normalizedLabelKey = normalizedLabel.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (!normalizedLabel || (filterMetaKeys && SPEC_META_KEYS.has(normalizedLabelKey))) {
        return null;
      }

      if (specValue === null || specValue === undefined) {
        return null;
      }

      if (!["string", "number", "boolean"].includes(typeof specValue)) {
        return null;
      }

      const normalizedValue = String(specValue).trim();

      if (!normalizedLabel || !normalizedValue) {
        return null;
      }

      return {
        label: normalizedLabel,
        value: normalizedValue,
      };
    })
    .filter((entry): entry is ProductSpec => Boolean(entry));
}

function parseSpecs(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function extractDomainUrl(urlValue: string | null | undefined, fallback: string): string {
  if (!urlValue) {
    return fallback;
  }

  try {
    const parsed = new URL(urlValue);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return fallback;
  }
}

function groupByKey<T>(rows: T[], keySelector: (row: T) => string): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  rows.forEach((row) => {
    const key = keySelector(row);
    const current = grouped.get(key) || [];
    current.push(row);
    grouped.set(key, current);
  });

  return grouped;
}

function toIsoDate(dateValue: string): string {
  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString().split("T")[0] : parsed.toISOString().split("T")[0];
}

function buildCategories(
  categoryRows: CategoryRow[],
  products: Product[],
): Category[] {
  const categoriesById = new Map(categoryRows.map((row) => [row.id, row]));

  const topCategoryRows = categoryRows.filter((row) => !row.parent_id);
  const subcategoryRowsByParentId = groupByKey(
    categoryRows.filter((row) => Boolean(row.parent_id)),
    (row) => row.parent_id as string,
  );

  const productCountByCategoryId = new Map<string, number>();
  const productCountBySubcategoryId = new Map<string, number>();

  products.forEach((product) => {
    productCountByCategoryId.set(product.categoryId, (productCountByCategoryId.get(product.categoryId) || 0) + 1);
    productCountBySubcategoryId.set(
      product.subcategoryId,
      (productCountBySubcategoryId.get(product.subcategoryId) || 0) + 1,
    );
  });

  return topCategoryRows.map((row) => {
    const slug = row.slug ? slugify(row.slug) : slugify(row.name);
    const meta = categoryMetaBySlug[slug] || {
      icon: "Archive",
      description: `Compara precios de ${row.name.toLowerCase()} en tiempo real`,
    };

    const subcategories = (subcategoryRowsByParentId.get(row.id) || []).map((subRow): Subcategory => ({
      id: subRow.id,
      categoryId: row.id,
      name: subRow.name,
      slug: subRow.slug ? slugify(subRow.slug) : slugify(subRow.name),
      image: subRow.image_url || PRODUCT_IMAGE_FALLBACK,
      productCount: productCountBySubcategoryId.get(subRow.id) || 0,
    }));

    const directCount = productCountByCategoryId.get(row.id) || 0;
    const nestedCount = subcategories.reduce((sum, subcategory) => sum + subcategory.productCount, 0);

    return {
      id: row.id,
      name: row.name,
      slug,
      icon: row.icon || meta.icon,
      description: meta.description,
      image: row.image_url || meta.image || PRODUCT_IMAGE_FALLBACK,
      productCount: directCount + nestedCount,
      subcategories,
    };
  }).filter((category) => categoriesById.has(category.id));
}

function buildProducts(
  productRows: ProductRow[],
  brandRows: BrandRow[],
  categoryRows: CategoryRow[],
  imageRows: ProductImageRow[],
  offerRows: OfferRow[],
): Product[] {
  const brandsById = new Map(brandRows.map((row) => [row.id, row.name]));
  const categoriesById = new Map(categoryRows.map((row) => [row.id, row]));
  const imagesByProductId = groupByKey(imageRows, (row) => row.product_id);
  const offersByProductId = groupByKey(offerRows, (row) => row.product_id);

  return productRows
    .map((row) => {
      if (row.is_active === false) {
        return null;
      }

      const categoryRow = categoriesById.get(row.category_id);
      if (!categoryRow) {
        return null;
      }

      const parentCategory = categoryRow.parent_id ? categoriesById.get(categoryRow.parent_id) : categoryRow;
      const categoryId = parentCategory?.id || categoryRow.id;
      const subcategoryId = categoryRow.id;

      const offers = (offersByProductId.get(row.id) || []).filter((offer) => offer.is_active !== false);
      const minPrice = offers.length > 0 ? Math.min(...offers.map((offer) => toNumber(offer.price))) : 0;
      const maxPrice = offers.length > 0 ? Math.max(...offers.map((offer) => toNumber(offer.price))) : minPrice;
      const originalPriceCandidate = offers.length > 0
        ? Math.max(...offers.map((offer) => toNumber(offer.old_price, 0)))
        : 0;
      const originalPrice = originalPriceCandidate > minPrice ? originalPriceCandidate : undefined;

      const specsRecord = parseSpecs(row.specs);
      const rowAttributes = parseSpecs(row.attributes);
      const specsFromAttributes = toSpecArray(specsRecord.attributes);
      const specsFromRecord = toSpecArray(specsRecord, true);
      const specsFromColumnAttributes = toSpecArray(rowAttributes, true);
      const productSpecs = specsFromAttributes.length
        ? specsFromAttributes
        : specsFromRecord.length
          ? specsFromRecord
          : specsFromColumnAttributes;
      const rawAttributes = parseSpecs(specsRecord.attributes);
      const effectiveAttributes = Object.keys(rawAttributes).length > 0 ? rawAttributes : rowAttributes;
      const editorialPriorityValue = toNumber(
        (specsRecord.editorialPriority as number | string | null | undefined) ??
          (effectiveAttributes.editorialPriority as number | string | null | undefined),
        0,
      );
      const editorialPriority = Math.max(0, Math.min(100, Math.round(editorialPriorityValue)));

      const images = (imagesByProductId.get(row.id) || [])
        .sort((left, right) => {
          const leftSortOrder = Number(left.sort_order ?? 0);
          const rightSortOrder = Number(right.sort_order ?? 0);
          if (leftSortOrder !== rightSortOrder) {
            return leftSortOrder - rightSortOrder;
          }

          const primaryDiff = Number(right.is_primary) - Number(left.is_primary);
          if (primaryDiff !== 0) {
            return primaryDiff;
          }

          return String(left.id).localeCompare(String(right.id));
        })
        .map((image) => image.url);

      const discountPercent = computeDiscountPercent({
        minPrice,
        originalPrice,
      }) || undefined;

      return {
        id: row.id,
        name: row.name,
        slug: typeof specsRecord.slug === "string" ? specsRecord.slug : slugify(row.name),
        categoryId,
        subcategoryId,
        brand: brandsById.get(row.brand_id) || "Marca desconocida",
        description: row.description,
        longDescription:
          typeof specsRecord.longDescription === "string"
            ? specsRecord.longDescription
            : row.description,
        images,
        minPrice,
        maxPrice,
        originalPrice,
        discountPercent,
        rating: toNumber(specsRecord.rating, 0),
        reviewCount: Math.max(0, Math.floor(toNumber(specsRecord.reviewCount, 0))),
        offerCount: offers.length,
        specs: productSpecs,
        tags: toStringArray(specsRecord.tags),
        material: typeof specsRecord.material === "string" ? specsRecord.material : undefined,
        color: typeof specsRecord.color === "string" ? specsRecord.color : undefined,
        style: typeof specsRecord.style === "string" ? specsRecord.style : undefined,
        dimensions: typeof specsRecord.dimensions === "string" ? specsRecord.dimensions : undefined,
        weight: typeof specsRecord.weight === "string" ? specsRecord.weight : undefined,
        featured: toBoolean(specsRecord.featured ?? effectiveAttributes.featured),
        teamRecommended: toBoolean(specsRecord.teamRecommended ?? effectiveAttributes.teamRecommended),
        editorialPriority,
        bestSeller: toBoolean(specsRecord.bestSeller),
        isNew: toBoolean(specsRecord.isNew),
      } satisfies Product;
    })
    .filter((product): product is Product => Boolean(product));
}

function buildMerchants(merchantRows: MerchantRow[], offerRows: OfferRow[]): Merchant[] {
  const offersByMerchantId = groupByKey(offerRows, (row) => row.merchant_id);

  return merchantRows.map((row) => {
    const key = slugify(row.name);
    const defaults = merchantDefaultsByName[key] || {
      url: `https://${slugify(row.name)}.com`,
      rating: 4.0,
      reviewCount: 10000,
      shippingInfo: "Envio segun condiciones de tienda",
      returnPolicy: "Devolucion segun tienda",
      paymentMethods: ["Tarjeta"],
      trusted: true,
    };

    const firstOffer = (offersByMerchantId.get(row.id) || [])[0];

    return {
      id: row.id,
      name: row.name,
      logo: row.logo_url || undefined,
      rating: defaults.rating,
      reviewCount: defaults.reviewCount,
      url: extractDomainUrl(firstOffer?.url, defaults.url),
      shippingInfo: defaults.shippingInfo,
      returnPolicy: defaults.returnPolicy,
      paymentMethods: defaults.paymentMethods,
      trusted: defaults.trusted,
    } satisfies Merchant;
  });
}

function buildOffers(offerRows: OfferRow[], merchants: Merchant[]): Map<string, Offer[]> {
  const merchantsById = new Map(merchants.map((merchant) => [merchant.id, merchant]));

  const mappedOffers = offerRows
    .map((row) => {
      if (row.is_active === false) {
        return null;
      }

      const merchant = merchantsById.get(row.merchant_id);
      if (!merchant) {
        return null;
      }

      const price = toNumber(row.price, 0);
      const shippingCost = price >= 80 ? 0 : 4.99;

      return {
        id: row.id,
        productId: row.product_id,
        merchantId: row.merchant_id,
        merchant,
        price,
        originalPrice: toNumber(row.old_price, 0) > price ? toNumber(row.old_price, 0) : undefined,
        shippingCost,
        freeShipping: shippingCost === 0,
        fastShipping: true,
        inStock: row.stock,
        url: row.url,
        lastUpdated: new Date(row.updated_at).toISOString(),
      } satisfies Offer;
    })
    .filter((offer): offer is Offer => Boolean(offer));

  const offersByProductId = groupByKey(mappedOffers, (offer) => offer.productId);

  offersByProductId.forEach((offers, productId) => {
    offersByProductId.set(
      productId,
      [...offers].sort((left, right) => left.price + left.shippingCost - (right.price + right.shippingCost)),
    );
  });

  return offersByProductId;
}

function buildPriceHistoryMap(rows: PriceHistoryRow[]): Map<string, PriceHistory[]> {
  const grouped = groupByKey(rows, (row) => row.product_id);
  const historyByProductId = new Map<string, PriceHistory[]>();

  grouped.forEach((historyRows, productId) => {
    const mapped = historyRows
      .map((row) => ({
        date: toIsoDate(row.created_at),
        price: toNumber(row.price, 0),
      }))
      .sort((left, right) => left.date.localeCompare(right.date));

    historyByProductId.set(productId, mapped);
  });

  return historyByProductId;
}

function countByProductId(rows: ProductSignalRow[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const productId = String(row.product_id || "");
    if (!productId) {
      continue;
    }

    counts[productId] = (counts[productId] || 0) + 1;
  }

  return counts;
}

function countFromAggregateRows(
  rows: Array<{ product_id: string; count: number | string }> | Array<{ product_id: string; clicks: number | string }> | Array<{ product_id: string; favorites: number | string }>,
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const productId = String(row.product_id || "");
    if (!productId) {
      continue;
    }

    const value = "clicks" in row
      ? toNumber(row.clicks, 0)
      : "favorites" in row
        ? toNumber(row.favorites, 0)
        : toNumber((row as { count?: number | string }).count, 0);

    if (value <= 0) {
      continue;
    }

    counts[productId] = value;
  }

  return counts;
}

function isMissingRelationError(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) {
    return false;
  }

  const code = String(error.code || "").toUpperCase();
  if (code === "42P01" || code === "PGRST202" || code === "PGRST204" || code === "PGRST205") {
    return true;
  }

  const message = String(error.message || "").toLowerCase();
  return message.includes("does not exist") || message.includes("could not find") || message.includes("relation");
}

async function queryOptionalSignalRows(
  tables: string[],
  client: SupabaseClientLike,
): Promise<{ counts: Record<string, number>; found: boolean }> {
  for (const table of tables) {
    const result = await client.from(table).select("product_id").limit(10000);

    if (!result.error) {
      return {
        counts: countByProductId((result.data || []) as ProductSignalRow[]),
        found: true,
      };
    }

    if (isMissingRelationError(result.error)) {
      continue;
    }

    logger.log({
      level: "warn",
      message: "Optional signal source query failed",
      timestamp: new Date().toISOString(),
      context: {
        table,
        error: result.error,
      },
    });
  }

  return { counts: {}, found: false };
}

async function fetchRankingSignals(client: SupabaseClientLike): Promise<CatalogRankingSignals> {
  const [productViewsResult, favoriteResult, explicitViewsResult] = await Promise.all([
    client.from("products").select("id,search_count"),
    queryOptionalSignalRows(["product_favorites", "favorites", "user_favorites", "wishlists"], client),
    queryOptionalSignalRows(["product_views", "views", "product_impressions"], client),
  ]);

  let clicksByProductId: Record<string, number> = {};
  const clickSignalResult = await client.rpc("get_home_click_signals", {
    p_days: 120,
    p_limit: 10000,
  });

  if (!clickSignalResult.error) {
    clicksByProductId = countFromAggregateRows((clickSignalResult.data || []) as HomeClickSignalRow[]);
  } else {
    const fallbackClicksResult = await client
      .from("clicks")
      .select("product_id")
      .order("created_at", { ascending: false })
      .limit(10000);

    if (!fallbackClicksResult.error) {
      clicksByProductId = countByProductId((fallbackClicksResult.data || []) as ProductSignalRow[]);
    } else {
      logger.log({
        level: "warn",
        message: "Clicks signals unavailable for home ranking",
        timestamp: new Date().toISOString(),
        context: {
          rpcError: clickSignalResult.error,
          fallbackError: fallbackClicksResult.error,
        },
      });
    }
  }

  const outboundClicksByProductId = { ...clicksByProductId };

  let viewsByProductId: Record<string, number> = {};
  let hasViewSignals = explicitViewsResult.found;

  if (explicitViewsResult.found) {
    viewsByProductId = explicitViewsResult.counts;
  } else {
    if (productViewsResult.error && !isMissingRelationError(productViewsResult.error)) {
      logger.log({
        level: "warn",
        message: "Products search_count query for view signals failed",
        timestamp: new Date().toISOString(),
        context: {
          error: productViewsResult.error,
        },
      });
    }

    const fallbackViews: Record<string, number> = {};
    for (const row of productViewsResult.data || []) {
      const productId = String(row.id || "");
      const count = toNumber((row as { search_count?: number | string | null }).search_count, 0);
      if (!productId || count <= 0) {
        continue;
      }

      fallbackViews[productId] = count;
    }

    viewsByProductId = fallbackViews;
    hasViewSignals = Object.keys(fallbackViews).length > 0;
  }

  let favoritesByProductId = favoriteResult.counts;
  let hasFavoriteSignals = favoriteResult.found;

  const favoriteSignalResult = await client.rpc("get_home_favorite_signals", {
    p_days: 365,
    p_limit: 10000,
  });

  if (!favoriteSignalResult.error) {
    favoritesByProductId = countFromAggregateRows((favoriteSignalResult.data || []) as HomeFavoriteSignalRow[]);
    hasFavoriteSignals = true;
  } else if (!isMissingRelationError(favoriteSignalResult.error)) {
    logger.log({
      level: "warn",
      message: "Favorite signal RPC query failed",
      timestamp: new Date().toISOString(),
      context: {
        error: favoriteSignalResult.error,
      },
    });
  }

  return {
    clicksByProductId,
    outboundClicksByProductId,
    viewsByProductId,
    favoritesByProductId,
    hasViewSignals,
    hasFavoriteSignals,
    updatedAt: new Date().toISOString(),
  };
}

async function refreshSnapshot(client?: SupabaseClientLike): Promise<void> {
  const supabase = client || getSupabaseClient();
  snapshot = await buildSnapshot(supabase);
  snapshotFetchedAt = Date.now();
}

function refreshSnapshotIfStale(): void {
  if (!initialized) {
    return;
  }

  const now = Date.now();
  if (snapshotRefreshPromise || now - snapshotFetchedAt < SNAPSHOT_TTL_MS) {
    return;
  }

  snapshotRefreshPromise = refreshSnapshot()
    .catch((error) => {
      logger.log({
        level: "warn",
        message: "Catalog snapshot refresh failed",
        timestamp: new Date().toISOString(),
        context: { error },
      });
    })
    .finally(() => {
      snapshotRefreshPromise = null;
    });
}

async function refreshRankingSignals(client?: SupabaseClientLike): Promise<void> {
  const supabase = client || getSupabaseClient();
  rankingSignals = await fetchRankingSignals(supabase);
  rankingSignalsFetchedAt = Date.now();
}

function refreshRankingSignalsIfStale(): void {
  if (!initialized) {
    return;
  }

  const now = Date.now();
  if (rankingRefreshPromise || now - rankingSignalsFetchedAt < RANKING_SIGNALS_TTL_MS) {
    return;
  }

  rankingRefreshPromise = refreshRankingSignals()
    .catch((error) => {
      logger.log({
        level: "warn",
        message: "Ranking signal refresh failed",
        timestamp: new Date().toISOString(),
        context: { error },
      });
    })
    .finally(() => {
      rankingRefreshPromise = null;
    });
}

async function queryTable<T>(
  table: string,
  columns: string,
  client: SupabaseClientLike,
): Promise<T[]> {
  const { data, error } = await client.from(table).select(columns);

  if (error) {
    throw error;
  }

  return (data || []) as T[];
}

async function buildSnapshot(client: SupabaseClientLike): Promise<CatalogSnapshot> {
  const [brandRows, categoryRows, productRows, imageRows, merchantRows, offerRows, priceHistoryRows] = await Promise.all([
    queryTable<BrandRow>("brands", "id,name", client),
    queryTable<CategoryRow>("categories", "id,name,slug,icon,image_url,parent_id", client),
    queryTable<ProductRow>("products", "id,name,brand_id,category_id,description,specs,attributes,is_active,created_at", client),
    queryTable<ProductImageRow>("product_images", "id,product_id,url,is_primary,sort_order", client),
    queryTable<MerchantRow>("merchants", "id,name,logo_url", client),
    queryTable<OfferRow>("offers", "id,product_id,merchant_id,price,old_price,url,stock,is_active,updated_at", client),
    queryTable<PriceHistoryRow>("price_history", "id,product_id,price,created_at", client),
  ]);

  const products = buildProducts(productRows, brandRows, categoryRows, imageRows, offerRows);
  const merchants = buildMerchants(merchantRows, offerRows);
  const offersByProductId = buildOffers(offerRows, merchants);
  const priceHistoryByProductId = buildPriceHistoryMap(priceHistoryRows);
  const categories = buildCategories(categoryRows, products);

  return {
    products,
    categories,
    merchants,
    offersByProductId,
    priceHistoryByProductId,
  };
}

async function ensureInitialized(): Promise<void> {
  if (initialized) {
    return;
  }

  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    try {
      const client = getSupabaseClient();
      await Promise.all([
        refreshSnapshot(client),
        refreshRankingSignals(client),
      ]);
      initialized = true;
      logger.log({
        level: "info",
        message: "Supabase catalog source initialized",
        timestamp: new Date().toISOString(),
        context: {
          products: snapshot.products.length,
          categories: snapshot.categories.length,
          merchants: snapshot.merchants.length,
          rankingSignalsUpdatedAt: rankingSignals.updatedAt,
        },
      });
    } catch (error) {
      logger.log({
        level: "error",
        message: "Supabase catalog source initialization failed",
        timestamp: new Date().toISOString(),
        context: {
          error,
        },
      });
      throw error;
    } finally {
      initPromise = null;
    }
  })();

  await initPromise;
}

function currentSnapshot(): CatalogSnapshot {
  if (!initialized && !initPromise) {
    void ensureInitialized();
  }

  refreshSnapshotIfStale();
  return snapshot;
}

function currentRankingSignals(): CatalogRankingSignals {
  if (!initialized && !initPromise) {
    void ensureInitialized();
  }

  refreshRankingSignalsIfStale();
  return rankingSignals;
}

export async function initializeCatalogSource(): Promise<void> {
  await ensureInitialized();
}

export async function refreshCatalogSnapshotNow(): Promise<void> {
  await refreshSnapshot();
}

export function invalidateCatalogSnapshotCache(): void {
  snapshotFetchedAt = 0;
}

export async function trackClick(
  productId: string,
  merchantId: string,
  client?: SupabaseClientLike,
  options?: TrackClickOptions,
): Promise<void> {
  const supabase = client || getSupabaseClient();
  const { data, error } = await supabase.rpc("track_click_secure", {
    p_product_id: productId,
    p_merchant_id: merchantId,
    p_offer_id: options?.offerId || null,
    p_ip_override: options?.ipAddress || null,
    p_user_agent_override: options?.userAgent || null,
  });

  if (error) {
    logger.log({
      level: "warn",
      message: "Click tracking RPC failed",
      timestamp: new Date().toISOString(),
      context: {
        productId,
        merchantId,
        offerId: options?.offerId || null,
        error,
      },
    });
    return;
  }

  const payload = data && typeof data === "object" ? (data as TrackClickRpcResponse) : null;
  if (!payload?.accepted) {
    logger.log({
      level: "info",
      message: "Click tracking blocked by anti-abuse controls",
      timestamp: new Date().toISOString(),
      context: {
        productId,
        merchantId,
        offerId: options?.offerId || null,
        reason: payload?.reason || "unknown",
      },
    });
    return;
  }

  const currentClicks = rankingSignals.clicksByProductId[productId] || 0;
  rankingSignals = {
    ...rankingSignals,
    clicksByProductId: {
      ...rankingSignals.clicksByProductId,
      [productId]: currentClicks + 1,
    },
    outboundClicksByProductId: {
      ...rankingSignals.outboundClicksByProductId,
      [productId]: (rankingSignals.outboundClicksByProductId[productId] || 0) + 1,
    },
    updatedAt: new Date().toISOString(),
  };
  rankingSignalsFetchedAt = Date.now();
}

export async function getOfferRedirectPayload(
  offerId: string,
  client?: SupabaseClientLike,
): Promise<OfferRedirectRow | null> {
  const supabase = client || getSupabaseClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id,product_id,merchant_id,url,merchants(domain)")
    .eq("id", offerId)
    .maybeSingle();

  if (error) {
    logger.log({
      level: "warn",
      message: "Offer redirect lookup failed",
      timestamp: new Date().toISOString(),
      context: {
        offerId,
        error,
      },
    });
    return null;
  }

  if (!data) {
    return null;
  }

  const merchantData =
    data.merchants && typeof data.merchants === "object" && !Array.isArray(data.merchants)
      ? (data.merchants as { domain?: unknown })
      : null;

  return {
    id: String(data.id),
    product_id: String(data.product_id),
    merchant_id: String(data.merchant_id),
    url: String(data.url || ""),
    merchant_domain: merchantData?.domain ? String(merchantData.domain) : null,
  };
}

export async function searchProducts(
  query: string,
  limit = 40,
  client?: SupabaseClientLike,
): Promise<Product[]> {
  const cappedLimit = Math.max(1, Math.min(limit, 200));
  const localMatches = searchProductsInSnapshot(query, cappedLimit);
  const tokens = buildSearchTokens(query);

  if (!tokens.length) {
    return [];
  }

  const searchFilter = buildSearchOrFilter(tokens);
  if (!searchFilter) {
    return localMatches;
  }

  try {
    const supabase = client || getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("id")
      .or(searchFilter)
      .limit(Math.max(cappedLimit * 2, 24));

    if (error) {
      throw error;
    }

    const remoteIds = (data || [])
      .map((row) => String((row as { id?: string }).id || ""))
      .filter(Boolean);

    const relationMatchIds = await searchProductIdsByBrandAndCategory(
      tokens,
      supabase,
      Math.max(cappedLimit * 2, 24),
    );

    const candidateIds = [...remoteIds, ...relationMatchIds];

    if (!candidateIds.length) {
      return localMatches;
    }

    const productsById = new Map(currentSnapshot().products.map((product) => [product.id, product]));
    const merged: Product[] = [];
    const seen = new Set<string>();

    candidateIds.forEach((productId) => {
      const product = productsById.get(productId);
      if (!product || seen.has(productId)) {
        return;
      }

      seen.add(productId);
      merged.push(product);
    });

    localMatches.forEach((product) => {
      if (seen.has(product.id)) {
        return;
      }

      seen.add(product.id);
      merged.push(product);
    });

    return merged.slice(0, cappedLimit);
  } catch (error) {
    logger.log({
      level: "warn",
      message: "Remote product search failed. Falling back to local snapshot search",
      timestamp: new Date().toISOString(),
      context: {
        query,
        error,
      },
    });

    return localMatches;
  }
}

export interface SupabaseCatalogSource extends ExtendedCatalogDataSource {
  initialize(): Promise<void>;
  getProductById(productId: string): Product | undefined;
  getProductsByCategory(categoryId: string): Product[];
  searchProducts(query: string, limit?: number): Promise<Product[]>;
  getOffersByProduct(productId: string): Offer[];
  trackClick(productId: string, merchantId: string): Promise<void>;
  getOfferRedirectPayload(offerId: string): Promise<OfferRedirectRow | null>;
  getRankingSignals(): CatalogRankingSignals;
}

export const supabaseCatalogSource: SupabaseCatalogSource = {
  initialize: ensureInitialized,
  getProducts: () => currentSnapshot().products,
  getCategories: () => currentSnapshot().categories,
  getMerchants: () => currentSnapshot().merchants,
  getBestSellers: () => currentSnapshot().products.filter((product) => product.bestSeller),
  getFeaturedProducts: () => currentSnapshot().products.filter((product) => product.featured),
  getProductById: (productId: string) => currentSnapshot().products.find((product) => product.id === productId),
  getProductsByCategory: (categoryId: string) =>
    currentSnapshot().products.filter(
      (product) => product.categoryId === categoryId || product.subcategoryId === categoryId,
    ),
  searchProducts: (query: string, limit?: number) => searchProducts(query, limit),
  getOffersForProduct: (productId: string) => currentSnapshot().offersByProductId.get(productId) || [],
  getOffersByProduct: (productId: string) => currentSnapshot().offersByProductId.get(productId) || [],
  getPriceHistory: (productId: string) => currentSnapshot().priceHistoryByProductId.get(productId) || [],
  getPriceAnalysis: (productId: string): PriceAnalysis =>
    buildPriceAnalysis(currentSnapshot().priceHistoryByProductId.get(productId) || []),
  trackClick: (productId: string, merchantId: string) => trackClick(productId, merchantId),
  getOfferRedirectPayload: (offerId: string) => getOfferRedirectPayload(offerId),
  getRankingSignals: () => currentRankingSignals(),
};
