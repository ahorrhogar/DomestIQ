/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/integrations/supabase/client";
import {
  getAdminAuthStatus,
  isUserAdmin,
  signOutAdmin,
} from "@/admin/services/adminAuthService";

interface AdminAuthContextValue {
  loading: boolean;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const status = await getAdminAuthStatus();
      setSession(status.session);
      setUser(status.user);
      setIsAdmin(status.isAdmin);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo validar la sesion");
      setSession(null);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();

    const supabase = getSupabaseClient();
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUser = nextSession?.user || null;
      setSession(nextSession);
      setUser(nextUser);

      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      void (async () => {
        setLoading(true);
        const admin = await isUserAdmin(nextUser);
        setIsAdmin(admin);
        setLoading(false);
      })();
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await signOutAdmin();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      loading,
      user,
      session,
      isAdmin,
      error,
      refresh,
      signOut,
    }),
    [loading, user, session, isAdmin, error],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  }

  return context;
}
