import { getSupabaseClient } from "@/integrations/supabase/client";
import { sanitizeNumber, sanitizeText } from "@/infrastructure/security/sanitize";
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
  AdminProductImageRecord,
  AdminProductRecord,
  DashboardMetrics,
  SyncStatusRecord,
} from "@/admin/types";

export interface ProductListFilters extends AdminListQuery {
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface OfferListFilters extends AdminListQuery {
  productId?: string;
  merchantId?: string;
  isActive?: boolean;
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

const ADMIN_RATE_LIMIT_POLICIES = {
  productWrite: { scope: "admin:product:write", maxRequests: 60, windowSeconds: 60, blockSeconds: 180 },
  productDelete: { scope: "admin:product:delete", maxRequests: 20, windowSeconds: 60, blockSeconds: 300 },
  offerWrite: { scope: "admin:offer:write", maxRequests: 100, windowSeconds: 60, blockSeconds: 180 },
  offerDelete: { scope: "admin:offer:delete", maxRequests: 30, windowSeconds: 60, blockSeconds: 300 },
  imageUpload: { scope: "admin:image:upload", maxRequests: 30, windowSeconds: 60, blockSeconds: 300 },
  csvImport: { scope: "admin:import:csv", maxRequests: 6, windowSeconds: 60, blockSeconds: 600 },
} as const;

export type AdminRateLimitScope = keyof typeof ADMIN_RATE_LIMIT_POLICIES;

function normalizeSlug(value: string): string {
  return sanitizeText(value.toLowerCase(), 120)
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeHttpUrl(value: string, maxLength = 400): string {
  const safeValue = sanitizeText(value, maxLength);
  if (!safeValue) {
    return "";
  }

  try {
    const parsed = new URL(safeValue);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "";
    }

    return parsed.toString();
  } catch {
    return "";
  }
}

function sanitizeDomainValue(value: string): string {
  const safeValue = sanitizeText(value.toLowerCase(), 200);
  if (!safeValue) {
    return "";
  }

  const withoutProtocol = safeValue
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .trim();

  const domainPattern = /^[a-z0-9.-]+$/;
  if (!domainPattern.test(withoutProtocol) || !withoutProtocol.includes(".")) {
    return "";
  }

  return withoutProtocol;
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

function parseTechnicalSpecs(specs: Record<string, unknown>): Array<{ label: string; value: string }> {
  const attributes = specs.attributes;

  if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
    return [];
  }

  return Object.entries(attributes)
    .map(([label, value]) => ({
      label: sanitizeText(label, 60),
      value: sanitizeText(String(value ?? ""), 200),
    }))
    .filter((entry) => entry.label && entry.value);
}

function toTechnicalSpecObject(rows: Array<{ label: string; value: string }> = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    const label = sanitizeText(row.label, 60);
    const value = sanitizeText(row.value, 200);

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
    technicalSpecs: parseTechnicalSpecs(specs),
    tags,
    attributes,
    isActive: Boolean(row.is_active),
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

  if (!name) {
    throw new Error("La marca requiere nombre");
  }

  if (input.logoUrl && !safeLogoUrl) {
    throw new Error("La marca requiere una URL de logo valida (http/https)");
  }

  const payload = {
    name,
    logo_url: safeLogoUrl || null,
    is_active: Boolean(input.isActive),
  };

  const query = input.id
    ? supabase.from("brands").update(payload).eq("id", input.id).select("id,name,logo_url,is_active,updated_at").single()
    : supabase.from("brands").insert(payload).select("id,name,logo_url,is_active,updated_at").single();

  const { data, error } = await query;
  throwIfError(error, "No se pudo guardar la marca");

  return {
    id: String(data.id),
    name: String(data.name),
    logoUrl: data.logo_url ? String(data.logo_url) : undefined,
    isActive: Boolean(data.is_active),
    updatedAt: String(data.updated_at || new Date().toISOString()),
  };
}

export async function deleteBrand(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("brands").delete().eq("id", id);
  throwIfError(error, "No se pudo eliminar la marca");
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

  if (!name) {
    throw new Error("La tienda requiere nombre");
  }

  if (input.logoUrl && !safeLogoUrl) {
    throw new Error("La tienda requiere una URL de logo valida (http/https)");
  }

  if (input.domain && !safeDomain) {
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

  const query = input.id
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

  return {
    id: String(data.id),
    name: String(data.name),
    logoUrl: data.logo_url ? String(data.logo_url) : undefined,
    domain: data.domain ? String(data.domain) : undefined,
    country: data.country ? String(data.country) : "ES",
    isActive: Boolean(data.is_active),
    brandColor: data.brand_color ? String(data.brand_color) : undefined,
    updatedAt: String(data.updated_at || new Date().toISOString()),
  };
}

export async function deleteMerchant(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("merchants").delete().eq("id", id);
  throwIfError(error, "No se pudo eliminar la tienda");
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
  const safeImageUrl = input.imageUrl ? sanitizeHttpUrl(input.imageUrl, 300) : "";

  if (!name) {
    throw new Error("La categoria requiere nombre");
  }

  if (input.id && input.parentId === input.id) {
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
      throw new Error("No se puede guardar la categoria porque se genera un ciclo en la jerarquia");
    }
  }

  if (input.imageUrl && !safeImageUrl) {
    throw new Error("La categoria requiere una URL de imagen valida (http/https)");
  }

  const slug = normalizeSlug(input.slug || name);

  const payload = {
    name,
    slug,
    parent_id: input.parentId || null,
    icon: input.icon ? sanitizeText(input.icon, 32) : null,
    image_url: safeImageUrl || null,
    sort_order: sanitizeNumber(Number(input.sortOrder || 0), 0, 100000),
    is_active: Boolean(input.isActive),
  };

  const query = input.id
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

  return {
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
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  throwIfError(error, "No se pudo eliminar la categoria");
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

  if (!name) {
    throw new Error("El producto requiere nombre");
  }

  if (!input.brandId) {
    throw new Error("El producto requiere marca");
  }

  if (!input.categoryId) {
    throw new Error("El producto requiere categoria");
  }

  let existingSpecs: Record<string, unknown> = {};
  if (input.id) {
    const existing = await supabase.from("products").select("specs").eq("id", input.id).maybeSingle();
    throwIfError(existing.error, "No se pudo validar producto existente");
    existingSpecs = parseSpecsObject(existing.data?.specs);
  }

  const technicalSpecs = toTechnicalSpecObject(input.technicalSpecs || []);
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
    },
    tags: (input.tags || []).map((tag) => sanitizeText(tag, 50)).filter(Boolean),
    attributes: input.attributes || {},
    is_active: Boolean(input.isActive),
    sku: input.sku ? sanitizeText(input.sku, 80) : null,
    ean: input.ean ? sanitizeText(input.ean, 80) : null,
  };

  const query = input.id
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

  return mapProductRow(
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
  const { error } = await supabase.from("products").delete().eq("id", id);
  throwIfError(error, "No se pudo eliminar el producto");
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
    .select("id,product_id,url,is_primary")
    .eq("product_id", productId)
    .order("id", { ascending: true });

  throwIfError(error, "No se pudieron cargar imagenes");

  return (data || []).map((row) => ({
    id: String(row.id),
    productId: String(row.product_id),
    url: String(row.url),
    isPrimary: Boolean(row.is_primary),
  }));
}

export async function addProductImage(productId: string, url: string, isPrimary: boolean): Promise<AdminProductImageRecord> {
  await enforceAdminRateLimit("imageUpload");
  const supabase = getSupabaseClient();
  const safeUrl = sanitizeHttpUrl(url, 400);

  if (!safeUrl) {
    throw new Error("La imagen requiere una URL valida (http/https)");
  }

  if (isPrimary) {
    const resetPrimary = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
    throwIfError(resetPrimary.error, "No se pudo preparar imagen principal");
  }

  const { data, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, url: safeUrl, is_primary: isPrimary })
    .select("id,product_id,url,is_primary")
    .single();

  throwIfError(error, "No se pudo agregar la imagen");

  return {
    id: String(data.id),
    productId: String(data.product_id),
    url: String(data.url),
    isPrimary: Boolean(data.is_primary),
  };
}

export async function setPrimaryProductImage(productId: string, imageId: string): Promise<void> {
  const supabase = getSupabaseClient();

  const [resetResult, setResult] = await Promise.all([
    supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId),
    supabase.from("product_images").update({ is_primary: true }).eq("id", imageId).eq("product_id", productId),
  ]);

