import { getOfferRedirectPayload, trackClick } from "@/data/sources/supabaseCatalogSource";
import { logger } from "@/infrastructure/logging/logger";
import { getServerSupabaseClient } from "@/server/nextjs/lib/supabaseServerClient";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isSafeAffiliateUrl(value: string): boolean {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:") {
      return false;
    }

    if (["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const offerId = requestUrl.searchParams.get("offerId") || "";

  if (!uuidPattern.test(offerId)) {
    return Response.json({ error: "Invalid offerId" }, { status: 400 });
  }

  try {
    const supabase = getServerSupabaseClient();
    const offer = await getOfferRedirectPayload(offerId, supabase);

    if (!offer) {
      return Response.json({ error: "Offer not found" }, { status: 404 });
    }

    if (!isSafeAffiliateUrl(offer.url)) {
      return Response.json({ error: "Unsafe redirect URL" }, { status: 400 });
    }

    await trackClick(offer.product_id, offer.merchant_id, supabase);

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
