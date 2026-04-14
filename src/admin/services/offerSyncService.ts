import { getSupabaseClient } from "@/integrations/supabase/client";
import type { OfferSyncBatchResult, OfferSyncResult, OfferSyncService } from "@/domain/catalog/offer-sync";

function safeReason(value: string | undefined, fallback: string): string {
  const text = String(value || "").trim();
  return text ? text.slice(0, 240) : fallback;
}

async function safeAdminAudit(action: string, entityId: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("admin_actions").insert({
      action,
      entity_type: "offer",
      entity_id: entityId,
      payload: {
        ...payload,
        source: "offerSyncService",
      },
    });
  } catch {
    // Audit errors must never block operational flows.
  }
}

export async function mark_offer_stale(offerId: string, reason?: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("mark_offer_stale", {
    p_offer_id: offerId,
    p_reason: safeReason(reason, "manual_mark_stale"),
  });

  if (error) {
    throw new Error(error.message || "No se pudo marcar la oferta como desactualizada");
  }

  await safeAdminAudit("offer.sync.mark_stale", offerId, { reason: safeReason(reason, "manual_mark_stale") });
  return data === true;
}

export async function mark_offer_fresh(offerId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("mark_offer_fresh", {
    p_offer_id: offerId,
  });

  if (error) {
    throw new Error(error.message || "No se pudo marcar la oferta como revisada");
  }

  await safeAdminAudit("offer.sync.mark_fresh", offerId, {});
  return Boolean(data);
}

export async function update_price_history_on_change(
  offerId: string,
  reason?: string,
  metadata?: Record<string, unknown>,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("update_price_history_on_change", {
    p_offer_id: offerId,
    p_reason: safeReason(reason, "manual_review"),
    p_metadata: metadata || {},
  });

  if (error) {
    throw new Error(error.message || "No se pudo registrar historial de precio");
  }

  await safeAdminAudit("offer.sync.history_on_change", offerId, {
    reason: safeReason(reason, "manual_review"),
    metadata: metadata || {},
  });

  return Boolean(data);
}

export async function sync_price_for_offer(offerId: string): Promise<OfferSyncResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("sync_price_for_offer", {
    p_offer_id: offerId,
  });

  if (error) {
    throw new Error(error.message || "No se pudo encolar sincronizacion de oferta");
  }

  const enqueued = data === true;

  const result: OfferSyncResult = {
    offerId,
    checkedAt: new Date().toISOString(),
    status: enqueued ? "pending" : "error",
    changed: enqueued,
    reason: enqueued ? "sync_enqueued" : "offer_not_found",
  };

  await safeAdminAudit("offer.sync.requested", offerId, {
    enqueueResult: result.changed,
  });

  return result;
}

export async function sync_offers_batch(limit = 50): Promise<OfferSyncBatchResult> {
  const supabase = getSupabaseClient();
  const safeLimit = Math.max(1, Math.min(200, Math.floor(limit || 50)));

  const { data, error } = await supabase.rpc("sync_offers_batch", {
    p_limit: safeLimit,
  });

  if (error) {
    throw new Error(error.message || "No se pudo encolar lote de sincronizacion");
  }

  const syncedOfferIds = Array.isArray(data)
    ? data
        .map((row) => {
          if (row && typeof row === "object" && "offer_id" in row) {
            return String((row as { offer_id?: string }).offer_id || "");
          }
          return "";
        })
        .filter(Boolean)
    : [];

  const result: OfferSyncBatchResult = {
    syncedOfferIds,
    pendingOfferIds: syncedOfferIds,
    failedOfferIds: [],
  };

  await safeAdminAudit("offer.sync.batch_requested", "batch", {
    requestedLimit: safeLimit,
    enqueued: syncedOfferIds.length,
  });

  return result;
}

export const offerSyncService: OfferSyncService = {
  sync_price_for_offer,
  sync_offers_batch,
  mark_offer_stale,
  mark_offer_fresh,
  update_price_history_on_change,
};
