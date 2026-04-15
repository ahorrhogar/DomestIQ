import { mockCatalogSource } from "@/data/sources/mockCatalogSource";
import type { Merchant, Offer, PriceAnalysis, PriceHistory } from "@/domain/catalog/types";
import { canUseAnalytics } from "@/services/cookieConsentService";

export interface OfferService {
  getMerchants(): Merchant[];
  getOffersForProduct(productId: string): Offer[];
  getPriceHistory(productId: string): PriceHistory[];
  getPriceAnalysis(productId: string): PriceAnalysis;
  trackClick(productId: string, merchantId: string): Promise<void>;
}

class MockOfferService implements OfferService {
  getMerchants(): Merchant[] {
    return mockCatalogSource.getMerchants();
  }

  getOffersForProduct(productId: string): Offer[] {
    return mockCatalogSource.getOffersForProduct(productId);
  }

  getPriceHistory(productId: string): PriceHistory[] {
    return mockCatalogSource.getPriceHistory(productId);
  }

  getPriceAnalysis(productId: string): PriceAnalysis {
    return mockCatalogSource.getPriceAnalysis(productId);
  }

  async trackClick(productId: string, merchantId: string): Promise<void> {
    if (!canUseAnalytics()) {
      return;
    }

    if (mockCatalogSource.trackClick) {
      await mockCatalogSource.trackClick(productId, merchantId);
    }
  }
}

export const offerService: OfferService = new MockOfferService();
