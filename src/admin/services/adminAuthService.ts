import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/integrations/supabase/client";

async function safeAuditAuthAction(action: "auth.login" | "auth.logout"): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    await supabase.from("admin_actions").insert({
      action,
      entity_type: "auth",
      payload: { source: "adminAuthService" },
    });
  } catch {
    // Do not fail login/logout when audit logging fails.
  }
}

export interface AdminAuthStatus {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
}

export async function signInAdmin(email: string, password: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw error;
  }

  await safeAuditAuthAction("auth.login");
}

export async function signOutAdmin(): Promise<void> {
  const supabase = getSupabaseClient();
  await safeAuditAuthAction("auth.logout");
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function isUserAdmin(user: User | null | undefined): Promise<boolean> {
  if (!user) {
    return false;
  }

  if (user.app_metadata?.role === "admin") {
    return true;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("is_admin");

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function getAdminAuthStatus(): Promise<AdminAuthStatus> {
  const session = await getCurrentSession();
  const user = session?.user || null;
  const admin = await isUserAdmin(user);

  return {
    session,
    user,
    isAdmin: admin,
  };
}
