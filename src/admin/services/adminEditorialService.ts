import { getSupabaseClient } from "@/integrations/supabase/client";
import { sanitizeNumber, sanitizeText } from "@/infrastructure/security/sanitize";
import { mapAdminErrorMessage } from "@/admin/services/adminCatalogService";
import type { AdminEditorialArticleRecord, AdminListQuery } from "@/admin/types";

export interface AdminEditorialListFilters extends AdminListQuery {
  status?: "draft" | "published" | "inactive";
  categorySlug?: string;
  isFeatured?: boolean;
}

export interface AdminEditorialListResult {
  rows: AdminEditorialArticleRecord[];
  total: number;
}

export interface AdminEditorialMutationInput {
  id?: string;
  slug?: string;
  path?: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverTone?: "warm" | "fresh" | "calm" | "contrast";
  categorySlug: string;
  categoryName: string;
  intent: "comparativa" | "calidad-precio" | "ahorro" | "premium" | "guia-practica";
  tags?: string[];
  readMinutes?: number;
  averageBudget?: number;
  relatedCategorySlugs?: string[];
  relatedProductSlugs?: string[];
  publishedAt?: string;
  status: "draft" | "published" | "inactive";
  isFeatured: boolean;
  sections?: Array<{ heading: string; body: string }>;
}

interface EditorialArticleRow {
  id: string;
  slug: string;
  path: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  cover_image_alt: string | null;
  cover_tone: "warm" | "fresh" | "calm" | "contrast";
  category_slug: string;
  category_name: string;
  intent: AdminEditorialArticleRecord["intent"];
  tags: string[] | null;
  read_minutes: number;
  average_budget: number | null;
  related_category_slugs: string[] | null;
  related_product_slugs: string[] | null;
  published_at: string | null;
  updated_at: string;
  views_count: number | null;
  is_featured: boolean;
  status: AdminEditorialArticleRecord["status"];
  sections: Array<{ heading?: string; body?: string }> | null;
}

function normalizeSlug(value: string): string {
  const normalized = sanitizeText(value, 160)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || `articulo-${Date.now()}`;
}

function sanitizeArray(input: string[] | undefined, itemLimit = 64, maxItems = 20): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => sanitizeText(String(item || ""), itemLimit))
    .filter(Boolean)
    .slice(0, maxItems);
}

function sanitizeSections(input: AdminEditorialMutationInput["sections"]): Array<{ heading: string; body: string }> {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((section) => ({
      heading: sanitizeText(String(section?.heading || ""), 160),
      body: sanitizeText(String(section?.body || ""), 4000),
    }))
    .filter((section) => Boolean(section.heading) && Boolean(section.body))
    .slice(0, 30);
}

function mapRow(row: EditorialArticleRow): AdminEditorialArticleRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    path: String(row.path),
    title: String(row.title),
    excerpt: String(row.excerpt),
    coverImage: row.cover_image || undefined,
    coverImageAlt: row.cover_image_alt || undefined,
    coverTone: row.cover_tone,
    categorySlug: String(row.category_slug),
    categoryName: String(row.category_name),
    intent: row.intent,
    tags: Array.isArray(row.tags) ? row.tags.map(String).filter(Boolean) : [],
    readMinutes: Math.max(1, Number(row.read_minutes || 1)),
    averageBudget: typeof row.average_budget === "number" ? row.average_budget : undefined,
    relatedCategorySlugs: Array.isArray(row.related_category_slugs)
      ? row.related_category_slugs.map(String).filter(Boolean)
      : [],
    relatedProductSlugs: Array.isArray(row.related_product_slugs)
      ? row.related_product_slugs.map(String).filter(Boolean)
      : [],
    publishedAt: row.published_at || undefined,
    updatedAt: String(row.updated_at),
    views: Math.max(0, Number(row.views_count || 0)),
    isFeatured: Boolean(row.is_featured),
    status: row.status,
    sections: (Array.isArray(row.sections) ? row.sections : [])
      .map((section) => ({
        heading: String(section.heading || "").trim(),
        body: String(section.body || "").trim(),
      }))
      .filter((section) => Boolean(section.heading) && Boolean(section.body)),
  };
}

async function safeLogEditorialAction(action: string, entityId: string, payload: Record<string, unknown>) {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("admin_actions").insert({
      action: sanitizeText(action, 80),
      entity_type: "editorial_article",
      entity_id: entityId,
      payload: {
        source: "adminEditorialService",
        ...payload,
      },
    });
  } catch {
    // Audit logging must never break admin actions.
  }
}

