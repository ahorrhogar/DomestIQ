import Papa from "papaparse";
import { getSupabaseClient } from "@/integrations/supabase/client";
import { sanitizeText } from "@/infrastructure/security/sanitize";
import type { ImportColumnMapping } from "@/admin/types";
import {
  addImportJobLog,
  addProductImage,
  createImportJob,
  listProductImages,
  logAdminAction,
  updateImportJob,
  upsertOffer,
  upsertProduct,
} from "@/admin/services/adminCatalogService";

const DEFAULT_MAPPING: ImportColumnMapping = {
  productName: "product_name",
  brandName: "brand_name",
  categoryName: "category_name",
  subcategoryName: "subcategory_name",
  description: "description",
  longDescription: "long_description",
  price: "price",
  oldPrice: "old_price",
  merchantName: "merchant_name",
  offerUrl: "offer_url",
  stock: "stock",
  imageUrl: "image_url",
  sku: "sku",
  ean: "ean",
  tags: "tags",
};

export interface CsvPreviewResult {
  headers: string[];
  rows: Array<Record<string, string>>;
  totalRows: number;
  mapping: ImportColumnMapping;
}

export interface CsvImportResult {
  jobId: string;
  createdCount: number;
  updatedCount: number;
  errorCount: number;
}

function normalizeHeader(value: string): string {
  return sanitizeText(value.toLowerCase().replace(/\s+/g, "_"), 80);
}

function parseCsv(csvText: string): Array<Record<string, string>> {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });

  if (parsed.errors.length) {
    throw new Error(`CSV invalido: ${parsed.errors[0].message}`);
  }

  return parsed.data.map((row) => {
    const next: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      if (!key) {
        continue;
      }

      next[key] = typeof value === "string" ? value.trim() : String(value ?? "");
    }
    return next;
  });
}

function inferMapping(headers: string[]): ImportColumnMapping {
  const normalized = headers.map((header) => normalizeHeader(header));

  const pick = (candidates: string[], fallback: string): string => {
    const found = candidates.find((candidate) => normalized.includes(candidate));
    return found || fallback;
  };

  return {
    productName: pick(["product_name", "name", "producto", "titulo"], DEFAULT_MAPPING.productName),
    brandName: pick(["brand_name", "marca", "brand"], DEFAULT_MAPPING.brandName),
    categoryName: pick(["category_name", "categoria", "category"], DEFAULT_MAPPING.categoryName),
    subcategoryName: pick(["subcategory_name", "subcategoria", "sub_category"], DEFAULT_MAPPING.subcategoryName),
    description: pick(["description", "descripcion", "short_description"], DEFAULT_MAPPING.description),
    longDescription: pick(["long_description", "descripcion_larga", "details"], DEFAULT_MAPPING.longDescription),
    price: pick(["price", "precio"], DEFAULT_MAPPING.price),
    oldPrice: pick(["old_price", "precio_anterior", "compare_at_price"], DEFAULT_MAPPING.oldPrice),
    merchantName: pick(["merchant_name", "tienda", "merchant", "store"], DEFAULT_MAPPING.merchantName),
    offerUrl: pick(["offer_url", "url", "link"], DEFAULT_MAPPING.offerUrl),
    stock: pick(["stock", "in_stock", "availability"], DEFAULT_MAPPING.stock),
    imageUrl: pick(["image_url", "imagen", "image", "photo"], DEFAULT_MAPPING.imageUrl),
    sku: pick(["sku", "reference", "ref"], DEFAULT_MAPPING.sku),
    ean: pick(["ean", "gtin", "barcode"], DEFAULT_MAPPING.ean),
    tags: pick(["tags", "etiquetas", "keywords"], DEFAULT_MAPPING.tags),
  };
}

export function parseCsvPreview(csvText: string): CsvPreviewResult {
  const rows = parseCsv(csvText);
  const headers = rows.length ? Object.keys(rows[0]) : [];

  return {
    headers,
    rows: rows.slice(0, 20),
    totalRows: rows.length,
    mapping: inferMapping(headers),
  };
}

async function findBrandIdByName(name: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const safeName = sanitizeText(name, 120);

  if (!safeName) {
    return null;
  }

  const { data, error } = await supabase
    .from("brands")
    .select("id")
    .ilike("name", safeName)
    .limit(1);

  if (error) {
    throw new Error(error.message || "No se pudo buscar marca");
  }

  if (data?.length) {
    return String(data[0].id);
  }

  const insert = await supabase.from("brands").insert({ name: safeName, is_active: true }).select("id").single();
  if (insert.error) {
    throw new Error(insert.error.message || "No se pudo crear marca");
  }

  return String(insert.data.id);
}

