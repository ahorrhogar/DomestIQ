import { getSupabaseClient } from "@/integrations/supabase/client";
import { sanitizeNumber, sanitizeText } from "@/infrastructure/security/sanitize";
import { invalidateCatalogSnapshotCache, refreshCatalogSnapshotNow } from "@/data/sources/supabaseCatalogSource";
import {
  extractDomainFromAffiliateUrl,
  isAffiliateUrlAllowed,
  normalizeDomain,
  parseAffiliateUrl,
} from "@/infrastructure/security/affiliateUrl";
import type {
  AdminActionRecord,
  AdminBrandRecord,
  AdminCategoryRecord,
  AdminClickRecord,
  AdminImportJobLogRecord,
  AdminImportJobRecord,
  AdminListQuery,
  AdminMerchantRecord,
  AdminOfferRecord,
  AdminOfferPriceHistoryRecord,
  AdminProductImageRecord,
  AdminProductRecord,
  DashboardMetrics,
  OfferSourceType,
  OfferSyncStatus,
  OfferUpdateMode,
  SyncStatusRecord,
} from "@/admin/types";
import {
  mark_offer_fresh,
  mark_offer_stale,
  sync_offers_batch,
  sync_price_for_offer,
  update_price_history_on_change,
} from "@/admin/services/offerSyncService";

export interface ProductListFilters extends AdminListQuery {
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface OfferListFilters extends AdminListQuery {
  productId?: string;
  categoryId?: string;
  merchantId?: string;
  sourceType?: OfferSourceType;
  syncStatus?: OfferSyncStatus;
  isActive?: boolean;
  reviewQueueFirst?: boolean;
}

export interface ProductMutationInput {
  id?: string;
  name: string;
  slug?: string;
  brandId: string;
  categoryId: string;
  shortDescription?: string;
  longDescription?: string;
  technicalSpecs?: Array<{ label: string; value: string }>;
  tags?: string[];
  attributes?: Record<string, unknown>;
  isActive: boolean;
  featured?: boolean;
  teamRecommended?: boolean;
  editorialPriority?: number;
  sku?: string;
  ean?: string;
}

export interface OfferMutationInput {
  id?: string;
  productId: string;
  merchantId: string;
  price: number;
  oldPrice?: number;
  url: string;
  stock: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sourceType?: OfferSourceType;
  updateMode?: OfferUpdateMode;
  syncStatus?: OfferSyncStatus;
  nextCheckAt?: string;
  lastSyncError?: string;
  priorityScore?: number;
  freshnessScore?: number;
}

export interface BrandMutationInput {
  id?: string;
  name: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface MerchantMutationInput {
  id?: string;
  name: string;
  logoUrl?: string;
  domain?: string;
  country?: string;
  isActive: boolean;
  brandColor?: string;
}

export interface CategoryMutationInput {
  id?: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  icon?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive: boolean;
}

interface SupabaseLikeError {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
}

interface RateLimitRpcResult {
  allowed?: boolean;
  reason?: string;
  remaining?: number;
  resetAt?: string;
  blockedUntil?: string;
}

interface DashboardAnalyticsSnapshot {
  clicksLast30Days?: number;
  topClickedProducts?: Array<{ productId?: string; productName?: string; clicks?: number }>;
  topClickedMerchants?: Array<{ merchantId?: string; merchantName?: string; clicks?: number }>;
  topOfferPairs?: Array<{
    productId?: string;
    productName?: string;
    merchantId?: string;
    merchantName?: string;
    clicks?: number;
  }>;
  topViewedProducts?: Array<{ productId?: string; productName?: string; views?: number }>;
  topSearchedProducts?: Array<{ productId?: string; productName?: string; searchCount?: number }>;
  topCategoriesByClicks?: Array<{ categoryId?: string; categoryName?: string; clicks?: number }>;
  topCategoriesByPerformance?: Array<{
    categoryId?: string;
    categoryName?: string;
    clicks?: number;
    views?: number;
    ctr?: number;
  }>;
  noResultSearchTerms?: Array<{ term?: string; count?: number }>;
  searchesWithoutResults?: number;
  failedImportJobs?: number;
  productsWithoutActiveOffers?: number;
  staleActiveOffers?: number;
  highClicksLowViews?: Array<{ productId?: string; productName?: string; clicks?: number; views?: number }>;
  highViewsLowClicks?: Array<{ productId?: string; productName?: string; clicks?: number; views?: number }>;
  underFeaturedTopPerformers?: Array<{
    productId?: string;
    productName?: string;
    clicks?: number;
    views?: number;
  }>;
  featuredTopPerformers?: Array<{ productId?: string; productName?: string; clicks?: number; views?: number }>;
  favoritesTotal?: number | null;
  recentAdminActions?: Array<{
    id?: string;
    userId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    createdAt?: string;
  }>;
  freshness?: {
    lastClickAt?: string | null;
    lastSearchAt?: string | null;
    lastImportAt?: string | null;
    lastSyncAt?: string | null;
    stale?: boolean;
    staleSources?: number;
  };
  dailyClicks?: Array<{ day?: string; clicks?: number }>;
}

const ADMIN_RATE_LIMIT_POLICIES = {
  productWrite: { scope: "admin:product:write", maxRequests: 60, windowSeconds: 60, blockSeconds: 180 },
  productDelete: { scope: "admin:product:delete", maxRequests: 20, windowSeconds: 60, blockSeconds: 300 },
  offerWrite: { scope: "admin:offer:write", maxRequests: 100, windowSeconds: 60, blockSeconds: 180 },
  offerDelete: { scope: "admin:offer:delete", maxRequests: 30, windowSeconds: 60, blockSeconds: 300 },
  imageUpload: { scope: "admin:image:upload", maxRequests: 30, windowSeconds: 60, blockSeconds: 300 },
  csvImport: { scope: "admin:import:csv", maxRequests: 6, windowSeconds: 60, blockSeconds: 600 },
} as const;

const IMAGE_UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
const IMAGE_UPLOAD_ALLOWED_TYPE_SET = new Set(IMAGE_UPLOAD_ALLOWED_TYPES);
const IMAGE_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const PRODUCT_IMAGES_BUCKET = "product-images";
const BRAND_IMAGES_BUCKET = "brand-images";
const CATEGORY_IMAGES_BUCKET = "category-images";
const MERCHANT_LOGOS_BUCKET = "merchant-logos";

const OFFER_SOURCE_VALUES: OfferSourceType[] = ["manual", "api", "feed", "future_auto"];
const OFFER_UPDATE_MODE_VALUES: OfferUpdateMode[] = ["manual", "auto", "hybrid"];
const OFFER_SYNC_STATUS_VALUES: OfferSyncStatus[] = ["ok", "stale", "error", "pending"];
const OFFER_CHECK_DEFAULT_HOURS = 24;

export type AdminRateLimitScope = keyof typeof ADMIN_RATE_LIMIT_POLICIES;

function sanitizeOfferSourceType(value: unknown, fallback: OfferSourceType = "manual"): OfferSourceType {
  const safe = sanitizeText(String(value || ""), 32).toLowerCase() as OfferSourceType;
  return OFFER_SOURCE_VALUES.includes(safe) ? safe : fallback;
}

function sanitizeOfferUpdateMode(value: unknown, fallback: OfferUpdateMode = "manual"): OfferUpdateMode {
  const safe = sanitizeText(String(value || ""), 32).toLowerCase() as OfferUpdateMode;
  return OFFER_UPDATE_MODE_VALUES.includes(safe) ? safe : fallback;
}

function sanitizeOfferSyncStatus(value: unknown, fallback: OfferSyncStatus = "ok"): OfferSyncStatus {
  const safe = sanitizeText(String(value || ""), 32).toLowerCase() as OfferSyncStatus;
  return OFFER_SYNC_STATUS_VALUES.includes(safe) ? safe : fallback;
}

function defaultNextOfferCheckAt(hours = OFFER_CHECK_DEFAULT_HOURS): string {
  return new Date(Date.now() + Math.max(1, hours) * 3_600_000).toISOString();
}

function normalizeSlug(value: string): string {
  return sanitizeText(value.toLowerCase(), 120)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function containsControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) {
      return true;
    }
  }

  return false;
}

