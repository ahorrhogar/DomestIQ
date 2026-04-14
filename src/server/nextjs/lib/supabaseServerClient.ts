import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type ProcessEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

function getProcessEnv(): ProcessEnv {
  const globalValue = globalThis as {
    process?: {
      env?: ProcessEnv;
    };
  };

  return globalValue.process?.env ?? {};
}

export function getServerSupabaseClient(): SupabaseClient {
  const env = getProcessEnv();
  const url = env.SUPABASE_URL;
  const anonKey = env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY for server Supabase client.");
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