export async function listEditorialArticles(filters: AdminEditorialListFilters): Promise<AdminEditorialListResult> {
  const supabase = getSupabaseClient();
  const page = Math.max(1, Math.floor(filters.page || 1));
  const pageSize = Math.max(1, Math.min(100, Math.floor(filters.pageSize || 25)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("editorial_articles")
    .select(
      "id,slug,path,title,excerpt,cover_image,cover_image_alt,cover_tone,category_slug,category_name,intent,tags,read_minutes,average_budget,related_category_slugs,related_product_slugs,published_at,updated_at,views_count,is_featured,status,sections",
      { count: "exact" },
    )
    .order("updated_at", { ascending: false })
    .range(from, to);

  const safeSearch = sanitizeText(filters.search || "", 80);
  if (safeSearch) {
    query = query.or(`title.ilike.%${safeSearch}%,slug.ilike.%${safeSearch}%,category_name.ilike.%${safeSearch}%`);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (typeof filters.isFeatured === "boolean") {
    query = query.eq("is_featured", filters.isFeatured);
  }

  if (filters.categorySlug) {
    query = query.eq("category_slug", sanitizeText(filters.categorySlug, 80).toLowerCase());
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(mapAdminErrorMessage(error, "No se pudieron cargar los articulos"));
  }

  return {
    rows: (data || []).map((row) => mapRow(row as EditorialArticleRow)),
    total: count || 0,
  };
}

export async function upsertEditorialArticle(input: AdminEditorialMutationInput): Promise<AdminEditorialArticleRecord> {
  const supabase = getSupabaseClient();

  const slug = normalizeSlug(input.slug || input.title);
  const safePath = sanitizeText(input.path || `/blog/${slug}`, 200) || `/blog/${slug}`;
  const safeTitle = sanitizeText(input.title, 180);
  const safeExcerpt = sanitizeText(input.excerpt, 600);

  if (!safeTitle || !safeExcerpt) {
    throw new Error("Titulo y extracto son obligatorios");
  }

  const nowIso = new Date().toISOString();
  const readMinutes = Math.max(1, Math.min(240, Math.floor(sanitizeNumber(input.readMinutes || 8, 1, 240))));
  const averageBudget = typeof input.averageBudget === "number"
    ? sanitizeNumber(input.averageBudget, 0, 1_000_000)
    : null;

  const sections = sanitizeSections(input.sections);
  const shouldPublish = input.status === "published";
  const publishedAt = shouldPublish
    ? (input.publishedAt ? new Date(input.publishedAt).toISOString() : nowIso)
    : null;

  const payload = {
    id: input.id || undefined,
    slug,
    path: safePath.startsWith("/") ? safePath : `/${safePath}`,
    title: safeTitle,
    excerpt: safeExcerpt,
    cover_image: input.coverImage ? sanitizeText(input.coverImage, 400) : null,
    cover_image_alt: input.coverImageAlt ? sanitizeText(input.coverImageAlt, 200) : null,
    cover_tone: input.coverTone || "fresh",
    category_slug: sanitizeText(input.categorySlug, 80).toLowerCase(),
    category_name: sanitizeText(input.categoryName, 120),
    intent: input.intent,
    tags: sanitizeArray(input.tags, 64, 20),
    read_minutes: readMinutes,
    average_budget: averageBudget,
    related_category_slugs: sanitizeArray(input.relatedCategorySlugs, 80, 20).map((item) => item.toLowerCase()),
    related_product_slugs: sanitizeArray(input.relatedProductSlugs, 120, 20).map((item) => item.toLowerCase()),
    status: input.status,
    is_featured: Boolean(input.isFeatured),
    sections,
    published_at: publishedAt,
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from("editorial_articles")
    .upsert(payload)
    .select(
      "id,slug,path,title,excerpt,cover_image,cover_image_alt,cover_tone,category_slug,category_name,intent,tags,read_minutes,average_budget,related_category_slugs,related_product_slugs,published_at,updated_at,views_count,is_featured,status,sections",
    )
    .single();

  if (error) {
    throw new Error(mapAdminErrorMessage(error, "No se pudo guardar el articulo"));
  }

  const record = mapRow(data as EditorialArticleRow);
  await safeLogEditorialAction(input.id ? "editorial.article.update" : "editorial.article.create", record.id, {
    slug: record.slug,
    status: record.status,
    featured: record.isFeatured,
  });

  return record;
}

export async function deleteEditorialArticle(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const safeId = sanitizeText(id, 64);
  if (!safeId) {
    throw new Error("ID de articulo invalido");
  }

  const { error } = await supabase.from("editorial_articles").delete().eq("id", safeId);
  if (error) {
    throw new Error(mapAdminErrorMessage(error, "No se pudo eliminar el articulo"));
  }

  await safeLogEditorialAction("editorial.article.delete", safeId, {});
}
