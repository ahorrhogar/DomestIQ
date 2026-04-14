import Papa from "papaparse";
import { getSupabaseClient } from "@/integrations/supabase/client";
import { sanitizeText } from "@/infrastructure/security/sanitize";
import type { ImportColumnMapping } from "@/admin/types";
import {
  addImportJobLog,
  createImportJob,
  logAdminAction,
  requireAdminRateLimit,
  updateImportJob,
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
  warningCount: number;
  processedRows: number;
}

interface ImportRpcResult {
  createdCount?: number;
  updatedCount?: number;
  errorCount?: number;
  warningCount?: number;
  totalRows?: number;
  batchSize?: number;
}

interface RowImportError {
  rowIndex: number;
  message: string;
}

interface ImportPayloadRow {
  product_name: string;
  brand_name: string;
  category_name: string;
  subcategory_name: string;
  description: string;
  long_description: string;
  merchant_name: string;
  offer_url: string;
  image_url: string;
  price: number;
  old_price: number | null;
  stock: boolean;
  sku: string;
  ean: string;
  tags: string[];
}

const MAX_CSV_CHARS = 2_000_000;
const MAX_IMPORT_ROWS = 10_000;
const IMPORT_BATCH_SIZE = 100;

function assertCsvLimits(csvText: string, rowCount?: number): void {
  if (csvText.length > MAX_CSV_CHARS) {
    throw new Error("El CSV supera el limite permitido (2MB de texto)");
  }

  if (typeof rowCount === "number" && rowCount > MAX_IMPORT_ROWS) {
    throw new Error(`El CSV supera el limite de ${MAX_IMPORT_ROWS} filas por importacion`);
  }
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
  assertCsvLimits(csvText);
  const rows = parseCsv(csvText);
  assertCsvLimits(csvText, rows.length);
  const headers = rows.length ? Object.keys(rows[0]) : [];

  return {
    headers,
    rows: rows.slice(0, 20),
    totalRows: rows.length,
    mapping: inferMapping(headers),
  };
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

function buildImportPayload(rows: Array<Record<string, string>>, mapping: ImportColumnMapping): ImportPayloadRow[] {
  return rows.map((row) => {
    const oldPriceRaw = parseNumber(readField(row, mapping.oldPrice));

    return {
      product_name: readField(row, mapping.productName),
      brand_name: readField(row, mapping.brandName) || "Sin marca",
      category_name: readField(row, mapping.categoryName) || "General",
      subcategory_name: readField(row, mapping.subcategoryName),
      description: readField(row, mapping.description),
      long_description: readField(row, mapping.longDescription),
      merchant_name: readField(row, mapping.merchantName),
      offer_url: readField(row, mapping.offerUrl),
      image_url: readField(row, mapping.imageUrl),
      price: parseNumber(readField(row, mapping.price)),
      old_price: oldPriceRaw > 0 ? oldPriceRaw : null,
      stock: parseBoolean(readField(row, mapping.stock)),
      sku: readField(row, mapping.sku),
      ean: readField(row, mapping.ean),
      tags: parseTags(readField(row, mapping.tags)),
    };
  });
}

function parseImportRowErrors(value: string | null | undefined): RowImportError[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const rowIndex = Number((entry as { rowIndex?: unknown }).rowIndex);
        const message = String((entry as { message?: unknown }).message || "Error desconocido en fila");

        if (!Number.isFinite(rowIndex) || rowIndex < 0) {
          return null;
        }

        return { rowIndex, message };
      })
      .filter((entry): entry is RowImportError => Boolean(entry));
  } catch {
    return [];
  }
}

function isSupabaseError(error: unknown): error is { message?: string; details?: string } {
  return Boolean(error) && typeof error === "object";
}

async function persistImportRowErrors(jobId: string, rowErrors: RowImportError[]): Promise<void> {
  for (const rowError of rowErrors) {
    await addImportJobLog({
      jobId,
      level: "error",
      rowIndex: rowError.rowIndex,
      message: rowError.message,
    });
  }
}

export async function runCsvImport(params: {
  csvText: string;
  mapping: ImportColumnMapping;
  sourceLabel?: string;
}): Promise<CsvImportResult> {
  const supabase = getSupabaseClient();
  await requireAdminRateLimit("csvImport");

  assertCsvLimits(params.csvText);
  const rows = parseCsv(params.csvText);
  assertCsvLimits(params.csvText, rows.length);

  if (!rows.length) {
    throw new Error("El CSV no contiene filas para importar");
  }

  const job = await createImportJob({
    source: params.sourceLabel || "admin_csv",
    status: "running",
    rowCount: rows.length,
    metadata: { mapping: params.mapping, batchSize: IMPORT_BATCH_SIZE },
  });

  try {
    const payloadRows = buildImportPayload(rows, params.mapping);

    const { data, error } = await supabase.rpc("import_products_batch", {
      p_job_id: job.id,
      p_data: payloadRows,
      p_batch_size: IMPORT_BATCH_SIZE,
    });

    if (error) {
      throw error;
    }

    const result = (data || {}) as ImportRpcResult;
    const createdCount = Number(result.createdCount || 0);
    const updatedCount = Number(result.updatedCount || 0);
    const errorCount = Number(result.errorCount || 0);
    const warningCount = Number(result.warningCount || 0);
    const processedRows = Number(result.totalRows || rows.length);

    await updateImportJob(job.id, {
      status: "completed",
      createdCount,
      updatedCount,
      errorCount,
      metadata: {
        mapping: params.mapping,
        batchSize: IMPORT_BATCH_SIZE,
        warningCount,
        processedRows,
      },
      finishedAt: new Date().toISOString(),
    });

    if (warningCount > 0) {
      await addImportJobLog({
        jobId: job.id,
        level: "warning",
        message: `Se completaron ${processedRows} filas con ${warningCount} advertencias`,
        payload: { warningCount, processedRows },
      });
    }

    await logAdminAction({
      action: "import.csv",
      entityType: "catalog",
      entityId: job.id,
      payload: {
        rowCount: processedRows,
        createdCount,
        updatedCount,
        errorCount,
        warningCount,
        batchSize: IMPORT_BATCH_SIZE,
      },
    });

    return {
      jobId: job.id,
      createdCount,
      updatedCount,
      errorCount,
      warningCount,
      processedRows,
    };
  } catch (error) {
    const rowErrors = isSupabaseError(error)
      ? parseImportRowErrors(error.details || error.message)
      : [];

    if (rowErrors.length) {
      try {
        await persistImportRowErrors(job.id, rowErrors);
      } catch {
        // Keep original error handling path when logging individual rows fails.
      }
    }

    const safeErrorCount = rowErrors.length > 0 ? rowErrors.length : 1;

    await updateImportJob(job.id, {
      status: "failed",
      createdCount: 0,
      updatedCount: 0,
      errorCount: safeErrorCount,
      metadata: {
        mapping: params.mapping,
        batchSize: IMPORT_BATCH_SIZE,
        rollback: true,
      },
      finishedAt: new Date().toISOString(),
    });

    await addImportJobLog({
      jobId: job.id,
      level: "error",
      message:
        error instanceof Error
          ? error.message.includes("IMPORT_BATCH_FAILED")
            ? "Importacion revertida: una o mas filas fallaron validacion"
            : error.message
          : "Importacion fallida",
      payload: rowErrors.length ? { rowErrors: rowErrors.length } : {},
    });

    if (rowErrors.length) {
      throw new Error(`Importacion revertida. Filas con error: ${rowErrors.length}`);
    }

    throw error instanceof Error ? error : new Error("Importacion fallida");
  }
}
