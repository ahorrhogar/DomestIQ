export type { CatalogDataSource, ExtendedCatalogDataSource } from "@/data/sources/catalogSource.types";
export {
  getOfferRedirectPayload,
  initializeCatalogSource,
  supabaseCatalogSource as mockCatalogSource,
  trackClick,
} from "@/data/sources/supabaseCatalogSource";
