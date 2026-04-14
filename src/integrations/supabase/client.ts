import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ProcessEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

type ImportMetaEnvLike = Record<string, string | undefined>;

function readProcessEnv(): ProcessEnv {
  const globalValue = globalThis as {
    process?: {
      env?: ProcessEnv;
    };
  };

  return globalValue.process?.env ?? {};
}

function resolveEnvValue(name: "SUPABASE_URL" | "SUPABASE_ANON_KEY"): string | undefined {
  const viteEnv = import.meta.env as ImportMetaEnvLike;
  const processEnv = readProcessEnv();

  if (name === "SUPABASE_URL") {
    return viteEnv.SUPABASE_URL || viteEnv.VITE_SUPABASE_URL || processEnv.SUPABASE_URL;
  }

  return viteEnv.SUPABASE_ANON_KEY || viteEnv.VITE_SUPABASE_ANON_KEY || processEnv.SUPABASE_ANON_KEY;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const supabaseUrl = resolveEnvValue("SUPABASE_URL");
  const supabaseAnonKey = resolveEnvValue("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY (or VITE_* equivalents).",
    );
  }

  const isBrowser = typeof window !== "undefined";

  cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });

  return cachedClient;
}

export type SupabaseClientLike = SupabaseClient;
