import { getOfferRedirectPayload, trackClick } from "@/data/sources/supabaseCatalogSource";
import { isAffiliateUrlAllowed } from "@/infrastructure/security/affiliateUrl";
import { logger } from "@/infrastructure/logging/logger";
import { getServerSupabaseClient } from "@/server/nextjs/lib/supabaseServerClient";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getClientIp(request: Request): string | undefined {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const realIp = request.headers.get("x-real-ip") || "";
  const candidate = forwardedFor || realIp;
  const ip = candidate.split(",")[0]?.trim();

  if (!ip) {
    return undefined;
  }

  return ip;
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const offerId = requestUrl.searchParams.get("offerId") || "";
  const shouldTrack = requestUrl.searchParams.get("track") === "1";

  if (!uuidPattern.test(offerId)) {
    return Response.json({ error: "Invalid offerId" }, { status: 400 });
  }

  try {
    const supabase = getServerSupabaseClient();
    const offer = await getOfferRedirectPayload(offerId, supabase);

    if (!offer) {
      return Response.json({ error: "Offer not found" }, { status: 404 });
    }

    if (!isAffiliateUrlAllowed(offer.url, offer.merchant_domain || undefined)) {
      logger.log({
        level: "warn",
        message: "Redirect blocked due to unsafe affiliate URL",
        timestamp: new Date().toISOString(),
        context: {
          offerId,
          merchantId: offer.merchant_id,
          merchantDomain: offer.merchant_domain || null,
        },
      });
      return Response.json({ error: "Unsafe redirect URL" }, { status: 400 });
    }

    if (shouldTrack) {
      await trackClick(offer.product_id, offer.merchant_id, supabase, {
        offerId: offer.id,
        ipAddress: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
      });
    }

    return Response.redirect(offer.url, 302);
  } catch (error) {
    logger.log({
      level: "error",
      message: "Redirect endpoint failed",
      timestamp: new Date().toISOString(),
      context: {
        offerId,
        error,
      },
    });

    return Response.json({ error: "Internal redirect error" }, { status: 500 });
  }
}