async function findMerchantIdByName(name: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const safeName = sanitizeText(name, 120);

  if (!safeName) {
    return null;
  }

  const { data, error } = await supabase
    .from("merchants")
    .select("id")
    .ilike("name", safeName)
    .limit(1);

  if (error) {
    throw new Error(error.message || "No se pudo buscar tienda");
  }

  if (data?.length) {
    return String(data[0].id);
  }

  const insert = await supabase
    .from("merchants")
    .insert({ name: safeName, country: "ES", is_active: true })
    .select("id")
    .single();

  if (insert.error) {
    throw new Error(insert.error.message || "No se pudo crear tienda");
  }

  return String(insert.data.id);
}

async function findCategoryId(name: string, parentId: string | null): Promise<string | null> {
  const supabase = getSupabaseClient();
  const safeName = sanitizeText(name, 120);

  if (!safeName) {
    return null;
  }

  let query = supabase.from("categories").select("id").ilike("name", safeName).limit(1);
  if (parentId) {
    query = query.eq("parent_id", parentId);
  } else {
    query = query.is("parent_id", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "No se pudo buscar categoria");
  }

  return data?.length ? String(data[0].id) : null;
}

function buildSlug(value: string): string {
  return normalizeHeader(value)
    .replace(/_+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function ensureCategoryHierarchy(categoryName: string, subcategoryName: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const safeCategory = sanitizeText(categoryName, 120);
  const safeSubcategory = sanitizeText(subcategoryName, 120);

  if (!safeCategory && !safeSubcategory) {
    return null;
  }

  let parentId = await findCategoryId(safeCategory || safeSubcategory, null);
  if (!parentId) {
    const parentInsert = await supabase
      .from("categories")
      .insert({
        name: safeCategory || safeSubcategory,
        slug: buildSlug(safeCategory || safeSubcategory),
        parent_id: null,
        is_active: true,
      })
      .select("id")
      .single();

    if (parentInsert.error) {
      throw new Error(parentInsert.error.message || "No se pudo crear categoria");
    }

    parentId = String(parentInsert.data.id);
  }

  if (!safeSubcategory) {
    return parentId;
  }

  let subcategoryId = await findCategoryId(safeSubcategory, parentId);
  if (!subcategoryId) {
    const childInsert = await supabase
      .from("categories")
      .insert({
        name: safeSubcategory,
        slug: buildSlug(safeSubcategory),
        parent_id: parentId,
        is_active: true,
      })
      .select("id")
      .single();

    if (childInsert.error) {
      throw new Error(childInsert.error.message || "No se pudo crear subcategoria");
    }

    subcategoryId = String(childInsert.data.id);
  }

  return subcategoryId;
}

function parseTags(value: string): string[] {
  return value
    .split(/[|,;]/g)
    .map((tag) => sanitizeText(tag, 50))
    .filter(Boolean);
}

function parseNumber(value: string): number {
  if (!value) {
    return 0;
  }

  const normalized = value.replace(/\./g, "").replace(/,/g, ".").replace(/[^0-9.-]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseBoolean(value: string): boolean {
  const normalized = sanitizeText(value.toLowerCase(), 20);
  return ["1", "true", "yes", "si", "on", "available", "in_stock", "stock"].includes(normalized);
}

function readField(row: Record<string, string>, key: string): string {
  return sanitizeText(row[key] || "", 2000);
}

export async function runCsvImport(params: {
  csvText: string;
  mapping: ImportColumnMapping;
  sourceLabel?: string;
}): Promise<CsvImportResult> {
  const supabase = getSupabaseClient();
  const rows = parseCsv(params.csvText);

  if (!rows.length) {
    throw new Error("El CSV no contiene filas para importar");
  }

  const job = await createImportJob({
    source: params.sourceLabel || "admin_csv",
    status: "running",
    rowCount: rows.length,
    metadata: { mapping: params.mapping },
  });

  let createdCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  try {
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];

      try {
        const productName = readField(row, params.mapping.productName);
        const brandName = readField(row, params.mapping.brandName);
        const categoryName = readField(row, params.mapping.categoryName);
        const subcategoryName = readField(row, params.mapping.subcategoryName);
        const description = readField(row, params.mapping.description);
        const longDescription = readField(row, params.mapping.longDescription);
        const merchantName = readField(row, params.mapping.merchantName);
        const offerUrl = readField(row, params.mapping.offerUrl);
        const imageUrl = readField(row, params.mapping.imageUrl);
        const price = parseNumber(readField(row, params.mapping.price));
        const oldPrice = parseNumber(readField(row, params.mapping.oldPrice));
        const stock = parseBoolean(readField(row, params.mapping.stock));
        const sku = readField(row, params.mapping.sku);
        const ean = readField(row, params.mapping.ean);
        const tags = parseTags(readField(row, params.mapping.tags));

        if (!productName || !merchantName || !offerUrl || price <= 0) {
          errorCount += 1;
          await addImportJobLog({
            jobId: job.id,
            level: "warning",
            rowIndex: index,
            message: "Fila omitida por datos obligatorios faltantes",
            payload: { productName, merchantName, offerUrl, price },
          });
          continue;
        }

        const brandId = await findBrandIdByName(brandName || "Sin marca");
        const categoryId = await ensureCategoryHierarchy(categoryName || "General", subcategoryName);
        const merchantId = await findMerchantIdByName(merchantName);

        if (!brandId || !categoryId || !merchantId) {
          errorCount += 1;
          await addImportJobLog({
            jobId: job.id,
            level: "error",
            rowIndex: index,
            message: "No se pudieron resolver entidades relacionadas",
            payload: { brandName, categoryName, subcategoryName, merchantName },
          });
          continue;
        }

        const slug = buildSlug(productName);
        const existingProduct = await supabase
          .from("products")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (existingProduct.error) {
          throw new Error(existingProduct.error.message || "No se pudo consultar producto existente");
        }

        const product = await upsertProduct({
          id: existingProduct.data?.id ? String(existingProduct.data.id) : undefined,
          name: productName,
          slug,
          brandId,
          categoryId,
          shortDescription: description || longDescription,
          longDescription: longDescription || description,
          tags,
          technicalSpecs: [],
          attributes: {},
          isActive: true,
          sku: sku || undefined,
          ean: ean || undefined,
        });

        if (existingProduct.data?.id) {
          updatedCount += 1;
        } else {
          createdCount += 1;
        }

        const existingOffer = await supabase
          .from("offers")
          .select("id")
          .eq("product_id", product.id)
          .eq("merchant_id", merchantId)
          .eq("url", offerUrl)
          .maybeSingle();

        if (existingOffer.error) {
          throw new Error(existingOffer.error.message || "No se pudo consultar oferta existente");
        }

        await upsertOffer({
          id: existingOffer.data?.id ? String(existingOffer.data.id) : undefined,
          productId: product.id,
          merchantId,
          price,
          oldPrice: oldPrice > 0 ? oldPrice : undefined,
          url: offerUrl,
          stock,
          isActive: true,
          isFeatured: false,
        });

        if (existingOffer.data?.id) {
          updatedCount += 1;
        } else {
          createdCount += 1;
        }

        if (imageUrl) {
          const images = await listProductImages(product.id);
          const hasSameUrl = images.some((image) => image.url === imageUrl);
          if (!hasSameUrl) {
            const shouldBePrimary = images.length === 0;
            await addProductImage(product.id, imageUrl, shouldBePrimary);
          }
        }
      } catch (rowError) {
        errorCount += 1;
        await addImportJobLog({
          jobId: job.id,
          level: "error",
          rowIndex: index,
          message: rowError instanceof Error ? rowError.message : "Error desconocido en fila",
          payload: rows[index],
        });
      }
    }

    await updateImportJob(job.id, {
      status: errorCount > 0 ? "completed" : "completed",
      createdCount,
      updatedCount,
      errorCount,
      finishedAt: new Date().toISOString(),
    });

    await logAdminAction({
      action: "import.csv",
      entityType: "catalog",
      entityId: job.id,
      payload: {
        rowCount: rows.length,
        createdCount,
        updatedCount,
        errorCount,
      },
    });

    return {
      jobId: job.id,
      createdCount,
      updatedCount,
      errorCount,
    };
  } catch (error) {
    await updateImportJob(job.id, {
      status: "failed",
      createdCount,
      updatedCount,
      errorCount: errorCount + 1,
      finishedAt: new Date().toISOString(),
    });

    await addImportJobLog({
      jobId: job.id,
      level: "error",
      message: error instanceof Error ? error.message : "Importacion fallida",
    });

    throw error;
  }
}