function sanitizeHttpUrl(value: string, maxLength = 400): string {
  const safeValue = String(value || "").trim().slice(0, maxLength);
  if (!safeValue) {
    return "";
  }

  if (containsControlCharacters(safeValue)) {
    return "";
  }

  try {
    const parsed = new URL(safeValue);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }

    if (parsed.username || parsed.password) {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function sanitizeDomainValue(value: string): string {
  const normalized = normalizeDomain(value);
  if (!normalized) {
    return "";
  }

  const parsed = parseAffiliateUrl(`https://${normalized}`);
  if (!parsed) {
    return "";
  }

  return normalizeDomain(parsed.hostname);
}

function sanitizeAffiliateOfferUrl(value: string, merchantDomain?: string | null): string {
  const parsed = parseAffiliateUrl(value);
  if (!parsed) {
    return "";
  }

  if (!isAffiliateUrlAllowed(parsed.toString(), merchantDomain)) {
    return "";
  }

  return parsed.toString();
}

function randomImageFileName(file: File): string {
  const extensionRaw = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
  const extension = sanitizeText(extensionRaw.toLowerCase(), 10) || "jpg";
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}.${extension}`;
}

function validateImageUploadFile(file: File): void {
  if (!IMAGE_UPLOAD_ALLOWED_TYPE_SET.has(file.type as (typeof IMAGE_UPLOAD_ALLOWED_TYPES)[number])) {
    throw new Error("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF");
  }

  if (file.size > IMAGE_UPLOAD_MAX_SIZE_BYTES) {
    throw new Error("La imagen supera el limite de 10MB");
  }
}

async function ensureStorageBucketExists(bucketId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const createResult = await supabase.storage.createBucket(bucketId, {
    public: true,
    fileSizeLimit: IMAGE_UPLOAD_MAX_SIZE_BYTES,
    allowedMimeTypes: [...IMAGE_UPLOAD_ALLOWED_TYPES],
  });

  if (!createResult.error) {
    return;
  }

  const errorText = [createResult.error.message, createResult.error.name].filter(Boolean).join(" ").toLowerCase();
  const alreadyExists =
    errorText.includes("already") ||
    errorText.includes("exists") ||
    errorText.includes("duplicate") ||
    errorText.includes("409");

  if (alreadyExists) {
    return;
  }
}

async function uploadImageToStorageBucket(bucketId: string, filePath: string, file: File): Promise<string> {
  const supabase = getSupabaseClient();

  let upload = await supabase.storage
    .from(bucketId)
    .upload(filePath, file, { upsert: false, contentType: file.type || "image/jpeg" });

  if (upload.error) {
    const uploadErrorText = [upload.error.message, upload.error.name].filter(Boolean).join(" ").toLowerCase();
    if (uploadErrorText.includes("bucket") && (uploadErrorText.includes("not") || uploadErrorText.includes("missing"))) {
      await ensureStorageBucketExists(bucketId);
      upload = await supabase.storage
        .from(bucketId)
        .upload(filePath, file, { upsert: false, contentType: file.type || "image/jpeg" });
    }
  }

  if (upload.error) {
    const uploadErrorText = [upload.error.message, upload.error.name].filter(Boolean).join(" ").toLowerCase();
    if (uploadErrorText.includes("row-level security") || uploadErrorText.includes("policy")) {
      throw new Error(
        `No se pudo subir el archivo al bucket ${bucketId} por permisos de Storage (RLS). Verifica las politicas de insert/update para admins.`,
      );
    }

    throw new Error(
      `No se pudo subir el archivo al bucket ${bucketId}. Ejecuta las migraciones de Supabase para crear buckets y politicas de Storage.`,
    );
  }

  return supabase.storage.from(bucketId).getPublicUrl(upload.data.path).data.publicUrl;
}

function parseSpecsObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function parseAttributes(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? sanitizeText(item, 50) : ""))
    .filter(Boolean);
}

const TECHNICAL_SPEC_META_KEYS = new Set([
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

function normalizeTechnicalSpecText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (!["string", "number", "boolean"].includes(typeof value)) {
    return "";
  }

  const normalized = String(value).replace(/\s+/g, " ").trim();
  if (!normalized || containsControlCharacters(normalized)) {
    return "";
  }

  return normalized;
}

function parseTechnicalSpecsFromValue(value: unknown, filterMetaKeys = false): Array<{ label: string; value: string }> {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const record = entry as Record<string, unknown>;
        const label = normalizeTechnicalSpecText(record.label);
        const specValue = normalizeTechnicalSpecText(record.value);

        if (!label || !specValue) {
          return null;
        }

        return {
          label,
          value: specValue,
        };
      })
      .filter((entry): entry is { label: string; value: string } => Boolean(entry));
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  return Object.entries(value as Record<string, unknown>)
    .map(([label, rawValue]) => {
      const normalizedLabel = normalizeTechnicalSpecText(label);
      const normalizedLabelKey = normalizedLabel.toLowerCase().replace(/[^a-z0-9]/g, "");

      if (!normalizedLabel || (filterMetaKeys && TECHNICAL_SPEC_META_KEYS.has(normalizedLabelKey))) {
        return null;
      }

      if (rawValue === null || rawValue === undefined) {
        return null;
      }

      const normalizedValue = normalizeTechnicalSpecText(rawValue);
      if (!normalizedValue) {
        return null;
      }

      return {
        label: normalizedLabel,
        value: normalizedValue,
      };
    })
    .filter((entry): entry is { label: string; value: string } => Boolean(entry));
}

function parseTechnicalSpecs(specs: Record<string, unknown>, attributes?: Record<string, unknown>): Array<{ label: string; value: string }> {
  const fromSpecsAttributes = parseTechnicalSpecsFromValue(specs.attributes);
  if (fromSpecsAttributes.length > 0) {
    return fromSpecsAttributes;
  }

  const fromSpecsRecord = parseTechnicalSpecsFromValue(specs, true);
  if (fromSpecsRecord.length > 0) {
    return fromSpecsRecord;
  }

  return parseTechnicalSpecsFromValue(attributes, true);
}

function toTechnicalSpecObject(rows: Array<{ label: string; value: string }> = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const label = normalizeTechnicalSpecText(row.label);
    const value = normalizeTechnicalSpecText(row.value);

    if (!label || !value) {
      return acc;
    }

    acc[label] = value;
    return acc;
  }, {});
}

export function mapAdminErrorMessage(error: SupabaseLikeError | null | undefined, fallback: string): string {
  if (!error) {
    return fallback;
  }

  const raw = [error.message, error.details, error.hint, error.code].filter(Boolean).join(" | ").toLowerCase();

  if (raw.includes("import_batch_failed")) {
    return "La importacion fallo y se revirtio por completo. Revisa los errores por fila en el job.";
  }

  if (raw.includes("rate") && raw.includes("limit")) {
    return "Se alcanzo el limite temporal de operaciones. Intenta de nuevo en unos minutos.";
  }

  if (raw.includes("user_limit") || raw.includes("user_blocked") || raw.includes("ip_limit") || raw.includes("ip_blocked")) {
    return "Operacion bloqueada temporalmente por seguridad. Espera unos minutos antes de reintentar.";
  }

  if ((raw.includes("duplicate key") && (raw.includes("products") || raw.includes("slug"))) || raw.includes("idx_products_slug_unique") || raw.includes("products_slug")) {
    return "Producto duplicado: ya existe un producto con el mismo slug.";
  }

  if ((raw.includes("duplicate key") && raw.includes("brands")) || raw.includes("idx_brands_name_unique_lower")) {
    return "Marca duplicada: ya existe una marca con ese nombre.";
  }

  if ((raw.includes("duplicate key") && raw.includes("merchants")) || raw.includes("idx_merchants_name_unique")) {
    return "Tienda duplicada: ya existe una tienda con ese nombre.";
  }

  if ((raw.includes("duplicate key") && raw.includes("categories")) || raw.includes("idx_categories_slug_parent_unique")) {
    return "Categoria duplicada: ya existe una categoria con el mismo slug dentro del mismo nivel.";
  }

  if (raw.includes("genera un ciclo") || raw.includes("categoria no puede ser su propio padre")) {
    return "No se puede guardar la categoria porque se genera un ciclo en la jerarquia.";
  }

  if (raw.includes("violates foreign key constraint") && raw.includes("offers")) {
    return "No se puede borrar porque tiene ofertas asociadas.";
  }

  if (raw.includes("violates foreign key constraint") && raw.includes("products")) {
    return "No se puede borrar porque tiene productos asociados.";
  }

  if (raw.includes("product-images") && (raw.includes("mimetype") || raw.includes("size") || raw.includes("formato"))) {
    return "La imagen no cumple las politicas de seguridad (tipo o tamano invalido).";
  }

  return error.message || fallback;
}

function sanitizeAuditPayload(payload: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const safePayload: Record<string, unknown> = {};
  const maxKeys = 24;
  let count = 0;

  for (const [rawKey, rawValue] of Object.entries(payload)) {
    if (count >= maxKeys) {
      safePayload._truncated = true;
      break;
    }

    const key = sanitizeText(rawKey, 64);
    if (!key) {
      continue;
    }

    if (typeof rawValue === "string") {
      safePayload[key] = sanitizeText(rawValue, 300);
      count += 1;
      continue;
    }

    if (typeof rawValue === "number") {
      if (Number.isFinite(rawValue)) {
        safePayload[key] = sanitizeNumber(rawValue, -1_000_000_000, 1_000_000_000);
      }
      count += 1;
      continue;
    }

    if (typeof rawValue === "boolean" || rawValue === null) {
      safePayload[key] = rawValue;
      count += 1;
      continue;
    }

    if (rawValue instanceof Date) {
      safePayload[key] = rawValue.toISOString();
      count += 1;
      continue;
    }

    if (Array.isArray(rawValue)) {
      safePayload[key] = sanitizeText(rawValue.slice(0, 10).map((item) => String(item)).join(","), 300);
      count += 1;
      continue;
    }

    if (rawValue && typeof rawValue === "object") {
      safePayload[key] = sanitizeText(JSON.stringify(rawValue), 300);
      count += 1;
    }
  }

  return safePayload;
}

function toAuditErrorPayload(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      errorName: sanitizeText(error.name || "Error", 80),
      errorMessage: sanitizeText(error.message || "Error", 300),
    };
  }

  if (error && typeof error === "object") {
    const input = error as { message?: unknown; code?: unknown; details?: unknown; hint?: unknown };
    return {
      errorMessage: sanitizeText(String(input.message || "Error desconocido"), 300),
      errorCode: sanitizeText(String(input.code || ""), 80),
      errorDetails: sanitizeText(String(input.details || ""), 200),
      errorHint: sanitizeText(String(input.hint || ""), 200),
    };
  }

  return {
    errorMessage: sanitizeText(String(error || "Error desconocido"), 300),
  };
}

async function safeLogAdminAction(input: {
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  source?: string;
}): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const source = sanitizeText(input.source || "adminCatalogService", 80);
    const payload = sanitizeAuditPayload({
      ...(input.payload || {}),
      source,
    });

    await supabase.from("admin_actions").insert({
      action: sanitizeText(input.action, 80),
      entity_type: sanitizeText(input.entityType, 80),
      entity_id: input.entityId || null,
      payload,
    });
  } catch {
    // Do not block business operations if audit insertion fails.
  }
}

async function enforceAdminRateLimit(scope: AdminRateLimitScope): Promise<void> {
  const supabase = getSupabaseClient();
  const policy = ADMIN_RATE_LIMIT_POLICIES[scope];

  const { data, error } = await supabase.rpc("check_admin_rate_limit", {
    p_scope: policy.scope,
    p_max_requests: policy.maxRequests,
    p_window_seconds: policy.windowSeconds,
    p_block_seconds: policy.blockSeconds,
  });

  if (error) {
    await safeLogAdminAction({
      action: "security.rate_limit.error",
      entityType: "security",
      payload: {
        scope,
        policyScope: policy.scope,
        ...toAuditErrorPayload(error),
      },
    });
    throw new Error(mapAdminErrorMessage(error, "No se pudo validar limites de seguridad para la operacion"));
  }

  const rateResult = (data || {}) as RateLimitRpcResult;
  if (rateResult.allowed) {
    return;
  }

  const resetText = rateResult.resetAt ? new Date(rateResult.resetAt).toLocaleTimeString("es-ES") : null;
  const message = resetText
    ? `Operacion bloqueada temporalmente por rate limiting. Intenta de nuevo despues de ${resetText}.`
    : "Operacion bloqueada temporalmente por rate limiting. Intenta de nuevo en unos minutos.";

  await safeLogAdminAction({
    action: "security.rate_limit.blocked",
    entityType: "security",
    payload: {
      scope,
      policyScope: policy.scope,
      reason: rateResult.reason || "rate_limited",
      remaining: typeof rateResult.remaining === "number" ? rateResult.remaining : null,
      resetAt: rateResult.resetAt || null,
      blockedUntil: rateResult.blockedUntil || null,
    },
  });

  throw new Error(message);
}

export async function requireAdminRateLimit(scope: AdminRateLimitScope): Promise<void> {
  await enforceAdminRateLimit(scope);
}

function throwIfError(error: SupabaseLikeError | null, fallback: string): never | void {
  if (!error) {
    return;
  }

  throw new Error(mapAdminErrorMessage(error, fallback));
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return ["1", "true", "yes", "si", "on", "in-stock", "available"].includes(normalized);
  }

  return false;
}

function mapProductRow(
  row: Record<string, unknown>,
  brandMap: Map<string, string>,
  categoryMap: Map<string, { name: string; parentId?: string | null; parentName?: string }>,
  offerStatsMap: Map<string, { offerCount: number; minPrice: number }>,
  imageMap: Map<string, string>,
): AdminProductRecord {
  const specs = parseSpecsObject(row.specs);
  const tags = parseTags(row.tags);
  const attributes = parseAttributes(row.attributes);
  const featured = asBoolean(specs.featured ?? attributes.featured);
  const teamRecommended = asBoolean(specs.teamRecommended ?? attributes.teamRecommended);
  const editorialPriorityRaw = Number(specs.editorialPriority ?? attributes.editorialPriority ?? 0);
  const editorialPriority = Number.isFinite(editorialPriorityRaw)
    ? sanitizeNumber(Math.round(editorialPriorityRaw), 0, 100)
    : 0;
  const categoryId = String(row.category_id || "");
  const categoryData = categoryMap.get(categoryId);
  const offerStats = offerStatsMap.get(String(row.id)) || { offerCount: 0, minPrice: 0 };

  return {
    id: String(row.id),
    name: String(row.name || ""),
    slug: String(row.slug || ""),
    brandId: String(row.brand_id || ""),
    brandName: brandMap.get(String(row.brand_id || "")) || "Sin marca",
    categoryId,
    categoryName: categoryData?.name || "Sin categoria",
    subcategoryName: categoryData?.parentName ? categoryData.name : undefined,
    shortDescription: String(row.short_description || row.description || ""),
    longDescription: String(row.long_description || specs.longDescription || ""),
    technicalSpecs: parseTechnicalSpecs(specs, attributes),
    tags,
    attributes,
    isActive: Boolean(row.is_active),
    featured,
    teamRecommended,
    editorialPriority,
    sku: row.sku ? String(row.sku) : undefined,
    ean: row.ean ? String(row.ean) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    primaryImageUrl: imageMap.get(String(row.id)),
    offerCount: offerStats.offerCount,
    minPrice: offerStats.minPrice,
  };
}

export async function listBrands(): Promise<AdminBrandRecord[]> {
  const supabase = getSupabaseClient();

  const [brandsResult, productsResult] = await Promise.all([
    supabase
      .from("brands")
      .select("id,name,logo_url,is_active,updated_at")
      .order("name", { ascending: true }),
    supabase.from("products").select("brand_id"),
  ]);

  throwIfError(brandsResult.error, "No se pudieron cargar marcas");
  throwIfError(productsResult.error, "No se pudieron cargar productos para marcas");

  const counts = new Map<string, number>();
  for (const row of productsResult.data || []) {
    const brandId = String(row.brand_id || "");
    counts.set(brandId, (counts.get(brandId) || 0) + 1);
  }

  return (brandsResult.data || []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    isActive: Boolean(row.is_active),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    productCount: counts.get(String(row.id)) || 0,
  }));
}

export async function upsertBrand(input: BrandMutationInput): Promise<AdminBrandRecord> {
  const supabase = getSupabaseClient();
  const name = sanitizeText(input.name, 120);
  const safeLogoUrl = input.logoUrl ? sanitizeHttpUrl(input.logoUrl, 300) : "";

  try {
    if (!name) {
      await safeLogAdminAction({
        action: "brand.validation_failed",
        entityType: "brand",
        entityId: input.id,
        payload: { reason: "name_required" },
      });
      throw new Error("La marca requiere nombre");
    }

    if (input.logoUrl && !safeLogoUrl) {
      await safeLogAdminAction({
        action: "brand.validation_failed",
        entityType: "brand",
        entityId: input.id,
        payload: { reason: "invalid_logo_url" },
      });
      throw new Error("La marca requiere una URL de logo valida (http/https)");
    }

    const payload = {
      name,
      logo_url: safeLogoUrl || null,
      is_active: Boolean(input.isActive),
    };

    const isUpdate = Boolean(input.id);
    const query = isUpdate
      ? supabase.from("brands").update(payload).eq("id", input.id).select("id,name,logo_url,is_active,updated_at").single()
      : supabase.from("brands").insert(payload).select("id,name,logo_url,is_active,updated_at").single();

    const { data, error } = await query;
    throwIfError(error, "No se pudo guardar la marca");

    const result = {
      id: String(data.id),
      name: String(data.name),
      logoUrl: data.logo_url ? String(data.logo_url) : undefined,
      isActive: Boolean(data.is_active),
      updatedAt: String(data.updated_at || new Date().toISOString()),
    };

    await safeLogAdminAction({
      action: isUpdate ? "brand.update" : "brand.create",
      entityType: "brand",
      entityId: result.id,
      payload: {
        name: result.name,
        isActive: result.isActive,
      },
    });

    return result;
  } catch (error) {
    await safeLogAdminAction({
      action: "brand.error",
      entityType: "brand",
      entityId: input.id,
      payload: {
        operation: input.id ? "update" : "create",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function deleteBrand(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from("brands").delete().eq("id", id);
    throwIfError(error, "No se pudo eliminar la marca");

    await safeLogAdminAction({
      action: "brand.delete",
      entityType: "brand",
      entityId: id,
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "brand.error",
      entityType: "brand",
      entityId: id,
      payload: {
        operation: "delete",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function listMerchants(): Promise<AdminMerchantRecord[]> {
  const supabase = getSupabaseClient();

  const [merchantsResult, offersResult, clicksResult] = await Promise.all([
    supabase
      .from("merchants")
      .select("id,name,logo_url,domain,country,is_active,brand_color,updated_at")
      .order("name", { ascending: true }),
    supabase.from("offers").select("merchant_id"),
    supabase.from("clicks").select("merchant_id"),
  ]);

  throwIfError(merchantsResult.error, "No se pudieron cargar tiendas");
  throwIfError(offersResult.error, "No se pudieron calcular ofertas por tienda");
  throwIfError(clicksResult.error, "No se pudieron calcular clics por tienda");

  const offerCount = new Map<string, number>();
  for (const row of offersResult.data || []) {
    const merchantId = String(row.merchant_id || "");
    offerCount.set(merchantId, (offerCount.get(merchantId) || 0) + 1);
  }

  const clickCount = new Map<string, number>();
  for (const row of clicksResult.data || []) {
    const merchantId = String(row.merchant_id || "");
    clickCount.set(merchantId, (clickCount.get(merchantId) || 0) + 1);
  }

  return (merchantsResult.data || []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    logoUrl: row.logo_url ? String(row.logo_url) : undefined,
    domain: row.domain ? String(row.domain) : undefined,
    country: row.country ? String(row.country) : "ES",
    isActive: Boolean(row.is_active),
    brandColor: row.brand_color ? String(row.brand_color) : undefined,
    updatedAt: String(row.updated_at || new Date().toISOString()),
    offerCount: offerCount.get(String(row.id)) || 0,
    clicks: clickCount.get(String(row.id)) || 0,
  }));
}

export async function upsertMerchant(input: MerchantMutationInput): Promise<AdminMerchantRecord> {
  const supabase = getSupabaseClient();
  const name = sanitizeText(input.name, 120);
  const safeLogoUrl = input.logoUrl ? sanitizeHttpUrl(input.logoUrl, 300) : "";
  const safeDomain = input.domain ? sanitizeDomainValue(input.domain) : "";

  try {
    if (!name) {
      await safeLogAdminAction({
        action: "merchant.validation_failed",
        entityType: "merchant",
        entityId: input.id,
        payload: { reason: "name_required" },
      });
      throw new Error("La tienda requiere nombre");
    }

    if (input.logoUrl && !safeLogoUrl) {
      await safeLogAdminAction({
        action: "merchant.validation_failed",
        entityType: "merchant",
        entityId: input.id,
        payload: { reason: "invalid_logo_url" },
      });
      throw new Error("La tienda requiere una URL de logo valida (http/https)");
    }

    if (input.domain && !safeDomain) {
      await safeLogAdminAction({
        action: "merchant.validation_failed",
        entityType: "merchant",
        entityId: input.id,
        payload: { reason: "invalid_domain" },
      });
      throw new Error("La tienda requiere un dominio valido (ejemplo.com)");
    }

    const payload = {
      name,
      logo_url: safeLogoUrl || null,
      domain: safeDomain || null,
      country: sanitizeText(input.country || "ES", 8),
      is_active: Boolean(input.isActive),
      brand_color: input.brandColor ? sanitizeText(input.brandColor, 30) : null,
    };

    const isUpdate = Boolean(input.id);
    const query = isUpdate
      ? supabase
          .from("merchants")
          .update(payload)
          .eq("id", input.id)
          .select("id,name,logo_url,domain,country,is_active,brand_color,updated_at")
          .single()
      : supabase
          .from("merchants")
          .insert(payload)
          .select("id,name,logo_url,domain,country,is_active,brand_color,updated_at")
          .single();

    const { data, error } = await query;
    throwIfError(error, "No se pudo guardar la tienda");

    const result = {
      id: String(data.id),
      name: String(data.name),
      logoUrl: data.logo_url ? String(data.logo_url) : undefined,
      domain: data.domain ? String(data.domain) : undefined,
      country: data.country ? String(data.country) : "ES",
      isActive: Boolean(data.is_active),
      brandColor: data.brand_color ? String(data.brand_color) : undefined,
      updatedAt: String(data.updated_at || new Date().toISOString()),
    };

    await safeLogAdminAction({
      action: isUpdate ? "merchant.update" : "merchant.create",
      entityType: "merchant",
      entityId: result.id,
      payload: {
        name: result.name,
        domain: result.domain || null,
        isActive: result.isActive,
      },
    });

    return result;
  } catch (error) {
    await safeLogAdminAction({
      action: "merchant.error",
      entityType: "merchant",
      entityId: input.id,
      payload: {
        operation: input.id ? "update" : "create",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function deleteMerchant(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from("merchants").delete().eq("id", id);
    throwIfError(error, "No se pudo eliminar la tienda");

    await safeLogAdminAction({
      action: "merchant.delete",
      entityType: "merchant",
      entityId: id,
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "merchant.error",
      entityType: "merchant",
      entityId: id,
      payload: {
        operation: "delete",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function listCategories(): Promise<AdminCategoryRecord[]> {
  const supabase = getSupabaseClient();

  const [categoriesResult, productsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,parent_id,icon,image_url,sort_order,is_active,updated_at")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("products").select("category_id"),
  ]);

  throwIfError(categoriesResult.error, "No se pudieron cargar categorias");
  throwIfError(productsResult.error, "No se pudo calcular productos por categoria");

  const rows = categoriesResult.data || [];
  const parentMap = new Map<string, string>();
  for (const row of rows) {
    parentMap.set(String(row.id), String(row.name));
  }

  const counts = new Map<string, number>();
  for (const row of productsResult.data || []) {
    const categoryId = String(row.category_id || "");
    counts.set(categoryId, (counts.get(categoryId) || 0) + 1);
  }

  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: row.slug ? String(row.slug) : undefined,
    parentId: row.parent_id ? String(row.parent_id) : null,
    parentName: row.parent_id ? parentMap.get(String(row.parent_id)) : undefined,
    icon: row.icon ? String(row.icon) : undefined,
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    sortOrder: Number(row.sort_order || 0),
    isActive: Boolean(row.is_active),
    productCount: counts.get(String(row.id)) || 0,
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }));
}

export async function upsertCategory(input: CategoryMutationInput): Promise<AdminCategoryRecord> {
  const supabase = getSupabaseClient();
  const name = sanitizeText(input.name, 120);
  const safeImageUrl = input.imageUrl ? sanitizeHttpUrl(input.imageUrl, 2000) : "";

  try {
    if (!name) {
      await safeLogAdminAction({
        action: "category.validation_failed",
        entityType: "category",
        entityId: input.id,
        payload: { reason: "name_required" },
      });
      throw new Error("La categoria requiere nombre");
    }

    if (input.id && input.parentId === input.id) {
      await safeLogAdminAction({
        action: "category.validation_failed",
        entityType: "category",
        entityId: input.id,
        payload: { reason: "self_parent" },
      });
      throw new Error("Una categoria no puede ser su propia categoria padre");
    }

    if (input.id && input.parentId) {
      const cycleCheck = await supabase.rpc("category_parent_would_create_cycle", {
        p_category_id: input.id,
        p_parent_id: input.parentId,
      });

      if (cycleCheck.error) {
        throw new Error(cycleCheck.error.message || "No se pudo validar jerarquia de categorias");
      }

      if (cycleCheck.data) {
        await safeLogAdminAction({
          action: "category.validation_failed",
          entityType: "category",
          entityId: input.id,
          payload: { reason: "cycle_detected", parentId: input.parentId },
        });
        throw new Error("No se puede guardar la categoria porque se genera un ciclo en la jerarquia");
      }
    }

    if (input.imageUrl && !safeImageUrl) {
      await safeLogAdminAction({
        action: "category.validation_failed",
        entityType: "category",
        entityId: input.id,
        payload: { reason: "invalid_image_url" },
      });
      throw new Error("La categoria requiere una URL de imagen valida (http/https)");
    }

    const normalizedInputSlug = normalizeSlug(input.slug || "");
    const slug = input.id ? (normalizedInputSlug || null) : normalizeSlug(normalizedInputSlug || name);

    const payload = {
      name,
      slug,
      parent_id: input.parentId || null,
      icon: input.icon ? sanitizeText(input.icon, 32) : null,
      image_url: safeImageUrl || null,
      sort_order: sanitizeNumber(Number(input.sortOrder || 0), 0, 100000),
      is_active: Boolean(input.isActive),
    };

    const isUpdate = Boolean(input.id);
    const query = isUpdate
      ? supabase
          .from("categories")
          .update(payload)
          .eq("id", input.id)
          .select("id,name,slug,parent_id,icon,image_url,sort_order,is_active,updated_at")
          .single()
      : supabase
          .from("categories")
          .insert(payload)
          .select("id,name,slug,parent_id,icon,image_url,sort_order,is_active,updated_at")
          .single();

    const { data, error } = await query;
    throwIfError(error, "No se pudo guardar la categoria");

    const result = {
      id: String(data.id),
      name: String(data.name),
      slug: data.slug ? String(data.slug) : undefined,
      parentId: data.parent_id ? String(data.parent_id) : null,
      icon: data.icon ? String(data.icon) : undefined,
      imageUrl: data.image_url ? String(data.image_url) : undefined,
      sortOrder: Number(data.sort_order || 0),
      isActive: Boolean(data.is_active),
      updatedAt: String(data.updated_at || new Date().toISOString()),
    };

    await safeLogAdminAction({
      action: isUpdate ? "category.update" : "category.create",
      entityType: "category",
      entityId: result.id,
      payload: {
        name: result.name,
        parentId: result.parentId || null,
        isActive: result.isActive,
      },
    });

    invalidateCatalogSnapshotCache();
    try {
      await refreshCatalogSnapshotNow();
    } catch {
      // Keep save success even if snapshot refresh fails; next read will refresh lazily.
    }

    return result;
  } catch (error) {
    await safeLogAdminAction({
      action: "category.error",
      entityType: "category",
      entityId: input.id,
      payload: {
        operation: input.id ? "update" : "create",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    throwIfError(error, "No se pudo eliminar la categoria");

    await safeLogAdminAction({
      action: "category.delete",
      entityType: "category",
      entityId: id,
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "category.error",
      entityType: "category",
      entityId: id,
      payload: {
        operation: "delete",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function listProducts(filters: ProductListFilters): Promise<{ rows: AdminProductRecord[]; total: number }> {
  const supabase = getSupabaseClient();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(filters.pageSize || 20, 200));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      "id,name,slug,brand_id,category_id,description,short_description,long_description,specs,tags,attributes,is_active,sku,ean,created_at,updated_at",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.search) {
    query = query.ilike("name", `%${sanitizeText(filters.search, 60)}%`);
  }

  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  if (typeof filters.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  const { data, count, error } = await query;
  throwIfError(error, "No se pudieron cargar productos");

  const rows = data || [];
  const productIds = rows.map((row) => String(row.id));
  const brandIds = Array.from(new Set(rows.map((row) => String(row.brand_id || "")).filter(Boolean)));
  const categoryIds = Array.from(new Set(rows.map((row) => String(row.category_id || "")).filter(Boolean)));

  const [brandsResult, categoriesResult, offersResult, imagesResult] = await Promise.all([
    brandIds.length
      ? supabase.from("brands").select("id,name").in("id", brandIds)
      : Promise.resolve({ data: [], error: null } as const),
    categoryIds.length
      ? supabase.from("categories").select("id,name,parent_id").in("id", categoryIds)
      : Promise.resolve({ data: [], error: null } as const),
    productIds.length
      ? supabase.from("offers").select("product_id,price,is_active").in("product_id", productIds)
      : Promise.resolve({ data: [], error: null } as const),
    productIds.length
      ? supabase.from("product_images").select("product_id,url,is_primary").in("product_id", productIds).eq("is_primary", true)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  throwIfError(brandsResult.error, "No se pudieron cargar marcas de productos");
  throwIfError(categoriesResult.error, "No se pudieron cargar categorias de productos");
  throwIfError(offersResult.error, "No se pudieron calcular ofertas por producto");
  throwIfError(imagesResult.error, "No se pudieron cargar imagenes de productos");

  const parentIds = Array.from(
    new Set(
      (categoriesResult.data || [])
        .map((row) => (row.parent_id ? String(row.parent_id) : ""))
        .filter(Boolean),
    ),
  );

  const parentsResult = parentIds.length
    ? await supabase.from("categories").select("id,name").in("id", parentIds)
    : ({ data: [], error: null } as const);

  throwIfError(parentsResult.error, "No se pudieron cargar subcategorias");

  const parentNameMap = new Map<string, string>();
  for (const row of parentsResult.data || []) {
    parentNameMap.set(String(row.id), String(row.name));
  }

  const brandMap = new Map<string, string>();
  for (const row of brandsResult.data || []) {
    brandMap.set(String(row.id), String(row.name));
  }

  const categoryMap = new Map<string, { name: string; parentId?: string | null; parentName?: string }>();
  for (const row of categoriesResult.data || []) {
    const parentId = row.parent_id ? String(row.parent_id) : null;
    categoryMap.set(String(row.id), {
      name: String(row.name),
      parentId,
      parentName: parentId ? parentNameMap.get(parentId) : undefined,
    });
  }

  const offerStatsMap = new Map<string, { offerCount: number; minPrice: number }>();
  for (const row of offersResult.data || []) {
    if (!row.is_active) {
      continue;
    }

    const productId = String(row.product_id || "");
    const price = Number(row.price || 0);
    const existing = offerStatsMap.get(productId);

    if (!existing) {
      offerStatsMap.set(productId, { offerCount: 1, minPrice: price });
      continue;
    }

    existing.offerCount += 1;
    existing.minPrice = existing.minPrice > 0 ? Math.min(existing.minPrice, price) : price;
    offerStatsMap.set(productId, existing);
  }

  const imageMap = new Map<string, string>();
  for (const row of imagesResult.data || []) {
    imageMap.set(String(row.product_id), String(row.url));
  }

  return {
    rows: rows.map((row) => mapProductRow(row as unknown as Record<string, unknown>, brandMap, categoryMap, offerStatsMap, imageMap)),
    total: count || 0,
  };
}

export async function getProductById(id: string): Promise<AdminProductRecord | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,slug,brand_id,category_id,description,short_description,long_description,specs,tags,attributes,is_active,sku,ean,created_at,updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  throwIfError(error, "No se pudo cargar el producto");

  if (!data) {
    return null;
  }

  const [brandsResult, categoriesResult, offersResult, imagesResult] = await Promise.all([
    supabase.from("brands").select("id,name").eq("id", data.brand_id).maybeSingle(),
    supabase.from("categories").select("id,name,parent_id").eq("id", data.category_id).maybeSingle(),
    supabase.from("offers").select("price,is_active").eq("product_id", id),
    supabase.from("product_images").select("url,is_primary").eq("product_id", id).eq("is_primary", true).limit(1),
  ]);

  throwIfError(brandsResult.error, "No se pudo cargar marca del producto");
  throwIfError(categoriesResult.error, "No se pudo cargar categoria del producto");
  throwIfError(offersResult.error, "No se pudo cargar ofertas del producto");
  throwIfError(imagesResult.error, "No se pudo cargar imagen del producto");

  const categoryRow = categoriesResult.data;
  let parentName: string | undefined;
  if (categoryRow?.parent_id) {
    const parent = await supabase.from("categories").select("name").eq("id", categoryRow.parent_id).maybeSingle();
    throwIfError(parent.error, "No se pudo cargar subcategoria");
    parentName = parent.data?.name ? String(parent.data.name) : undefined;
  }

  const activeOffers = (offersResult.data || []).filter((offer) => offer.is_active);
  const minPrice = activeOffers.length
    ? Math.min(...activeOffers.map((offer) => Number(offer.price || 0)).filter((price) => Number.isFinite(price)))
    : 0;

  return mapProductRow(
    data as unknown as Record<string, unknown>,
    new Map<string, string>([[String(data.brand_id), brandsResult.data?.name ? String(brandsResult.data.name) : "Sin marca"]]),
    new Map<string, { name: string; parentId?: string | null; parentName?: string }>([
      [
        String(data.category_id),
        {
          name: categoryRow?.name ? String(categoryRow.name) : "Sin categoria",
          parentId: categoryRow?.parent_id ? String(categoryRow.parent_id) : null,
          parentName,
        },
      ],
    ]),
    new Map<string, { offerCount: number; minPrice }>([[id, { offerCount: activeOffers.length, minPrice }]]),
    new Map<string, string>(
      (imagesResult.data || []).map((image) => [String(id), String(image.url)]),
    ),
  );
}

export async function upsertProduct(input: ProductMutationInput): Promise<AdminProductRecord> {
  await enforceAdminRateLimit("productWrite");
  const supabase = getSupabaseClient();
  const name = sanitizeText(input.name, 180);
  const slug = normalizeSlug(input.slug || name);

  try {
    if (!name) {
      await safeLogAdminAction({
        action: "product.validation_failed",
        entityType: "product",
        entityId: input.id,
        payload: { reason: "name_required" },
      });
      throw new Error("El producto requiere nombre");
    }

    if (!input.brandId) {
      await safeLogAdminAction({
        action: "product.validation_failed",
        entityType: "product",
        entityId: input.id,
        payload: { reason: "brand_required" },
      });
      throw new Error("El producto requiere marca");
    }

    if (!input.categoryId) {
      await safeLogAdminAction({
        action: "product.validation_failed",
        entityType: "product",
        entityId: input.id,
        payload: { reason: "category_required" },
      });
      throw new Error("El producto requiere categoria");
    }

    let existingSpecs: Record<string, unknown> = {};
    let existingAttributes: Record<string, unknown> = {};
    if (input.id) {
      const existing = await supabase.from("products").select("specs,attributes").eq("id", input.id).maybeSingle();
      throwIfError(existing.error, "No se pudo validar producto existente");
      existingSpecs = parseSpecsObject(existing.data?.specs);
      existingAttributes = parseAttributes(existing.data?.attributes);
    }

    const technicalSpecs = toTechnicalSpecObject(input.technicalSpecs || []);
    const featured = Boolean(input.featured ?? existingSpecs.featured ?? existingAttributes.featured);
    const teamRecommended = Boolean(
      input.teamRecommended ?? existingSpecs.teamRecommended ?? existingAttributes.teamRecommended,
    );
    const editorialPrioritySource =
      input.editorialPriority ?? existingSpecs.editorialPriority ?? existingAttributes.editorialPriority ?? 0;
    const editorialPriority = sanitizeNumber(Number(editorialPrioritySource || 0), 0, 100);
    const mergedAttributes = {
      ...existingAttributes,
      ...(input.attributes || {}),
      featured,
      teamRecommended,
      editorialPriority,
    };

    const payload = {
      name,
      slug,
      brand_id: input.brandId,
      category_id: input.categoryId,
      description: sanitizeText(input.shortDescription || input.longDescription || "", 400),
      short_description: sanitizeText(input.shortDescription || "", 400),
      long_description: sanitizeText(input.longDescription || "", 2000),
      specs: {
        ...existingSpecs,
        longDescription: sanitizeText(input.longDescription || "", 2000),
        attributes: technicalSpecs,
        tags: (input.tags || []).map((tag) => sanitizeText(tag, 50)).filter(Boolean),
        sku: input.sku ? sanitizeText(input.sku, 80) : null,
        ean: input.ean ? sanitizeText(input.ean, 80) : null,
        isActive: Boolean(input.isActive),
        featured,
        teamRecommended,
        editorialPriority,
      },
      tags: (input.tags || []).map((tag) => sanitizeText(tag, 50)).filter(Boolean),
      attributes: mergedAttributes,
      is_active: Boolean(input.isActive),
      sku: input.sku ? sanitizeText(input.sku, 80) : null,
      ean: input.ean ? sanitizeText(input.ean, 80) : null,
    };

    const isUpdate = Boolean(input.id);
    const query = isUpdate
      ? supabase
          .from("products")
          .update(payload)
          .eq("id", input.id)
          .select(
            "id,name,slug,brand_id,category_id,description,short_description,long_description,specs,tags,attributes,is_active,sku,ean,created_at,updated_at",
          )
          .single()
      : supabase
          .from("products")
          .insert(payload)
          .select(
            "id,name,slug,brand_id,category_id,description,short_description,long_description,specs,tags,attributes,is_active,sku,ean,created_at,updated_at",
          )
          .single();

    const { data, error } = await query;
    throwIfError(error, "No se pudo guardar el producto");

    const [brandRes, categoryRes] = await Promise.all([
      supabase.from("brands").select("name").eq("id", data.brand_id).maybeSingle(),
      supabase.from("categories").select("name,parent_id").eq("id", data.category_id).maybeSingle(),
    ]);

    throwIfError(brandRes.error, "No se pudo cargar marca del producto guardado");
    throwIfError(categoryRes.error, "No se pudo cargar categoria del producto guardado");

    let parentName: string | undefined;
    if (categoryRes.data?.parent_id) {
      const parent = await supabase.from("categories").select("name").eq("id", categoryRes.data.parent_id).maybeSingle();
      throwIfError(parent.error, "No se pudo cargar subcategoria del producto guardado");
      parentName = parent.data?.name ? String(parent.data.name) : undefined;
    }

    const result = mapProductRow(
      data as unknown as Record<string, unknown>,
      new Map<string, string>([[String(data.brand_id), brandRes.data?.name ? String(brandRes.data.name) : "Sin marca"]]),
      new Map<string, { name: string; parentId?: string | null; parentName?: string }>([
        [
          String(data.category_id),
          {
            name: categoryRes.data?.name ? String(categoryRes.data.name) : "Sin categoria",
            parentId: categoryRes.data?.parent_id ? String(categoryRes.data.parent_id) : null,
            parentName,
          },
        ],
      ]),
      new Map<string, { offerCount: number; minPrice: number }>([[String(data.id), { offerCount: 0, minPrice: 0 }]]),
      new Map<string, string>(),
    );

    await safeLogAdminAction({
      action: isUpdate ? "product.update" : "product.create",
      entityType: "product",
      entityId: result.id,
      payload: {
        name: result.name,
        slug: result.slug,
        categoryId: result.categoryId,
        brandId: result.brandId,
        isActive: result.isActive,
      },
    });

    return result;
  } catch (error) {
    await safeLogAdminAction({
      action: "product.error",
      entityType: "product",
      entityId: input.id,
      payload: {
        operation: input.id ? "update" : "create",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function duplicateProduct(productId: string): Promise<AdminProductRecord> {
  const original = await getProductById(productId);

  if (!original) {
    throw new Error("No se encontro el producto a duplicar");
  }

  const duplicate = await upsertProduct({
    name: `${original.name} Copia`,
    slug: `${original.slug}-${Date.now()}`,
    brandId: original.brandId,
    categoryId: original.categoryId,
    shortDescription: original.shortDescription,
    longDescription: original.longDescription,
    technicalSpecs: original.technicalSpecs,
    tags: original.tags,
    attributes: original.attributes,
    isActive: false,
    sku: original.sku,
    ean: original.ean,
  });

  const images = await listProductImages(productId);
  for (const image of images) {
    await addProductImage(duplicate.id, image.url, image.isPrimary);
  }

  return duplicate;
}

export async function deleteProduct(id: string): Promise<void> {
  await enforceAdminRateLimit("productDelete");
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from("products").delete().eq("id", id);
    throwIfError(error, "No se pudo eliminar el producto");

    await safeLogAdminAction({
      action: "product.delete",
      entityType: "product",
      entityId: id,
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "product.error",
      entityType: "product",
      entityId: id,
      payload: {
        operation: "delete",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function listProductsForSelect(search: string, limit = 25): Promise<Array<{ id: string; name: string }>> {
  const supabase = getSupabaseClient();
  const safeSearch = sanitizeText(search || "", 80);
  const safeLimit = Math.max(1, Math.min(limit, 50));

  let query = supabase
    .from("products")
    .select("id,name")
    .order("name", { ascending: true })
    .limit(safeLimit);

  if (safeSearch) {
    query = query.ilike("name", `%${safeSearch}%`);
  }

  const { data, error } = await query;
  throwIfError(error, "No se pudieron cargar productos para el selector");

  return (data || []).map((row) => ({
    id: String(row.id),
    name: String(row.name || ""),
  }));
}

export async function listProductImages(productId: string): Promise<AdminProductImageRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("id,product_id,url,is_primary,sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  throwIfError(error, "No se pudieron cargar imagenes");

  return (data || []).map((row) => ({
    id: String(row.id),
    productId: String(row.product_id),
    url: String(row.url),
    isPrimary: Boolean(row.is_primary),
    sortOrder: Number(row.sort_order || 0),
  }));
}

export async function addProductImage(productId: string, url: string, isPrimary: boolean): Promise<AdminProductImageRecord> {
  await enforceAdminRateLimit("imageUpload");
  const supabase = getSupabaseClient();
  const safeUrl = sanitizeHttpUrl(url, 400);

  try {
    if (!safeUrl) {
      await safeLogAdminAction({
        action: "product.image.validation_failed",
        entityType: "product",
        entityId: productId,
        payload: { reason: "invalid_url" },
      });
      throw new Error("La imagen requiere una URL valida (http/https)");
    }

    const sortProbe = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    throwIfError(sortProbe.error, "No se pudo calcular el orden de la imagen");
    const nextSortOrder = Math.max(0, Number(sortProbe.data?.sort_order ?? -1) + 1);

    if (isPrimary) {
      const resetPrimary = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
      throwIfError(resetPrimary.error, "No se pudo preparar imagen principal");
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert({ product_id: productId, url: safeUrl, is_primary: isPrimary, sort_order: nextSortOrder })
      .select("id,product_id,url,is_primary,sort_order")
      .single();

    throwIfError(error, "No se pudo agregar la imagen");

    const result = {
      id: String(data.id),
      productId: String(data.product_id),
      url: String(data.url),
      isPrimary: Boolean(data.is_primary),
      sortOrder: Number(data.sort_order || 0),
    };

    await safeLogAdminAction({
      action: "product.image.add",
      entityType: "product",
      entityId: productId,
      payload: {
        imageId: result.id,
        isPrimary: result.isPrimary,
      },
    });

    return result;
  } catch (error) {
    await safeLogAdminAction({
      action: "product.image.error",
      entityType: "product",
      entityId: productId,
      payload: {
        operation: "add",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function reorderProductImages(productId: string, imageIdsInOrder: string[]): Promise<void> {
  await enforceAdminRateLimit("productWrite");
  const supabase = getSupabaseClient();
  const sanitizedOrder = Array.from(
    new Set(imageIdsInOrder.map((id) => sanitizeText(String(id || ""), 80)).filter(Boolean)),
  );

  if (!sanitizedOrder.length) {
    throw new Error("No se recibio un orden de imagenes valido");
  }

  try {
    const existingResult = await supabase.from("product_images").select("id").eq("product_id", productId);
    throwIfError(existingResult.error, "No se pudo validar imagenes del producto");

    const existingIds = (existingResult.data || []).map((row) => String(row.id));
    if (!existingIds.length) {
      return;
    }

    const hasSameCardinality = existingIds.length === sanitizedOrder.length;
    const hasSameIds = existingIds.every((id) => sanitizedOrder.includes(id));
    if (!hasSameCardinality || !hasSameIds) {
      throw new Error("El orden enviado no coincide con las imagenes actuales del producto");
    }

    const updateResults = await Promise.all(
      sanitizedOrder.map((imageId, index) =>
        supabase.from("product_images").update({ sort_order: index }).eq("id", imageId).eq("product_id", productId),
      ),
    );

    updateResults.forEach((result) => {
      throwIfError(result.error, "No se pudo actualizar el orden de imagenes");
    });

    await safeLogAdminAction({
      action: "product.image.reorder",
      entityType: "product",
      entityId: productId,
      payload: {
        imageCount: sanitizedOrder.length,
      },
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "product.image.error",
      entityType: "product",
      entityId: productId,
      payload: {
        operation: "reorder",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<void> {
  const supabase = getSupabaseClient();

  try {
    const [resetResult, setResult] = await Promise.all([
      supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId),
      supabase.from("product_images").update({ is_primary: true }).eq("id", imageId).eq("product_id", productId),
    ]);

    throwIfError(resetResult.error, "No se pudo limpiar imagen principal");
    throwIfError(setResult.error, "No se pudo actualizar imagen principal");

    await safeLogAdminAction({
      action: "product.image.set_primary",
      entityType: "product",
      entityId: productId,
      payload: { imageId },
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "product.image.error",
      entityType: "product",
      entityId: productId,
      payload: {
        operation: "set_primary",
        imageId,
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = getSupabaseClient();
  try {
    const lookup = await supabase.from("product_images").select("product_id").eq("id", imageId).maybeSingle();
    throwIfError(lookup.error, "No se pudo validar imagen");

    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    throwIfError(error, "No se pudo eliminar la imagen");

    await safeLogAdminAction({
      action: "product.image.delete",
      entityType: "product",
      entityId: lookup.data?.product_id ? String(lookup.data.product_id) : undefined,
      payload: { imageId },
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "product.image.error",
      entityType: "product",
      payload: {
        operation: "delete",
        imageId,
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function uploadProductImage(productId: string, file: File, isPrimary: boolean): Promise<AdminProductImageRecord> {
  await enforceAdminRateLimit("imageUpload");

  try {
    try {
      validateImageUploadFile(file);
    } catch (validationError) {
      await safeLogAdminAction({
        action: "product.image.validation_failed",
        entityType: "product",
        entityId: productId,
        payload: {
          reason: "invalid_file",
          mimeType: file.type || "unknown",
          fileSize: file.size,
          ...toAuditErrorPayload(validationError),
        },
      });
      throw validationError;
    }

    const fileName = randomImageFileName(file);
    const filePath = `${productId}/${fileName}`;
    const publicUrl = await uploadImageToStorageBucket(PRODUCT_IMAGES_BUCKET, filePath, file);
    const image = await addProductImage(productId, publicUrl, isPrimary);

    await safeLogAdminAction({
      action: "product.image.upload",
      entityType: "product",
      entityId: productId,
      payload: {
        imageId: image.id,
        isPrimary: image.isPrimary,
        mimeType: file.type || null,
        fileSize: file.size,
      },
    });

    return image;
  } catch (error) {
    await safeLogAdminAction({
      action: "product.image.error",
      entityType: "product",
      entityId: productId,
      payload: {
        operation: "upload",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function uploadBrandLogoImage(file: File): Promise<string> {
  await enforceAdminRateLimit("imageUpload");

  try {
    validateImageUploadFile(file);
    const publicUrl = await uploadImageToStorageBucket(BRAND_IMAGES_BUCKET, `brands/${randomImageFileName(file)}`, file);

    await safeLogAdminAction({
      action: "brand.image.upload",
      entityType: "brand",
      payload: {
        bucket: BRAND_IMAGES_BUCKET,
        mimeType: file.type || null,
        fileSize: file.size,
      },
    });

    return publicUrl;
  } catch (error) {
    await safeLogAdminAction({
      action: "brand.error",
      entityType: "brand",
      payload: {
        operation: "image_upload",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function uploadCategoryImageFile(file: File): Promise<string> {
  await enforceAdminRateLimit("imageUpload");

  try {
    validateImageUploadFile(file);
    const publicUrl = await uploadImageToStorageBucket(CATEGORY_IMAGES_BUCKET, `categories/${randomImageFileName(file)}`, file);

    await safeLogAdminAction({
      action: "category.image.upload",
      entityType: "category",
      payload: {
        bucket: CATEGORY_IMAGES_BUCKET,
        mimeType: file.type || null,
        fileSize: file.size,
      },
    });

    return publicUrl;
  } catch (error) {
    await safeLogAdminAction({
      action: "category.error",
      entityType: "category",
      payload: {
        operation: "image_upload",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function uploadMerchantLogoImage(file: File): Promise<string> {
  await enforceAdminRateLimit("imageUpload");

  try {
    validateImageUploadFile(file);
    const publicUrl = await uploadImageToStorageBucket(MERCHANT_LOGOS_BUCKET, `merchants/${randomImageFileName(file)}`, file);

    await safeLogAdminAction({
      action: "merchant.image.upload",
      entityType: "merchant",
      payload: {
        bucket: MERCHANT_LOGOS_BUCKET,
        mimeType: file.type || null,
        fileSize: file.size,
      },
    });

    return publicUrl;
  } catch (error) {
    await safeLogAdminAction({
      action: "merchant.error",
      entityType: "merchant",
      payload: {
        operation: "image_upload",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

function mapOfferRow(row: Record<string, unknown>): AdminOfferRecord {
  const productData =
    row.products && typeof row.products === "object" && !Array.isArray(row.products)
      ? (row.products as { name?: unknown; category_id?: unknown; categories?: unknown })
      : null;
  const merchantData =
    row.merchants && typeof row.merchants === "object" && !Array.isArray(row.merchants)
      ? (row.merchants as { name?: unknown })
      : null;
  const categoryDataRaw = productData?.categories;
  const categoryData = Array.isArray(categoryDataRaw)
    ? (categoryDataRaw[0] as { name?: unknown } | undefined)
    : (categoryDataRaw as { name?: unknown } | undefined);

  const currentPrice = Number(row.current_price ?? row.price ?? 0);
  const oldPrice = row.old_price ? Number(row.old_price) : undefined;
  const discountPercent = oldPrice && oldPrice > 0 ? Math.max(0, Math.round(((oldPrice - currentPrice) / oldPrice) * 100)) : undefined;

  return {
    id: String(row.id),
    productId: String(row.product_id),
    productName: productData?.name ? String(productData.name) : "Producto",
    categoryId: productData?.category_id ? String(productData.category_id) : undefined,
    categoryName: categoryData?.name ? String(categoryData.name) : undefined,
    merchantId: String(row.merchant_id),
    merchantName: merchantData?.name ? String(merchantData.name) : "Tienda",
    sourceType: sanitizeOfferSourceType(row.source_type, "manual"),
    updateMode: sanitizeOfferUpdateMode(row.update_mode, "manual"),
    syncStatus: sanitizeOfferSyncStatus(row.sync_status, "ok"),
    currentPrice,
    price: currentPrice,
    oldPrice,
    discountPercent,
    url: String(row.url || ""),
    stock: Boolean(row.stock),
    isActive: Boolean(row.is_active),
    isFeatured: Boolean(row.is_featured),
    lastCheckedAt: row.last_checked_at ? String(row.last_checked_at) : undefined,
    lastUpdatedBy: row.last_updated_by ? String(row.last_updated_by) : undefined,
    lastSyncError: row.last_sync_error ? String(row.last_sync_error) : undefined,
    nextCheckAt: row.next_check_at ? String(row.next_check_at) : undefined,
    priorityScore: typeof row.priority_score === "number" ? row.priority_score : Number(row.priority_score || 0),
    freshnessScore: typeof row.freshness_score === "number" ? row.freshness_score : Number(row.freshness_score || 0),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

async function recalculateOfferPriorityScoresSafe(): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.rpc("recalculate_offer_priority_scores", { p_stale_hours: 72 });
  } catch {
    // Non-blocking best effort recalculation.
  }
}

export async function listOffers(filters: OfferListFilters): Promise<{ rows: AdminOfferRecord[]; total: number }> {
  const supabase = getSupabaseClient();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(filters.pageSize || 20, 200));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let categoryProductIds: string[] | null = null;
  if (filters.categoryId) {
    const categoryProducts = await supabase.from("products").select("id").eq("category_id", filters.categoryId).limit(5000);
    throwIfError(categoryProducts.error, "No se pudieron filtrar productos por categoria");
    categoryProductIds = (categoryProducts.data || []).map((row) => String(row.id));

    if (!categoryProductIds.length) {
      return { rows: [], total: 0 };
    }
  }

  let query = supabase
    .from("offers")
    .select(
      "id,product_id,merchant_id,price,current_price,old_price,url,stock,is_active,is_featured,source_type,update_mode,sync_status,last_checked_at,last_updated_by,last_sync_error,next_check_at,priority_score,freshness_score,updated_at,products(name,category_id,categories(name)),merchants(name)",
      { count: "exact" },
    )
    .range(from, to);

  if (filters.reviewQueueFirst) {
    query = query.order("sync_status", { ascending: true }).order("priority_score", { ascending: false }).order("updated_at", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false });
  }

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  if (categoryProductIds && categoryProductIds.length) {
    query = query.in("product_id", categoryProductIds);
  }

  if (filters.merchantId) {
    query = query.eq("merchant_id", filters.merchantId);
  }

  if (filters.sourceType) {
    query = query.eq("source_type", sanitizeOfferSourceType(filters.sourceType));
  }

  if (filters.syncStatus) {
    query = query.eq("sync_status", sanitizeOfferSyncStatus(filters.syncStatus));
  }

  if (typeof filters.isActive === "boolean") {
    query = query.eq("is_active", filters.isActive);
  }

  if (filters.search) {
    const safeSearch = sanitizeText(filters.search, 80);
    query = query.ilike("url", `%${safeSearch}%`);
  }

  const { data, count, error } = await query;
  throwIfError(error, "No se pudieron cargar ofertas");

  return {
    rows: (data || []).map((row: Record<string, unknown>) => mapOfferRow(row)),
    total: count || 0,
  };
}

export async function upsertOffer(input: OfferMutationInput): Promise<AdminOfferRecord> {
  await enforceAdminRateLimit("offerWrite");
  const supabase = getSupabaseClient();

  try {
    if (!input.productId || !input.merchantId) {
      await safeLogAdminAction({
        action: "offer.validation_failed",
        entityType: "offer",
        entityId: input.id,
        payload: { reason: "product_or_merchant_required" },
      });
      throw new Error("La oferta requiere producto y tienda");
    }

    const merchantLookup = await supabase
      .from("merchants")
      .select("id,name,domain")
      .eq("id", input.merchantId)
      .maybeSingle();
    throwIfError(merchantLookup.error, "No se pudo cargar la tienda de la oferta");

    if (!merchantLookup.data) {
      await safeLogAdminAction({
        action: "offer.validation_failed",
        entityType: "offer",
        entityId: input.id,
        payload: { reason: "merchant_not_found", merchantId: input.merchantId },
      });
      throw new Error("La oferta requiere una tienda valida");
    }

    const merchantDomain = sanitizeDomainValue(String(merchantLookup.data.domain || ""));
    const price = sanitizeNumber(Number(input.price), 0, 1_000_000);
    const oldPrice = typeof input.oldPrice === "number" && Number.isFinite(input.oldPrice)
      ? sanitizeNumber(Number(input.oldPrice), 0, 1_000_000)
      : null;
    const safeUrl = sanitizeAffiliateOfferUrl(input.url, merchantDomain || undefined);

    if (price <= 0) {
      await safeLogAdminAction({
        action: "offer.validation_failed",
        entityType: "offer",
        entityId: input.id,
        payload: { reason: "invalid_price" },
      });
      throw new Error("La oferta requiere un precio mayor que 0");
    }

    if (!safeUrl) {
      await safeLogAdminAction({
        action: "offer.validation_failed",
        entityType: "offer",
        entityId: input.id,
        payload: { reason: "invalid_or_disallowed_affiliate_url", merchantDomain: merchantDomain || null },
      });
      throw new Error("La oferta requiere una URL HTTPS valida");
    }

    if (!merchantDomain) {
      const inferredDomain = extractDomainFromAffiliateUrl(safeUrl);
      if (!inferredDomain) {
        throw new Error("No se pudo inferir el dominio de la tienda para validar el enlace");
      }

      const updateDomainResult = await supabase
        .from("merchants")
        .update({ domain: inferredDomain })
        .eq("id", input.merchantId);
      throwIfError(updateDomainResult.error, "No se pudo completar la configuracion de dominio de la tienda");

      await safeLogAdminAction({
        action: "merchant.domain.inferred",
        entityType: "merchant",
        entityId: input.merchantId,
        payload: {
          domain: inferredDomain,
          source: "offer_upsert",
        },
      });
    }

    const nowIso = new Date().toISOString();
    const existingOfferResult = input.id
      ? await supabase
          .from("offers")
          .select(
            "id,current_price,source_type,update_mode,sync_status,last_sync_error,next_check_at,priority_score,freshness_score",
          )
          .eq("id", input.id)
          .maybeSingle()
      : ({ data: null, error: null } as const);

    throwIfError(existingOfferResult.error, "No se pudo cargar contexto de la oferta");

    const existingCurrentPrice = existingOfferResult.data?.current_price
      ? Number(existingOfferResult.data.current_price)
      : undefined;
    const safeSourceType = sanitizeOfferSourceType(input.sourceType || existingOfferResult.data?.source_type, "manual");
    const safeUpdateMode = sanitizeOfferUpdateMode(input.updateMode || existingOfferResult.data?.update_mode, "manual");
    const safeSyncStatus = sanitizeOfferSyncStatus(input.syncStatus || "ok", "ok");
    const normalizedOldPrice = oldPrice ?? (existingCurrentPrice && existingCurrentPrice !== price ? existingCurrentPrice : null);

    const payload = {
      product_id: input.productId,
      merchant_id: input.merchantId,
      price,
      current_price: price,
      old_price: normalizedOldPrice,
      url: safeUrl,
      stock: Boolean(input.stock),
      is_active: Boolean(input.isActive),
      is_featured: Boolean(input.isFeatured),
      source_type: safeSourceType,
      update_mode: safeUpdateMode,
      sync_status: safeSyncStatus,
      last_checked_at: nowIso,
      last_sync_error:
        safeSyncStatus === "error"
          ? sanitizeText(input.lastSyncError || existingOfferResult.data?.last_sync_error || "sync_error", 500)
          : null,
      next_check_at: input.nextCheckAt || existingOfferResult.data?.next_check_at || defaultNextOfferCheckAt(),
      priority_score: sanitizeNumber(Number(input.priorityScore ?? existingOfferResult.data?.priority_score ?? 0), 0, 100000),
      freshness_score: sanitizeNumber(Number(input.freshnessScore ?? 100), 0, 100),
    };

    const isUpdate = Boolean(input.id);
    const query = isUpdate
      ? supabase
          .from("offers")
          .update(payload)
          .eq("id", input.id)
          .select(
            "id,product_id,merchant_id,price,current_price,old_price,url,stock,is_active,is_featured,source_type,update_mode,sync_status,last_checked_at,last_updated_by,last_sync_error,next_check_at,priority_score,freshness_score,updated_at",
          )
          .single()
      : supabase
          .from("offers")
          .insert(payload)
          .select(
            "id,product_id,merchant_id,price,current_price,old_price,url,stock,is_active,is_featured,source_type,update_mode,sync_status,last_checked_at,last_updated_by,last_sync_error,next_check_at,priority_score,freshness_score,updated_at",
          )
          .single();

    const { data, error } = await query;
    throwIfError(error, "No se pudo guardar la oferta");

    const [productRes, merchantRes] = await Promise.all([
      supabase.from("products").select("name").eq("id", data.product_id).maybeSingle(),
      supabase.from("merchants").select("name").eq("id", data.merchant_id).maybeSingle(),
    ]);

    throwIfError(productRes.error, "No se pudo cargar producto de la oferta");
    throwIfError(merchantRes.error, "No se pudo cargar tienda de la oferta");

    const safePrice = Number(data.current_price || data.price || 0);
    const safeOldPrice = data.old_price ? Number(data.old_price) : undefined;

    const result = {
      id: String(data.id),
      productId: String(data.product_id),
      productName: productRes.data?.name ? String(productRes.data.name) : "Producto",
      merchantId: String(data.merchant_id),
      merchantName: merchantRes.data?.name ? String(merchantRes.data.name) : "Tienda",
      sourceType: sanitizeOfferSourceType(data.source_type, safeSourceType),
      updateMode: sanitizeOfferUpdateMode(data.update_mode, safeUpdateMode),
      syncStatus: sanitizeOfferSyncStatus(data.sync_status, safeSyncStatus),
      currentPrice: safePrice,
      price: safePrice,
      oldPrice: safeOldPrice,
      discountPercent:
        safeOldPrice && safeOldPrice > 0 ? Math.max(0, Math.round(((safeOldPrice - safePrice) / safeOldPrice) * 100)) : undefined,
      url: String(data.url),
      stock: Boolean(data.stock),
      isActive: Boolean(data.is_active),
      isFeatured: Boolean(data.is_featured),
      lastCheckedAt: data.last_checked_at ? String(data.last_checked_at) : undefined,
      lastUpdatedBy: data.last_updated_by ? String(data.last_updated_by) : undefined,
      lastSyncError: data.last_sync_error ? String(data.last_sync_error) : undefined,
      nextCheckAt: data.next_check_at ? String(data.next_check_at) : undefined,
      priorityScore: Number(data.priority_score || 0),
      freshnessScore: Number(data.freshness_score || 0),
      updatedAt: String(data.updated_at || new Date().toISOString()),
    };

    await mark_offer_fresh(result.id);
    await recalculateOfferPriorityScoresSafe();

    await safeLogAdminAction({
      action: isUpdate ? "offer.update" : "offer.create",
      entityType: "offer",
      entityId: result.id,
      payload: {
        productId: result.productId,
        merchantId: result.merchantId,
        isActive: result.isActive,
        sourceType: result.sourceType,
        updateMode: result.updateMode,
        syncStatus: result.syncStatus,
      },
    });

    return result;
  } catch (error) {
    await safeLogAdminAction({
      action: "offer.error",
      entityType: "offer",
      entityId: input.id,
      payload: {
        operation: input.id ? "update" : "create",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function deleteOffer(id: string): Promise<void> {
  await enforceAdminRateLimit("offerDelete");
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.from("offers").delete().eq("id", id);
    throwIfError(error, "No se pudo eliminar la oferta");

    await safeLogAdminAction({
      action: "offer.delete",
      entityType: "offer",
      entityId: id,
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "offer.error",
      entityType: "offer",
      entityId: id,
      payload: {
        operation: "delete",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function deactivateOffer(id: string): Promise<void> {
  await enforceAdminRateLimit("offerWrite");
  const supabase = getSupabaseClient();

  try {
    const { error } = await supabase
      .from("offers")
      .update({
        is_active: false,
        sync_status: "stale",
        next_check_at: new Date().toISOString(),
      })
      .eq("id", id);

    throwIfError(error, "No se pudo desactivar la oferta");
    await mark_offer_stale(id, "offer_deactivated");

    await safeLogAdminAction({
      action: "offer.deactivate",
      entityType: "offer",
      entityId: id,
    });
  } catch (error) {
    await safeLogAdminAction({
      action: "offer.error",
      entityType: "offer",
      entityId: id,
      payload: {
        operation: "deactivate",
        ...toAuditErrorPayload(error),
      },
    });
    throw error;
  }
}

export async function markOfferReviewed(offerId: string): Promise<void> {
  await enforceAdminRateLimit("offerWrite");
  const marked = await mark_offer_fresh(offerId);

  if (!marked) {
    throw new Error("No se encontro la oferta para marcar como revisada");
  }

  await recalculateOfferPriorityScoresSafe();
}

export async function markOfferAsStale(offerId: string, reason = "manual_stale"): Promise<void> {
  await enforceAdminRateLimit("offerWrite");
  const marked = await mark_offer_stale(offerId, reason);

  if (!marked) {
    throw new Error("No se encontro la oferta para marcar como desactualizada");
  }

  await recalculateOfferPriorityScoresSafe();
}

export async function requestOfferSync(offerId: string): Promise<void> {
  await enforceAdminRateLimit("offerWrite");
  const result = await sync_price_for_offer(offerId);

  if (!result.changed) {
    throw new Error("No se pudo encolar la sincronizacion de la oferta");
  }
}

export async function runOffersSyncBatch(limit = 50): Promise<number> {
  await enforceAdminRateLimit("offerWrite");
  const result = await sync_offers_batch(limit);
  return result.syncedOfferIds.length;
}

export async function saveOfferPriceChange(input: {
  offerId: string;
  price: number;
  oldPrice?: number;
  stock?: boolean;
}): Promise<AdminOfferRecord> {
  await enforceAdminRateLimit("offerWrite");
  const supabase = getSupabaseClient();
  const lookup = await supabase
    .from("offers")
    .select(
      "id,product_id,merchant_id,url,stock,is_active,is_featured,source_type,update_mode,sync_status,last_sync_error,next_check_at,priority_score,freshness_score,current_price",
    )
    .eq("id", input.offerId)
    .maybeSingle();

  throwIfError(lookup.error, "No se pudo cargar la oferta para actualizar precio");
  if (!lookup.data) {
    throw new Error("No se encontro la oferta a actualizar");
  }

  const updated = await upsertOffer({
    id: String(lookup.data.id),
    productId: String(lookup.data.product_id),
    merchantId: String(lookup.data.merchant_id),
    price: sanitizeNumber(Number(input.price), 0, 1_000_000),
    oldPrice:
      typeof input.oldPrice === "number"
        ? sanitizeNumber(Number(input.oldPrice), 0, 1_000_000)
        : Number(lookup.data.current_price || 0),
    url: String(lookup.data.url || ""),
    stock: typeof input.stock === "boolean" ? input.stock : Boolean(lookup.data.stock),
    isActive: Boolean(lookup.data.is_active),
    isFeatured: Boolean(lookup.data.is_featured),
    sourceType: sanitizeOfferSourceType(lookup.data.source_type, "manual"),
    updateMode: sanitizeOfferUpdateMode(lookup.data.update_mode, "manual"),
    syncStatus: "ok",
    lastSyncError: undefined,
    nextCheckAt: lookup.data.next_check_at ? String(lookup.data.next_check_at) : defaultNextOfferCheckAt(),
    priorityScore: Number(lookup.data.priority_score || 0),
    freshnessScore: 100,
  });

  return updated;
}

export async function registerOfferPriceHistorySnapshot(
  offerId: string,
  reason = "manual_review",
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  return update_price_history_on_change(offerId, sanitizeText(reason, 80), metadata);
}

export async function listOfferPriceHistory(offerId: string, limit = 120): Promise<AdminOfferPriceHistoryRecord[]> {
  const supabase = getSupabaseClient();
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit || 120)));

  const { data, error } = await supabase
    .from("offer_price_history")
    .select(
      "id,offer_id,product_id,merchant_id,price,old_price,source_type,update_mode,sync_status,changed_by,change_reason,checked_at,created_at",
    )
    .eq("offer_id", offerId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  throwIfError(error, "No se pudo cargar historial de precios de la oferta");

  return (data || []).map((row) => ({
    id: String(row.id),
    offerId: String(row.offer_id),
    productId: String(row.product_id),
    merchantId: String(row.merchant_id),
    price: Number(row.price || 0),
    oldPrice: row.old_price ? Number(row.old_price) : undefined,
    sourceType: sanitizeOfferSourceType(row.source_type),
    updateMode: sanitizeOfferUpdateMode(row.update_mode),
    syncStatus: sanitizeOfferSyncStatus(row.sync_status),
    changedBy: row.changed_by ? String(row.changed_by) : undefined,
    changeReason: row.change_reason ? String(row.change_reason) : undefined,
    checkedAt: String(row.checked_at || row.created_at || new Date().toISOString()),
    createdAt: String(row.created_at || new Date().toISOString()),
  }));
}

export async function listClicks(limit = 100): Promise<AdminClickRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("clicks")
    .select("id,product_id,merchant_id,created_at,products(name),merchants(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  throwIfError(error, "No se pudieron cargar clics");

  return (data || []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    productId: String(row.product_id || ""),
    productName:
      typeof row.products === "object" && row.products !== null && "name" in row.products
        ? String((row.products as { name?: string }).name || "Producto")
        : "Producto",
    merchantId: String(row.merchant_id || ""),
    merchantName:
      typeof row.merchants === "object" && row.merchants !== null && "name" in row.merchants
        ? String((row.merchants as { name?: string }).name || "Tienda")
        : "Tienda",
    createdAt: String(row.created_at || new Date().toISOString()),
  }));
}

export async function listAdminActions(limit = 200): Promise<AdminActionRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("admin_actions")
    .select("id,user_id,action,entity_type,entity_id,payload,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  throwIfError(error, "No se pudo cargar auditoria");

  return (data || []).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id || ""),
    action: String(row.action || ""),
    entityType: String(row.entity_type || ""),
    entityId: row.entity_id ? String(row.entity_id) : undefined,
    payload:
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at || new Date().toISOString()),
  }));
}

export async function logAdminAction(input: {
  action: string;
  entityType: string;
  entityId?: string;
  payload?: Record<string, unknown>;
  source?: string;
}): Promise<void> {
  await safeLogAdminAction({
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    payload: input.payload,
    source: input.source || "adminUI",
  });
}

export async function createImportJob(input: {
  source: string;
  status?: "pending" | "running" | "completed" | "failed";
  rowCount?: number;
  metadata?: Record<string, unknown>;
}): Promise<AdminImportJobRecord> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("import_jobs")
    .insert({
      source: sanitizeText(input.source, 80),
      status: input.status || "pending",
      row_count: sanitizeNumber(Number(input.rowCount || 0), 0, 1_000_000),
      metadata: input.metadata || {},
      started_at: input.status === "running" ? new Date().toISOString() : null,
    })
    .select("id,user_id,source,status,row_count,created_count,updated_count,error_count,metadata,started_at,finished_at,created_at,updated_at")
    .single();

  throwIfError(error, "No se pudo crear import job");

  return {
    id: String(data.id),
    userId: String(data.user_id || ""),
    source: String(data.source),
    status: data.status as AdminImportJobRecord["status"],
    rowCount: Number(data.row_count || 0),
    createdCount: Number(data.created_count || 0),
    updatedCount: Number(data.updated_count || 0),
    errorCount: Number(data.error_count || 0),
    metadata:
      data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    startedAt: data.started_at ? String(data.started_at) : undefined,
    finishedAt: data.finished_at ? String(data.finished_at) : undefined,
    createdAt: String(data.created_at || new Date().toISOString()),
    updatedAt: String(data.updated_at || new Date().toISOString()),
  };
}

export async function updateImportJob(
  id: string,
  input: Partial<{
    status: "pending" | "running" | "completed" | "failed";
    createdCount: number;
    updatedCount: number;
    errorCount: number;
    metadata: Record<string, unknown>;
    rowCount: number;
    startedAt: string | null;
    finishedAt: string | null;
  }>,
): Promise<AdminImportJobRecord> {
  const supabase = getSupabaseClient();

  const payload: Record<string, unknown> = {};
  if (input.status) payload.status = input.status;
  if (typeof input.createdCount === "number") payload.created_count = sanitizeNumber(input.createdCount, 0, 1_000_000);
  if (typeof input.updatedCount === "number") payload.updated_count = sanitizeNumber(input.updatedCount, 0, 1_000_000);
  if (typeof input.errorCount === "number") payload.error_count = sanitizeNumber(input.errorCount, 0, 1_000_000);
  if (typeof input.rowCount === "number") payload.row_count = sanitizeNumber(input.rowCount, 0, 1_000_000);
  if (input.metadata) payload.metadata = input.metadata;
  if (Object.prototype.hasOwnProperty.call(input, "startedAt")) payload.started_at = input.startedAt;
  if (Object.prototype.hasOwnProperty.call(input, "finishedAt")) payload.finished_at = input.finishedAt;

  const { data, error } = await supabase
    .from("import_jobs")
    .update(payload)
    .eq("id", id)
    .select("id,user_id,source,status,row_count,created_count,updated_count,error_count,metadata,started_at,finished_at,created_at,updated_at")
    .single();

  throwIfError(error, "No se pudo actualizar import job");

  return {
    id: String(data.id),
    userId: String(data.user_id || ""),
    source: String(data.source),
    status: data.status as AdminImportJobRecord["status"],
    rowCount: Number(data.row_count || 0),
    createdCount: Number(data.created_count || 0),
    updatedCount: Number(data.updated_count || 0),
    errorCount: Number(data.error_count || 0),
    metadata:
      data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    startedAt: data.started_at ? String(data.started_at) : undefined,
    finishedAt: data.finished_at ? String(data.finished_at) : undefined,
    createdAt: String(data.created_at || new Date().toISOString()),
    updatedAt: String(data.updated_at || new Date().toISOString()),
  };
}

export async function listImportJobs(limit = 100): Promise<AdminImportJobRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("import_jobs")
    .select("id,user_id,source,status,row_count,created_count,updated_count,error_count,metadata,started_at,finished_at,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  throwIfError(error, "No se pudieron cargar import jobs");

  return (data || []).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id || ""),
    source: String(row.source || ""),
    status: row.status as AdminImportJobRecord["status"],
    rowCount: Number(row.row_count || 0),
    createdCount: Number(row.created_count || 0),
    updatedCount: Number(row.updated_count || 0),
    errorCount: Number(row.error_count || 0),
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    startedAt: row.started_at ? String(row.started_at) : undefined,
    finishedAt: row.finished_at ? String(row.finished_at) : undefined,
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }));
}

export async function addImportJobLog(input: {
  jobId: string;
  level: "info" | "warning" | "error";
  message: string;
  rowIndex?: number;
  payload?: Record<string, unknown>;
}): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("import_job_logs").insert({
    job_id: input.jobId,
    level: input.level,
    message: sanitizeText(input.message, 500),
    row_index: typeof input.rowIndex === "number" ? input.rowIndex : null,
    payload: input.payload || {},
  });

  throwIfError(error, "No se pudo guardar log de importacion");
}

export async function listImportJobLogs(jobId: string): Promise<AdminImportJobLogRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("import_job_logs")
    .select("id,job_id,level,message,row_index,payload,created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false })
    .limit(500);

  throwIfError(error, "No se pudieron cargar logs de importacion");

  return (data || []).map((row) => ({
    id: String(row.id),
    jobId: String(row.job_id),
    level: row.level as AdminImportJobLogRecord["level"],
    message: String(row.message),
    rowIndex: typeof row.row_index === "number" ? row.row_index : undefined,
    payload:
      row.payload && typeof row.payload === "object" && !Array.isArray(row.payload)
        ? (row.payload as Record<string, unknown>)
        : {},
    createdAt: String(row.created_at || new Date().toISOString()),
  }));
}

export async function listSyncStatus(): Promise<SyncStatusRecord[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("sync_status")
    .select("id,source,status,last_success_at,last_error_at,message,metadata,updated_at")
    .order("source", { ascending: true });

  throwIfError(error, "No se pudo cargar estado de sincronizacion");

  return (data || []).map((row) => ({
    id: String(row.id),
    source: String(row.source),
    status: row.status as SyncStatusRecord["status"],
    lastSuccessAt: row.last_success_at ? String(row.last_success_at) : undefined,
    lastErrorAt: row.last_error_at ? String(row.last_error_at) : undefined,
    message: row.message ? String(row.message) : undefined,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
    updatedAt: String(row.updated_at || new Date().toISOString()),
  }));
}

export async function updateSyncStatus(input: {
  source: string;
  status: "healthy" | "warning" | "error";
  message?: string;
  metadata?: Record<string, unknown>;
  lastSuccessAt?: string | null;
  lastErrorAt?: string | null;
}): Promise<SyncStatusRecord> {
  const supabase = getSupabaseClient();

  const payload = {
    source: sanitizeText(input.source, 80),
    status: input.status,
    message: input.message ? sanitizeText(input.message, 500) : null,
    metadata: input.metadata || {},
    last_success_at: Object.prototype.hasOwnProperty.call(input, "lastSuccessAt") ? input.lastSuccessAt : null,
    last_error_at: Object.prototype.hasOwnProperty.call(input, "lastErrorAt") ? input.lastErrorAt : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sync_status")
    .upsert(payload, { onConflict: "source" })
    .select("id,source,status,last_success_at,last_error_at,message,metadata,updated_at")
    .single();

  throwIfError(error, "No se pudo actualizar estado de sincronizacion");

  return {
    id: String(data.id),
    source: String(data.source),
    status: data.status as SyncStatusRecord["status"],
    lastSuccessAt: data.last_success_at ? String(data.last_success_at) : undefined,
    lastErrorAt: data.last_error_at ? String(data.last_error_at) : undefined,
    message: data.message ? String(data.message) : undefined,
    metadata:
      data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
        ? (data.metadata as Record<string, unknown>)
        : {},
    updatedAt: String(data.updated_at || new Date().toISOString()),
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = getSupabaseClient();

  const [
    totalProductsResult,
    activeOffersResult,
    activeMerchantsResult,
    totalClicksResult,
    topSearchTermsResult,
    analyticsSnapshotResult,
    syncStatus,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("offers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("merchants").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("clicks").select("id", { count: "exact", head: true }),
    supabase.from("search_terms").select("term,count").order("count", { ascending: false }).limit(10),
    supabase.rpc("get_admin_analytics_snapshot", { p_days: 30, p_stale_offer_days: 14 }),
    listSyncStatus(),
  ]);

  throwIfError(totalProductsResult.error, "No se pudo contar productos");
  throwIfError(activeOffersResult.error, "No se pudo contar ofertas activas");
  throwIfError(activeMerchantsResult.error, "No se pudo contar tiendas activas");
  throwIfError(totalClicksResult.error, "No se pudo contar clics");
  throwIfError(topSearchTermsResult.error, "No se pudieron cargar terminos de busqueda");
  throwIfError(analyticsSnapshotResult.error, "No se pudo cargar snapshot de analitica admin");

  const snapshot = (analyticsSnapshotResult.data || {}) as DashboardAnalyticsSnapshot;

  const topClickedProducts = (snapshot.topClickedProducts || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      clicks: Number(row.clicks || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const topClickedMerchants = (snapshot.topClickedMerchants || [])
    .map((row) => ({
      merchantId: String(row.merchantId || ""),
      merchantName: String(row.merchantName || "Tienda"),
      clicks: Number(row.clicks || 0),
    }))
    .filter((row) => Boolean(row.merchantId))
    .slice(0, 10);

  const topSearchTerms = (topSearchTermsResult.data || []).map((row) => ({
    term: String(row.term || ""),
    count: Number(row.count || 0),
  }));

  const topViewedProducts = (snapshot.topViewedProducts || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      views: Number(row.views || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const topSearchedProducts = (snapshot.topSearchedProducts || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      searchCount: Number(row.searchCount || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const topOfferPairs = (snapshot.topOfferPairs || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      merchantId: String(row.merchantId || ""),
      merchantName: String(row.merchantName || "Tienda"),
      clicks: Number(row.clicks || 0),
    }))
    .filter((row) => Boolean(row.productId) && Boolean(row.merchantId))
    .slice(0, 10);

  const topCategoriesByClicks = (snapshot.topCategoriesByClicks || [])
    .map((row) => ({
      categoryId: String(row.categoryId || ""),
      categoryName: String(row.categoryName || "Categoria"),
      clicks: Number(row.clicks || 0),
    }))
    .filter((row) => Boolean(row.categoryId))
    .slice(0, 10);

  const topCategoriesByPerformance = (snapshot.topCategoriesByPerformance || [])
    .map((row) => ({
      categoryId: String(row.categoryId || ""),
      categoryName: String(row.categoryName || "Categoria"),
      clicks: Number(row.clicks || 0),
      views: Number(row.views || 0),
      ctr: typeof row.ctr === "number" ? row.ctr : 0,
    }))
    .filter((row) => Boolean(row.categoryId))
    .slice(0, 10);

  const noResultSearchTerms = (snapshot.noResultSearchTerms || [])
    .map((row) => ({
      term: String(row.term || ""),
      count: Number(row.count || 0),
    }))
    .filter((row) => Boolean(row.term))
    .slice(0, 10);

  const highClicksLowViews = (snapshot.highClicksLowViews || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      clicks: Number(row.clicks || 0),
      views: Number(row.views || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const highViewsLowClicks = (snapshot.highViewsLowClicks || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      clicks: Number(row.clicks || 0),
      views: Number(row.views || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const underFeaturedTopPerformers = (snapshot.underFeaturedTopPerformers || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      clicks: Number(row.clicks || 0),
      views: Number(row.views || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const featuredTopPerformers = (snapshot.featuredTopPerformers || [])
    .map((row) => ({
      productId: String(row.productId || ""),
      productName: String(row.productName || "Producto"),
      clicks: Number(row.clicks || 0),
      views: Number(row.views || 0),
    }))
    .filter((row) => Boolean(row.productId))
    .slice(0, 10);

  const recentAdminActions = (snapshot.recentAdminActions || []).map((row) => ({
    id: String(row.id || ""),
    userId: String(row.userId || ""),
    action: String(row.action || ""),
    entityType: String(row.entityType || ""),
    entityId: row.entityId ? String(row.entityId) : undefined,
    payload: {},
    createdAt: String(row.createdAt || new Date().toISOString()),
  }));

  const dailyClicks = (snapshot.dailyClicks || [])
    .map((row) => ({
      day: String(row.day || ""),
      clicks: Number(row.clicks || 0),
    }))
    .filter((row) => Boolean(row.day));

  const activeProducts = await supabase.from("products").select("id").eq("is_active", true);
  throwIfError(activeProducts.error, "No se pudieron cargar productos activos");
  const activeProductIds = (activeProducts.data || []).map((row) => String(row.id));

  let incompleteProducts = 0;
  if (activeProductIds.length) {
    const [offersByProduct, imagesByProduct] = await Promise.all([
      supabase.from("offers").select("product_id").eq("is_active", true).in("product_id", activeProductIds),
      supabase.from("product_images").select("product_id").eq("is_primary", true).in("product_id", activeProductIds),
    ]);

    throwIfError(offersByProduct.error, "No se pudieron cargar ofertas para calidad de catalogo");
    throwIfError(imagesByProduct.error, "No se pudieron cargar imagenes para calidad de catalogo");

    const hasOffer = new Set((offersByProduct.data || []).map((row) => String(row.product_id || "")));
    const hasImage = new Set((imagesByProduct.data || []).map((row) => String(row.product_id || "")));

    incompleteProducts = activeProductIds.reduce((countValue, productId) => {
      if (!hasOffer.has(productId) || !hasImage.has(productId)) {
        return countValue + 1;
      }

      return countValue;
    }, 0);
  }

  return {
    totalProducts: totalProductsResult.count || 0,
    activeOffers: activeOffersResult.count || 0,
    activeMerchants: activeMerchantsResult.count || 0,
    totalClicks: totalClicksResult.count || 0,
    clicksLast30Days: Number(snapshot.clicksLast30Days || 0),
    topClickedProducts,
    topClickedMerchants,
    topOfferPairs,
    topSearchTerms,
    noResultSearchTerms,
    topViewedProducts,
    topSearchedProducts,
    topCategoriesByClicks,
    topCategoriesByPerformance,
    searchesWithoutResults: Number(snapshot.searchesWithoutResults || 0),
    failedImportJobs: Number(snapshot.failedImportJobs || 0),
    productsWithoutActiveOffers: Number(snapshot.productsWithoutActiveOffers || 0),
    staleActiveOffers: Number(snapshot.staleActiveOffers || 0),
    highClicksLowViews,
    highViewsLowClicks,
    underFeaturedTopPerformers,
    featuredTopPerformers,
    favoritesTotal:
      typeof snapshot.favoritesTotal === "number" && Number.isFinite(snapshot.favoritesTotal)
        ? Number(snapshot.favoritesTotal)
        : null,
    recentAdminActions,
    freshness: {
      lastClickAt: snapshot.freshness?.lastClickAt || undefined,
      lastSearchAt: snapshot.freshness?.lastSearchAt || undefined,
      lastImportAt: snapshot.freshness?.lastImportAt || undefined,
      lastSyncAt: snapshot.freshness?.lastSyncAt || undefined,
      stale: Boolean(snapshot.freshness?.stale),
      staleSources: Number(snapshot.freshness?.staleSources || 0),
    },
    dailyClicks,
    incompleteProducts,
    syncStatus,
  };
}
