type SitemapUrlEntry = {
  loc: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
  lastmod?: string;
};

type CategoryRow = {
  id?: string | null;
  slug?: string | null;
  parent_id?: string | null;
  is_active?: boolean | null;
  updated_at?: string | null;
};

type EditorialArticleRow = {
  slug?: string | null;
  path?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

const DEFAULT_SITE_URL = "https://homara.es";
const DYNAMIC_ENTRIES_TTL_MS = 10 * 60 * 1000;

let dynamicEntriesCache: {
  key: string;
  expiresAt: number;
  value: SitemapUrlEntry[];
} | null = null;

let dynamicEntriesPromise: Promise<SitemapUrlEntry[]> | null = null;

const STATIC_URLS: SitemapUrlEntry[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/acerca-de", changefreq: "monthly", priority: "0.7" },
  { loc: "/asistente", changefreq: "weekly", priority: "0.8" },
  { loc: "/buscar", changefreq: "weekly", priority: "0.6" },
  { loc: "/guias", changefreq: "daily", priority: "0.9" },
  { loc: "/politica-privacidad", changefreq: "monthly", priority: "0.6" },
  { loc: "/aviso-legal", changefreq: "monthly", priority: "0.6" },
  { loc: "/condiciones-generales-de-uso", changefreq: "monthly", priority: "0.6" },
  { loc: "/blog", changefreq: "daily", priority: "0.8" },
  { loc: "/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/mejores-sofas-calidad-precio-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/mejores-ventiladores-de-pie-para-este-verano-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/los-7-mejores-ventiladores-amazon-calor-verano-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/mejores-frigorificos-combi-bajo-consumo-2026", changefreq: "weekly", priority: "0.6" },
  { loc: "/blog/mejores-microondas-sin-plato-giratorio-2026", changefreq: "weekly", priority: "0.6" },
];

function resolveEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSiteUrl(value: string): string {
  if (!value) {
    return DEFAULT_SITE_URL;
  }

  try {
    const parsed = new URL(value);
    parsed.pathname = "";
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

function toAbsoluteUrl(siteUrl: string, path: string): string {
  if (!path) {
    return siteUrl;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

function normalizeSitemapUrl(value: string, siteUrl: string): string {
  try {
    const absolute = /^https?:\/\//i.test(value) ? value : toAbsoluteUrl(siteUrl, value);
    const parsed = new URL(absolute);
    parsed.search = "";
    parsed.hash = "";

    const pathname = parsed.pathname.replace(/\/{2,}/g, "/");
    parsed.pathname = pathname !== "/" ? pathname.replace(/\/$/, "") : "/";

    return parsed.toString();
  } catch {
    return "";
  }
}

function shouldIncludeUrl(url: string, siteUrl: string): boolean {
  try {
    const parsed = new URL(url);
    const site = new URL(siteUrl);
    if (parsed.origin !== site.origin) {
      return false;
    }

    const path = parsed.pathname;
    if (path.startsWith("/admin")) {
      return false;
    }

    if (path.startsWith("/producto/")) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeIsoDate(value: string | null | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed.toISOString();
}

function createSitemapXml(entries: SitemapUrlEntry[]): string {
  const lines: string[] = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const entry of entries) {
    lines.push("  <url>");
    lines.push(`    <loc>${escapeXml(entry.loc)}</loc>`);
    if (entry.lastmod) {
      lines.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
    }
    if (entry.changefreq) {
      lines.push(`    <changefreq>${entry.changefreq}</changefreq>`);
    }
    if (entry.priority) {
      lines.push(`    <priority>${entry.priority}</priority>`);
    }
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  return lines.join("\n");
}

async function fetchSupabaseRows<T>(
  supabaseUrl: string,
  supabaseAnonKey: string,
  pathWithQuery: string,
): Promise<T[]> {
  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${pathWithQuery}`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status})`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data as T[];
}

async function getDynamicEntries(siteUrl: string): Promise<SitemapUrlEntry[]> {
  const cacheKey = siteUrl;
  const now = Date.now();
  if (dynamicEntriesCache && dynamicEntriesCache.key === cacheKey && dynamicEntriesCache.expiresAt > now) {
    return dynamicEntriesCache.value;
  }

  if (dynamicEntriesPromise) {
    return dynamicEntriesPromise;
  }

  const supabaseUrl = resolveEnv("SUPABASE_URL") || resolveEnv("VITE_SUPABASE_URL");
  const supabaseAnonKey = resolveEnv("SUPABASE_ANON_KEY") || resolveEnv("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  dynamicEntriesPromise = (async () => {
    try {
    const [categories, articles] = await Promise.all([
      fetchSupabaseRows<CategoryRow>(
        supabaseUrl,
        supabaseAnonKey,
        "categories?select=id,slug,parent_id,is_active,updated_at&is_active=eq.true",
      ),
      fetchSupabaseRows<EditorialArticleRow>(
        supabaseUrl,
        supabaseAnonKey,
        "editorial_articles?select=slug,path,published_at,updated_at,status&status=eq.published",
      ),
    ]);

    const dynamicEntries: SitemapUrlEntry[] = [];

    const topLevelById = new Map<string, string>();
    categories
      .filter((category) => !category.parent_id)
      .forEach((category) => {
        const categoryId = String(category.id || "").trim();
        const slug = String(category.slug || "").trim();
        if (!categoryId || !slug) {
          return;
        }

        topLevelById.set(categoryId, slug);
        dynamicEntries.push({
          loc: toAbsoluteUrl(siteUrl, `/categoria/${slug}`),
          lastmod: normalizeIsoDate(category.updated_at),
          changefreq: "weekly",
          priority: "0.8",
        });
      });

    categories
      .filter((category) => Boolean(category.parent_id))
      .forEach((subcategory) => {
        const subSlug = String(subcategory.slug || "").trim();
        const parentId = String(subcategory.parent_id || "").trim();
        const parentSlug = topLevelById.get(parentId);

        if (!subSlug || !parentSlug) {
          return;
        }

        dynamicEntries.push({
          loc: toAbsoluteUrl(siteUrl, `/categoria/${parentSlug}/${subSlug}`),
          lastmod: normalizeIsoDate(subcategory.updated_at),
          changefreq: "weekly",
          priority: "0.7",
        });
      });

    for (const article of articles) {
      const slug = String(article.slug || "").trim();
      const path = String(article.path || "").trim();
      const articlePath = path || (slug ? `/blog/${slug}` : "");

      if (!articlePath) {
        continue;
      }

      dynamicEntries.push({
        loc: toAbsoluteUrl(siteUrl, articlePath),
        changefreq: "weekly",
        priority: "0.6",
        lastmod: normalizeIsoDate(article.updated_at || article.published_at),
      });
    }

      dynamicEntriesCache = {
        key: cacheKey,
        expiresAt: Date.now() + DYNAMIC_ENTRIES_TTL_MS,
        value: dynamicEntries,
      };

      return dynamicEntries;
    } catch {
      return [];
    } finally {
      dynamicEntriesPromise = null;
    }
  })();

  return dynamicEntriesPromise;
}

export default async function handler(_req: unknown, res: { setHeader: (name: string, value: string) => void; status: (code: number) => { send: (body: string) => void } }): Promise<void> {
  const siteUrl = normalizeSiteUrl(resolveEnv("PUBLIC_SITE_URL") || resolveEnv("SITE_URL") || DEFAULT_SITE_URL);
  const generatedAt = new Date().toISOString();
  const staticEntries = STATIC_URLS.map((entry) => ({
    ...entry,
    loc: toAbsoluteUrl(siteUrl, entry.loc),
    lastmod: entry.lastmod || generatedAt,
  }));

  const dynamicEntries = await getDynamicEntries(siteUrl);

  const deduped = new Map<string, SitemapUrlEntry>();
  for (const entry of [...staticEntries, ...dynamicEntries]) {
    const normalizedLoc = normalizeSitemapUrl(entry.loc, siteUrl);
    if (!normalizedLoc) {
      continue;
    }

    if (!shouldIncludeUrl(normalizedLoc, siteUrl)) {
      continue;
    }

    deduped.set(normalizedLoc, {
      ...entry,
      loc: normalizedLoc,
      lastmod: entry.lastmod || generatedAt,
    });
  }

  const xml = createSitemapXml(Array.from(deduped.values()));

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}