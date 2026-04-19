type SitemapUrlEntry = {
  loc: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
  lastmod?: string;
};

type CategoryRow = {
  slug?: string | null;
};

type EditorialArticleRow = {
  slug?: string | null;
  path?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
};

const DEFAULT_SITE_URL = "https://homara.es";

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
  { loc: "/blog/mejores-freidoras-aire-amazon-2026-menos-100-euros", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/mejores-sofas-calidad-precio-2026", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/mejores-ventiladores-de-pie-para-este-verano-2026", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/los-7-mejores-ventiladores-amazon-calor-verano-2026", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/10-mesas-de-terraza-baratas-y-bonitas-en-amazon-2026", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/review-cosori-5-7l-freidora-aire-calidad-precio-menos-100-euros", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/mejores-cafeteras-superautomaticas-amantes-del-cafe-2026", changefreq: "weekly", priority: "0.8" },
  { loc: "/blog/mejores-robots-de-cocina-baratos-alternativas-thermomix-2026", changefreq: "weekly", priority: "0.8" },
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
  const supabaseUrl = resolveEnv("SUPABASE_URL") || resolveEnv("VITE_SUPABASE_URL");
  const supabaseAnonKey = resolveEnv("SUPABASE_ANON_KEY") || resolveEnv("VITE_SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  try {
    const [categories, articles] = await Promise.all([
      fetchSupabaseRows<CategoryRow>(
        supabaseUrl,
        supabaseAnonKey,
        "categories?select=slug,parent_id&parent_id=is.null",
      ),
      fetchSupabaseRows<EditorialArticleRow>(
        supabaseUrl,
        supabaseAnonKey,
        "editorial_articles?select=slug,path,published_at,updated_at,status&status=eq.published",
      ),
    ]);

    const dynamicEntries: SitemapUrlEntry[] = [];

    for (const category of categories) {
      const slug = String(category.slug || "").trim();
      if (!slug) {
        continue;
      }

      dynamicEntries.push({
        loc: toAbsoluteUrl(siteUrl, `/categoria/${slug}`),
        changefreq: "weekly",
        priority: "0.8",
      });
    }

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
        priority: "0.8",
        lastmod: normalizeIsoDate(article.updated_at || article.published_at),
      });
    }

    return dynamicEntries;
  } catch {
    return [];
  }
}

export default async function handler(_req: unknown, res: { setHeader: (name: string, value: string) => void; status: (code: number) => { send: (body: string) => void } }): Promise<void> {
  const siteUrl = normalizeSiteUrl(resolveEnv("PUBLIC_SITE_URL") || resolveEnv("SITE_URL") || DEFAULT_SITE_URL);
  const staticEntries = STATIC_URLS.map((entry) => ({
    ...entry,
    loc: toAbsoluteUrl(siteUrl, entry.loc),
  }));

  const dynamicEntries = await getDynamicEntries(siteUrl);

  const deduped = new Map<string, SitemapUrlEntry>();
  for (const entry of [...staticEntries, ...dynamicEntries]) {
    deduped.set(entry.loc, entry);
  }

  const xml = createSitemapXml(Array.from(deduped.values()));

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(xml);
}