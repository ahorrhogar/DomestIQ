/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly SUPABASE_URL?: string;
	readonly SUPABASE_ANON_KEY?: string;
	readonly VITE_SUPABASE_URL?: string;
	readonly VITE_SUPABASE_ANON_KEY?: string;
	readonly VITE_USE_REDIRECT_API?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
