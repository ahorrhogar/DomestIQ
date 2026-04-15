import type { Offer, Product } from "@/domain/catalog/types";
import { extractDomainFromAffiliateUrl, isAffiliateUrlAllowed } from "@/infrastructure/security/affiliateUrl";
import { analyticsService } from "@/services/analyticsService";
import { offerService } from "@/services/offerService";

const useRedirectApi = (import.meta.env.VITE_USE_REDIRECT_API || "false") === "true";

export interface ProductNavigationTarget {
  href: string;
  isDirectAffiliateOffer: boolean;
  offerId?: string;
  merchantId?: string;
}

function getInternalProductHref(product: Product): string {
  return `/producto/${product.slug}`;
}

function isDirectOfferUrlSafe(offer: Offer): boolean {
  const merchantDomain = extractDomainFromAffiliateUrl(offer.merchant.url);
  return isAffiliateUrlAllowed(offer.url, merchantDomain || undefined);
}

export function getProductNavigationTarget(product: Product): ProductNavigationTarget {
  const fallback: ProductNavigationTarget = {
    href: getInternalProductHref(product),
    isDirectAffiliateOffer: false,
  };

  const offers = offerService.getOffersForProduct(product.id);
  if (offers.length !== 1) {
    return fallback;
  }

  const [offer] = offers;
  if (!isDirectOfferUrlSafe(offer)) {
    return fallback;
  }

  const href = useRedirectApi
    ? `/api/redirect?offerId=${encodeURIComponent(offer.id)}`
    : offer.url;

  return {
    href,
    isDirectAffiliateOffer: true,
    offerId: offer.id,
    merchantId: offer.merchantId,
  };
}

export function trackDirectOfferNavigation(
  product: Product,
  target: ProductNavigationTarget,
): void {
  if (!target.isDirectAffiliateOffer || !target.offerId || !target.merchantId) {
    return;
  }

  analyticsService.track({
    name: "offer_click",
    timestamp: new Date().toISOString(),
    payload: {
      productId: product.id,
      offerId: target.offerId,
      merchantId: target.merchantId,
    },
  });

  if (!useRedirectApi) {
    void offerService.trackClick(product.id, target.merchantId);
  }
}