  throwIfError(resetResult.error, "No se pudo limpiar imagen principal");
  throwIfError(setResult.error, "No se pudo actualizar imagen principal");
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  throwIfError(error, "No se pudo eliminar la imagen");
}

export async function uploadProductImage(productId: string, file: File, isPrimary: boolean): Promise<AdminProductImageRecord> {
  await enforceAdminRateLimit("imageUpload");
  const supabase = getSupabaseClient();
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const maxFileSizeBytes = 10 * 1024 * 1024;

  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato de imagen no permitido. Usa JPG, PNG, WEBP o GIF");
  }

  if (file.size > maxFileSizeBytes) {
    throw new Error("La imagen supera el limite de 10MB");
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
  const fileName = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}.${sanitizeText(extension, 10)}`;
  const filePath = `${productId}/${fileName}`;

  const upload = await supabase.storage
    .from("product-images")
    .upload(filePath, file, { upsert: false, contentType: file.type || "image/jpeg" });

  if (upload.error) {
    throw new Error(
      "No se pudo subir el archivo al bucket product-images. Crea el bucket en Supabase Storage y concede permisos de lectura publica.",
    );
  }

  const publicUrl = supabase.storage.from("product-images").getPublicUrl(upload.data.path).data.publicUrl;
  return addProductImage(productId, publicUrl, isPrimary);
}

export async function listOffers(filters: OfferListFilters): Promise<{ rows: AdminOfferRecord[]; total: number }> {
  const supabase = getSupabaseClient();
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(filters.pageSize || 20, 200));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("offers")
    .select(
      "id,product_id,merchant_id,price,old_price,url,stock,is_active,is_featured,updated_at,products(name),merchants(name)",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (filters.productId) {
    query = query.eq("product_id", filters.productId);
  }

  if (filters.merchantId) {
    query = query.eq("merchant_id", filters.merchantId);
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
    rows: (data || []).map((row: Record<string, unknown>) => {
      const price = Number(row.price || 0);
      const oldPrice = row.old_price ? Number(row.old_price) : undefined;
      const discountPercent = oldPrice && oldPrice > 0 ? Math.max(0, Math.round(((oldPrice - price) / oldPrice) * 100)) : undefined;

      return {
        id: String(row.id),
        productId: String(row.product_id),
        productName:
          typeof row.products === "object" && row.products !== null && "name" in row.products
            ? String((row.products as { name?: string }).name || "Producto")
            : "Producto",
        merchantId: String(row.merchant_id),
        merchantName:
          typeof row.merchants === "object" && row.merchants !== null && "name" in row.merchants
            ? String((row.merchants as { name?: string }).name || "Tienda")
            : "Tienda",
        price,
        oldPrice,
        discountPercent,
        url: String(row.url || ""),
        stock: Boolean(row.stock),
        isActive: Boolean(row.is_active),
        isFeatured: Boolean(row.is_featured),
        updatedAt: String(row.updated_at || new Date().toISOString()),
      };
    }),
    total: count || 0,
  };
}

export async function upsertOffer(input: OfferMutationInput): Promise<AdminOfferRecord> {
  await enforceAdminRateLimit("offerWrite");
  const supabase = getSupabaseClient();

  if (!input.productId || !input.merchantId) {
    throw new Error("La oferta requiere producto y tienda");
  }

  const price = sanitizeNumber(Number(input.price), 0, 1_000_000);
  const oldPrice = typeof input.oldPrice === "number" && Number.isFinite(input.oldPrice)
    ? sanitizeNumber(Number(input.oldPrice), 0, 1_000_000)
    : null;
  const safeUrl = sanitizeHttpUrl(input.url, 400);

  if (price <= 0) {
    throw new Error("La oferta requiere un precio mayor que 0");
  }

  if (!safeUrl) {
    throw new Error("La oferta requiere una URL valida (http/https)");
  }

  const payload = {
    product_id: input.productId,
    merchant_id: input.merchantId,
    price,
    old_price: oldPrice,
    url: safeUrl,
    stock: Boolean(input.stock),
    is_active: Boolean(input.isActive),
    is_featured: Boolean(input.isFeatured),
  };

  const query = input.id
    ? supabase
        .from("offers")
        .update(payload)
        .eq("id", input.id)
        .select("id,product_id,merchant_id,price,old_price,url,stock,is_active,is_featured,updated_at")
        .single()
    : supabase
        .from("offers")
        .insert(payload)
        .select("id,product_id,merchant_id,price,old_price,url,stock,is_active,is_featured,updated_at")
        .single();

  const { data, error } = await query;
  throwIfError(error, "No se pudo guardar la oferta");

  const [productRes, merchantRes] = await Promise.all([
    supabase.from("products").select("name").eq("id", data.product_id).maybeSingle(),
    supabase.from("merchants").select("name").eq("id", data.merchant_id).maybeSingle(),
  ]);

  throwIfError(productRes.error, "No se pudo cargar producto de la oferta");
  throwIfError(merchantRes.error, "No se pudo cargar tienda de la oferta");

  const safePrice = Number(data.price || 0);
  const safeOldPrice = data.old_price ? Number(data.old_price) : undefined;

  return {
    id: String(data.id),
    productId: String(data.product_id),
    productName: productRes.data?.name ? String(productRes.data.name) : "Producto",
    merchantId: String(data.merchant_id),
    merchantName: merchantRes.data?.name ? String(merchantRes.data.name) : "Tienda",
    price: safePrice,
    oldPrice: safeOldPrice,
    discountPercent:
      safeOldPrice && safeOldPrice > 0 ? Math.max(0, Math.round(((safeOldPrice - safePrice) / safeOldPrice) * 100)) : undefined,
    url: String(data.url),
    stock: Boolean(data.stock),
    isActive: Boolean(data.is_active),
    isFeatured: Boolean(data.is_featured),
    updatedAt: String(data.updated_at || new Date().toISOString()),
  };
}

export async function deleteOffer(id: string): Promise<void> {
  await enforceAdminRateLimit("offerDelete");
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("offers").delete().eq("id", id);
  throwIfError(error, "No se pudo eliminar la oferta");
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
}): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("admin_actions").insert({
    action: sanitizeText(input.action, 80),
    entity_type: sanitizeText(input.entityType, 80),
    entity_id: input.entityId || null,
    payload: input.payload || {},
  });

  throwIfError(error, "No se pudo registrar accion de auditoria");
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
    clicksResult,
    topSearchTermsResult,
    topViewedProductsResult,
    syncStatus,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("offers").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("merchants").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("clicks").select("id", { count: "exact", head: true }),
    supabase.from("clicks").select("product_id,merchant_id,created_at").order("created_at", { ascending: false }).limit(2000),
    supabase.from("search_terms").select("term,count").order("count", { ascending: false }).limit(10),
    supabase.from("products").select("id,name,search_count").order("search_count", { ascending: false }).limit(10),
    listSyncStatus(),
  ]);

  throwIfError(totalProductsResult.error, "No se pudo contar productos");
  throwIfError(activeOffersResult.error, "No se pudo contar ofertas activas");
  throwIfError(activeMerchantsResult.error, "No se pudo contar tiendas activas");
  throwIfError(totalClicksResult.error, "No se pudo contar clics");
  throwIfError(clicksResult.error, "No se pudieron cargar clics para analitica");
  throwIfError(topSearchTermsResult.error, "No se pudieron cargar terminos de busqueda");
  throwIfError(topViewedProductsResult.error, "No se pudieron cargar productos vistos");

  const clickRows = clicksResult.data || [];
  const productClickCount = new Map<string, number>();
  const merchantClickCount = new Map<string, number>();

  for (const row of clickRows) {
    const productId = String(row.product_id || "");
    const merchantId = String(row.merchant_id || "");

    if (productId) {
      productClickCount.set(productId, (productClickCount.get(productId) || 0) + 1);
    }

    if (merchantId) {
      merchantClickCount.set(merchantId, (merchantClickCount.get(merchantId) || 0) + 1);
    }
  }

  const productIds = Array.from(productClickCount.keys());
  const merchantIds = Array.from(merchantClickCount.keys());

  const [productNamesResult, merchantNamesResult] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id,name").in("id", productIds)
      : Promise.resolve({ data: [], error: null } as const),
    merchantIds.length
      ? supabase.from("merchants").select("id,name").in("id", merchantIds)
      : Promise.resolve({ data: [], error: null } as const),
  ]);

  throwIfError(productNamesResult.error, "No se pudieron cargar nombres de productos para analitica");
  throwIfError(merchantNamesResult.error, "No se pudieron cargar nombres de tiendas para analitica");

  const productNameMap = new Map<string, string>();
  for (const row of productNamesResult.data || []) {
    productNameMap.set(String(row.id), String(row.name));
  }

  const merchantNameMap = new Map<string, string>();
  for (const row of merchantNamesResult.data || []) {
    merchantNameMap.set(String(row.id), String(row.name));
  }

  const topClickedProducts = Array.from(productClickCount.entries())
    .map(([productId, clicks]) => ({
      productId,
      productName: productNameMap.get(productId) || "Producto",
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const topClickedMerchants = Array.from(merchantClickCount.entries())
    .map(([merchantId, clicks]) => ({
      merchantId,
      merchantName: merchantNameMap.get(merchantId) || "Tienda",
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10);

  const topSearchTerms = (topSearchTermsResult.data || []).map((row) => ({
    term: String(row.term || ""),
    count: Number(row.count || 0),
  }));

  const topViewedProducts = (topViewedProductsResult.data || []).map((row) => ({
    productId: String(row.id),
    productName: String(row.name || ""),
    views: Number(row.search_count || 0),
  }));

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
    topClickedProducts,
    topClickedMerchants,
    topSearchTerms,
    topViewedProducts,
    incompleteProducts,
    syncStatus,
  };
}
