import { z } from 'zod/mini'

export interface SupabaseConfig {
  url: string
  publishableKey: string
}

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().check(z.minLength(1)),
})

export function readSupabaseConfig(env: Record<string, unknown>): SupabaseConfig {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY.')
  }
  return {
    url: result.data.VITE_SUPABASE_URL,
    publishableKey: result.data.VITE_SUPABASE_PUBLISHABLE_KEY,
  }
}
