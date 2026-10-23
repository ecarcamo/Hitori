interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string
  readonly VITE_GOOGLE_SIGN_IN?: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
